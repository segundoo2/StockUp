import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import cookieParser from 'cookie-parser';
import { Application } from 'express';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  //configuração do class-validator/class-transform
  app.useGlobalPipes(
    new ValidationPipe({
      stopAtFirstError: true,
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  // Configuração do Swagger
  const config = new DocumentBuilder()
    .setTitle('StockUp API')
    .setDescription(
      'Documentação da API do StockUp, um sistema de gestão e controle de estoque.',
    )
    .setVersion('1.0')
    .addBearerAuth()
    .build();

  const document = SwaggerModule.createDocument(app, config);

  SwaggerModule.setup('api', app, document);

  // Configuração de parsing de cookie
  app.use(cookieParser());

  // Configurações de Cors
  app.enableCors({
    origin: process.env.FRONTEN_URL || 'http://localhost:3000',
    credentials: true,
  });

  //configuração do Express para Proxy reverso
  const expressApp = app.getHttpAdapter().getInstance() as Application;
  expressApp.set('trust proxy', 1);

  await app.listen(process.env.PORT ?? 3000);
}
void bootstrap();
