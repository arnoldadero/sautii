export type IssueCategory =
  | 'healthcare'
  | 'education'
  | 'security'
  | 'infrastructure'
  | 'environment'
  | 'governance'
  | 'economy'
  | 'social'
  | 'other';

export type IssueStatus = 'pending' | 'active' | 'resolved' | 'rejected';

export type IssuePriority = 'low' | 'medium' | 'high' | 'critical';

export interface Location {
  latitude: number;
  longitude: number;
  address?: string;
  county?: string;
  constituency?: string;
  ward?: string;
}

export interface IssueComment {
  id: string;
  content: string;
  authorId?: string;
  authorName: string;
  createdAt: string;
  updatedAt: string;
  isAnonymous: boolean;
}

export interface IssueVote {
  id: string;
  userId: string;
  voteType: 'up' | 'down';
  createdAt: string;
  tokenId?: string; // Blockchain token ID
}

export interface Issue {
  id: string;
  title: string;
  description: string;
  category: IssueCategory;
  status: IssueStatus;
  priority: IssuePriority;
  location: Location;
  isAnonymous: boolean;
  authorId?: string;
  authorName?: string;
  createdAt: string;
  updatedAt: string;
  dueDate?: string;
  assignedTo?: string[];
  tags: string[];
  attachments?: string[];
  votes: IssueVote[];
  comments: IssueComment[];
  viewCount: number;
  voteCount: number;
  commentCount: number;
}

export interface CreateIssueDto {
  title: string;
  description: string;
  category: IssueCategory;
  priority: IssuePriority;
  location: Location;
  isAnonymous: boolean;
  tags: string[];
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
