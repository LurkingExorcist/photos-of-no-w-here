import { Module, Logger } from '@nestjs/common';
import { DataService } from './data.service';
import { DataController } from './data.controller';
import { RedisModule } from '@/external/redis/redis.module';
import { CacheModule } from '../cache/cache.module';
import { MediaColorModule } from '../media-color/media-color.module';

@Module({
    imports: [RedisModule, CacheModule, MediaColorModule],
    providers: [DataService, Logger],
    controllers: [DataController],
    exports: [DataService],
})
export class DataModule {}
