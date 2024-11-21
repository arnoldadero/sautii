import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch, RootState } from '../store';
import { fetchIssueById, voteOnIssue, fetchComments } from '../store/slices/issueSlice';
import { Button } from '../components/common/Button';
import { Comments } from '../components/issues/Comments';
import { formatDistanceToNow } from 'date-fns';
import { MapPinIcon, TagIcon, ChatBubbleLeftIcon } from '@heroicons/react/24/outline';
import { IssueStatus, IssuePriority, IssueCategory } from '../types/issue';

const priorityColors = {
  [IssuePriority.LOW]: 'bg-green-100 text-green-800',
  [IssuePriority.MEDIUM]: 'bg-yellow-100 text-yellow-800',
  [IssuePriority.HIGH]: 'bg-red-100 text-red-800',
};

const categoryIcons = {
  [IssueCategory.INFRASTRUCTURE]: '🏗️',
  [IssueCategory.SAFETY]: '🚨',
  [IssueCategory.ENVIRONMENT]: '🌳',
  [IssueCategory.COMMUNITY]: '👥',
  [IssueCategory.OTHER]: '📌',
};

export const IssueDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const dispatch = useDispatch<AppDispatch>();
  const { currentIssue, loading } = useSelector((state: RootState) => state.issues);
  const [isVoting, setIsVoting] = useState(false);

  useEffect(() => {
    if (id) {
      dispatch(fetchIssueById(id));
      dispatch(fetchComments(id));
    }
  }, [dispatch, id]);

  const handleVote = async (voteType: 'up' | 'down') => {
    if (!currentIssue) return;
    setIsVoting(true);
    try {
      await dispatch(voteOnIssue({ issueId: currentIssue.id, voteType }));
    } finally {
      setIsVoting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500"></div>
      </div>
    );
  }

  if (!currentIssue) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen">
        <h2 className="text-2xl font-semibold text-gray-900">Issue not found</h2>
        <Button
          variant="primary"
          className="mt-4"
          onClick={() => navigate('/issues')}
        >
          Back to Issues
        </Button>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold text-gray-900">{currentIssue.title}</h1>
          <div className="flex items-center space-x-4">
            <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${priorityColors[currentIssue.priority]}`}>
              {currentIssue.priority}
            </span>
            <span className="inline-flex items-center px-3 py-1 rounded-full bg-gray-100 text-gray-800 text-sm font-medium">
              {categoryIcons[currentIssue.category]} {currentIssue.category}
            </span>
          </div>
        </div>
        <div className="mt-2 flex items-center text-sm text-gray-500">
          <span>Posted {formatDistanceToNow(new Date(currentIssue.createdAt), { addSuffix: true })}</span>
          {!currentIssue.isAnonymous && (
            <>
              <span className="mx-2">•</span>
              <span>by {currentIssue.author}</span>
            </>
          )}
        </div>
      </div>

      {/* Main Content */}
      <div className="bg-white shadow rounded-lg overflow-hidden">
        {/* Description */}
        <div className="p-6">
          <p className="text-gray-700 whitespace-pre-wrap">{currentIssue.description}</p>
        </div>

        {/* Location */}
        {currentIssue.location && (
          <div className="px-6 py-4 border-t border-gray-200">
            <div className="flex items-center text-gray-600">
              <MapPinIcon className="h-5 w-5 mr-2" />
              <span>{currentIssue.location.address}</span>
            </div>
          </div>
        )}

        {/* Tags */}
        {currentIssue.tags && currentIssue.tags.length > 0 && (
          <div className="px-6 py-4 border-t border-gray-200">
            <div className="flex items-center flex-wrap gap-2">
              <TagIcon className="h-5 w-5 text-gray-400" />
              {currentIssue.tags.map((tag, index) => (
                <span
                  key={index}
                  className="inline-flex items-center px-3 py-1 rounded-full bg-gray-100 text-gray-800 text-sm"
                >
                  {tag}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Attachments */}
        {currentIssue.attachments && currentIssue.attachments.length > 0 && (
          <div className="px-6 py-4 border-t border-gray-200">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Attachments</h3>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {currentIssue.attachments.map((attachment, index) => (
                <div
                  key={index}
                  className="relative group aspect-w-16 aspect-h-9 rounded-lg overflow-hidden bg-gray-100"
                >
                  <img
                    src={attachment.url}
                    alt={`Attachment ${index + 1}`}
                    className="object-cover"
                  />
                  <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-30 transition-opacity" />
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Comments Section */}
        <div className="mt-8">
          <Comments
            issueId={currentIssue.id}
            comments={currentIssue.comments || []}
          />
        </div>

        {/* Voting */}
        <div className="px-6 py-4 border-t border-gray-200">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Button
                variant="outline"
                onClick={() => handleVote('up')}
                disabled={isVoting}
                className="flex items-center space-x-2"
              >
                <span>👍</span>
                <span>{currentIssue.upvotes}</span>
              </Button>
              <Button
                variant="outline"
                onClick={() => handleVote('down')}
                disabled={isVoting}
                className="flex items-center space-x-2"
              >
                <span>👎</span>
                <span>{currentIssue.downvotes}</span>
              </Button>
            </div>
            <div className="flex items-center text-gray-600">
              <ChatBubbleLeftIcon className="h-5 w-5 mr-2" />
              <span>{currentIssue.commentsCount || 0} comments</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
