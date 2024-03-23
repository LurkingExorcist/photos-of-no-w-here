import { NestFactory } from '@nestjs/core';
import { AppModule } from './domain/app/app.module';
import { BACKEND_PORT } from '@photos-of-no-w-here/config';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  await app.listen(BACKEND_PORT);
}
bootstrap();
