import { Module, Logger } from '@nestjs/common';
import { RedisService } from './redis.service';
import { PrefixerService } from './prefixer.service';

@Module({
    providers: [RedisService, PrefixerService, Logger],
    exports: [RedisService, PrefixerService],
})
export class RedisModule {}
