import path from 'path';
import fs from 'fs';
import os from 'os';
import afs from 'fs/promises';
import { Injectable, Logger } from '@nestjs/common';
import { IReadableFile } from 'src/types/common';
import { Media, Post } from './data.interface';
import sharp from 'sharp';
import { getAverageColor } from 'fast-average-color-node';
import decompress from 'decompress';
import { sortBy } from 'lodash';
import { WorkerData } from './data.worker';
import { Worker } from 'worker_threads';

const TEMP_UPLOAD_PATH = path.resolve('temp'); // Register the upload path

if (!fs.existsSync(TEMP_UPLOAD_PATH)) {
    fs.mkdirSync(TEMP_UPLOAD_PATH);
}

const INSTAGRAM_DATA_PATH = path.resolve('instagram_data'); // Register the data path

const POSTS_CONFIG_PATH = path.resolve(
    INSTAGRAM_DATA_PATH + '/your_instagram_activity/content/posts_1.json'
);

if (!fs.existsSync(INSTAGRAM_DATA_PATH)) {
    fs.mkdirSync(INSTAGRAM_DATA_PATH);
}

@Injectable()
export class DataService {
    constructor(private readonly logger: Logger) {}

    private async processArchive({ originalname, buffer }: IReadableFile) {
        if (!originalname.endsWith('.zip')) {
            return new Error('Zip file is required.');
        }

        this.logger.log(`Upload of '${originalname}' started`);

        const filePath = path.join(TEMP_UPLOAD_PATH, originalname);
        await afs.writeFile(filePath, buffer);

        this.logger.log(`Decompressing of '${originalname}' started...`);

        await decompress(filePath, INSTAGRAM_DATA_PATH);

        this.logger.log(`Decompressing of '${originalname}' finished`);
        this.logger.log(`Deleting of '${originalname}' started...`);

        fs.rmSync(filePath);

        this.logger.log(`Deleting of '${originalname}' finished`);
    }

    private async getPosts(): Promise<Post[]> {
        this.logger.log('Getting posts...');

        return afs
            .readFile(POSTS_CONFIG_PATH, { encoding: 'utf8' })
            .then((module) => JSON.parse(module));
    }

    async processMediaToColors(workerData: WorkerData) {
        return new Promise<void>((resolve, reject) => {
            const worker = new Worker('./src/domain/data/data.worker.js', {
                workerData,
            });

            worker.on('message', (message) => {
                this.logger.log(message);
            });

            worker.on('close', () => {
                resolve();
            });

            worker.on('error', (msg) => {
                reject(`An error ocurred: ${msg}`);
            });
        });
    }

    async upload(archive: IReadableFile) {
        await this.processArchive(archive);

        const posts = await this.getPosts();

        const medias: Media[] = [];

        for (let i = 0; i < posts.length; i++) {
            const {
                media: [media],
            } = posts[i];

            let postPath = path.resolve(INSTAGRAM_DATA_PATH, media.uri);
            const match = postPath.match(/(.+)\/(.+)\.(\w+)$/);

            if (!match) {
                throw new Error(
                    `Path ${postPath} doesn't fit to match pattern`
                );
            }

            const [_full, location, name, ext] = match;

            if (ext === 'mp4') {
                continue;
            }

            media.uri = `${location}/${name}.webp`;
            this.logger.log(`Processing file: ${media.uri}...`);

            switch (ext) {
                case 'jpg':
                case 'jpeg':
                case 'heic':
                    await sharp(postPath).webp().toFile(media.uri);

                    this.logger.log(`Extension is changed for: ${media.uri}`);

                    postPath = path.resolve(INSTAGRAM_DATA_PATH, media.uri);
                    break;
            }

            const color = await getAverageColor(postPath);
            media.average_color = color.hex;
            media.average_color_raw = color.value;

            posts[i].media[0] = media;
            medias.push(media);
        }

        this.logger.log('Overriding old posts data...');

        await afs.writeFile(POSTS_CONFIG_PATH, JSON.stringify(posts));

        this.logger.log('Overriding complete');

        await this.verifyCache(medias);
    }

    async verifyCache(inputMedias?: Media[]) {
        const medias = sortBy(
            inputMedias ??
                (await this.getPosts().then((posts) =>
                    posts.map((post) => post.media[0])
                )),
            (media) => media.average_color
        );

        this.logger.log('Updating cache...');

        const threadCount = os.cpus().length;
        await Promise.all(
            Array.from({ length: threadCount }, (_, workerIndex) =>
                this.processMediaToColors({
                    medias,
                    threadCount,
                    workerIndex,
                })
            )
        );

        this.logger.log('Cache is successfully updated');
    }
}
