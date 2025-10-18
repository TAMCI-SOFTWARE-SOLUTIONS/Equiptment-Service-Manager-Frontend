export interface FileResponseDto {
  id: string | null;
  name: string | null;
  contentType: string | null;
  size: number | null;
  uploadDate?: string | null;
}
