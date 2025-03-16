import { Module } from '@nestjs/common';
import { MediaColorProcessorService } from './media-color-processor.service';
import { ConfigModule } from '@/config/config.module';
import { RedisModule } from '@/external/redis/redis.module';

@Module({
    imports: [ConfigModule, RedisModule],
    providers: [MediaColorProcessorService],
    exports: [MediaColorProcessorService],
})
export class MediaColorProcessorModule {}
