export type HSLColor = [h: number, s: number, l: number];
export type HexColor = string;
export type RGBAColor = [r: number, g: number, b: number, a: number];

/**
 * Represents a readable file with its metadata
 */
export interface IReadableFile {
    /** The name of the field in the form data */
    fieldname: string;
    /** The original name of the file */
    originalname: string;
    /** The encoding of the file */
    encoding: string;
    /** The MIME type of the file */
    mimetype: string;
    /** The buffer containing the file data */
    buffer: Buffer;
    /** The size of the file in bytes */
    size: number;
}

/**
 * Represents a social media post containing an array of media items
 */
export type Post = {
    /** Array of media items associated with this post */
    media: Media[];
};

/**
 * Represents a media item with its metadata and properties
 */
export type Media = {
    /** URI path to the media file */
    uri: string;
    /** Unix timestamp of when the media was created */
    creation_timestamp: number;
    /** Optional metadata for photo or video content */
    media_metadata?: MediaMetadata;
    /** Title or caption of the media */
    title: string;
    /** Information about the original source if cross-posted */
    cross_post_source: CrossPostSource;
    /** Backup URI for the media */
    backup_uri: string;
    /** Computed average color of the media in hex format (e.g. "#FFFFFF") */
    average_color?: string;
    /** Raw RGBA values of the computed average color [r, g, b, a] */
    average_color_rgba?: RGBAColor;
    /** Computed average color of the media in HSL format [h, s, l] */
    average_color_hsl?: HSLColor;
    average_color_hsl_number?: string;
};

// Rest of the types from data.types.ts

export type CrossPostSource = {
    source_app: string;
};

export type CameraMetadata = {
    has_camera_metadata: boolean;
};

export type MediaMetadata = {
    photo_metadata?: PhotoMetadata;
    video_metadata?: VideoMetadata;
    camera_metadata?: CameraMetadata;
};

export type PhotoMetadata = {
    exif_data: PhotoMetadataExifDatum[];
};

export type PhotoMetadataExifDatum = {
    scene_capture_type?: string;
    software?: string;
    device_id: string;
    date_time_digitized?: string;
    date_time_original?: string;
    source_type: string;
};

export type VideoMetadata = {
    exif_data: VideoMetadataExifDatum[];
};

export type VideoMetadataExifDatum = {
    device_id: string;
    date_time_original: string;
    source_type: string;
};

export type WorkerData = {
    medias: Media[];
    threadCount: number;
    workerIndex: number;
};

export interface PaginatedResponse<T> {
    items: T[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
} 
