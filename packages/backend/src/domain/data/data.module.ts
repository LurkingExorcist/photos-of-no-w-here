import { Logger, Module } from '@nestjs/common';

import { RedisModule } from '@/external/redis/redis.module';

import { CacheModule } from '../cache/cache.module';
import { MediaColorModule } from '../media-color/media-color.module';

import { DataController } from './data.controller';
import { DataService } from './data.service';

@Module({
    imports: [RedisModule, CacheModule, MediaColorModule],
    providers: [DataService, Logger],
    controllers: [DataController],
    exports: [DataService],
})
export class DataModule {}
