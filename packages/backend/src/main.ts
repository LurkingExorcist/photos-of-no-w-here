import { NestFactory } from '@nestjs/core';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { AppModule } from './domain/app/app.module';
import { BACKEND_PORT } from '@photos-of-no-w-here/config';

async function bootstrap() {
    const app = await NestFactory.create(AppModule);

    const config = new DocumentBuilder()
        .setTitle('Photos of No w here')
        .setDescription('The Photos of No w here API description')
        .setVersion('1.0')
        .addTag('photos-of-no-w-here')
        .build();
    const documentFactory = () => SwaggerModule.createDocument(app, config);
    SwaggerModule.setup('api', app, documentFactory);

    await app.listen(BACKEND_PORT);
}
bootstrap();
