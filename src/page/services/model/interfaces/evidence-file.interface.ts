import {EvidenceType} from '../types/evidence-type.type';
import {FileEntity} from '../../../../entities/file/model/file.entity';

export interface EvidenceFile {
  fileEntity: FileEntity;
  previewUrl?: string;
  isLoading?: boolean;
}

export interface EvidenceConfig {
  type: EvidenceType;
  label: string;
  description: string;
  accept: string;
  icon: string;
  allowCapture: boolean;
  captureLabel?: string;
  multiple?: boolean;
  maxFiles?: number;
  required: boolean;
}
