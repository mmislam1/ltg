import { BadRequestException, ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { NestFactory } from '@nestjs/core';
import express from 'express';
import helmet from 'helmet';
import type { ValidationError } from 'class-validator';
import { AppModule } from './app.module';
import { ApiExceptionFilter } from './common/filters/api-exception.filter';

function validationErrors(errors: ValidationError[]): Record<string, string[]> {
  return errors.reduce<Record<string, string[]>>((result, error) => {
    const messages = error.constraints ? Object.values(error.constraints) : [];
    const nested: Record<string, string[]> = error.children?.length
      ? validationErrors(error.children)
      : {};
    if (messages.length) result[error.property] = messages;
    return { ...result, ...nested };
  }, {});
}

function normalizeCorsOrigin(origin: string) {
  if (origin === '*' || /^https?:\/\//i.test(origin)) return origin;
  return `https://${origin}`;
}

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    bodyParser: false,
    cors: false,
  });
  const config = app.get(ConfigService);
  const origins = config
    .get<string>('CORS_ORIGINS', 'http://localhost:3000')
    .split(',')
    .map((origin) => origin.trim())
    .filter(Boolean);

  app.use(helmet());
  app.use(express.json({ strict: false }));
  app.use(express.urlencoded({ extended: true }));
  app.enableCors({ origin: origins.map(normalizeCorsOrigin), credentials: false });
  app.setGlobalPrefix('api');
  app.useGlobalFilters(new ApiExceptionFilter());
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      transformOptions: { enableImplicitConversion: true },
      exceptionFactory: (errors) =>
        new BadRequestException({
          message: 'Please correct the highlighted fields.',
          errors: validationErrors(errors),
        }),
    }),
  );

  app.enableShutdownHooks();
  await app.listen(config.get<number>('PORT', 8000), '0.0.0.0');
}

void bootstrap();
