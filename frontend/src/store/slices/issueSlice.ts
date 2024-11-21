import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { Issue, CreateIssueDto, UpdateIssueDto } from '../../types/issue';
import { api } from '../../services/api';

interface IssueState {
  issues: Issue[];
  currentIssue: Issue | null;
  loading: boolean;
  error: string | null;
  filters: {
    category?: string;
    status?: string;
    priority?: string;
    search?: string;
    location?: {
      latitude?: number;
      longitude?: number;
      radius?: number; // in kilometers
    };
  };
  pagination: {
    page: number;
    limit: number;
    total: number;
  };
}

const initialState: IssueState = {
  issues: [],
  currentIssue: null,
  loading: false,
  error: null,
  filters: {},
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
      const { issues } = getState() as { issues: IssueState };
      const { filters, pagination } = issues;
      
      const response = await api.get('/issues', {
        params: {
          ...filters,
          page: pagination.page,
          limit: pagination.limit,
        },
      });
      
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch issues');
    }
  }
);

export const fetchIssueById = createAsyncThunk(
  'issues/fetchIssueById',
  async (id: string, { rejectWithValue }) => {
    try {
      const response = await api.get(`/issues/${id}`);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch issue');
    }
  }
);

export const createIssue = createAsyncThunk(
  'issues/createIssue',
  async (issueData: CreateIssueDto, { rejectWithValue }) => {
    try {
      const formData = new FormData();
      Object.entries(issueData).forEach(([key, value]) => {
        if (key === 'attachments' && value) {
          (value as File[]).forEach((file) => {
            formData.append('attachments', file);
          });
        } else if (key === 'location' || key === 'tags') {
          formData.append(key, JSON.stringify(value));
        } else {
          formData.append(key, value as string);
        }
      });

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

export const updateIssue = createAsyncThunk(
  'issues/updateIssue',
  async ({ id, data }: { id: string; data: UpdateIssueDto }, { rejectWithValue }) => {
    try {
      const response = await api.patch(`/issues/${id}`, data);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to update issue');
    }
  }
);

export const voteOnIssue = createAsyncThunk(
  'issues/voteOnIssue',
  async ({ id, voteType }: { id: string; voteType: 'up' | 'down' }, { rejectWithValue }) => {
    try {
      const response = await api.post(`/issues/${id}/vote`, { voteType });
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to vote on issue');
    }
  }
);

const issueSlice = createSlice({
  name: 'issues',
  initialState,
  reducers: {
    setFilters: (state, action) => {
      state.filters = action.payload;
      state.pagination.page = 1; // Reset to first page when filters change
    },
    setPage: (state, action) => {
      state.pagination.page = action.payload;
    },
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    // Fetch Issues
    builder.addCase(fetchIssues.pending, (state) => {
      state.loading = true;
      state.error = null;
    });
    builder.addCase(fetchIssues.fulfilled, (state, action) => {
      state.loading = false;
      state.issues = action.payload.issues;
      state.pagination.total = action.payload.total;
    });
    builder.addCase(fetchIssues.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload as string;
    });

    // Fetch Single Issue
    builder.addCase(fetchIssueById.pending, (state) => {
      state.loading = true;
      state.error = null;
    });
    builder.addCase(fetchIssueById.fulfilled, (state, action) => {
      state.loading = false;
      state.currentIssue = action.payload;
    });
    builder.addCase(fetchIssueById.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload as string;
    });

    // Create Issue
    builder.addCase(createIssue.pending, (state) => {
      state.loading = true;
      state.error = null;
    });
    builder.addCase(createIssue.fulfilled, (state, action) => {
      state.loading = false;
      state.issues.unshift(action.payload);
    });
    builder.addCase(createIssue.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload as string;
    });

    // Update Issue
    builder.addCase(updateIssue.pending, (state) => {
      state.loading = true;
      state.error = null;
    });
    builder.addCase(updateIssue.fulfilled, (state, action) => {
      state.loading = false;
      const index = state.issues.findIndex((issue) => issue.id === action.payload.id);
      if (index !== -1) {
        state.issues[index] = action.payload;
      }
      if (state.currentIssue?.id === action.payload.id) {
        state.currentIssue = action.payload;
      }
    });
    builder.addCase(updateIssue.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload as string;
    });

    // Vote on Issue
    builder.addCase(voteOnIssue.fulfilled, (state, action) => {
      const { issueId, vote } = action.payload;
      const issue = state.issues.find((i) => i.id === issueId);
      if (issue) {
        issue.votes.push(vote);
        issue.voteCount = vote.voteType === 'up' ? issue.voteCount + 1 : issue.voteCount - 1;
      }
      if (state.currentIssue?.id === issueId) {
        state.currentIssue.votes.push(vote);
        state.currentIssue.voteCount = vote.voteType === 'up'
          ? state.currentIssue.voteCount + 1
          : state.currentIssue.voteCount - 1;
      }
    });
  },
});

export const { setFilters, setPage, clearError } = issueSlice.actions;
export default issueSlice.reducer;
