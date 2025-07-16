import { Injectable, NotFoundException } from '@nestjs/common';

import { CacheService } from '@/modules/shared/cache/cache.service';

@Injectable()
export class PhotoService {
    constructor(private readonly cacheService: CacheService) {}

    public async getPhotoPath(colorHex: string): Promise<string> {
        const photoPath = await this.cacheService.get('color', colorHex);

        if (!photoPath) {
            throw new NotFoundException('Photo not found');
        }

        return photoPath;
    }
} 