import { useState, useEffect } from "react";
import { useOutletContext } from "react-router-dom";
import Header from "@/components/organisms/Header";
import ActivityForm from "@/components/organisms/ActivityForm";
import ActivityItem from "@/components/molecules/ActivityItem";
import SearchBar from "@/components/molecules/SearchBar";
import Card from "@/components/atoms/Card";
import Button from "@/components/atoms/Button";
import Loading from "@/components/ui/Loading";
import Error from "@/components/ui/Error";
import Empty from "@/components/ui/Empty";
import { activityService } from "@/services/api/activityService";
import { contactService } from "@/services/api/contactService";
import { dealService } from "@/services/api/dealService";
import { toast } from "react-toastify";

const Activities = () => {
  const { onMenuClick } = useOutletContext();
  
  const [activities, setActivities] = useState([]);
  const [contacts, setContacts] = useState([]);
  const [deals, setDeals] = useState([]);
  const [filteredActivities, setFilteredActivities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [typeFilter, setTypeFilter] = useState("All");
  const [showForm, setShowForm] = useState(false);
  const [editingActivity, setEditingActivity] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    filterActivities();
  }, [activities, searchTerm, typeFilter]);

  const loadData = async () => {
    try {
      setLoading(true);
      setError("");
      
      const [activitiesData, contactsData, dealsData] = await Promise.all([
        activityService.getAll(),
        contactService.getAll(),
        dealService.getAll()
      ]);
      
      setActivities(activitiesData);
      setContacts(contactsData);
      setDeals(dealsData);
    } catch (err) {
      setError("Failed to load activities data");
      console.error("Activities loading error:", err);
    } finally {
      setLoading(false);
    }
  };

  const filterActivities = () => {
    let filtered = activities;

    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(activity => {
        const contact = getContactById(activity.contactId);
        const deal = activity.dealId ? getDealById(activity.dealId) : null;
        
        return (
          activity.description?.toLowerCase().includes(term) ||
          activity.type?.toLowerCase().includes(term) ||
          (contact && `${contact.firstName} ${contact.lastName}`.toLowerCase().includes(term)) ||
          (deal && deal.title?.toLowerCase().includes(term))
        );
      });
    }

    if (typeFilter !== "All") {
      filtered = filtered.filter(activity => activity.type === typeFilter);
    }

    // Sort by date descending (most recent first)
    filtered.sort((a, b) => new Date(b.date) - new Date(a.date));
    
    setFilteredActivities(filtered);
  };

  const handleAddActivity = () => {
    setEditingActivity(null);
    setShowForm(true);
  };

  const handleEditActivity = (activity) => {
    setEditingActivity(activity);
    setShowForm(true);
  };

  const handleDeleteActivity = async (id) => {
    if (window.confirm("Are you sure you want to delete this activity?")) {
      try {
        await activityService.delete(id);
        setActivities(prev => prev.filter(activity => activity.Id !== id));
        toast.success("Activity deleted successfully!");
      } catch (err) {
        toast.error("Failed to delete activity");
        console.error("Delete error:", err);
      }
    }
  };

  const handleSubmitActivity = async (activityData) => {
    try {
      setIsSubmitting(true);
      
      if (editingActivity) {
        const updated = await activityService.update(editingActivity.Id, activityData);
        setActivities(prev => prev.map(activity => 
          activity.Id === editingActivity.Id ? updated : activity
        ));
        toast.success("Activity updated successfully!");
      } else {
        const newActivity = await activityService.create(activityData);
        setActivities(prev => [newActivity, ...prev]);
        toast.success("Activity logged successfully!");
      }
      
      setShowForm(false);
      setEditingActivity(null);
    } catch (err) {
      toast.error(editingActivity ? "Failed to update activity" : "Failed to log activity");
      console.error("Submit error:", err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancelForm = () => {
    setShowForm(false);
    setEditingActivity(null);
  };

  const getContactById = (id) => {
    return contacts.find(contact => contact.Id === id);
  };

  const getDealById = (id) => {
    return deals.find(deal => deal.Id === id);
  };

  if (loading) return <Loading />;
  if (error) return <Error message={error} onRetry={loadData} />;

  const headerActions = [
    {
      label: "Log Activity",
      icon: "Plus",
      onClick: handleAddActivity,
      variant: "primary"
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-gray-100">
      <Header
        onMenuClick={onMenuClick}
        title="Activities"
        subtitle={`Track all customer interactions and stay organized with ${activities.length} logged activities`}
        actions={headerActions}
      />
      
      <div className="p-6">
        {showForm ? (
          <div className="mb-8">
            <ActivityForm
              activity={editingActivity}
              onSubmit={handleSubmitActivity}
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
                    placeholder="Search activities, contacts, or deals..."
                  />
                </div>
                <div className="flex items-center gap-3">
                  <select
                    value={typeFilter}
                    onChange={(e) => setTypeFilter(e.target.value)}
                    className="px-4 py-3 rounded-md border-2 border-gray-200 bg-surface text-primary focus:border-accent focus:outline-none"
                  >
                    <option value="All">All Types</option>
                    <option value="Call">Call</option>
                    <option value="Email">Email</option>
                    <option value="Meeting">Meeting</option>
                    <option value="Note">Note</option>
                  </select>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleAddActivity}
                    className="flex items-center gap-2 whitespace-nowrap"
                  >
                    Log Activity
                  </Button>
                </div>
              </div>
            </div>

            {filteredActivities.length === 0 ? (
              <div className="p-12">
                <Empty
                  icon="Activity"
                  title={searchTerm || typeFilter !== "All" ? "No activities found" : "No activities yet"}
                  description={
                    searchTerm || typeFilter !== "All" 
                      ? "Try adjusting your search criteria or filters"
                      : "Start tracking customer interactions by logging your first activity"
                  }
                  action={!searchTerm && typeFilter === "All" ? handleAddActivity : undefined}
                  actionLabel="Log First Activity"
                />
              </div>
            ) : (
              <div className="p-6">
                <div className="space-y-4">
                  {filteredActivities.map(activity => {
                    const contact = getContactById(activity.contactId);
                    const deal = activity.dealId ? getDealById(activity.dealId) : null;
                    
                    return (
                      <div key={activity.Id} className="relative group">
                        <ActivityItem
                          activity={activity}
                          contact={contact}
                          deal={deal}
                        />
                        <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleEditActivity(activity)}
                            className="p-2"
                          >
                            Edit
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDeleteActivity(activity.Id)}
                            className="p-2 text-error hover:bg-error/10"
                          >
                            Delete
                          </Button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </Card>
        )}
      </div>
    </div>
  );
};

export default Activities;