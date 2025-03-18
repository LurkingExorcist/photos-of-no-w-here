import { Module } from '@nestjs/common';

import { DataService } from '../data/data.service';
import { MediaColorModule } from '../media-color/media-color.module';

import { CacheController } from './cache.controller';
import { CacheService } from './cache.service';
import { PrefixerService } from './prefixer.service';
import { RedisService } from './redis.service';

@Module({
    imports: [MediaColorModule],
    providers: [RedisService, CacheService, PrefixerService, DataService],
    controllers: [CacheController],
    exports: [CacheService, PrefixerService],
})
export class CacheModule {}
