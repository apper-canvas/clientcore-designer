import React, { useEffect, useState } from "react";
import { useOutletContext } from "react-router-dom";
import { contactService } from "@/services/api/contactService";
import { toast } from "react-toastify";
import ApperIcon from "@/components/ApperIcon";
import Header from "@/components/organisms/Header";
import ContactForm from "@/components/organisms/ContactForm";
import SearchBar from "@/components/molecules/SearchBar";
import ContactRow from "@/components/molecules/ContactRow";
import Button from "@/components/atoms/Button";
import Card from "@/components/atoms/Card";
import Empty from "@/components/ui/Empty";
import Loading from "@/components/ui/Loading";
import Error from "@/components/ui/Error";

const Contacts = () => {
  const { onMenuClick } = useOutletContext();
  
  const [contacts, setContacts] = useState([]);
  const [filteredContacts, setFilteredContacts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [showForm, setShowForm] = useState(false);
  const [editingContact, setEditingContact] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    loadContacts();
  }, []);

  useEffect(() => {
    filterContacts();
  }, [contacts, searchTerm, statusFilter]);

  const loadContacts = async () => {
    try {
      setLoading(true);
      setError("");
      const data = await contactService.getAll();
      setContacts(data);
    } catch (err) {
      setError("Failed to load contacts");
      console.error("Contacts loading error:", err);
    } finally {
      setLoading(false);
    }
  };

  const filterContacts = () => {
    let filtered = contacts;

    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(contact =>
contact.first_name_c?.toLowerCase().includes(term) ||
        contact.last_name_c?.toLowerCase().includes(term) ||
        contact.email_c?.toLowerCase().includes(term) ||
        contact.company_c?.toLowerCase().includes(term)
      );
}

    if (statusFilter !== "All") {
      filtered = filtered.filter(contact => contact.status_c === statusFilter);
    }

    setFilteredContacts(filtered);
  };

  const handleAddContact = () => {
    setEditingContact(null);
    setShowForm(true);
  };

  const handleEditContact = (contact) => {
    setEditingContact(contact);
    setShowForm(true);
  };

  const handleDeleteContact = async (id) => {
    if (window.confirm("Are you sure you want to delete this contact?")) {
      try {
        await contactService.delete(id);
        setContacts(prev => prev.filter(contact => contact.Id !== id));
        toast.success("Contact deleted successfully!");
      } catch (err) {
        toast.error("Failed to delete contact");
        console.error("Delete error:", err);
      }
    }
  };

  const handleSubmitContact = async (contactData) => {
    try {
      setIsSubmitting(true);
      
      if (editingContact) {
const updated = await contactService.update(editingContact.Id, contactData);
        if (updated) {
setContacts(prev => prev.map(contact => 
            contact.Id === editingContact.Id ? updated : contact
          ));
        }
        toast.success("Contact updated successfully!");
      } else {
        const newContact = await contactService.create(contactData);
        setContacts(prev => [newContact, ...prev]);
        toast.success("Contact added successfully!");
      }
      
      setShowForm(false);
      setEditingContact(null);
    } catch (err) {
      toast.error(editingContact ? "Failed to update contact" : "Failed to add contact");
      console.error("Submit error:", err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancelForm = () => {
    setShowForm(false);
    setEditingContact(null);
  };

  if (loading) return <Loading type="table" />;
  if (error) return <Error message={error} onRetry={loadContacts} />;

  const headerActions = [
    {
      label: "Add Contact",
      icon: "UserPlus",
      onClick: handleAddContact,
      variant: "primary"
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-gray-100">
      <Header
        onMenuClick={onMenuClick}
        title="Contacts"
        subtitle={`Manage your ${contacts.length} contacts and build stronger relationships`}
        actions={headerActions}
      />
      
      <div className="p-6">
        {showForm ? (
          <div className="mb-8">
            <ContactForm
              contact={editingContact}
              onSubmit={handleSubmitContact}
              onCancel={handleCancelForm}
              isSubmitting={isSubmitting}
            />
          </div>
        ) : (
          <Card className="bg-gradient-to-br from-surface to-gray-50">
            {/* Filters */}
            <div className="p-6 border-b border-gray-200">
              <div className="flex flex-col sm:flex-row gap-4">
                <div className="flex-1">
                  <SearchBar
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder="Search contacts by name, email, or company..."
                  />
                </div>
                <div className="flex items-center gap-3">
                  <select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    className="px-4 py-3 rounded-md border-2 border-gray-200 bg-surface text-primary focus:border-accent focus:outline-none"
                  >
                    <option value="All">All Status</option>
                    <option value="Lead">Lead</option>
                    <option value="Qualified">Qualified</option>
                    <option value="Active">Active</option>
                    <option value="Inactive">Inactive</option>
                  </select>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleAddContact}
                    className="flex items-center gap-2"
                  >
                    <ApperIcon name="Plus" size={16} />
                    Add Contact
                  </Button>
                </div>
              </div>
            </div>

            {filteredContacts.length === 0 ? (
              <div className="p-12">
                <Empty
                  icon="Users"
                  title={searchTerm || statusFilter !== "All" ? "No contacts found" : "No contacts yet"}
                  description={
                    searchTerm || statusFilter !== "All" 
                      ? "Try adjusting your search criteria or filters"
                      : "Start building your customer database by adding your first contact"
                  }
                  action={!searchTerm && statusFilter === "All" ? handleAddContact : undefined}
                  actionLabel="Add First Contact"
                />
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full">
                  <thead className="bg-gray-100 border-b border-gray-200">
                    <tr>
                      <th className="px-6 py-4 text-left text-sm font-semibold text-primary">Contact</th>
                      <th className="px-6 py-4 text-left text-sm font-semibold text-primary">Company</th>
                      <th className="px-6 py-4 text-left text-sm font-semibold text-primary">Phone</th>
                      <th className="px-6 py-4 text-left text-sm font-semibold text-primary">Status</th>
                      <th className="px-6 py-4 text-left text-sm font-semibold text-primary">Last Activity</th>
                      <th className="px-6 py-4 text-right text-sm font-semibold text-primary">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {filteredContacts.map(contact => (
                      <ContactRow
                        key={contact.Id}
                        contact={contact}
                        onEdit={handleEditContact}
                        onDelete={handleDeleteContact}
                      />
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </Card>
        )}
      </div>
    </div>
  );
};

export default Contacts;