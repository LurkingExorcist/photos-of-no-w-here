import { Module } from '@nestjs/common';

import { DataProcessingModule } from '@/modules/features/data-processing/data-processing.module';

import { CacheController } from './cache.controller';
import { CacheService } from './cache.service';
import { PrefixerService } from './prefixer.service';
import { RedisService } from './redis.service';

@Module({
    imports: [DataProcessingModule],
    providers: [RedisService, CacheService, PrefixerService],
    controllers: [CacheController],
    exports: [CacheService, PrefixerService],
})
export class CacheModule {}
