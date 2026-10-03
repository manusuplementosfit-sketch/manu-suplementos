import 'reflect-metadata';
import { existsSync } from 'fs';
import { join } from 'path';
import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { NestExpressApplication } from '@nestjs/platform-express';
import { AppModule } from './app.module';

if (existsSync('.env')) process.loadEnvFile('.env');

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);
  app.enableCors({ origin: (process.env.WEB_URL ?? 'http://localhost:3000').split(',') });
  app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true }));

  // Sem Vercel Blob, os arquivos ficam em ./uploads e são servidos pela própria API
  if (!process.env.BLOB_READ_WRITE_TOKEN) {
    app.useStaticAssets(join(process.cwd(), 'uploads'), { prefix: '/uploads' });
  }

  await app.listen(process.env.PORT ?? 3001);
}
bootstrap();
