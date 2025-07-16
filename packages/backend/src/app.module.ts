import { Logger, Module } from '@nestjs/common';

import { ConfigModule } from '@/modules/shared/config/config.module';

import { CacheModule } from '@/modules/shared/cache/cache.module';
import { DataProcessingModule } from '@/modules/features/data-processing/data-processing.module';
import { PhotoModule } from '@/modules/features/photo/photo.module';

/**
 * Root module of the application that configures all dependencies and controllers
 * Handles the main application setup including data management and photo handling
 */
@Module({
    imports: [
        ConfigModule,
        DataProcessingModule,
        PhotoModule,
        CacheModule,
    ],
    providers: [Logger],
})
export class AppModule {}
