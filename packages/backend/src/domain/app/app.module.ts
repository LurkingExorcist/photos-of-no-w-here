import { Logger, Module } from '@nestjs/common';
import { ConfigModule } from '@/config/config.module';
import { MediaColorModule } from '../media-color/media-color.module';
import { DataModule } from '../data/data.module';
import { PhotoModule } from '../photo/photo.module';

/**
 * Root module of the application that configures all dependencies and controllers
 * Handles the main application setup including data management and photo handling
 */
@Module({
    imports: [ConfigModule, DataModule, MediaColorModule, PhotoModule],
    providers: [Logger],
})
export class AppModule {}
