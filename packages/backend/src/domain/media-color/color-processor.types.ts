import type { Media } from '../data/data.types';

export interface MediaColorProcessorData {
    medias: Media[];
    threadCount: number;
    workerIndex: number;
}

export interface RedisConfig {
    host: string;
    port: number;
}
