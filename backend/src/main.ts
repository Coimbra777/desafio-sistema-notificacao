import { NestFactory } from "@nestjs/core";
import { AppModule } from "./app.module";

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.setGlobalPrefix("api");
  //   app.enableCors({
  //     origin: "http://localhost:4200",
  //     methods: "GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS",
  //     credentials: true,
  //   });
  await app.listen(3000);

  console.log(`Backend running on http://localhost:3002/api`);
}

bootstrap();
