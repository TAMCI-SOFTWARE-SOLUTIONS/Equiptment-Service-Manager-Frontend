import {FileEntity} from '../../../../entities/file/model/file.entity';

export type PreviewFileType = 'image' | 'video' | 'pdf' | 'unknown';

export interface PreviewFile {
  fileEntity: FileEntity;
  url?: string;
  thumbnailUrl?: string;
  type: PreviewFileType;
}

export interface PreviewConfig {
  allowFullscreen: boolean;
  allowZoom: boolean;
  allowDownload: boolean;
  showThumbnails: boolean;
  closeOnBackdrop: boolean;
  closeOnEsc: boolean;
  darkMode: boolean;
}

export const DEFAULT_PREVIEW_CONFIG: PreviewConfig = {
  allowFullscreen: true,
  allowZoom: true,
  allowDownload: true,
  showThumbnails: true,
  closeOnBackdrop: true,
  closeOnEsc: true,
  darkMode: true
};
