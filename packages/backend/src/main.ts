import { NestFactory } from '@nestjs/core';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { AppModule } from './app.module';
import { ConfigService } from './config/config.service';

/**
 * Bootstrap function to initialize and start the NestJS application
 * Sets up Swagger documentation and starts the HTTP server
 */
async function bootstrap() {
    const app = await NestFactory.create(AppModule);
    const configService = app.get(ConfigService);

    // Configure Swagger documentation
    const config = new DocumentBuilder()
        .setTitle('Photos of No w here')
        .setDescription('The Photos of No w here API description')
        .setVersion('1.0')
        .addTag('photos-of-no-w-here')
        .build();
    const documentFactory = () => SwaggerModule.createDocument(app, config);
    SwaggerModule.setup('api', app, documentFactory);

    await app.listen(configService.port);
}

bootstrap();
