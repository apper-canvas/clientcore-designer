import React from 'react';
import { format } from 'date-fns';
import Card from '@/components/atoms/Card';
import Button from '@/components/atoms/Button';
import Badge from '@/components/atoms/Badge';
import ApperIcon from '@/components/ApperIcon';

const QuoteCard = ({ quote, onEdit, onDelete }) => {
  const getStatusColor = (status) => {
    const colors = {
      'Draft': 'bg-gray-100 text-gray-800',
      'Sent': 'bg-blue-100 text-blue-800',
      'Accepted': 'bg-green-100 text-green-800',
      'Rejected': 'bg-red-100 text-red-800',
      'Expired': 'bg-orange-100 text-orange-800'
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  const isExpiringSoon = () => {
    if (!quote.expiryDate) return false;
    const expiryDate = new Date(quote.expiryDate);
    const today = new Date();
    const daysUntilExpiry = Math.ceil((expiryDate - today) / (1000 * 60 * 60 * 24));
    return daysUntilExpiry <= 7 && daysUntilExpiry > 0;
  };

  const formatCurrency = (value) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(value);
  };

  return (
    <Card className="p-6 hover:shadow-lg transition-shadow duration-200">
      <div className="space-y-4">
        {/* Header */}
        <div className="flex items-start justify-between">
          <div className="flex-1 min-w-0">
            <h3 className="text-lg font-semibold text-primary truncate">
              {quote.title}
            </h3>
            <p className="text-sm text-gray-500 mt-1">
              {quote.quotationNumber}
            </p>
          </div>
          <div className="flex items-center gap-2 ml-2">
            <Badge className={getStatusColor(quote.status)}>
              {quote.status}
            </Badge>
            {isExpiringSoon() && (
              <Badge className="bg-orange-100 text-orange-800">
                <ApperIcon name="Clock" size={12} className="mr-1" />
                Expiring Soon
              </Badge>
            )}
          </div>
        </div>

        {/* Content */}
        <div className="space-y-3">
          {/* Contact and Deal Info */}
          <div className="space-y-2">
            <div className="flex items-center text-sm text-gray-600">
              <ApperIcon name="User" size={16} className="mr-2" />
              <span>{quote.contactName}</span>
            </div>
            {quote.dealName && (
              <div className="flex items-center text-sm text-gray-600">
                <ApperIcon name="Briefcase" size={16} className="mr-2" />
                <span>{quote.dealName}</span>
              </div>
            )}
          </div>

          {/* Value */}
          <div className="flex items-center justify-between py-2">
            <span className="text-sm font-medium text-gray-700">Quote Value</span>
            <span className="text-lg font-bold text-accent">
              {formatCurrency(quote.value)}
            </span>
          </div>

          {/* Description */}
          {quote.description && (
            <p className="text-sm text-gray-600 line-clamp-2">
              {quote.description}
            </p>
          )}

          {/* Dates */}
          <div className="flex items-center justify-between text-xs text-gray-500 pt-2 border-t border-gray-100">
            <span>
              Created {format(new Date(quote.createdAt), 'MMM dd, yyyy')}
            </span>
            <span>
              Expires {format(new Date(quote.expiryDate), 'MMM dd, yyyy')}
            </span>
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center justify-between pt-4 border-t border-gray-100">
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={onEdit}
              className="flex items-center gap-1"
            >
              <ApperIcon name="Edit2" size={14} />
              Edit
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={onDelete}
              className="flex items-center gap-1 text-red-600 hover:text-red-700"
            >
              <ApperIcon name="Trash2" size={14} />
              Delete
            </Button>
          </div>
          
          {quote.status === 'Accepted' && (
            <Badge className="bg-green-100 text-green-800 text-xs">
              <ApperIcon name="CheckCircle" size={12} className="mr-1" />
              Won
            </Badge>
          )}
        </div>
      </div>
    </Card>
  );
};

export default QuoteCard;