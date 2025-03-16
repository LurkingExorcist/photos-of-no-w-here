import { Logger, Module } from '@nestjs/common';

import { RedisModule } from '@/external/redis/redis.module';

import { PhotoController } from './photo.controller';

@Module({
    imports: [RedisModule],
    controllers: [PhotoController],
    providers: [Logger],
})
export class PhotoModule {}
