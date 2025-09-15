import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import Card from '@/components/atoms/Card';
import Button from '@/components/atoms/Button';
import Input from '@/components/atoms/Input';
import ApperIcon from '@/components/ApperIcon';
import { contactService } from '@/services/api/contactService';
import dealService from '@/services/api/dealService';

const QuoteForm = ({ quote, onSubmit, onCancel }) => {
  const [loading, setLoading] = useState(false);
  const [loadingContacts, setLoadingContacts] = useState(false);
  const [loadingDeals, setLoadingDeals] = useState(false);
  const [contacts, setContacts] = useState([]);
  const [deals, setDeals] = useState([]);
  const [formData, setFormData] = useState({
    title: '',
    contactId: '',
    dealId: '',
    value: '',
    status: 'Draft',
    description: '',
    expiryDate: ''
  });
  const [errors, setErrors] = useState({});

  const statusOptions = ['Draft', 'Sent', 'Accepted', 'Rejected', 'Expired'];

  useEffect(() => {
    loadContacts();
    loadDeals();
    
    if (quote) {
      setFormData({
        title: quote.title || '',
        contactId: quote.contactId?.toString() || '',
        dealId: quote.dealId?.toString() || '',
        value: quote.value?.toString() || '',
        status: quote.status || 'Draft',
        description: quote.description || '',
        expiryDate: quote.expiryDate ? new Date(quote.expiryDate).toISOString().split('T')[0] : ''
      });
    } else {
      // Set default expiry date to 30 days from now
      const defaultExpiry = new Date();
      defaultExpiry.setDate(defaultExpiry.getDate() + 30);
      setFormData(prev => ({
        ...prev,
        expiryDate: defaultExpiry.toISOString().split('T')[0]
      }));
    }
  }, [quote]);

  const loadContacts = async () => {
    try {
      setLoadingContacts(true);
      const contactData = await contactService.getAll();
      setContacts(contactData);
    } catch (error) {
      console.error('Error loading contacts:', error);
      toast.error('Failed to load contacts');
    } finally {
      setLoadingContacts(false);
    }
  };

  const loadDeals = async () => {
    try {
      setLoadingDeals(true);
      const dealData = await dealService.getAll();
      setDeals(dealData);
    } catch (error) {
      console.error('Error loading deals:', error);
      toast.error('Failed to load deals');
    } finally {
      setLoadingDeals(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.title.trim()) {
      newErrors.title = 'Quote title is required';
    }

    if (!formData.contactId) {
      newErrors.contactId = 'Contact is required';
    }

    if (!formData.value || parseFloat(formData.value) <= 0) {
      newErrors.value = 'Quote value must be greater than 0';
    }

    if (!formData.expiryDate) {
      newErrors.expiryDate = 'Expiry date is required';
    } else {
      const expiryDate = new Date(formData.expiryDate);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      if (expiryDate < today) {
        newErrors.expiryDate = 'Expiry date cannot be in the past';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setLoading(true);
    
    try {
      const selectedContact = contacts.find(c => c.Id.toString() === formData.contactId);
      const selectedDeal = deals.find(d => d.Id.toString() === formData.dealId);
      
      const submitData = {
        ...formData,
        contactName: selectedContact?.Name || selectedContact?.first_name_c + ' ' + selectedContact?.last_name_c || `Contact ${formData.contactId}`,
        dealName: selectedDeal?.Name || selectedDeal?.title_c || null,
        expiryDate: new Date(formData.expiryDate).toISOString()
      };

      await onSubmit(submitData);
    } catch (error) {
      console.error('Error submitting quote form:', error);
      toast.error('Failed to save quote');
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    const hasChanges = quote ? 
      JSON.stringify(formData) !== JSON.stringify({
        title: quote.title || '',
        contactId: quote.contactId?.toString() || '',
        dealId: quote.dealId?.toString() || '',
        value: quote.value?.toString() || '',
        status: quote.status || 'Draft',
        description: quote.description || '',
        expiryDate: quote.expiryDate ? new Date(quote.expiryDate).toISOString().split('T')[0] : ''
      }) :
      Object.values(formData).some(value => value.trim() !== '' && value !== 'Draft');

    if (hasChanges && !window.confirm('You have unsaved changes. Are you sure you want to cancel?')) {
      return;
    }

    onCancel();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-primary">
              {quote ? 'Edit Quote' : 'Create New Quote'}
            </h2>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleCancel}
              className="p-2"
            >
              <ApperIcon name="X" size={20} />
            </Button>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Quote Title */}
            <div>
              <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">
                Quote Title <span className="text-red-500">*</span>
              </label>
              <Input
                id="title"
                name="title"
                value={formData.title}
                onChange={handleChange}
                placeholder="Enter quote title..."
                className={errors.title ? 'border-red-500' : ''}
              />
              {errors.title && (
                <p className="text-red-500 text-xs mt-1">{errors.title}</p>
              )}
            </div>

            {/* Contact Selection */}
            <div>
              <label htmlFor="contactId" className="block text-sm font-medium text-gray-700 mb-1">
                Contact <span className="text-red-500">*</span>
              </label>
              <select
                id="contactId"
                name="contactId"
                value={formData.contactId}
                onChange={handleChange}
                className={`w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-accent focus:border-accent ${errors.contactId ? 'border-red-500' : ''}`}
                disabled={loadingContacts}
              >
                <option value="">
                  {loadingContacts ? 'Loading contacts...' : 'Select a contact'}
                </option>
                {contacts.map((contact) => (
                  <option key={contact.Id} value={contact.Id}>
                    {contact.Name || `${contact.first_name_c} ${contact.last_name_c}` || `Contact ${contact.Id}`}
                    {contact.company_c && ` - ${contact.company_c}`}
                  </option>
                ))}
              </select>
              {errors.contactId && (
                <p className="text-red-500 text-xs mt-1">{errors.contactId}</p>
              )}
            </div>

            {/* Deal Selection (Optional) */}
            <div>
              <label htmlFor="dealId" className="block text-sm font-medium text-gray-700 mb-1">
                Related Deal
              </label>
              <select
                id="dealId"
                name="dealId"
                value={formData.dealId}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-accent focus:border-accent"
                disabled={loadingDeals}
              >
                <option value="">
                  {loadingDeals ? 'Loading deals...' : 'Select a deal (optional)'}
                </option>
                {deals.map((deal) => (
                  <option key={deal.Id} value={deal.Id}>
                    {deal.Name || deal.title_c || `Deal ${deal.Id}`}
                    {deal.value_c && ` - $${deal.value_c.toLocaleString()}`}
                  </option>
                ))}
              </select>
            </div>

            {/* Quote Value and Status */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label htmlFor="value" className="block text-sm font-medium text-gray-700 mb-1">
                  Quote Value <span className="text-red-500">*</span>
                </label>
                <Input
                  id="value"
                  name="value"
                  type="number"
                  min="0"
                  step="0.01"
                  value={formData.value}
                  onChange={handleChange}
                  placeholder="0.00"
                  className={errors.value ? 'border-red-500' : ''}
                />
                {errors.value && (
                  <p className="text-red-500 text-xs mt-1">{errors.value}</p>
                )}
              </div>

              <div>
                <label htmlFor="status" className="block text-sm font-medium text-gray-700 mb-1">
                  Status
                </label>
                <select
                  id="status"
                  name="status"
                  value={formData.status}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-accent focus:border-accent"
                >
                  {statusOptions.map((status) => (
                    <option key={status} value={status}>
                      {status}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Expiry Date */}
            <div>
              <label htmlFor="expiryDate" className="block text-sm font-medium text-gray-700 mb-1">
                Expiry Date <span className="text-red-500">*</span>
              </label>
              <Input
                id="expiryDate"
                name="expiryDate"
                type="date"
                value={formData.expiryDate}
                onChange={handleChange}
                className={errors.expiryDate ? 'border-red-500' : ''}
              />
              {errors.expiryDate && (
                <p className="text-red-500 text-xs mt-1">{errors.expiryDate}</p>
              )}
            </div>

            {/* Description */}
            <div>
              <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
                Description
              </label>
              <textarea
                id="description"
                name="description"
                rows={4}
                value={formData.description}
                onChange={handleChange}
                placeholder="Enter quote description, terms, or additional details..."
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-accent focus:border-accent resize-none"
              />
            </div>

            {/* Form Actions */}
            <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-200">
              <Button
                type="button"
                variant="outline"
                onClick={handleCancel}
                disabled={loading}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={loading}
                className="flex items-center gap-2"
              >
                {loading && <ApperIcon name="Loader2" size={16} className="animate-spin" />}
                {quote ? 'Update Quote' : 'Create Quote'}
              </Button>
            </div>
          </form>
        </div>
      </Card>
    </div>
  );
};

export default QuoteForm;