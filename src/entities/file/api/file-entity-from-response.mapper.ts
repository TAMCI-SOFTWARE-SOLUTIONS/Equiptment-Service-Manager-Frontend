import {FileResponseDto} from './file-response.dto';
import {FileEntity} from '../model/file.entity';

export class FileEntityFromResponseMapper {
  static fromDtoToEntity(dto: FileResponseDto): FileEntity {
    return {
      id: dto.id ?? '',
      originalName: dto.name ?? '',
      contentType: dto.contentType ?? '',
      size: dto.size ?? 0,
      uploadDate: dto.uploadDate ? new Date(dto.uploadDate) : undefined
    };
  }
}
