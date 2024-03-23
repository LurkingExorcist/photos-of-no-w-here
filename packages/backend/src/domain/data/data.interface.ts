export interface Post {
  media: Media[];
}

export interface Media {
  uri: string;
  creation_timestamp: number;
  media_metadata?: MediaMetadata;
  title: string;
  cross_post_source: CrossPostSource;
  average_color?: string;
}

export interface CrossPostSource {
  source_app: string;
}

export interface MediaMetadata {
  photo_metadata?: PhotoMetadata;
  video_metadata?: VideoMetadata;
}

export interface PhotoMetadata {
  exif_data: PhotoMetadataExifDatum[];
}

export interface PhotoMetadataExifDatum {
  scene_capture_type?: string;
  software?: string;
  device_id: string;
  date_time_digitized?: string;
  date_time_original?: string;
  source_type: string;
}

export interface VideoMetadata {
  exif_data: VideoMetadataExifDatum[];
}

export interface VideoMetadataExifDatum {
  device_id: string;
  date_time_original: string;
  source_type: string;
}
