import { Module } from '@nestjs/common';
import { MediaColorService } from './media-color.service';
import { ConfigModule } from '@/config/config.module';
import { RedisModule } from '@/external/redis/redis.module';

@Module({
    imports: [ConfigModule, RedisModule],
    providers: [MediaColorService],
    exports: [MediaColorService],
})
export class MediaColorModule {}
