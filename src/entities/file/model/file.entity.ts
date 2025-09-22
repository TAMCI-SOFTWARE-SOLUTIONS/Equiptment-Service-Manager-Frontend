export interface FileEntity {
  id: string;
  originalName: string;
  contentType: string;
  size: number;
  uploadDate?: Date;
}
