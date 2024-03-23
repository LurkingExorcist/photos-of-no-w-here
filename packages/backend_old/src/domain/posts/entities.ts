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
  source_app: SourceApp;
}

export type SourceApp = "FB";

export interface MediaMetadata {
  photo_metadata?: PhotoMetadata;
  video_metadata?: VideoMetadata;
}

export interface PhotoMetadata {
  exif_data: PhotoMetadataExifDatum[];
}

export interface PhotoMetadataExifDatum {
  scene_capture_type?: SceneCaptureType;
  software?: Software;
  device_id: DeviceID;
  date_time_digitized?: string;
  date_time_original?: string;
  source_type: string;
}

export type DeviceID = "android-2ab92768a4536147";

export type SceneCaptureType = "standard";

export type Software =
  | "willow_ru-user 11 RKQ1.201004.002 V12.5.1.0.RCXRUXM release-keys"
  | "willow_ru-user 10 QKQ1.200114.002 V12.0.5.0.QCXRUXM release-keys"
  | "MediaTek Camera Application?"
  | "vince-user 7.1.2 N2G47H V9.2.0.2.NEGMIEI release-keys"
  | "willow_ru-user 10 QKQ1.200114.002 V12.0.4.0.QCXRUXM release-keys"
  | "willow_ru-user 10 QKQ1.200114.002 V12.0.2.0.QCXRUXM release-keys";

export interface VideoMetadata {
  exif_data: VideoMetadataExifDatum[];
}

export interface VideoMetadataExifDatum {
  device_id: DeviceID;
  date_time_original: string;
  source_type: string;
}
