import React from 'react';
import { Link } from 'react-router-dom';
import { Issue, IssueStatus } from '../../types/issue';
import { formatDistanceToNow } from 'date-fns';
import { useDispatch } from 'react-redux';
import { voteOnIssue } from '../../store/slices/issueSlice';
import { AppDispatch } from '../../store';
import { ChevronUpIcon, ChevronDownIcon, ChatBubbleLeftIcon, EyeIcon } from '@heroicons/react/24/outline';
import { MapPinIcon } from '@heroicons/react/24/solid';
import clsx from 'clsx';

interface IssueCardProps {
  issue: Issue;
  showVoting?: boolean;
}

export const IssueCard: React.FC<IssueCardProps> = ({ issue, showVoting = true }) => {
  const dispatch = useDispatch<AppDispatch>();

  const handleVote = async (voteType: 'up' | 'down', e: React.MouseEvent) => {
    e.preventDefault(); // Prevent navigation when clicking vote buttons
    try {
      await dispatch(voteOnIssue({ issueId: issue.id, voteType }));
    } catch (error) {
      console.error('Failed to vote:', error);
    }
  };

  const getStatusColor = (status: IssueStatus) => {
    switch (status) {
      case IssueStatus.PENDING:
        return 'bg-yellow-100 text-yellow-800';
      case IssueStatus.ACTIVE:
        return 'bg-blue-100 text-blue-800';
      case IssueStatus.RESOLVED:
        return 'bg-green-100 text-green-800';
      case IssueStatus.REJECTED:
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <Link to={`/issues/${issue.id}`} className="block">
      <div className="bg-white shadow rounded-lg hover:shadow-md transition-shadow duration-200">
        <div className="p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-2">
              <span className={clsx('px-2 py-1 text-xs font-medium rounded-full', getStatusColor(issue.status))}>
                {issue.status}
              </span>
              {issue.priority === 'critical' && (
                <span className="px-2 py-1 text-xs font-medium rounded-full bg-red-100 text-red-800">
                  Critical
                </span>
              )}
            </div>
            <div className="text-sm text-gray-500">
              {formatDistanceToNow(new Date(issue.createdAt), { addSuffix: true })}
            </div>
          </div>

          <h3 className="text-lg font-semibold text-gray-900 mb-2">{issue.title}</h3>
          
          <p className="text-gray-600 mb-4 line-clamp-2">{issue.description}</p>

          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              {showVoting && (
                <div className="flex items-center space-x-2">
                  <button
                    onClick={(e) => handleVote('up', e)}
                    className="p-1 rounded hover:bg-gray-100"
                  >
                    <ChevronUpIcon className="h-5 w-5 text-gray-500" />
                  </button>
                  <span className="text-sm font-medium text-gray-700">
                    {issue.voteCount}
                  </span>
                  <button
                    onClick={(e) => handleVote('down', e)}
                    className="p-1 rounded hover:bg-gray-100"
                  >
                    <ChevronDownIcon className="h-5 w-5 text-gray-500" />
                  </button>
                </div>
              )}
              
              <div className="flex items-center space-x-1 text-gray-500">
                <ChatBubbleLeftIcon className="h-5 w-5" />
                <span className="text-sm">{issue.commentCount}</span>
              </div>

              {issue.location && (
                <div className="flex items-center space-x-1 text-gray-500">
                  <MapPinIcon className="h-5 w-5" />
                  <span className="text-sm truncate max-w-[200px]">
                    {issue.location.address || 'Location set'}
                  </span>
                </div>
              )}
            </div>

            <div className="flex items-center space-x-2">
              <EyeIcon className="h-5 w-5 text-gray-400" />
              <span className="text-sm text-gray-500">
                {!issue.isAnonymous && issue.username}
              </span>
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
};
