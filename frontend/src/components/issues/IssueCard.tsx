import React from 'react';
import { Link } from 'react-router-dom';
import { Issue } from '../../types/issue';
import { formatDistanceToNow } from 'date-fns';
import { useDispatch } from 'react-redux';
import { voteOnIssue } from '../../store/slices/issueSlice';
import { AppDispatch } from '../../store';
import { ChevronUpIcon, ChevronDownIcon, ChatBubbleLeftIcon, EyeIcon } from '@heroicons/react/24/outline';
import { MapPinIcon } from '@heroicons/react/24/solid';

interface IssueCardProps {
  issue: Issue;
  showVoting?: boolean;
}

const IssueCard: React.FC<IssueCardProps> = ({ issue, showVoting = true }) => {
  const dispatch = useDispatch<AppDispatch>();

  const handleVote = async (voteType: 'up' | 'down') => {
    try {
      await dispatch(voteOnIssue({ id: issue.id, voteType })).unwrap();
    } catch (error) {
      console.error('Failed to vote:', error);
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority.toLowerCase()) {
      case 'critical':
        return 'bg-red-100 text-red-800';
      case 'high':
        return 'bg-orange-100 text-orange-800';
      case 'medium':
        return 'bg-yellow-100 text-yellow-800';
      case 'low':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'active':
        return 'bg-blue-100 text-blue-800';
      case 'resolved':
        return 'bg-green-100 text-green-800';
      case 'rejected':
        return 'bg-red-100 text-red-800';
      case 'pending':
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow duration-200 overflow-hidden">
      <div className="p-4">
        <div className="flex items-start gap-4">
          {showVoting && (
            <div className="flex flex-col items-center space-y-1">
              <button
                onClick={() => handleVote('up')}
                className="p-1 rounded hover:bg-gray-100 transition-colors"
              >
                <ChevronUpIcon className="h-6 w-6 text-gray-500 hover:text-green-500" />
              </button>
              <span className="font-medium text-gray-700">{issue.voteCount}</span>
              <button
                onClick={() => handleVote('down')}
                className="p-1 rounded hover:bg-gray-100 transition-colors"
              >
                <ChevronDownIcon className="h-6 w-6 text-gray-500 hover:text-red-500" />
              </button>
            </div>
          )}
          
          <div className="flex-1">
            <Link to={`/issues/${issue.id}`}>
              <h3 className="text-lg font-semibold text-gray-900 hover:text-blue-600">
                {issue.title}
              </h3>
            </Link>
            
            <div className="mt-2 flex flex-wrap gap-2">
              <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${getPriorityColor(issue.priority)}`}>
                {issue.priority}
              </span>
              <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(issue.status)}`}>
                {issue.status}
              </span>
              <span className="px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                {issue.category}
              </span>
            </div>

            <p className="mt-2 text-sm text-gray-600 line-clamp-2">
              {issue.description}
            </p>

            <div className="mt-3 flex items-center gap-4 text-sm text-gray-500">
              {issue.location.address && (
                <div className="flex items-center gap-1">
                  <MapPinIcon className="h-4 w-4" />
                  <span className="truncate max-w-[200px]">{issue.location.address}</span>
                </div>
              )}
              
              <div className="flex items-center gap-1">
                <ChatBubbleLeftIcon className="h-4 w-4" />
                <span>{issue.commentCount}</span>
              </div>
              
              <div className="flex items-center gap-1">
                <EyeIcon className="h-4 w-4" />
                <span>{issue.viewCount}</span>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-4 flex items-center justify-between text-sm text-gray-500">
          <div className="flex items-center gap-2">
            <span>Posted by {issue.isAnonymous ? 'Anonymous' : issue.authorName}</span>
            <span>•</span>
            <span>{formatDistanceToNow(new Date(issue.createdAt))} ago</span>
          </div>
          
          {issue.tags.length > 0 && (
            <div className="flex gap-2">
              {issue.tags.slice(0, 3).map((tag, index) => (
                <span
                  key={index}
                  className="px-2 py-0.5 rounded-full text-xs bg-gray-100 text-gray-600"
                >
                  {tag}
                </span>
              ))}
              {issue.tags.length > 3 && (
                <span className="text-xs text-gray-500">+{issue.tags.length - 3} more</span>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default IssueCard;
