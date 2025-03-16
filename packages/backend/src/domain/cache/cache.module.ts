import { Module } from '@nestjs/common';

import { RedisModule } from '@/external/redis/redis.module';

import { CacheController } from './cache.controller';
import { CacheService } from './cache.service';
import { PrefixerService } from './prefixer.service';

@Module({
    imports: [RedisModule],
    providers: [CacheService, PrefixerService],
    controllers: [CacheController],
    exports: [CacheService, PrefixerService],
})
export class CacheModule {}
