import { Module } from '@nestjs/common';
import { RedisModule } from '@/external/redis/redis.module';
import { DataService } from './data.service';
import { MediaColorModule } from '../media-color/media-color.module';
import { DataController } from './data.controller';

@Module({
    imports: [RedisModule, MediaColorModule],
    providers: [DataService],
    controllers: [DataController],
    exports: [DataService],
})
export class DataModule {}
