import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import { AppDispatch, RootState } from '../store';
import { fetchIssues, setFilters, setPage } from '../store/slices/issueSlice';
import IssueCard from '../components/issues/IssueCard';
import { IssueCategory, IssuePriority, IssueStatus } from '../types/issue';
import { FunnelIcon, MagnifyingGlassIcon, PlusIcon } from '@heroicons/react/24/outline';
import { Button } from '../components/common/Button';
import { Input } from '../components/common/Input';

export const Issues: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { issues, loading, pagination, filters } = useSelector((state: RootState) => state.issues);
  const [showFilters, setShowFilters] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    dispatch(fetchIssues());
  }, [dispatch, pagination.page, filters]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    dispatch(setFilters({ ...filters, search: searchQuery }));
  };

  const handleFilterChange = (key: string, value: string) => {
    dispatch(setFilters({ ...filters, [key]: value }));
  };

  const handlePageChange = (newPage: number) => {
    dispatch(setPage(newPage));
  };

  const categories: IssueCategory[] = [
    'healthcare',
    'education',
    'security',
    'infrastructure',
    'environment',
    'governance',
    'economy',
    'social',
    'other',
  ];

  const priorities: IssuePriority[] = ['low', 'medium', 'high', 'critical'];
  const statuses: IssueStatus[] = ['pending', 'active', 'resolved', 'rejected'];

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Community Issues</h1>
        <Link to="/issues/new">
          <Button variant="primary" size="lg">
            <PlusIcon className="h-5 w-5 mr-2" />
            Raise New Issue
          </Button>
        </Link>
      </div>

      <div className="space-y-4 mb-6">
        <form onSubmit={handleSearch} className="flex gap-4">
          <div className="flex-1">
            <Input
              type="text"
              placeholder="Search issues..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              leftIcon={<MagnifyingGlassIcon className="h-5 w-5 text-gray-400" />}
            />
          </div>
          <Button
            type="button"
            variant="secondary"
            onClick={() => setShowFilters(!showFilters)}
          >
            <FunnelIcon className="h-5 w-5 mr-2" />
            Filters
          </Button>
        </form>

        {showFilters && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 p-4 bg-gray-50 rounded-lg">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Category
              </label>
              <select
                className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                value={filters.category || ''}
                onChange={(e) => handleFilterChange('category', e.target.value)}
              >
                <option value="">All Categories</option>
                {categories.map((category) => (
                  <option key={category} value={category}>
                    {category.charAt(0).toUpperCase() + category.slice(1)}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Priority
              </label>
              <select
                className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                value={filters.priority || ''}
                onChange={(e) => handleFilterChange('priority', e.target.value)}
              >
                <option value="">All Priorities</option>
                {priorities.map((priority) => (
                  <option key={priority} value={priority}>
                    {priority.charAt(0).toUpperCase() + priority.slice(1)}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Status
              </label>
              <select
                className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                value={filters.status || ''}
                onChange={(e) => handleFilterChange('status', e.target.value)}
              >
                <option value="">All Statuses</option>
                {statuses.map((status) => (
                  <option key={status} value={status}>
                    {status.charAt(0).toUpperCase() + status.slice(1)}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex items-end">
              <Button
                variant="text"
                onClick={() => {
                  dispatch(setFilters({}));
                  setSearchQuery('');
                }}
              >
                Clear Filters
              </Button>
            </div>
          </div>
        )}
      </div>

      {loading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
        </div>
      ) : issues.length === 0 ? (
        <div className="text-center py-12">
          <h3 className="text-lg font-medium text-gray-900 mb-2">No issues found</h3>
          <p className="text-gray-500">
            Try adjusting your filters or{' '}
            <Link to="/issues/new" className="text-blue-500 hover:text-blue-600">
              raise a new issue
            </Link>
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {issues.map((issue) => (
            <IssueCard key={issue.id} issue={issue} />
          ))}
        </div>
      )}

      {pagination.total > pagination.limit && (
        <div className="mt-6 flex justify-center">
          <nav className="flex items-center gap-2">
            <Button
              variant="secondary"
              disabled={pagination.page === 1}
              onClick={() => handlePageChange(pagination.page - 1)}
            >
              Previous
            </Button>
            <span className="px-4 py-2 text-gray-700">
              Page {pagination.page} of{' '}
              {Math.ceil(pagination.total / pagination.limit)}
            </span>
            <Button
              variant="secondary"
              disabled={
                pagination.page ===
                Math.ceil(pagination.total / pagination.limit)
              }
              onClick={() => handlePageChange(pagination.page + 1)}
            >
              Next
            </Button>
          </nav>
        </div>
      )}
    </div>
  );
};
