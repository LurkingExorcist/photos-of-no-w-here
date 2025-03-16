import { Module } from '@nestjs/common';

import { ConfigModule } from '@/domain/config/config.module';

import { MediaColorService } from './media-color.service';

@Module({
    imports: [ConfigModule],
    providers: [MediaColorService],
    exports: [MediaColorService],
})
export class MediaColorModule {}
