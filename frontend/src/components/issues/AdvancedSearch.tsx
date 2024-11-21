import React, { useState } from 'react';
import { useDispatch } from 'react-redux';
import { AppDispatch } from '../../store';
import { setFilters } from '../../store/slices/issueSlice';
import { IssueCategory, IssuePriority, IssueStatus } from '../../types/issue';
import { Dialog } from '@headlessui/react';
import { XMarkIcon } from '@heroicons/react/24/outline';
import { LocationSearch } from './LocationSearch';
import { Button } from '../common/Button';
import { Select } from '../common/Select';

interface AdvancedSearchProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AdvancedSearch: React.FC<AdvancedSearchProps> = ({ isOpen, onClose }) => {
  const dispatch = useDispatch<AppDispatch>();
  const [filters, setLocalFilters] = useState({
    category: '',
    priority: '',
    status: '',
    location: null as { lat: number; lng: number; address: string } | null,
    radius: 5, // Default radius in kilometers
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    dispatch(setFilters({
      ...filters,
      location: filters.location ? {
        ...filters.location,
        radius: filters.radius * 1000 // Convert to meters
      } : null
    }));
    onClose();
  };

  const handleLocationSelect = (location: { lat: number; lng: number; address: string } | null) => {
    setLocalFilters(prev => ({ ...prev, location }));
  };

  return (
    <Dialog
      open={isOpen}
      onClose={onClose}
      className="fixed inset-0 z-10 overflow-y-auto"
    >
      <div className="min-h-screen px-4 text-center">
        <Dialog.Overlay className="fixed inset-0 bg-black opacity-30" />

        <span
          className="inline-block h-screen align-middle"
          aria-hidden="true"
        >
          &#8203;
        </span>

        <div className="inline-block w-full max-w-md p-6 my-8 overflow-hidden text-left align-middle transition-all transform bg-white shadow-xl rounded-2xl">
          <div className="flex justify-between items-center mb-4">
            <Dialog.Title
              as="h3"
              className="text-lg font-medium leading-6 text-gray-900"
            >
              Advanced Search
            </Dialog.Title>
            <button
              onClick={onClose}
              className="rounded-md text-gray-400 hover:text-gray-500 focus:outline-none"
            >
              <XMarkIcon className="h-6 w-6" />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Category
              </label>
              <Select
                value={filters.category}
                onChange={(e) => setLocalFilters(prev => ({ ...prev, category: e.target.value }))}
                className="mt-1"
              >
                <option value="">All Categories</option>
                {Object.values(IssueCategory).map((category) => (
                  <option key={category} value={category}>
                    {category.charAt(0).toUpperCase() + category.slice(1)}
                  </option>
                ))}
              </Select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">
                Priority
              </label>
              <Select
                value={filters.priority}
                onChange={(e) => setLocalFilters(prev => ({ ...prev, priority: e.target.value }))}
                className="mt-1"
              >
                <option value="">All Priorities</option>
                {Object.values(IssuePriority).map((priority) => (
                  <option key={priority} value={priority}>
                    {priority.charAt(0).toUpperCase() + priority.slice(1)}
                  </option>
                ))}
              </Select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">
                Status
              </label>
              <Select
                value={filters.status}
                onChange={(e) => setLocalFilters(prev => ({ ...prev, status: e.target.value }))}
                className="mt-1"
              >
                <option value="">All Statuses</option>
                {Object.values(IssueStatus).map((status) => (
                  <option key={status} value={status}>
                    {status.charAt(0).toUpperCase() + status.slice(1)}
                  </option>
                ))}
              </Select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">
                Location
              </label>
              <div className="mt-1">
                <LocationSearch
                  onLocationSelect={handleLocationSelect}
                  initialLocation={filters.location}
                />
              </div>
            </div>

            {filters.location && (
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Radius (km)
                </label>
                <input
                  type="range"
                  min="1"
                  max="50"
                  value={filters.radius}
                  onChange={(e) => setLocalFilters(prev => ({ ...prev, radius: parseInt(e.target.value) }))}
                  className="mt-1 w-full"
                />
                <div className="text-sm text-gray-500 mt-1">
                  {filters.radius} km
                </div>
              </div>
            )}

            <div className="mt-6 flex justify-end space-x-3">
              <Button
                type="button"
                variant="secondary"
                onClick={onClose}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                variant="primary"
              >
                Apply Filters
              </Button>
            </div>
          </form>
        </div>
      </div>
    </Dialog>
  );
};
