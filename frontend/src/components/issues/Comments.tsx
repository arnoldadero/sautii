import React, { useState } from 'react';
import { useDispatch } from 'react-redux';
import { formatDistanceToNow } from 'date-fns';
import { AppDispatch } from '../../store';
import { addComment } from '../../store/slices/issueSlice';
import { Button } from '../common/Button';
import { UserCircleIcon } from '@heroicons/react/24/solid';

interface Comment {
  id: string;
  content: string;
  author: string;
  createdAt: string;
  isAnonymous: boolean;
}

interface CommentsProps {
  issueId: string;
  comments: Comment[];
}

export const Comments: React.FC<CommentsProps> = ({ issueId, comments }) => {
  const dispatch = useDispatch<AppDispatch>();
  const [newComment, setNewComment] = useState('');
  const [isAnonymous, setIsAnonymous] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim()) return;

    setIsSubmitting(true);
    try {
      await dispatch(addComment({
        issueId,
        content: newComment.trim(),
        isAnonymous
      })).unwrap();
      setNewComment('');
      setIsAnonymous(false);
    } catch (error) {
      console.error('Failed to add comment:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="bg-white shadow sm:rounded-lg sm:overflow-hidden">
        <div className="divide-y divide-gray-200">
          <div className="px-4 py-5 sm:px-6">
            <h2 className="text-lg font-medium text-gray-900">Comments</h2>
          </div>
          <div className="px-4 py-6 sm:px-6">
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label htmlFor="comment" className="sr-only">
                  Add your comment
                </label>
                <textarea
                  id="comment"
                  name="comment"
                  rows={3}
                  className="block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm"
                  placeholder="Add your comment..."
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                />
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <input
                    id="anonymous"
                    name="anonymous"
                    type="checkbox"
                    className="h-4 w-4 rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                    checked={isAnonymous}
                    onChange={(e) => setIsAnonymous(e.target.checked)}
                  />
                  <label htmlFor="anonymous" className="ml-2 block text-sm text-gray-900">
                    Post anonymously
                  </label>
                </div>
                <Button
                  type="submit"
                  disabled={isSubmitting || !newComment.trim()}
                  isLoading={isSubmitting}
                >
                  Post Comment
                </Button>
              </div>
            </form>
          </div>
        </div>
        <div className="px-4 py-6 sm:px-6">
          <ul role="list" className="space-y-6">
            {comments.map((comment) => (
              <li key={comment.id} className="relative bg-white py-5">
                <div className="flex space-x-3">
                  <div className="flex-shrink-0">
                    <UserCircleIcon className="h-10 w-10 text-gray-400" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="text-sm font-medium text-gray-900">
                      {comment.isAnonymous ? 'Anonymous' : comment.author}
                    </div>
                    <div className="mt-1 text-sm text-gray-700">
                      <p>{comment.content}</p>
                    </div>
                    <div className="mt-2 text-sm text-gray-500">
                      <span>{formatDistanceToNow(new Date(comment.createdAt), { addSuffix: true })}</span>
                    </div>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
};
