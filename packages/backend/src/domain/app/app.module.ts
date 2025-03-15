import { Logger, Module } from '@nestjs/common';
import { DataService } from '../data/data.service';
import { DataController } from '../data/data.controller';
import { RedisService } from 'services/RedisService';
import { PhotoController } from '../photo/photo.controller';

@Module({
    imports: [],
    controllers: [DataController, PhotoController],
    providers: [Logger, RedisService, DataService],
})
export class AppModule {}
