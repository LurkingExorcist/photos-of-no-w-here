import { Logger, Module } from '@nestjs/common';

import { CacheModule } from '../cache/cache.module';

import { PhotoController } from './photo.controller';

@Module({
    imports: [CacheModule],
    controllers: [PhotoController],
    providers: [Logger],
})
export class PhotoModule {}
