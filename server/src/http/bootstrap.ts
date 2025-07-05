import { NestFactory } from "@nestjs/core";
import { AppModule } from "./app.module";
import { DocumentBuilder, SwaggerModule } from "@nestjs/swagger";

import container from "@/container";
import { ValidationPipe } from "@nestjs/common";
import { CustomExceptionFilter } from "./exception.filter";

export async function bootstrap() {
  await container.initialize();
  const app = await NestFactory.create(AppModule);

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
  SwaggerModule.setup("docs", app, documentFactory);

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
