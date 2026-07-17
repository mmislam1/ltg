import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Food } from '../foods/schemas/food.schema';
import { MealActivitiesService } from '../meal-activities/meal-activities.service';
import { UsersService } from '../users/users.service';
import { DietChartMailService } from './diet-chart-mail.service';
import { DietChartPdfService } from './diet-chart-pdf.service';
import {
  DietChartExportRequest,
  DietChartExportRequestStatus,
} from './schemas/diet-chart-export-request.schema';
import {
  DietChartDocument,
  DietChartMeal,
  DietChartNutritionTotals,
} from './diet-chart.types';

@Injectable()
export class DietChartExportService {
  constructor(
    @InjectModel(Food.name) private readonly foods: Model<Food>,
    @InjectModel(DietChartExportRequest.name)
    private readonly requests: Model<DietChartExportRequest>,
    private readonly activities: MealActivitiesService,
    private readonly users: UsersService,
    private readonly pdf: DietChartPdfService,
    private readonly mail: DietChartMailService,
  ) {}

  async requestChart(userId: string, requestedDate?: string) {
    const user = await this.users.findById(userId);
    if (!user?.isActive) throw new UnauthorizedException('User account is unavailable.');
    if (!this.isProfileComplete(user)) {
      throw new BadRequestException(
        'Complete your profile before requesting a diet chart PDF.',
      );
    }

    const activity = await this.activities.findForDate(userId, requestedDate);
    const existing = await this.requests
      .findOne({
        userId: new Types.ObjectId(userId),
        date: activity.date,
      })
      .exec();
    if (existing) {
      if (existing.status === DietChartExportRequestStatus.APPROVED) {
        existing.status = DietChartExportRequestStatus.PENDING;
        existing.approvedAt = undefined;
        existing.approvedBy = undefined;
        await existing.save();
      }
      return this.requestResponse(existing);
    }

    try {
      const request = await this.requests.create({
        userId: new Types.ObjectId(userId),
        date: activity.date,
        status: DietChartExportRequestStatus.PENDING,
      });
      return this.requestResponse(request);
    } catch (error) {
      if ((error as { code?: number }).code !== 11000) throw error;
      const request = await this.requests
        .findOne({ userId: new Types.ObjectId(userId), date: activity.date })
        .exec();
      if (!request) throw error;
      return this.requestResponse(request);
    }
  }

  async listPendingRequests() {
    const requests = await this.requests
      .find({ status: DietChartExportRequestStatus.PENDING })
      .sort({ createdAt: 1 })
      .exec();
    const users = await this.users.findByIds(
      [...new Set(requests.map((request) => request.userId.toString()))],
    );
    const usersById = new Map(
      users.map((user) => [user.id, user]),
    );

    return requests.map((request) => {
      const user = usersById.get(request.userId.toString());
      return {
        id: request.id,
        date: request.date,
        status: request.status,
        requestedAt: (request as unknown as { createdAt: Date }).createdAt,
        user: user
          ? { id: user.id, name: user.name, email: user.email }
          : { id: request.userId.toString(), name: 'Unavailable member', email: '' },
      };
    });
  }

  async approveRequest(requestId: string, adminId: string) {
    if (!Types.ObjectId.isValid(requestId)) {
      throw new NotFoundException('PDF request was not found.');
    }
    const request = await this.requests
      .findOneAndUpdate(
        {
          _id: new Types.ObjectId(requestId),
          status: DietChartExportRequestStatus.PENDING,
        },
        { $set: { status: DietChartExportRequestStatus.PROCESSING } },
        { new: true },
      )
      .exec();
    if (!request) {
      const existing = await this.requests.findById(requestId).lean().exec();
      if (!existing) throw new NotFoundException('PDF request was not found.');
      throw new ConflictException('This PDF request has already been processed.');
    }

    try {
      const delivery = await this.emailChart(request.userId.toString(), request.date);
      request.status = DietChartExportRequestStatus.APPROVED;
      request.approvedBy = new Types.ObjectId(adminId);
      request.approvedAt = new Date();
      await request.save();
      return { ...this.requestResponse(request), ...delivery };
    } catch (error) {
      await this.requests.updateOne(
        { _id: request._id, status: DietChartExportRequestStatus.PROCESSING },
        { $set: { status: DietChartExportRequestStatus.PENDING } },
      );
      throw error;
    }
  }

  private async emailChart(userId: string, requestedDate: string) {
    const user = await this.users.findById(userId);
    if (!user?.isActive) throw new UnauthorizedException('User account is unavailable.');

    const activity = await this.activities.findForDate(userId, requestedDate);
    const foodIds = [
      ...new Set(activity.meals.flatMap((meal) => meal.list.map((item) => item.foodId))),
    ];
    const foods = foodIds.length
      ? await this.foods.find({ _id: { $in: foodIds.map((id) => new Types.ObjectId(id)) } }).exec()
      : [];
    const foodsById = new Map(foods.map((food) => [food.id, food]));
    const totals = this.emptyNutritionTotals();

    const meals: DietChartMeal[] = activity.meals.map((meal) => ({
      name: meal.mealType,
      items: meal.list.map((entry) => {
        const food = foodsById.get(entry.foodId);
        const factor = food ? entry.quantity / food.nutritionPer : 0;
        const macros = {
          calories: (food?.nutrition.calories ?? 0) * factor,
          protein: (food?.nutrition.protein ?? 0) * factor,
          carbs: (food?.nutrition.carbs ?? 0) * factor,
          fats: (food?.nutrition.fats ?? 0) * factor,
        };
        this.addNutrition(totals, food?.nutrition, factor);
        return {
          name: food?.name ?? 'Unavailable food',
          quantity: entry.quantity,
          unit: food?.unit ?? 'serving',
          macros,
        };
      }),
    }));

    const chart: DietChartDocument = {
      user: {
        name: user.name,
        email: user.email,
        age: user.age,
        weight: user.weight,
        weightUnit: user.weightUnit,
        height: user.height,
        heightUnit: user.heightUnit,
      },
      date: activity.date,
      timezone: activity.timezone,
      goals: {
        calories: user.targetCalories,
        protein: user.targetProtein,
        carbs: user.targetCarbs,
        fats: user.targetFat,
      },
      totals,
      meals,
      generatedAt: new Date(),
    };
    const filename = `diet-chart-${activity.date}.pdf`;
    const pdf = await this.pdf.render(chart);

    const delivery = await this.mail.send({
      recipient: user.email,
      recipientName: user.name,
      date: activity.date,
      filename,
      pdf,
    });

    return {
      message: 'PDF request approved and diet chart emailed successfully.',
      sentTo: user.email,
      date: activity.date,
      mail: delivery,
    };
  }

  private isProfileComplete(user: {
    name?: string;
    email?: string;
    age?: number;
    weight?: number;
    height?: number;
    targetCalories?: number;
    targetProtein?: number;
    targetCarbs?: number;
    targetFat?: number;
  }) {
    const numbers = [
      user.age,
      user.weight,
      user.height,
      user.targetCalories,
      user.targetProtein,
      user.targetCarbs,
      user.targetFat,
    ];
    return Boolean(
      user.name?.trim() &&
        user.email?.trim() &&
        numbers.every((value) => typeof value === 'number' && Number.isFinite(value)) &&
        (user.age ?? 0) > 0 &&
        (user.weight ?? 0) > 0 &&
        (user.height ?? 0) > 0 &&
        (user.targetCalories ?? 0) > 0,
    );
  }

  private requestResponse(request: {
    id: string;
    date: string;
    status: DietChartExportRequestStatus;
    approvedAt?: Date;
  }) {
    return {
      id: request.id,
      date: request.date,
      status: request.status,
      approvedAt: request.approvedAt,
      message:
        request.status === DietChartExportRequestStatus.APPROVED
          ? 'Diet chart PDF emailed.'
          : 'PDF request saved. You will receive an email after an admin approves it.',
    };
  }

  private emptyNutritionTotals(): DietChartNutritionTotals {
    return {
      calories: 0,
      protein: 0,
      carbs: 0,
      fats: 0,
      fiber: 0,
      netCarbs: 0,
      vitamins: {
        b1: 0,
        b2: 0,
        b3: 0,
        b5: 0,
        b6: 0,
        b7: 0,
        b8: 0,
        b9: 0,
        b12: 0,
        a: 0,
        c: 0,
        d: 0,
        e: 0,
        k: 0,
      },
      minerals: {
        calcium: 0,
        copper: 0,
        iron: 0,
        magnesium: 0,
        manganese: 0,
        phosphorus: 0,
        potassium: 0,
        selenium: 0,
        sodium: 0,
        zinc: 0,
      },
    };
  }

  private addNutrition(
    total: DietChartNutritionTotals,
    nutrition:
      | {
          calories: number;
          protein: number;
          carbs: number;
          fats: number;
          fiber: number;
          netCarbs: number;
          vitamins?: Partial<DietChartNutritionTotals['vitamins']>;
          minerals?: Partial<DietChartNutritionTotals['minerals']>;
        }
      | undefined,
    factor: number,
  ) {
    if (!nutrition) return;
    total.calories += nutrition.calories * factor;
    total.protein += nutrition.protein * factor;
    total.carbs += nutrition.carbs * factor;
    total.fats += nutrition.fats * factor;
    total.fiber += (nutrition.fiber ?? 0) * factor;
    total.netCarbs += (nutrition.netCarbs ?? nutrition.carbs) * factor;
    for (const key of Object.keys(total.vitamins) as Array<keyof typeof total.vitamins>) {
      total.vitamins[key] += (nutrition.vitamins?.[key] ?? 0) * factor;
    }
    for (const key of Object.keys(total.minerals) as Array<keyof typeof total.minerals>) {
      total.minerals[key] += (nutrition.minerals?.[key] ?? 0) * factor;
    }
  }
}
