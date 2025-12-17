export enum ProcessingStatus {
  IDLE = 'IDLE',
  PROCESSING = 'PROCESSING',
  COMPLETED = 'COMPLETED',
  ERROR = 'ERROR',
}

export interface ExtractedData {
  fullName: string | null;
  jobTitle: string | null;
  companyName: string | null;
  email: string | null;
  phoneNumber: string | null;
  address: string | null;
  website: string | null;
}

export interface BusinessCardItem {
  id: string;
  file: File;
  previewUrl: string;
  status: ProcessingStatus;
  data?: ExtractedData[];
  error?: string;
}

export interface ProcessingStats {
  total: number;
  completed: number;
  failed: number;
}