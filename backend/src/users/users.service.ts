import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { User } from './schemas/user.schema';

@Injectable()
export class UsersService {
  constructor(@InjectModel(User.name) private readonly users: Model<User>) {}

  findByEmail(email: string, includeSecrets = false) {
    const query = this.users.findOne({ email: email.toLowerCase() });
    return includeSecrets ? query.select('+passwordHash +refreshTokenHash').exec() : query.exec();
  }

  findById(id: string, includeRefreshToken = false) {
    if (!Types.ObjectId.isValid(id)) return null;
    const query = this.users.findById(id);
    return includeRefreshToken ? query.select('+refreshTokenHash').exec() : query.exec();
  }

  findByIds(ids: string[]) {
    const validIds = ids.filter((id) => Types.ObjectId.isValid(id));
    return this.users.find({ _id: { $in: validIds } }).exec();
  }

  create(data: Partial<User>) {
    return this.users.create(data);
  }

  updateProfile(id: string, data: Partial<User>) {
    if (!Types.ObjectId.isValid(id)) return null;
    return this.users
      .findByIdAndUpdate(id, { $set: data }, { new: true, runValidators: true })
      .exec();
  }

  async updateRefreshTokenHash(id: string, refreshTokenHash: string | null) {
    await this.users.updateOne({ _id: id }, { $set: { refreshTokenHash } }).exec();
  }

  async rotateRefreshTokenHash(id: string, currentHash: string, nextHash: string) {
    const result = await this.users
      .updateOne(
        { _id: id, refreshTokenHash: currentHash },
        { $set: { refreshTokenHash: nextHash } },
      )
      .exec();
    return result.modifiedCount === 1;
  }
}
