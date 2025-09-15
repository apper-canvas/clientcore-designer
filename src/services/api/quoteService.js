import { toast } from 'react-toastify';
import mockQuotes from '../mockData/quotes.json';

// Enhanced Quote Service with ApperClient-ready patterns
// Ready for database migration when Quote tables become available
class QuoteService {
  constructor() {
    this.quotes = [...mockQuotes];
    
    // Initialize ApperClient components for future database integration
    this.isInitialized = false;
    this.apperClient = null;
  }

  // Initialize ApperClient when database tables become available
  async initializeApperClient() {
    if (typeof window !== 'undefined' && window.ApperSDK) {
      const { ApperClient } = window.ApperSDK;
      this.apperClient = new ApperClient({
        apperProjectId: import.meta.env.VITE_APPER_PROJECT_ID,
        apperPublicKey: import.meta.env.VITE_APPER_PUBLIC_KEY
      });
      this.isInitialized = true;
    }
  }

  // Simulate API delay
  delay(ms = 300) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  async getAll() {
    try {
      await this.delay();
      
      // Return deep copy to prevent mutations
      return this.quotes.map(quote => ({ ...quote }));
    } catch (error) {
      console.error("Error fetching quotes:", error);
      return [];
    }
  }

  async getById(id) {
    try {
      await this.delay();
      
      const quote = this.quotes.find(q => q.Id === parseInt(id));
      if (!quote) {
        return null;
      }
      
      // Return deep copy
      return { ...quote };
    } catch (error) {
      console.error(`Error fetching quote ${id}:`, error);
      return null;
    }
  }

  async create(quoteData) {
    try {
      await this.delay();
      
      // Generate new ID
      const newId = Math.max(...this.quotes.map(q => q.Id), 0) + 1;
      
      const newQuote = {
        Id: newId,
        title: quoteData.title,
        contactId: parseInt(quoteData.contactId),
        contactName: quoteData.contactName || `Contact ${quoteData.contactId}`,
        dealId: quoteData.dealId ? parseInt(quoteData.dealId) : null,
        dealName: quoteData.dealName || null,
        value: parseFloat(quoteData.value),
        status: quoteData.status || 'Draft',
        description: quoteData.description || '',
        expiryDate: quoteData.expiryDate || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
        quotationNumber: `QUO-${new Date().getFullYear()}-${String(newId).padStart(3, '0')}`,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      this.quotes.push(newQuote);
      
      toast.success('Quote created successfully');
      return { ...newQuote };
    } catch (error) {
      console.error("Error creating quote:", error);
      toast.error('Failed to create quote');
      return null;
    }
  }

  async update(id, quoteData) {
    try {
      await this.delay();
      
      const index = this.quotes.findIndex(q => q.Id === parseInt(id));
      if (index === -1) {
        toast.error('Quote not found');
        return null;
      }

      const updatedQuote = {
        ...this.quotes[index],
        title: quoteData.title,
        contactId: parseInt(quoteData.contactId),
        contactName: quoteData.contactName || this.quotes[index].contactName,
        dealId: quoteData.dealId ? parseInt(quoteData.dealId) : null,
        dealName: quoteData.dealName || null,
        value: parseFloat(quoteData.value),
        status: quoteData.status,
        description: quoteData.description || '',
        expiryDate: quoteData.expiryDate,
        updatedAt: new Date().toISOString()
      };

      this.quotes[index] = updatedQuote;
      
      toast.success('Quote updated successfully');
      return { ...updatedQuote };
    } catch (error) {
      console.error("Error updating quote:", error);
      toast.error('Failed to update quote');
      return null;
    }
  }

  async delete(id) {
    try {
      await this.delay();
      
      const index = this.quotes.findIndex(q => q.Id === parseInt(id));
      if (index === -1) {
        toast.error('Quote not found');
        return false;
      }

      this.quotes.splice(index, 1);
      
      toast.success('Quote deleted successfully');
      return true;
    } catch (error) {
      console.error("Error deleting quote:", error);
      toast.error('Failed to delete quote');
      return false;
    }
  }

  // Additional utility methods
  async getByContactId(contactId) {
    try {
      await this.delay();
      
      const quotes = this.quotes.filter(q => q.contactId === parseInt(contactId));
      return quotes.map(quote => ({ ...quote }));
    } catch (error) {
      console.error(`Error fetching quotes for contact ${contactId}:`, error);
      return [];
    }
  }

  async getByDealId(dealId) {
    try {
      await this.delay();
      
      const quotes = this.quotes.filter(q => q.dealId === parseInt(dealId));
      return quotes.map(quote => ({ ...quote }));
    } catch (error) {
      console.error(`Error fetching quotes for deal ${dealId}:`, error);
      return [];
    }
  }

  async getByStatus(status) {
    try {
      await this.delay();
      
      const quotes = this.quotes.filter(q => q.status === status);
      return quotes.map(quote => ({ ...quote }));
    } catch (error) {
      console.error(`Error fetching quotes with status ${status}:`, error);
      return [];
    }
  }
}

export default new QuoteService();