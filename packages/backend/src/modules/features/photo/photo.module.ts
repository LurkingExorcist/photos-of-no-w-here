import { Logger, Module } from '@nestjs/common';

import { CacheModule } from '@/modules/shared/cache/cache.module';

import { PhotoController } from './photo.controller';
import { PhotoService } from './photo.service';

@Module({
    imports: [CacheModule],
    controllers: [PhotoController],
    providers: [PhotoService, Logger],
})
export class PhotoModule {}
