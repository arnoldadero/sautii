import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch, RootState } from '../store';
import { fetchIssues, updateIssueStatus } from '../store/slices/issueSlice';
import { Button } from '../components/common/Button';
import { Input } from '../components/common/Input';
import { IssueStatus, IssuePriority, IssueCategory } from '../types/issue';
import {
  ChartBarIcon,
  FolderIcon,
  DocumentTextIcon,
  CheckCircleIcon,
  XCircleIcon,
} from '@heroicons/react/24/outline';
import { IssueCard } from '../components/issues/IssueCard';

const statusColors = {
  [IssueStatus.PENDING]: 'bg-yellow-100 text-yellow-800',
  [IssueStatus.ACTIVE]: 'bg-blue-100 text-blue-800',
  [IssueStatus.RESOLVED]: 'bg-green-100 text-green-800',
  [IssueStatus.REJECTED]: 'bg-red-100 text-red-800',
};

const tabs = [
  { name: 'All Issues', value: 'all' },
  { name: 'Pending', value: IssueStatus.PENDING },
  { name: 'Active', value: IssueStatus.ACTIVE },
  { name: 'Resolved', value: IssueStatus.RESOLVED },
  { name: 'Rejected', value: IssueStatus.REJECTED },
];

export const GovernmentPortal: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { issues, loading, pagination, filters } = useSelector((state: RootState) => state.issues);
  const [selectedTab, setSelectedTab] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [selectedPriority, setSelectedPriority] = useState<string>('');

  useEffect(() => {
    dispatch(fetchIssues());
  }, [dispatch, pagination.page, filters]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    dispatch(fetchIssues());
  };

  const handleStatusChange = async (issueId: string, newStatus: IssueStatus) => {
    try {
      await dispatch(updateIssueStatus({ issueId, status: newStatus })).unwrap();
    } catch (error) {
      console.error('Failed to update issue status:', error);
    }
  };

  const stats = [
    {
      name: 'Total Issues',
      value: pagination.totalItems,
      icon: DocumentTextIcon,
      change: '+4.75%',
      changeType: 'positive',
    },
    {
      name: 'Pending Issues',
      value: issues.filter(i => i.status === IssueStatus.PENDING).length,
      icon: FolderIcon,
      change: '-1.39%',
      changeType: 'negative',
    },
    {
      name: 'Resolution Rate',
      value: '67.8%',
      icon: ChartBarIcon,
      change: '+2.45%',
      changeType: 'positive',
    },
    {
      name: 'Avg Response Time',
      value: '24h',
      icon: CheckCircleIcon,
      change: '-3.2%',
      changeType: 'positive',
    },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Government Portal</h1>
        <p className="mt-2 text-sm text-gray-600">
          Manage and respond to community issues efficiently
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4 mb-8">
        {stats.map((stat) => (
          <div
            key={stat.name}
            className="relative bg-white pt-5 px-4 pb-12 sm:pt-6 sm:px-6 shadow rounded-lg overflow-hidden"
          >
            <dt>
              <div className="absolute bg-primary-500 rounded-md p-3">
                <stat.icon className="h-6 w-6 text-white" aria-hidden="true" />
              </div>
              <p className="ml-16 text-sm font-medium text-gray-500 truncate">{stat.name}</p>
            </dt>
            <dd className="ml-16 pb-6 flex items-baseline sm:pb-7">
              <p className="text-2xl font-semibold text-gray-900">{stat.value}</p>
              <p
                className={`ml-2 flex items-baseline text-sm font-semibold ${
                  stat.changeType === 'positive' ? 'text-green-600' : 'text-red-600'
                }`}
              >
                {stat.change}
              </p>
            </dd>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="bg-white shadow rounded-lg mb-8">
        <div className="px-4 py-5 sm:p-6">
          <form onSubmit={handleSearch} className="space-y-4">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-4">
              <Input
                type="text"
                placeholder="Search issues..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm"
              >
                <option value="">All Categories</option>
                {Object.values(IssueCategory).map((category) => (
                  <option key={category} value={category}>
                    {category}
                  </option>
                ))}
              </select>
              <select
                value={selectedPriority}
                onChange={(e) => setSelectedPriority(e.target.value)}
                className="block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm"
              >
                <option value="">All Priorities</option>
                {Object.values(IssuePriority).map((priority) => (
                  <option key={priority} value={priority}>
                    {priority}
                  </option>
                ))}
              </select>
              <Button type="submit" fullWidth>
                Apply Filters
              </Button>
            </div>
          </form>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8" aria-label="Tabs">
          {tabs.map((tab) => (
            <button
              key={tab.value}
              onClick={() => setSelectedTab(tab.value)}
              className={`${
                selectedTab === tab.value
                  ? 'border-primary-500 text-primary-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
            >
              {tab.name}
            </button>
          ))}
        </nav>
      </div>

      {/* Issues List */}
      <div className="mt-6 space-y-4">
        {loading ? (
          <div className="flex justify-center items-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500"></div>
          </div>
        ) : issues.length === 0 ? (
          <div className="text-center py-12">
            <XCircleIcon className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">No issues found</h3>
            <p className="mt-1 text-sm text-gray-500">
              Try adjusting your search or filter criteria
            </p>
          </div>
        ) : (
          issues.map((issue) => (
            <div key={issue.id} className="relative">
              <IssueCard issue={issue} />
              <div className="absolute top-4 right-4 flex items-center space-x-2">
                <select
                  value={issue.status}
                  onChange={(e) => handleStatusChange(issue.id, e.target.value as IssueStatus)}
                  className={`rounded-full text-sm font-medium ${statusColors[issue.status]} border-0 py-1 px-3`}
                >
                  {Object.values(IssueStatus).map((status) => (
                    <option key={status} value={status}>
                      {status}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Pagination */}
      {!loading && issues.length > 0 && (
        <div className="mt-8 flex justify-center">
          <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px">
            <Button
              onClick={() => dispatch(fetchIssues())}
              disabled={pagination.page === 1}
              className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50"
            >
              Previous
            </Button>
            <Button
              onClick={() => dispatch(fetchIssues())}
              disabled={pagination.page === pagination.totalPages}
              className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50"
            >
              Next
            </Button>
          </nav>
        </div>
      )}
    </div>
  );
};
