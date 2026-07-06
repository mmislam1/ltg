import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Schema as MongooseSchema, Types } from 'mongoose';
import { User } from '../../users/schemas/user.schema';

export enum DietChartExportRequestStatus {
  PENDING = 'pending',
  PROCESSING = 'processing',
  APPROVED = 'approved',
}

@Schema({ timestamps: true, versionKey: false, collection: 'diet_chart_export_requests' })
export class DietChartExportRequest {
  @Prop({ required: true, type: MongooseSchema.Types.ObjectId, ref: User.name, index: true })
  userId: Types.ObjectId;

  @Prop({ required: true, match: /^\d{4}-\d{2}-\d{2}$/ })
  date: string;

  @Prop({
    required: true,
    enum: DietChartExportRequestStatus,
    default: DietChartExportRequestStatus.PENDING,
    index: true,
  })
  status: DietChartExportRequestStatus;

  @Prop({ type: MongooseSchema.Types.ObjectId, ref: User.name })
  approvedBy?: Types.ObjectId;

  @Prop()
  approvedAt?: Date;
}

export type DietChartExportRequestDocument = HydratedDocument<DietChartExportRequest>;
export const DietChartExportRequestSchema = SchemaFactory.createForClass(
  DietChartExportRequest,
);
DietChartExportRequestSchema.index({ userId: 1, date: 1 }, { unique: true });
