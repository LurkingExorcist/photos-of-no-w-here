import { Injectable } from '@nestjs/common';
import { ConfigService as NestConfigService } from '@nestjs/config';

@Injectable()
export class ConfigService {
    constructor(private configService: NestConfigService) {}

    public get redisHost(): string {
        return this.configService.get<string>('REDIS_HOST', 'localhost');
    }

    public get redisPort(): number {
        return this.configService.get<number>('REDIS_PORT', 6379);
    }

    public get port(): number {
        return this.configService.get<number>('PORT', 3333);
    }
}
