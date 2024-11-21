import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import { AppDispatch, RootState } from '../store';
import { fetchIssues, setFilters, setPage } from '../store/slices/issueSlice';
import { IssueCard } from '../components/issues/IssueCard';
import { IssueCategory, IssuePriority, IssueStatus } from '../types/issue';
import { FunnelIcon, MagnifyingGlassIcon, PlusIcon, AdjustmentsHorizontalIcon } from '@heroicons/react/24/outline';
import { Button } from '../components/common/Button';
import { Input } from '../components/common/Input';
import { AdvancedSearch } from '../components/issues/AdvancedSearch';

export const Issues: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { issues, loading, pagination, filters, facets } = useSelector((state: RootState) => state.issues);
  const [showAdvancedSearch, setShowAdvancedSearch] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    dispatch(fetchIssues());
  }, [dispatch, pagination.page, filters]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    dispatch(setFilters({ ...filters, query: searchQuery }));
  };

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
            onClick={() => setShowAdvancedSearch(true)}
          >
            <AdjustmentsHorizontalIcon className="h-5 w-5 mr-2" />
            Advanced Search
          </Button>
        </form>

        {/* Advanced Search Modal */}
        {showAdvancedSearch && (
          <div className="fixed inset-0 z-50 overflow-y-auto">
            <div className="flex items-center justify-center min-h-screen px-4">
              <div className="fixed inset-0 bg-black opacity-30" onClick={() => setShowAdvancedSearch(false)} />
              <div className="relative bg-white rounded-lg max-w-3xl w-full">
                <AdvancedSearch
                  facets={facets}
                  onClose={() => setShowAdvancedSearch(false)}
                />
              </div>
            </div>
          </div>
        )}
      </div>

      {loading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500" />
        </div>
      ) : issues.length === 0 ? (
        <div className="text-center py-12">
          <h3 className="text-lg font-medium text-gray-900">No issues found</h3>
          <p className="mt-2 text-sm text-gray-500">
            Try adjusting your search or filters to find what you're looking for.
          </p>
        </div>
      ) : (
        <div className="grid gap-6">
          {issues.map((issue) => (
            <IssueCard key={issue.id} issue={issue} />
          ))}
        </div>
      )}

      {/* Pagination */}
      {pagination.total > pagination.limit && (
        <div className="mt-6 flex justify-center">
          <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px">
            {Array.from({ length: Math.ceil(pagination.total / pagination.limit) }).map((_, i) => (
              <button
                key={i}
                onClick={() => dispatch(setPage(i + 1))}
                className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium ${
                  pagination.page === i + 1
                    ? 'z-10 bg-primary-50 border-primary-500 text-primary-600'
                    : 'bg-white border-gray-300 text-gray-500 hover:bg-gray-50'
                }`}
              >
                {i + 1}
              </button>
            ))}
          </nav>
        </div>
      )}
    </div>
  );
};
