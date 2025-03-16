import { Module, Logger } from '@nestjs/common';
import { PhotoController } from './photo.controller';
import { RedisModule } from '@/external/redis/redis.module';

@Module({
    imports: [RedisModule],
    controllers: [PhotoController],
    providers: [Logger],
})
export class PhotoModule {}
