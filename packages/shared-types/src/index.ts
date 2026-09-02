export enum EmailJobStatus {
  SCHEDULED = 'SCHEDULED',
  SENT = 'SENT',
  FAILED = 'FAILED',
  RATE_LIMITED = 'RATE_LIMITED'
}

export enum CampaignStatus {
  DRAFT = 'DRAFT',
  SCHEDULED = 'SCHEDULED',
  PROCESSING = 'PROCESSING',
  COMPLETED = 'COMPLETED',
  PAUSED = 'PAUSED'
}

export interface UserDTO {
  id: string;
  name: string;
  email: string;
  avatar?: string | null;
  googleId?: string | null;
  createdAt: string;
}

export interface SenderDTO {
  id: string;
  userId: string;
  senderName: string;
  senderEmail: string;
  etherealHost?: string;
  etherealPort?: number;
  etherealUser?: string;
  etherealPassword?: string;
  createdAt?: string;
}

export interface CampaignDTO {
  id: string;
  userId: string;
  name: string;
  subject: string;
  body: string;
  startTime: string;
  delayBetweenEmails: number; // in seconds
  hourlyLimit: number;
  status: CampaignStatus;
  createdAt: string;
  _count?: {
    leads: number;
    emailJobs: number;
  };
}

export interface LeadDTO {
  id: string;
  campaignId: string;
  email: string;
}

export interface EmailJobDTO {
  id: string;
  campaignId: string;
  leadId: string;
  senderId: string;
  subject: string;
  body: string;
  scheduledAt: string;
  sentAt?: string | null;
  status: EmailJobStatus;
  bullJobId?: string | null;
  retryCount: number;
  createdAt: string;
  lead?: {
    email: string;
  };
  sender?: {
    senderName: string;
    senderEmail: string;
  };
  campaign?: {
    name: string;
  };
  previewUrl?: string | null;
}

export interface SlackConnectionDTO {
  id: string;
  userId: string;
  workspaceId: string;
  teamName?: string | null;
  isConnected: boolean;
  createdAt?: string;
}

export interface CreateCampaignInput {
  name: string;
  subject: string;
  body: string;
  startTime: string;
  delayBetweenEmails: number; // in seconds
  hourlyLimit: number;
  senderId?: string;
  leads: string[];
}

export interface SearchEmailsQuery {
  q: string;
  status?: EmailJobStatus;
  startDate?: string;
  endDate?: string;
  page?: number;
  limit?: number;
}

export interface DashboardMetricsDTO {
  scheduledCount: number;
  sentCount: number;
  failedCount: number;
  rateLimitEventsCount: number;
  recentActivity: Array<{
    id: string;
    type: 'SCHEDULED' | 'SENT' | 'FAILED' | 'RATE_LIMITED';
    message: string;
    timestamp: string;
  }>;
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}
