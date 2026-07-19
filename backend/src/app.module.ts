import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { APP_GUARD } from '@nestjs/core';
import { MongooseModule } from '@nestjs/mongoose';
import { ThrottlerGuard, ThrottlerModule } from '@nestjs/throttler';
import * as Joi from 'joi';
import { AuthModule } from './auth/auth.module';
import { HealthController } from './health.controller';
import { UsersModule } from './users/users.module';
import { FoodsModule } from './foods/foods.module';
import { MealActivitiesModule } from './meal-activities/meal-activities.module';
import { DietChartExportModule } from './diet-chart-export/diet-chart-export.module';
import { AdminModule } from './admin/admin.module';
import { GoalsModule } from './goals/goals.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      cache: true,
      validationSchema: Joi.object({
        NODE_ENV: Joi.string().valid('development', 'test', 'production').default('development'),
        PORT: Joi.number().port().default(8000),
        MONGODB_URI: Joi.string().required(),
        CORS_ORIGINS: Joi.string().default('http://localhost:3000'),
        JWT_ACCESS_SECRET: Joi.string().min(32).required(),
        JWT_REFRESH_SECRET: Joi.string().min(32).required().invalid(Joi.ref('JWT_ACCESS_SECRET')),
        JWT_ACCESS_EXPIRES_IN: Joi.string().default('15m'),
        JWT_REFRESH_EXPIRES_IN: Joi.string().default('7d'),
        MAIL_HOST: Joi.string().hostname().allow('').optional(),
        MAIL_PORT: Joi.number().port().default(587),
        MAIL_SECURE: Joi.boolean().truthy('true').falsy('false').default(false),
        MAIL_USER: Joi.string().allow('').optional(),
        MAIL_PASSWORD: Joi.string().allow('').optional(),
        MAIL_FROM: Joi.string().allow('').default('Lose To Gain <no-reply@losetogain.app>'),
        RESEND_API_KEY: Joi.string().allow('').optional(),
        NUTRITION_LABEL_SCAN_ENABLED: Joi.boolean().truthy('true').falsy('false').default(false),
        GEMINI_API_KEY: Joi.string().allow('').optional(),
        GEMINI_NUTRITION_MODEL: Joi.string().default('gemini-3.5-flash'),
      }),
    }),
    MongooseModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        uri: config.getOrThrow<string>('MONGODB_URI'),
        autoIndex: config.get<string>('NODE_ENV') !== 'production',
      }),
    }),
    ThrottlerModule.forRoot([{ name: 'default', ttl: 60_000, limit: 100 }]),
    UsersModule,
    AuthModule,
    FoodsModule,
    MealActivitiesModule,
    DietChartExportModule,
    AdminModule,
    GoalsModule,
  ],
  controllers: [HealthController],
  providers: [{ provide: APP_GUARD, useClass: ThrottlerGuard }],
})
export class AppModule {}
