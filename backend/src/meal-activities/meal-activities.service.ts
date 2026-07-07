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
import { DEFAULT_TIMEZONE } from '../users/schemas/user.schema';
import { UsersService } from '../users/users.service';
import { AddMealDto, MealItemDto, UpdateMealDto } from './dto/meal.dto';
import {
  MealActivity,
  MealActivityDocument,
  MealType,
} from './schemas/meal-activity.schema';

@Injectable()
export class MealActivitiesService {
  constructor(
    @InjectModel(MealActivity.name)
    private readonly activities: Model<MealActivity>,
    @InjectModel(Food.name)
    private readonly foods: Model<Food>,
    private readonly usersService: UsersService,
  ) {}

  async findForDate(userId: string, requestedDate?: string) {
    const { date, timezone } = await this.resolveDate(userId, requestedDate);
    const activity = await this.getOrCreateActivity(userId, date, timezone);
    return this.toResponse(activity);
  }

  async addMeal(userId: string, dto: AddMealDto, requestedDate?: string) {
    await this.assertFoodsAvailable(userId, dto.list);
    const { date, timezone } = await this.resolveDate(userId, requestedDate);
    const objectUserId = new Types.ObjectId(userId);
    await this.getOrCreateActivity(userId, date, timezone);

    const activity = await this.activities
      .findOneAndUpdate(
        {
          userId: objectUserId,
          date,
          'meals.mealType': { $ne: dto.mealType },
        },
        { $push: { meals: this.toMeal(dto) } },
        { new: true, runValidators: true },
      )
      .exec();
    if (!activity) {
      throw new ConflictException(`${dto.mealType} already exists for ${date}.`);
    }
    return this.toResponse(activity);
  }

  async copyToToday(userId: string, sourceDate?: string) {
    const sourceResolved = await this.resolveDate(userId, sourceDate);
    const todayResolved = await this.resolveDate(userId);
    const source = await this.getOrCreateActivity(
      userId,
      sourceResolved.date,
      sourceResolved.timezone,
    );

    if (sourceResolved.date === todayResolved.date) return this.toResponse(source);

    const meals = source.meals.map((meal) => ({
      mealType: meal.mealType,
      list: meal.list.map((item) => ({
        foodId: item.foodId,
        quantity: item.quantity,
      })),
    }));
    const destination = await this.activities
      .findOneAndUpdate(
        { userId: new Types.ObjectId(userId), date: todayResolved.date },
        {
          $set: { meals, timezone: todayResolved.timezone },
          $setOnInsert: {
            userId: new Types.ObjectId(userId),
            date: todayResolved.date,
          },
        },
        { new: true, upsert: true, runValidators: true },
      )
      .exec();

    return this.toResponse(destination);
  }

  async updateMeal(
    userId: string,
    mealType: MealType,
    dto: UpdateMealDto,
    requestedDate?: string,
  ) {
    await this.assertFoodsAvailable(userId, dto.list);
    const { date } = await this.resolveDate(userId, requestedDate);
    const activity = await this.activities
      .findOneAndUpdate(
        {
          userId: new Types.ObjectId(userId),
          date,
          'meals.mealType': mealType,
        },
        { $set: { 'meals.$.list': this.toItems(dto.list) } },
        { new: true, runValidators: true },
      )
      .exec();

    if (!activity) throw new NotFoundException(`${mealType} was not found for ${date}.`);
    return this.toResponse(activity);
  }

  private async resolveDate(userId: string, requestedDate?: string) {
    if (!Types.ObjectId.isValid(userId)) {
      throw new UnauthorizedException('User account is unavailable.');
    }
    const user = await this.usersService.findById(userId);
    if (!user?.isActive) throw new UnauthorizedException('User account is unavailable.');
    const timezone = this.validTimezone(user.timezone)
      ? user.timezone
      : DEFAULT_TIMEZONE;
    const today = this.localDate(new Date(), timezone);
    if (requestedDate && requestedDate > today) {
      throw new BadRequestException('Future dates are not available.');
    }
    return {
      date: requestedDate ?? today,
      timezone,
    };
  }

  private localDate(now: Date, timezone: string) {
    const parts = new Intl.DateTimeFormat('en-US', {
      timeZone: timezone,
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
    }).formatToParts(now);
    const value = (type: Intl.DateTimeFormatPartTypes) =>
      parts.find((part) => part.type === type)?.value;
    return `${value('year')}-${value('month')}-${value('day')}`;
  }

  private validTimezone(timezone?: string): timezone is string {
    if (!timezone) return false;
    try {
      new Intl.DateTimeFormat('en-US', { timeZone: timezone }).format();
      return true;
    } catch {
      return false;
    }
  }

  private async getOrCreateActivity(userId: string, date: string, timezone: string) {
    const objectUserId = new Types.ObjectId(userId);
    try {
      return await this.activities
        .findOneAndUpdate(
          { userId: objectUserId, date },
          { $setOnInsert: { userId: objectUserId, date, timezone, meals: [] } },
          { new: true, upsert: true, runValidators: true },
        )
        .exec();
    } catch (error) {
      if (!this.isDuplicateKey(error)) throw error;
      const activity = await this.activities
        .findOne({ userId: objectUserId, date })
        .exec();
      if (activity) return activity;
      throw error;
    }
  }

  private async assertFoodsAvailable(userId: string, items: MealItemDto[]) {
    const foodIds = [...new Set(items.map((item) => item.foodId))];
    if (foodIds.length === 0) return;
    const available = await this.foods.countDocuments({
      _id: { $in: foodIds.map((id) => new Types.ObjectId(id)) },
      $or: [{ approved: true }, { addedBy: userId }],
    });
    if (available !== foodIds.length) {
      throw new BadRequestException({
        message: 'One or more food items are unavailable.',
        errors: { list: ['Use approved foods or foods created by this user.'] },
      });
    }
  }

  private toMeal(dto: AddMealDto) {
    return { mealType: dto.mealType, list: this.toItems(dto.list) };
  }

  private toItems(items: MealItemDto[]) {
    return items.map((item) => ({
      foodId: new Types.ObjectId(item.foodId),
      quantity: item.quantity,
    }));
  }

  private toResponse(activity: MealActivityDocument) {
    return {
      id: activity.id,
      date: activity.date,
      timezone: activity.timezone,
      meals: activity.meals.map((meal) => ({
        mealType: meal.mealType,
        list: meal.list.map((item) => ({
          foodId: item.foodId.toString(),
          quantity: item.quantity,
        })),
      })),
    };
  }

  private isDuplicateKey(error: unknown) {
    return (error as { code?: number }).code === 11000;
  }
}
