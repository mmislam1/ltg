import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import type { Response } from 'express';

interface ErrorBody {
  message?: string | string[];
  errors?: Record<string, string[] | string>;
}

@Catch()
export class ApiExceptionFilter implements ExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost) {
    const response = host.switchToHttp().getResponse<Response>();
    const status = exception instanceof HttpException ? exception.getStatus() : HttpStatus.INTERNAL_SERVER_ERROR;
    const raw = exception instanceof HttpException ? exception.getResponse() : null;
    const body: ErrorBody = typeof raw === 'string' ? { message: raw } : ((raw || {}) as ErrorBody);
    const message = Array.isArray(body.message)
      ? body.message[0]
      : body.message || (status === 500 ? 'An unexpected server error occurred.' : 'Request failed.');

    response.status(status).json({
      message,
      ...(body.errors ? { errors: body.errors } : {}),
      statusCode: status,
      timestamp: new Date().toISOString(),
    });
  }
}
