import { forwardRef, Logger, Module } from '@nestjs/common';

import { DataProcessingController } from '@/modules/features/data-processing/data-processing.controller';
import { DataProcessingService } from '@/modules/features/data-processing/data-processing.service';
import { CacheModule } from '@/modules/shared/cache/cache.module';

@Module({
    imports: [forwardRef(() => CacheModule)],
    providers: [DataProcessingService, Logger],
    controllers: [DataProcessingController],
    exports: [DataProcessingService],
})
export class DataProcessingModule {} 