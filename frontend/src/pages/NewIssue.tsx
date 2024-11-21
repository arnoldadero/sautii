import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { useForm, Controller } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { AppDispatch } from '../store';
import { createIssue } from '../store/slices/issueSlice';
import { CreateIssueDto, IssueCategory, IssuePriority, CategoryPrediction, Location } from '../types/issue';
import { Button } from '../components/common/Button';
import { Input } from '../components/common/Input';
import { MapPinIcon, PhotoIcon } from '@heroicons/react/24/outline';
import { LocationSearch } from '../components/issues/LocationSearch';
import api from '../services/api';

const schema = yup.object().shape({
  title: yup.string().required('Title is required').min(5, 'Title must be at least 5 characters'),
  description: yup.string().required('Description is required').min(20, 'Description must be at least 20 characters'),
  category: yup.mixed<IssueCategory>().oneOf(Object.values(IssueCategory), 'Invalid category').required('Category is required'),
  priority: yup.mixed<IssuePriority>().oneOf(Object.values(IssuePriority), 'Invalid priority').required('Priority is required'),
  location: yup.object().shape({
    lat: yup.number().required('Latitude is required'),
    lng: yup.number().required('Longitude is required'),
    address: yup.string().required('Address is required'),
    radius: yup.number().optional(),
  }).required(),
  isAnonymous: yup.boolean().required(),
  tags: yup.array().of(yup.string()).optional(),
  attachments: yup.array().of(yup.mixed<File>()).optional(),
});

export const NewIssue: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();
  const [attachments, setAttachments] = useState<File[]>([]);
  const [aiPrediction, setAiPrediction] = useState<CategoryPrediction | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [locationSearchOpen, setLocationSearchOpen] = useState(false);

  const {
    control,
    handleSubmit,
    formState: { errors },
    watch,
    setValue,
  } = useForm<CreateIssueDto>({
    resolver: yupResolver(schema),
    defaultValues: {
      isAnonymous: false,
      tags: [],
      location: {
        lat: 0,
        lng: 0,
        address: '',
        radius: 0,
      },
      category: IssueCategory.OTHER,
      priority: IssuePriority.LOW,
    },
  });

  const categories = Object.values(IssueCategory);
  const priorities = Object.values(IssuePriority);

  const title = watch('title');
  const description = watch('description');

  useEffect(() => {
    const timer = setTimeout(async () => {
      if (title && description && title.length > 5 && description.length > 20) {
        try {
          // Use a separate API endpoint for predictions
          const response = await api.post('/issues/predict', {
            title,
            description,
          });
          
          if (response.data.prediction) {
            setAiPrediction(response.data.prediction);
            // Auto-set the category if confidence is high
            if (response.data.prediction.confidence > 0.8) {
              setValue('category', response.data.prediction.category);
            }
          }
        } catch (error) {
          console.error('Failed to get AI prediction:', error);
        }
      }
    }, 1000);

    return () => clearTimeout(timer);
  }, [title, description, setValue]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    setAttachments((prev) => [...prev, ...files]);
  };

  const removeAttachment = (index: number) => {
    setAttachments((prev) => prev.filter((_, i) => i !== index));
  };

  const handleTagInput = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault();
      const input = e.currentTarget;
      const value = input.value.trim();
      if (value) {
        const currentTags = watch('tags') || [];
        if (!currentTags.includes(value)) {
          setValue('tags', [...currentTags, value]);
        }
        input.value = '';
      }
    }
  };

  const removeTag = (tagToRemove: string) => {
    const currentTags = watch('tags') || [];
    setValue('tags', currentTags.filter((tag) => tag !== tagToRemove));
  };

  const handleLocationSelect = (location: Location) => {
    setValue('location', {
      lat: location.lat,
      lng: location.lng,
      address: location.address || '',
      radius: location.radius || 0,
    });
    setLocationSearchOpen(false);
  };

  const onSubmit = async (data: CreateIssueDto) => {
    try {
      setIsSubmitting(true);
      data.attachments = attachments;
      await dispatch(createIssue(data)).unwrap();
      navigate('/issues');
    } catch (error) {
      console.error('Failed to create issue:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Raise New Issue</h1>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <div>
          <Controller
            name="title"
            control={control}
            render={({ field }) => (
              <Input
                {...field}
                label="Title"
                placeholder="Enter a clear title for your issue"
                error={errors.title?.message}
              />
            )}
          />
        </div>

        <div>
          <Controller
            name="description"
            control={control}
            render={({ field }) => (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Description
                </label>
                <textarea
                  {...field}
                  rows={5}
                  className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  placeholder="Describe the issue in detail..."
                />
                {errors.description && (
                  <p className="mt-1 text-sm text-red-600">{errors.description.message}</p>
                )}
              </div>
            )}
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <Controller
              name="category"
              control={control}
              render={({ field }) => (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Category
                  </label>
                  <select
                    {...field}
                    className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  >
                    <option value="">Select a category</option>
                    {categories.map((category) => (
                      <option key={category} value={category}>
                        {category.replace(/_/g, ' ').toLowerCase().replace(/\b\w/g, l => l.toUpperCase())}
                      </option>
                    ))}
                  </select>
                  {errors.category && (
                    <p className="mt-1 text-sm text-red-600">{errors.category.message}</p>
                  )}
                  {aiPrediction && (
                    <div className="mt-2 text-sm">
                      <p className="text-gray-600">
                        AI Suggestion:{' '}
                        <span className="font-medium">
                          {aiPrediction.category.replace(/_/g, ' ').toLowerCase().replace(/\b\w/g, l => l.toUpperCase())}
                        </span>
                        {' '}
                        <span className="text-gray-500">
                          ({Math.round(aiPrediction.confidence * 100)}% confidence)
                        </span>
                      </p>
                    </div>
                  )}
                </div>
              )}
            />
          </div>

          <div>
            <Controller
              name="priority"
              control={control}
              render={({ field }) => (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Priority
                  </label>
                  <select
                    {...field}
                    className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  >
                    <option value="">Select priority</option>
                    {priorities.map((priority) => (
                      <option key={priority} value={priority}>
                        {priority.replace(/_/g, ' ').toLowerCase().replace(/\b\w/g, l => l.toUpperCase())}
                      </option>
                    ))}
                  </select>
                  {errors.priority && (
                    <p className="mt-1 text-sm text-red-600">{errors.priority.message}</p>
                  )}
                </div>
              )}
            />
          </div>
        </div>

        <div>
          <div className="flex items-center justify-between mb-2">
            <label className="block text-sm font-medium text-gray-700">Location</label>
            <Button
              type="button"
              variant="secondary"
              size="sm"
              onClick={() => setLocationSearchOpen(true)}
            >
              <MapPinIcon className="h-5 w-5 mr-2" />
              Search Location
            </Button>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Controller
              name="location.address"
              control={control}
              render={({ field }) => (
                <Input
                  {...field}
                  label="Address"
                  placeholder="Enter address"
                  error={errors.location?.address?.message}
                />
              )}
            />
            <Controller
              name="location.radius"
              control={control}
              render={({ field }) => (
                <Input
                  {...field}
                  label="Radius"
                  placeholder="Enter radius"
                  error={errors.location?.radius?.message}
                />
              )}
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Tags
          </label>
          <div className="flex flex-wrap gap-2 mb-2">
            {(watch('tags') || []).map((tag, index) => (
              <span
                key={index}
                className="inline-flex items-center px-2.5 py-0.5 rounded-full text-sm font-medium bg-blue-100 text-blue-800"
              >
                {tag}
                <button
                  type="button"
                  onClick={() => removeTag(tag)}
                  className="ml-1.5 inline-flex items-center justify-center w-4 h-4 rounded-full text-blue-400 hover:bg-blue-200 hover:text-blue-600"
                >
                  ×
                </button>
              </span>
            ))}
          </div>
          <Input
            type="text"
            placeholder="Type a tag and press Enter"
            onKeyDown={handleTagInput}
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Attachments
          </label>
          <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-md">
            <div className="space-y-1 text-center">
              <PhotoIcon className="mx-auto h-12 w-12 text-gray-400" />
              <div className="flex text-sm text-gray-600">
                <label className="relative cursor-pointer rounded-md font-medium text-blue-600 hover:text-blue-500">
                  <span>Upload files</span>
                  <input
                    type="file"
                    multiple
                    onChange={handleFileChange}
                    className="sr-only"
                  />
                </label>
                <p className="pl-1">or drag and drop</p>
              </div>
              <p className="text-xs text-gray-500">
                PNG, JPG, PDF up to 10MB each
              </p>
            </div>
          </div>
          {attachments.length > 0 && (
            <ul className="mt-4 space-y-2">
              {attachments.map((file, index) => (
                <li
                  key={index}
                  className="flex items-center justify-between py-2 px-3 bg-gray-50 rounded-md"
                >
                  <span className="text-sm text-gray-700">{file.name}</span>
                  <button
                    type="button"
                    onClick={() => removeAttachment(index)}
                    className="text-red-500 hover:text-red-700"
                  >
                    Remove
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="flex items-center gap-2">
          <Controller
            name="isAnonymous"
            control={control}
            render={({ field: { value, onChange } }) => (
              <>
                <input
                  type="checkbox"
                  id="anonymous"
                  checked={value}
                  onChange={onChange}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <label htmlFor="anonymous" className="text-sm text-gray-700">
                  Submit anonymously
                </label>
              </>
            )}
          />
        </div>

        <div className="flex justify-end gap-4">
          <Button
            type="button"
            variant="secondary"
            onClick={() => navigate('/issues')}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            variant="primary"
            loading={isSubmitting}
          >
            Submit Issue
          </Button>
        </div>
      </form>
      {locationSearchOpen && (
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg p-6 max-w-lg w-full">
            <LocationSearch
              onLocationSelect={handleLocationSelect}
              initialLocation={watch('location')}
            />
            <div className="mt-4 flex justify-end">
              <Button
                type="button"
                variant="secondary"
                onClick={() => setLocationSearchOpen(false)}
              >
                Close
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
