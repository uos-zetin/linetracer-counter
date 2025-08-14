import { NestFactory } from "@nestjs/core";
import { DocumentBuilder, SwaggerModule } from "@nestjs/swagger";
import { AppModule } from "./app.module";

import container from "@/container";
import { env } from "@/env";
import { ValidationPipe } from "@nestjs/common";
import express from "express";
import { CustomExceptionFilter } from "./exception.filter";

export async function bootstrap() {
  await container.initialize();
  const app = await NestFactory.create(AppModule, {
    bodyParser: false,
  });
  const expressApp = app.getHttpAdapter().getInstance();

  app.setGlobalPrefix("api");

  // JSON 파서 미들웨어 추가
  expressApp.use(express.json({ limit: "10mb" }));

  // Express 자체 에러 핸들러 추가
  expressApp.use((error: any, req: any, res: any, next: any) => {
    if (error instanceof SyntaxError) {
      return res.status(400).json({
        statusCode: 400,
        type: "JsonParseError",
        message: error.message,
      });
    }
    next(error);
  });

  // Swagger 문서는 development 환경에서만 생성
  if (env.NODE_ENV === "development") {
    const config = new DocumentBuilder()
      .setTitle("ZETIN Linetracer Counter Server")
      .setDescription("APIs for ZETIN Linetracer Counter Server")
      .setVersion("0.0.1")
      .addApiKey(
        {
          type: "apiKey",
          name: "Authorization",
          in: "header",
          description: "Actor session key for authentication",
        },
        "ActorSessionKey"
      )
      .build();
    const documentFactory = () => SwaggerModule.createDocument(app, config);
    SwaggerModule.setup("/api/docs", app, documentFactory);
  }

  app.useGlobalPipes(
    new ValidationPipe({
      transform: true,
      whitelist: true,
      forbidNonWhitelisted: true,
    })
  );

  app.useGlobalFilters(new CustomExceptionFilter());

  await app.listen(process.env.PORT ?? 3000);
}
