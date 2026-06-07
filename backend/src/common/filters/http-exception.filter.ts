import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { Request, Response } from 'express';

@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  // Catch
  catch(exception: unknown, host: ArgumentsHost): void {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    let status = HttpStatus.INTERNAL_SERVER_ERROR;
    let message: string | string[] = 'Erreur interne du serveur';
    let error = 'Internal Server Error';

    if (exception instanceof HttpException) {
      status = exception.getStatus();
      const exceptionResponse = exception.getResponse();
      if (typeof exceptionResponse === 'string') {
        message = exceptionResponse;
      } else if (typeof exceptionResponse === 'object') {
        const resp = exceptionResponse as any;
        message = resp.message || message;
        error = resp.error || error;
      }
    } else if (exception instanceof Error) {
      if (exception.message.includes('No ') && exception.message.includes(' found')) {
        status = HttpStatus.NOT_FOUND;
        message = exception.message;
        error = 'Not Found';
      }
    }

    if (status === HttpStatus.INTERNAL_SERVER_ERROR) {
      console.error('INTERNAL_SERVER_ERROR:', exception);
      try {
        const fs = require('fs');
        const path = require('path');
        const logPath = path.join(process.cwd(), 'error.log');
        const logMessage = `[${new Date().toISOString()}] ${request.method} ${request.url}\n${exception instanceof Error ? exception.stack : JSON.stringify(exception)}\n\n`;
        fs.appendFileSync(logPath, logMessage);
      } catch (e) {
        console.error('Failed to write to error.log', e);
      }
    }

    response.status(status).json({
      success: false,
      statusCode: status,
      error,
      message,
      timestamp: new Date().toISOString(),
      path: request.url,
    });
  }
}
