import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import Button from '@/components/atoms/Button';
import Card from '@/components/atoms/Card';
import Input from '@/components/atoms/Input';
import ApperIcon from '@/components/ApperIcon';
import QuoteCard from '@/components/molecules/QuoteCard';
import QuoteForm from '@/components/organisms/QuoteForm';
import Loading from '@/components/ui/Loading';
import Error from '@/components/ui/Error';
import Empty from '@/components/ui/Empty';
import quoteService from '@/services/api/quoteService';

const Quotes = () => {
  const [quotes, setQuotes] = useState([]);
  const [filteredQuotes, setFilteredQuotes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [showForm, setShowForm] = useState(false);
  const [editingQuote, setEditingQuote] = useState(null);

  const statusOptions = ['All', 'Draft', 'Sent', 'Accepted', 'Rejected', 'Expired'];

  useEffect(() => {
    loadQuotes();
  }, []);

  useEffect(() => {
    filterQuotes();
  }, [quotes, searchTerm, statusFilter]);

  const loadQuotes = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await quoteService.getAll();
      setQuotes(data);
    } catch (err) {
      setError('Failed to load quotes. Please try again.');
      console.error('Error loading quotes:', err);
    } finally {
      setLoading(false);
    }
  };

  const filterQuotes = () => {
    let filtered = quotes;

    // Filter by search term
    if (searchTerm.trim()) {
      filtered = filtered.filter(quote => 
        quote.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        quote.contactName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        quote.quotationNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
        quote.description.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Filter by status
    if (statusFilter !== 'All') {
      filtered = filtered.filter(quote => quote.status === statusFilter);
    }

    setFilteredQuotes(filtered);
  };

  const handleCreateQuote = () => {
    setEditingQuote(null);
    setShowForm(true);
  };

  const handleEditQuote = (quote) => {
    setEditingQuote(quote);
    setShowForm(true);
  };

  const handleDeleteQuote = async (quoteId) => {
    if (!window.confirm('Are you sure you want to delete this quote?')) {
      return;
    }

    try {
      const success = await quoteService.delete(quoteId);
      if (success) {
        await loadQuotes();
      }
    } catch (err) {
      console.error('Error deleting quote:', err);
    }
  };

  const handleFormSubmit = async (quoteData) => {
    try {
      let success;
      if (editingQuote) {
        success = await quoteService.update(editingQuote.Id, quoteData);
      } else {
        success = await quoteService.create(quoteData);
      }

      if (success) {
        setShowForm(false);
        setEditingQuote(null);
        await loadQuotes();
      }
    } catch (err) {
      console.error('Error saving quote:', err);
    }
  };

  const handleFormCancel = () => {
    setShowForm(false);
    setEditingQuote(null);
  };

  const getStatusColor = (status) => {
    const colors = {
      'Draft': 'text-gray-600 bg-gray-100',
      'Sent': 'text-blue-600 bg-blue-100',
      'Accepted': 'text-green-600 bg-green-100',
      'Rejected': 'text-red-600 bg-red-100',
      'Expired': 'text-orange-600 bg-orange-100'
    };
    return colors[status] || 'text-gray-600 bg-gray-100';
  };

  if (loading) {
    return <Loading type="page" />;
  }

  if (error) {
    return <Error title="Failed to Load Quotes" message={error} onRetry={loadQuotes} />;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-primary">Quotes</h1>
          <p className="text-gray-600 mt-1">
            Manage your quotes and proposals
          </p>
        </div>
        <Button onClick={handleCreateQuote} className="flex items-center gap-2">
          <ApperIcon name="Plus" size={16} />
          Add Quote
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total Quotes</p>
              <p className="text-2xl font-bold text-primary">{quotes.length}</p>
            </div>
            <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
              <ApperIcon name="FileText" size={24} className="text-blue-600" />
            </div>
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Sent</p>
              <p className="text-2xl font-bold text-primary">
                {quotes.filter(q => q.status === 'Sent').length}
              </p>
            </div>
            <div className="w-12 h-12 bg-yellow-100 rounded-xl flex items-center justify-center">
              <ApperIcon name="Send" size={24} className="text-yellow-600" />
            </div>
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Accepted</p>
              <p className="text-2xl font-bold text-primary">
                {quotes.filter(q => q.status === 'Accepted').length}
              </p>
            </div>
            <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
              <ApperIcon name="CheckCircle" size={24} className="text-green-600" />
            </div>
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total Value</p>
              <p className="text-2xl font-bold text-primary">
                ${quotes.reduce((sum, q) => sum + (q.value || 0), 0).toLocaleString()}
              </p>
            </div>
            <div className="w-12 h-12 bg-accent/10 rounded-xl flex items-center justify-center">
              <ApperIcon name="DollarSign" size={24} className="text-accent" />
            </div>
          </div>
        </Card>
      </div>

      {/* Filters */}
      <Card className="p-4">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <Input
              placeholder="Search quotes..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full"
            />
          </div>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-accent focus:border-accent"
          >
            {statusOptions.map(status => (
              <option key={status} value={status}>{status}</option>
            ))}
          </select>
        </div>
      </Card>

      {/* Quotes Grid */}
      {filteredQuotes.length === 0 ? (
        <Empty
          icon="FileText"
          title={quotes.length === 0 ? "No quotes yet" : "No quotes found"}
          description={
            quotes.length === 0 
              ? "Create your first quote to get started"
              : "Try adjusting your search or filters"
          }
          action={quotes.length === 0 ? (
            <Button onClick={handleCreateQuote} className="flex items-center gap-2">
              <ApperIcon name="Plus" size={16} />
              Create Quote
            </Button>
          ) : null}
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredQuotes.map((quote) => (
            <QuoteCard
              key={quote.Id}
              quote={quote}
              onEdit={() => handleEditQuote(quote)}
              onDelete={() => handleDeleteQuote(quote.Id)}
            />
          ))}
        </div>
      )}

      {/* Quote Form Modal */}
      {showForm && (
        <QuoteForm
          quote={editingQuote}
          onSubmit={handleFormSubmit}
          onCancel={handleFormCancel}
        />
      )}
    </div>
  );
};

export default Quotes;