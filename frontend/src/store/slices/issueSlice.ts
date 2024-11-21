import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { Issue, IssueCategory, IssuePriority, IssueStatus, Comment, CreateIssueDto } from '../../types/issue';
import api from '../../services/api';

interface IssueFilters {
  query?: string;
  categories?: IssueCategory[];
  priorities?: IssuePriority[];
  statuses?: IssueStatus[];
  startDate?: string;
  endDate?: string;
  tags?: string[];
  location?: {
    lat: number;
    lng: number;
    radius: number;
  };
  sortBy?: 'votes' | 'date' | 'priority';
  sortOrder?: 'asc' | 'desc';
}

interface Facets {
  categories: { [key in IssueCategory]: number };
  priorities: { [key in IssuePriority]: number };
  statuses: { [key in IssueStatus]: number };
  tags: { [key: string]: number };
}

interface IssueState {
  issues: Issue[];
  currentIssue: Issue | null;
  comments: Comment[];
  loading: boolean;
  error: string | null;
  filters: IssueFilters;
  facets: Facets;
  pagination: {
    page: number;
    limit: number;
    total: number;
  };
}

const initialState: IssueState = {
  issues: [],
  currentIssue: null,
  comments: [],
  loading: false,
  error: null,
  filters: {},
  facets: {
    categories: {} as { [key in IssueCategory]: number },
    priorities: {} as { [key in IssuePriority]: number },
    statuses: {} as { [key in IssueStatus]: number },
    tags: {},
  },
  pagination: {
    page: 1,
    limit: 10,
    total: 0,
  },
};

export const fetchIssues = createAsyncThunk(
  'issues/fetchIssues',
  async (_, { getState, rejectWithValue }) => {
    try {
      const state = getState() as { issues: IssueState };
      const { filters, pagination } = state.issues;
      const response = await api.get('/issues', {
        params: {
          ...filters,
          page: pagination.page,
          limit: pagination.limit,
        },
      });
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch issues');
    }
  }
);

export const fetchIssueById = createAsyncThunk(
  'issues/fetchIssueById',
  async (issueId: string, { rejectWithValue }) => {
    try {
      const response = await api.get(`/issues/${issueId}`);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch issue');
    }
  }
);

export const fetchComments = createAsyncThunk(
  'issues/fetchComments',
  async (issueId: string, { rejectWithValue }) => {
    try {
      const response = await api.get(`/issues/${issueId}/comments`);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch comments');
    }
  }
);

export const addComment = createAsyncThunk(
  'issues/addComment',
  async ({ issueId, content }: { issueId: string; content: string }, { rejectWithValue }) => {
    try {
      const response = await api.post(`/issues/${issueId}/comments`, { content });
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to add comment');
    }
  }
);

export const voteOnIssue = createAsyncThunk(
  'issues/voteOnIssue',
  async ({ issueId, voteType }: { issueId: string; voteType: 'up' | 'down' }, { rejectWithValue }) => {
    try {
      const response = await api.post(`/issues/${issueId}/vote`, { voteType });
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to vote on issue');
    }
  }
);

export const updateIssueStatus = createAsyncThunk(
  'issues/updateStatus',
  async ({ issueId, status }: { issueId: string; status: IssueStatus }, { rejectWithValue }) => {
    try {
      const response = await api.patch(`/issues/${issueId}/status`, { status });
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to update issue status');
    }
  }
);

export const createIssue = createAsyncThunk(
  'issues/create',
  async (issueData: CreateIssueDto, { rejectWithValue }) => {
    try {
      const formData = new FormData();
      
      // Add basic issue data
      formData.append('title', issueData.title);
      formData.append('description', issueData.description);
      formData.append('category', issueData.category);
      formData.append('priority', issueData.priority);
      formData.append('isAnonymous', String(issueData.isAnonymous));
      
      // Add location data
      formData.append('location', JSON.stringify(issueData.location));
      
      // Add tags if present
      if (issueData.tags && issueData.tags.length > 0) {
        formData.append('tags', JSON.stringify(issueData.tags));
      }
      
      // Add attachments if present
      if (issueData.attachments) {
        issueData.attachments.forEach((file, index) => {
          formData.append(`attachments`, file);
        });
      }

      const response = await api.post('/issues', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to create issue');
    }
  }
);

const issueSlice = createSlice({
  name: 'issues',
  initialState,
  reducers: {
    setFilters(state, action: PayloadAction<IssueFilters>) {
      state.filters = action.payload;
      state.pagination.page = 1; // Reset page when filters change
    },
    setPage(state, action: PayloadAction<number>) {
      state.pagination.page = action.payload;
    },
    clearFilters(state) {
      state.filters = {};
      state.pagination.page = 1;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchIssues.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchIssues.fulfilled, (state, action) => {
        state.loading = false;
        state.issues = action.payload.issues;
        state.facets = action.payload.facets;
        state.pagination.total = action.payload.total;
      })
      .addCase(fetchIssues.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      .addCase(fetchIssueById.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchIssueById.fulfilled, (state, action) => {
        state.loading = false;
        state.currentIssue = action.payload;
      })
      .addCase(fetchIssueById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      .addCase(fetchComments.fulfilled, (state, action) => {
        state.comments = action.payload;
      })
      .addCase(addComment.fulfilled, (state, action) => {
        state.comments.push(action.payload);
      })
      .addCase(voteOnIssue.fulfilled, (state, action) => {
        if (state.currentIssue && state.currentIssue.id === action.payload.id) {
          state.currentIssue = action.payload;
        }
        const index = state.issues.findIndex(issue => issue.id === action.payload.id);
        if (index !== -1) {
          state.issues[index] = action.payload;
        }
      })
      .addCase(updateIssueStatus.fulfilled, (state, action) => {
        if (state.currentIssue && state.currentIssue.id === action.payload.id) {
          state.currentIssue = action.payload;
        }
        const index = state.issues.findIndex(issue => issue.id === action.payload.id);
        if (index !== -1) {
          state.issues[index] = action.payload;
        }
      })
      .addCase(createIssue.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createIssue.fulfilled, (state, action) => {
        state.loading = false;
        state.issues.unshift(action.payload);
        state.pagination.total += 1;
      })
      .addCase(createIssue.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  },
});

export const { setFilters, setPage, clearFilters } = issueSlice.actions;
export default issueSlice.reducer;
