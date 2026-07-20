import { ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import type { AuthenticatedUser } from '../auth/decorators/current-user.decorator';
import { UserRole } from '../users/schemas/user.schema';
import { foodToResponse } from './food-response';
import { Food } from './schemas/food.schema';

@Injectable()
export class FoodsService {
  constructor(@InjectModel(Food.name) private readonly foods: Model<Food>) {}

  async findVisible(userId?: string) {
    const visibility = userId
      ? { $or: [{ approved: true }, { addedBy: userId }] }
      : { approved: true };
    const items = await this.foods
      .find(visibility)
      .sort({ name: 1 })
      .exec();
    return items.map(foodToResponse);
  }

  async findPending() {
    const items = await this.foods.find({ approved: false }).sort({ createdAt: 1 }).exec();
    return items.map(foodToResponse);
  }

  async approve(id: string) {
    return this.setApproval(id, true);
  }

  async cancelApproval(id: string) {
    return this.setApproval(id, false);
  }

  private async setApproval(id: string, approved: boolean) {
    const item = await this.findById(id);
    item.approved = approved;
    await item.save();
    return foodToResponse(item);
  }

  async remove(id: string, user: AuthenticatedUser) {
    const item = await this.findById(id);
    const isCreator = item.addedBy === user.id;
    if (user.role !== UserRole.ADMIN && !isCreator) {
      throw new ForbiddenException('You can only delete food items that you created.');
    }
    await item.deleteOne();
  }

  private async findById(id: string) {
    if (!Types.ObjectId.isValid(id)) throw new NotFoundException('Food item not found.');
    const item = await this.foods.findById(id).exec();
    if (!item) throw new NotFoundException('Food item not found.');
    return item;
  }
}
