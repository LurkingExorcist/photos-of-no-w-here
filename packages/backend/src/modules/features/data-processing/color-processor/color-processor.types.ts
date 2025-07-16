import type { Media } from '@/modules/features/data-processing/data-processing.types';

export interface MediaColorProcessorData {
    medias: Media[];
    threadCount: number;
    workerIndex: number;
}

export interface RedisConfig {
    host: string;
    port: number;
}
