import { Logger, Module } from '@nestjs/common';

import { ConfigModule } from '@/config/config.module';

import { CacheModule } from './domain/cache/cache.module';
import { DataModule } from './domain/data/data.module';
import { MediaColorModule } from './domain/media-color/media-color.module';
import { PhotoModule } from './domain/photo/photo.module';

/**
 * Root module of the application that configures all dependencies and controllers
 * Handles the main application setup including data management and photo handling
 */
@Module({
    imports: [
        ConfigModule,
        DataModule,
        MediaColorModule,
        PhotoModule,
        CacheModule,
    ],
    providers: [Logger],
})
export class AppModule {}
