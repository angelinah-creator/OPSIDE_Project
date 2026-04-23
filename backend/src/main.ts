import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { Application, NextFunction, Request, Response } from 'express';
import { AppModule } from './app.module';
import { AllExceptionsFilter } from './common/filters/http-exception.filter';

function parseCorsOrigins(value?: string): string[] {
  if (!value) {
    return ['http://localhost:3000', 'http://localhost:3001'];
  }
  return value
    .split(',')
    .map((origin) => origin.trim())
    .filter(Boolean);
}

function isExpressApp(value: unknown): value is Application {
  if (!value || typeof value !== 'function') {
    return false;
  }

  const candidate = value as {
    disable?: unknown;
    enable?: unknown;
  };

  return (
    typeof candidate.disable === 'function' &&
    typeof candidate.enable === 'function'
  );
}

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  const rawExpressApp: unknown = app.getHttpAdapter().getInstance();
  if (!isExpressApp(rawExpressApp)) {
    throw new Error('HTTP adapter is not an Express application.');
  }
  const expressApp = rawExpressApp;

  expressApp.disable('x-powered-by');

  app.use((req: Request, res: Response, next: NextFunction) => {
    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.setHeader('X-Frame-Options', 'DENY');
    res.setHeader('Referrer-Policy', 'no-referrer');
    res.setHeader(
      'Permissions-Policy',
      'camera=(), microphone=(), geolocation=()',
    );
    res.setHeader('X-DNS-Prefetch-Control', 'off');
    if (process.env.NODE_ENV === 'production') {
      res.setHeader(
        'Strict-Transport-Security',
        'max-age=31536000; includeSubDomains; preload',
      );
    }
    next();
  });

  if (process.env.FORCE_HTTPS === 'true') {
    expressApp.enable('trust proxy');
    app.use((req: Request, res: Response, next: NextFunction) => {
      const forwardedProto = req.headers['x-forwarded-proto'];
      const isForwardedHttps = Array.isArray(forwardedProto)
        ? forwardedProto.includes('https')
        : forwardedProto === 'https';

      if (req.secure || isForwardedHttps) {
        return next();
      }

      const host = req.headers.host || '';
      return res.redirect(301, `https://${host}${req.url}`);
    });
  }

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      transformOptions: { enableImplicitConversion: true },
    }),
  );

  app.useGlobalFilters(new AllExceptionsFilter());

  const corsOrigins = parseCorsOrigins(process.env.CORS_ORIGIN);
  app.enableCors({
    origin: corsOrigins.includes('*') ? true : corsOrigins,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true,
  });

  const port = process.env.PORT || 3001;
  await app.listen(port);
  console.log(`Application running on port ${port}`);
}

void bootstrap();
