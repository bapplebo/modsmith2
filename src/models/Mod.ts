export interface Mod extends ModWithoutMetadata {
  title?: string;
  author?: string;
  lastUpdated?: string;
  category?: string;
  url?: string;
}

export interface ModWithoutMetadata {
  filename: string;
  filePath: string;
  imagePath: string;
  modId: string;
}
