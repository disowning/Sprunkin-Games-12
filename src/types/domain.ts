export interface Domain {
  id: string;
  domain: string;
  isActive: boolean;
  isValid?: boolean;
  lastChecked?: Date;
  createdAt: string;
} 