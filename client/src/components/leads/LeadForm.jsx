import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { leadApi } from '../../utils/api';
import { useState, useEffect } from 'react';
import { toast } from 'react-toastify';

// Validation schema using yup
const leadSchema = yup.object().shape({
  name: yup.string().required('Name is required').max(100, 'Name is too long'),
  email: yup
    .string()
    .email('Invalid email address')
    .required('Email is required'),
  phone: yup
    .string()
    .matches(
      /^[0-9\-\+\(\)\s]+$/,
      'Please enter a valid phone number'
    )
    .required('Phone number is required'),
  status: yup.string().oneOf(['new', 'contacted', 'qualified', 'lost'], 'Invalid status'),
  notes: yup.string().max(500, 'Notes cannot exceed 500 characters'),
});

const LeadForm = ({ onSuccess, leadId, onCancel }) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(!!leadId);
  
  const {
    register,
    handleSubmit,
    reset,
    setValue,
    formState: { errors },
  } = useForm({
    resolver: yupResolver(leadSchema),
    defaultValues: {
      status: 'new'
    }
  });

  // Load lead data if in edit mode
  useEffect(() => {
    const fetchLead = async () => {
      if (!leadId) return;
      
      try {
        setIsLoading(true);
        const lead = await leadApi.getLead(leadId);
        // Set form values from the fetched lead
        Object.entries(lead).forEach(([key, value]) => {
          if (value !== undefined) {
            setValue(key, value);
          }
        });
      } catch (error) {
        console.error('Error fetching lead:', error);
        toast.error('Failed to load lead data');
        onCancel?.();
      } finally {
        setIsLoading(false);
      }
    };

    fetchLead();
  }, [leadId, setValue, onCancel]);

  const onSubmit = async (data) => {
    try {
      setIsSubmitting(true);
      
      if (leadId) {
        // Update existing lead
        await leadApi.editLead(leadId, data);
        toast.success('Lead updated successfully!');
      } else {
        // Create new lead
        await leadApi.createLead(data);
        toast.success('Lead created successfully!');
        reset();
      }
      
      if (onSuccess) onSuccess();
    } catch (error) {
      console.error('Error saving lead:', error);
      const errorMessage = error.errors?.join('\n') || error.message || 'Failed to save lead';
      toast.error(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  return (
    <div className="bg-white shadow-md rounded-lg p-6">
      <h2 className="text-2xl font-semibold text-gray-800 mb-6">
        {leadId ? 'Edit Lead' : 'Add New Lead'}
      </h2>
      
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <div>
          <label htmlFor="name" className="block text-sm font-medium text-gray-700">
            Name *
          </label>
          <input
            id="name"
            type="text"
            {...register('name')}
            className={`mt-1 block w-full rounded-md bg-gray-200 border-black shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm py-2 ${
              errors.name ? 'border-red-500' : 'border-black'
            }`}
            disabled={isSubmitting}
          />
          {errors.name && (
            <p className="mt-1 text-sm text-red-600">{errors.name.message}</p>
          )}
        </div>

        <div>
          <label htmlFor="email" className="block text-sm font-medium text-gray-700">
            Email *
          </label>
          <input
            id="email"
            type="email"
            {...register('email')}
            className={`mt-1 block w-full rounded-md bg-gray-200 border-black shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm py-2 ${
              errors.email ? 'border-red-500' : 'border-black'
            }`}
            disabled={isSubmitting || !!leadId}
          />
          {errors.email && (
            <p className="mt-1 text-sm text-red-600">{errors.email.message}</p>
          )}
        </div>

        <div>
          <label htmlFor="phone" className="block text-sm font-medium text-gray-700">
            Phone *
          </label>
          <input
            id="phone"
            type="tel"
            {...register('phone')}
            className={`mt-1 block w-full rounded-md bg-gray-200 border-black shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm py-2 ${
              errors.phone ? 'border-red-500' : 'border-black'
            }`}
            disabled={isSubmitting}
          />
          {errors.phone && (
            <p className="mt-1 text-sm text-red-600">{errors.phone.message}</p>
          )}
        </div>

        <div>
          <label htmlFor="status" className="block text-sm font-medium text-gray-700">
            Status
          </label>
          <select
            id="status"
            {...register('status')}
            className={`mt-1 block w-full rounded-md bg-gray-200 border-black shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm py-2 ${
              errors.status ? 'border-red-500' : 'border-black'
            }`}
            disabled={isSubmitting}
          >
            <option value="new">New</option>
            <option value="contacted">Contacted</option>
            <option value="qualified">Qualified</option>
            <option value="lost">Lost</option>
          </select>
          {errors.status && (
            <p className="mt-1 text-sm text-red-600">{errors.status.message}</p>
          )}
        </div>

        <div>
          <label htmlFor="notes" className="block text-sm font-medium text-gray-700">
            Notes
          </label>
          <textarea
            id="notes"
            rows={3}
            {...register('notes')}
            className={`mt-1 block w-full rounded-md bg-gray-200 border-black shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm ${
              errors.notes ? 'border-red-500' : 'border-black'
            }`}
            disabled={isSubmitting}
          />
          {errors.notes && (
            <p className="mt-1 text-sm text-red-600">{errors.notes.message}</p>
          )}
        </div>

        <div className="flex justify-end space-x-3 pt-4">
          <button
            type="button"
            onClick={onCancel || (() => onSuccess?.())}
            className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md shadow-sm text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            disabled={isSubmitting}
          >
            Cancel
          </button>
          <button
            type="submit"
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
            disabled={isSubmitting}
          >
            {isSubmitting 
              ? 'Saving...' 
              : leadId ? 'Update Lead' : 'Save Lead'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default LeadForm;
