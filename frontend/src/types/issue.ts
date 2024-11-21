export enum IssueStatus {
  PENDING = 'pending',
  ACTIVE = 'active',
  RESOLVED = 'resolved',
  REJECTED = 'rejected'
}

export enum IssuePriority {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
  CRITICAL = 'critical'
}

export enum IssueCategory {
  HEALTHCARE = 'healthcare',
  EDUCATION = 'education',
  SECURITY = 'security',
  INFRASTRUCTURE = 'infrastructure',
  ENVIRONMENT = 'environment',
  GOVERNANCE = 'governance',
  ECONOMY = 'economy',
  SOCIAL = 'social',
  OTHER = 'other'
}

export interface Location {
  lat: number;
  lng: number;
  address: string;
  radius?: number;
}

export interface Vote {
  id: string;
  userId: string;
  voteType: 'up' | 'down';
  createdAt: string;
}

export interface Comment {
  id: string;
  content: string;
  userId: string;
  username: string;
  isAnonymous: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Issue {
  id: string;
  title: string;
  description: string;
  category: IssueCategory;
  priority: IssuePriority;
  status: IssueStatus;
  location: Location;
  userId: string;
  username: string;
  isAnonymous: boolean;
  attachments?: string[];
  tags?: string[];
  votes: Vote[];
  voteCount: number;
  comments: Comment[];
  commentsCount: number;
  createdAt: string;
  updatedAt: string;
  aiPrediction?: {
    category: IssueCategory;
    confidence: number;
  };
}

export interface SearchResponse {
  issues: Issue[];
  total: number;
  facets: {
    categories: { [key in IssueCategory]: number };
    priorities: { [key in IssuePriority]: number };
    statuses: { [key in IssueStatus]: number };
    tags: { [key: string]: number };
  };
}

export interface CreateIssueDto {
  title: string;
  description: string;
  category: IssueCategory;
  priority: IssuePriority;
  location: Location;
  isAnonymous: boolean;
  tags?: string[];
  attachments?: File[];
}

export interface UpdateIssueDto {
  title?: string;
  description?: string;
  category?: IssueCategory;
  status?: IssueStatus;
  priority?: IssuePriority;
  location?: Partial<Location>;
  tags?: string[];
  attachments?: File[];
}
