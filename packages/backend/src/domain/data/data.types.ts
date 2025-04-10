import type { HSLColor, RGBAColor } from '../media-color/media-color.types';

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

/**
 * Information about the source of a cross-posted media item
 */
export type CrossPostSource = {
    /** Name or identifier of the application that originally created the media */
    source_app: string;
};

export type CameraMetadata = {
    /** Whether the camera metadata is available */
    has_camera_metadata: boolean;
};

/**
 * Container for either photo or video metadata
 */
export type MediaMetadata = {
    /** Metadata specific to photo media */
    photo_metadata?: PhotoMetadata;
    /** Metadata specific to video media */
    video_metadata?: VideoMetadata;

    /** Metadata specific to photo media */
    camera_metadata?: CameraMetadata;
};

/**
 * Metadata specific to photo media types
 */
export type PhotoMetadata = {
    /** Array of EXIF data entries extracted from the photo */
    exif_data: PhotoMetadataExifDatum[];
};

/**
 * EXIF metadata entry for a photo
 */
export type PhotoMetadataExifDatum = {
    /** Type of scene captured (e.g. landscape, portrait) */
    scene_capture_type?: string;
    /** Software used to create or edit the photo */
    software?: string;
    /** Unique identifier of the device that captured the photo */
    device_id: string;
    /** Timestamp when the photo was digitized */
    date_time_digitized?: string;
    /** Original timestamp when the photo was taken */
    date_time_original?: string;
    /** Type of source that created the photo */
    source_type: string;
};

/**
 * Metadata specific to video media types
 */
export type VideoMetadata = {
    /** Array of EXIF data entries extracted from the video */
    exif_data: VideoMetadataExifDatum[];
};

/**
 * EXIF metadata entry for a video
 */
export type VideoMetadataExifDatum = {
    /** Unique identifier of the device that captured the video */
    device_id: string;
    /** Original timestamp when the video was recorded */
    date_time_original: string;
    /** Type of source that created the video */
    source_type: string;
};

/**
 * Configuration data for worker threads processing media
 */
export type WorkerData = {
    /** Array of media items to be processed by the worker */
    medias: Media[];
    /** Total number of worker threads being used */
    threadCount: number;
    /** Index of this worker thread (0-based) */
    workerIndex: number;
};

/**
 * Represents a paginated response for any type of data
 */
export interface PaginatedResponse<T> {
    /** Array of items for the current page */
    items: T[];
    /** Total number of items across all pages */
    total: number;
    /** Current page number (1-based) */
    page: number;
    /** Number of items per page */
    limit: number;
    /** Total number of pages */
    totalPages: number;
}
