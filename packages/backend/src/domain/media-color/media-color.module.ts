import { Module } from '@nestjs/common';

import { ConfigModule } from '@/config/config.module';
import { RedisModule } from '@/external/redis/redis.module';

import { MediaColorService } from './media-color.service';

@Module({
    imports: [ConfigModule, RedisModule],
    providers: [MediaColorService],
    exports: [MediaColorService],
})
export class MediaColorModule {}
