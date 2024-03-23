import { Readable } from 'stream';

export interface IReadableFile {
  filename: string;
  stream: Readable;
}
