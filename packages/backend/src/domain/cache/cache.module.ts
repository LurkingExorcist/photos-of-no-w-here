import { Module } from '@nestjs/common';
import { RedisModule } from '@/external/redis/redis.module';
import { CacheService } from './cache.service';
import { CacheController } from './cache.controller';
import { PrefixerService } from './prefixer.service';

@Module({
    imports: [RedisModule],
    providers: [CacheService, PrefixerService],
    controllers: [CacheController],
    exports: [CacheService, PrefixerService],
})
export class CacheModule {}
