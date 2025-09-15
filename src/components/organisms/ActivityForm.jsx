import { useState, useEffect } from "react";
import Button from "@/components/atoms/Button";
import Input from "@/components/atoms/Input";
import Card from "@/components/atoms/Card";
import ApperIcon from "@/components/ApperIcon";
import { contactService } from "@/services/api/contactService";
import { dealService } from "@/services/api/dealService";

const ActivityForm = ({ activity, onSubmit, onCancel, isSubmitting = false }) => {
  const [formData, setFormData] = useState({
    contactId: "",
    dealId: "",
    type: "Call",
    description: "",
    date: new Date().toISOString().slice(0, 16)
  });

  const [contacts, setContacts] = useState([]);
  const [deals, setDeals] = useState([]);
  const [filteredDeals, setFilteredDeals] = useState([]);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    if (activity) {
      setFormData({
contactId: activity.contact_id_c?.Id?.toString() || activity.contact_id_c?.toString() || "",
        dealId: activity.deal_id_c?.Id?.toString() || activity.deal_id_c?.toString() || "",
        type: activity.type_c || "Call",
        description: activity.description_c || "",
        date: activity.date_c ?
          new Date(activity.date).toISOString().slice(0, 16) : 
          new Date().toISOString().slice(0, 16)
      });
    }
  }, [activity]);

  useEffect(() => {
    if (formData.contactId) {
const contactDeals = deals.filter(deal => (deal.contact_id_c?.Id || deal.contact_id_c)?.toString() === formData.contactId);
      setFilteredDeals(contactDeals);
    } else {
      setFilteredDeals(deals);
    }
  }, [formData.contactId, deals]);

  const loadData = async () => {
    try {
      const [contactsData, dealsData] = await Promise.all([
        contactService.getAll(),
        dealService.getAll()
      ]);
      setContacts(contactsData);
      setDeals(dealsData);
      setFilteredDeals(dealsData);
    } catch (error) {
      console.error("Error loading data:", error);
    }
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.contactId) {
      newErrors.contactId = "Contact selection is required";
    }
    
    if (!formData.description.trim()) {
      newErrors.description = "Description is required";
    }
    
    if (!formData.date) {
      newErrors.date = "Date is required";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (validateForm()) {
      const activityData = {
        ...formData,
contact_id_c: parseInt(formData.contactId),
        deal_id_c: formData.dealId ? parseInt(formData.dealId) : null,
        type_c: formData.type,
        description_c: formData.description,
        date_c: new Date(formData.date).toISOString()
      };
      onSubmit(activityData);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    
    // Clear deal selection when contact changes
    if (name === "contactId") {
      setFormData(prev => ({ ...prev, dealId: "" }));
    }
    
    // Clear error for this field
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: "" }));
    }
  };

  return (
    <Card className="p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-bold text-primary">
          {activity ? "Edit Activity" : "Log New Activity"}
        </h2>
        <Button
          variant="ghost"
          size="sm"
          onClick={onCancel}
          className="p-2"
        >
          <ApperIcon name="X" size={20} />
        </Button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-primary mb-2">
            Contact
          </label>
          <select
            name="contactId"
            value={formData.contactId}
            onChange={handleChange}
            className={`w-full px-4 py-3 rounded-md border-2 bg-surface text-primary focus:outline-none transition-colors duration-200 ${
              errors.contactId ? "border-error focus:border-error" : "border-gray-200 focus:border-accent"
            }`}
          >
            <option value="">Select a contact</option>
            {contacts.map(contact => (
              <option key={contact.Id} value={contact.Id}>
{contact.first_name_c} {contact.last_name_c} - {contact.company_c}
              </option>
            ))}
          </select>
          {errors.contactId && (
            <p className="text-error text-sm mt-1">{errors.contactId}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-primary mb-2">
            Related Deal (Optional)
          </label>
          <select
            name="dealId"
            value={formData.dealId}
            onChange={handleChange}
            className="w-full px-4 py-3 rounded-md border-2 border-gray-200 bg-surface text-primary focus:border-accent focus:outline-none transition-colors duration-200"
          >
            <option value="">No related deal</option>
            {filteredDeals.map(deal => (
              <option key={deal.Id} value={deal.Id}>
{deal.title_c}
              </option>
            ))}
          </select>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-primary mb-2">
              Activity Type
            </label>
            <select
              name="type"
              value={formData.type}
              onChange={handleChange}
              className="w-full px-4 py-3 rounded-md border-2 border-gray-200 bg-surface text-primary focus:border-accent focus:outline-none transition-colors duration-200"
            >
              <option value="Call">Call</option>
              <option value="Email">Email</option>
              <option value="Meeting">Meeting</option>
              <option value="Note">Note</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-primary mb-2">
              Date & Time
            </label>
            <Input
              name="date"
              type="datetime-local"
              value={formData.date}
              onChange={handleChange}
              error={errors.date}
            />
            {errors.date && (
              <p className="text-error text-sm mt-1">{errors.date}</p>
            )}
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-primary mb-2">
            Description
          </label>
          <textarea
            name="description"
            value={formData.description}
            onChange={handleChange}
            rows={4}
            className={`w-full px-4 py-3 rounded-md border-2 bg-surface text-primary focus:outline-none transition-colors duration-200 resize-none ${
              errors.description ? "border-error focus:border-error" : "border-gray-200 focus:border-accent"
            }`}
            placeholder="Describe the activity..."
          />
          {errors.description && (
            <p className="text-error text-sm mt-1">{errors.description}</p>
          )}
        </div>

        <div className="flex justify-end gap-3 pt-4">
          <Button
            type="button"
            variant="outline"
            onClick={onCancel}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            disabled={isSubmitting}
          >
            {isSubmitting ? "Saving..." : (activity ? "Update Activity" : "Log Activity")}
          </Button>
        </div>
      </form>
    </Card>
  );
};

export default ActivityForm;