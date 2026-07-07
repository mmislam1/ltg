import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import {
  DietChartExportRequest,
  DietChartExportRequestStatus,
} from '../diet-chart-export/schemas/diet-chart-export-request.schema';
import { Food, FoodKind } from '../foods/schemas/food.schema';
import { User, UserRole } from '../users/schemas/user.schema';

type UserWithTimestamps = User & {
  _id: Types.ObjectId;
  createdAt: Date;
};

@Injectable()
export class AdminService {
  constructor(
    @InjectModel(User.name) private readonly users: Model<User>,
    @InjectModel(Food.name) private readonly foods: Model<Food>,
    @InjectModel(DietChartExportRequest.name)
    private readonly pdfRequests: Model<DietChartExportRequest>,
  ) {}

  async dashboard() {
    const start = new Date();
    start.setUTCDate(1);
    start.setUTCHours(0, 0, 0, 0);
    start.setUTCMonth(start.getUTCMonth() - 11);

    const memberFilter = { role: UserRole.USER };
    const [
      members,
      purchasedMembers,
      pendingPdfRequests,
      pendingFoods,
      pendingRecipes,
      monthlyCounts,
    ] = await Promise.all([
      this.users
        .find(memberFilter)
        .select('name email isActive purchased purchasedAt createdAt')
        .sort({ createdAt: -1 })
        .lean<UserWithTimestamps[]>()
        .exec(),
      this.users.countDocuments({ ...memberFilter, purchased: true }).exec(),
      this.pdfRequests
        .countDocuments({ status: DietChartExportRequestStatus.PENDING })
        .exec(),
      this.foods.countDocuments({ approved: false, kind: FoodKind.FOOD }).exec(),
      this.foods.countDocuments({ approved: false, kind: FoodKind.RECIPE }).exec(),
      this.users
        .aggregate<{ _id: string; count: number }>([
          { $match: { ...memberFilter, createdAt: { $gte: start } } },
          {
            $group: {
              _id: { $dateToString: { format: '%Y-%m', date: '$createdAt' } },
              count: { $sum: 1 },
            },
          },
          { $sort: { _id: 1 } },
        ])
        .exec(),
    ]);

    const countsByMonth = new Map(monthlyCounts.map((entry) => [entry._id, entry.count]));
    const newMembersByMonth = Array.from({ length: 12 }, (_, index) => {
      const date = new Date(start);
      date.setUTCMonth(start.getUTCMonth() + index);
      const month = `${date.getUTCFullYear()}-${String(date.getUTCMonth() + 1).padStart(2, '0')}`;
      return {
        month,
        label: date.toLocaleDateString('en-US', { month: 'short', year: '2-digit', timeZone: 'UTC' }),
        count: countsByMonth.get(month) ?? 0,
      };
    });

    return {
      summary: {
        totalMembers: members.length,
        purchasedMembers,
        pendingPdfRequests,
        pendingFoods,
        pendingRecipes,
      },
      members: members.map((member) => this.memberResponse(member)),
      newMembersByMonth,
    };
  }

  async setPurchased(memberId: string, purchased: boolean, adminId: string) {
    if (!Types.ObjectId.isValid(memberId)) {
      throw new NotFoundException('Member was not found.');
    }

    const update = purchased
      ? {
          $set: {
            purchased: true,
            purchasedAt: new Date(),
            purchasedBy: new Types.ObjectId(adminId),
          },
        }
      : {
          $set: { purchased: false },
          $unset: { purchasedAt: 1, purchasedBy: 1 },
        };
    const member = await this.users
      .findOneAndUpdate(
        { _id: new Types.ObjectId(memberId), role: UserRole.USER },
        update,
        { new: true, runValidators: true },
      )
      .select('name email isActive purchased purchasedAt createdAt')
      .lean<UserWithTimestamps>()
      .exec();

    if (!member) throw new NotFoundException('Member was not found.');
    return this.memberResponse(member);
  }

  private memberResponse(member: UserWithTimestamps) {
    return {
      id: member._id.toString(),
      name: member.name,
      email: member.email,
      isActive: member.isActive,
      purchased: member.purchased ?? false,
      purchasedAt: member.purchasedAt ?? null,
      joinedAt: member.createdAt,
    };
  }
}
