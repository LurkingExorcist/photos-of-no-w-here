import path from 'path';
import fs from 'fs';
import afs from 'fs/promises';
import { Injectable } from '@nestjs/common';
import { IReadableFile } from 'src/types/common';
import { Media, Post } from './data.interface';
import sharp from 'sharp';
import { getAverageColor } from 'fast-average-color-node';
import decompress from 'decompress';

const UPLOAD_PATH = path.resolve('temp'); // Register the upload path

if (!fs.existsSync(UPLOAD_PATH)) {
  fs.mkdirSync(UPLOAD_PATH);
}

const DATA_PATH = path.resolve('data'); // Register the data path

if (!fs.existsSync(DATA_PATH)) {
  fs.mkdirSync(DATA_PATH);
}

@Injectable()
export class DataService {
  private async processArchive({ filename, stream }: IReadableFile) {
    return new Promise<void>((resolve, reject) => {
      if (!filename.endsWith('.zip')) {
        return reject(new Error('Zip file is required.'));
      }

      const filePath = path.join(UPLOAD_PATH, filename);

      console.log(`Upload of '${filename}' started`);

      const fstream = fs.createWriteStream(filePath);
      stream.pipe(fstream);

      fstream.on('close', async () => {
        console.log(`Decompressing of '${filename}' started...`);

        await decompress(filePath, DATA_PATH);

        console.log(`Decompressing of '${filename}' finished`);

        console.log(`Deleting of '${filename}' started...`);

        fs.rmSync(filePath);

        console.log(`Deleting of '${filename}' finished`);

        resolve();
      });
    });
  }

  private async getPosts(): Promise<Post[]> {
    const postsPath = path.resolve(
      'data/your_instagram_activity/content/posts_1.json',
    );

    console.log('Getting posts...');

    return afs
      .readFile(postsPath, { encoding: 'utf8' })
      .then((module) => JSON.parse(module));
  }

  async upload(archive: IReadableFile) {
    await this.processArchive(archive);

    const posts = await this.getPosts();

    const medias: Media[] = [];

    posts.forEach(({ media: [media] }) => {});

    for (let i = 0; i < posts.length; i++) {
      const {
        media: [media],
      } = posts[i];

      let postPath = path.resolve(DATA_PATH, media.uri);
      const match = postPath.match(/(.+)\/(.+)\.(\w+)$/);

      if (!match) {
        throw new Error(`Path ${postPath} doesn't fit to match pattern`);
      }

      const [_full, location, name, ext] = match;

      if (ext === 'mp4') {
        continue;
      }

      media.uri = `${location}/${name}.webp`;
      console.log(`Processing file: ${media.uri}...`);

      switch (ext) {
        case 'jpg':
        case 'jpeg':
        case 'heic':
          await sharp(postPath).jpeg().toFile(media.uri);

          console.log(`Extension is changed for: ${media.uri}`);

          postPath = path.resolve(DATA_PATH, media.uri);
          break;
      }

      const color = await getAverageColor(postPath);
      media.average_color = color.hex;

      medias.push(media);
    }

    console.log('Starting caching...');

    console.log('Caching is complete');

    console.log('Overriding old posts data...');

    await afs.writeFile(postsPath, JSON.stringify(posts));

    console.log('Overriding complete');

    console.log('Updating the cache...');

    cache.update();

    console.log('Cache is updated');

    res.json({
      success: true,
    });
  }
}
