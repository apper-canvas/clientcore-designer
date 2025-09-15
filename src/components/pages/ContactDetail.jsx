import { useState, useEffect, useOutletContext } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Header from "@/components/organisms/Header";
import Card from "@/components/atoms/Card";
import Button from "@/components/atoms/Button";
import Badge from "@/components/atoms/Badge";
import ActivityItem from "@/components/molecules/ActivityItem";
import DealCard from "@/components/molecules/DealCard";
import Loading from "@/components/ui/Loading";
import Error from "@/components/ui/Error";
import Empty from "@/components/ui/Empty";
import ApperIcon from "@/components/ApperIcon";
import { contactService } from "@/services/api/contactService";
import { dealService } from "@/services/api/dealService";
import { activityService } from "@/services/api/activityService";
import { format } from "date-fns";

const ContactDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { onMenuClick } = useOutletContext();
  
  const [contact, setContact] = useState(null);
  const [deals, setDeals] = useState([]);
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [activeTab, setActiveTab] = useState("overview");

  useEffect(() => {
    if (id) {
      loadContactData();
    }
  }, [id]);

  const loadContactData = async () => {
    try {
      setLoading(true);
      setError("");
      
      const [contactData, allDeals, allActivities] = await Promise.all([
        contactService.getById(parseInt(id)),
        dealService.getAll(),
        activityService.getAll()
      ]);
      
      if (!contactData) {
        setError("Contact not found");
        return;
      }
      
      setContact(contactData);
setDeals(allDeals.filter(deal => deal.contact_id_c?.Id === contactData.Id || deal.contact_id_c === contactData.Id));
      setActivities(allActivities.filter(activity => activity.contactId === contactData.Id));
    } catch (err) {
      setError("Failed to load contact details");
      console.error("Contact detail loading error:", err);
    } finally {
      setLoading(false);
    }
  };

  const getDealById = (dealId) => {
    return deals.find(deal => deal.Id === dealId);
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(amount);
  };

  const totalDealValue = deals.reduce((sum, deal) => sum + deal.value, 0);
  const activeDealCount = deals.filter(deal => deal.stage !== "Closed").length;

  if (loading) return <Loading />;
  if (error) return <Error message={error} onRetry={loadContactData} />;
  if (!contact) return <Error message="Contact not found" />;

  const headerActions = [
    {
      label: "Edit",
      icon: "Edit",
      onClick: () => navigate("/contacts"),
      variant: "outline"
    },
    {
      label: "Add Deal",
      icon: "Plus",
      onClick: () => navigate("/deals"),
      variant: "primary"
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-gray-100">
      <Header
onMenuClick={onMenuClick}
        title={`${contact.first_name_c} ${contact.last_name_c}`}
        subtitle={`${contact.company_c} • ${contact.email_c}`}
        actions={headerActions}
      />
      
      <div className="p-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Contact Info */}
          <div className="lg:col-span-1">
            <Card className="p-6 bg-gradient-to-br from-surface to-gray-50">
              <div className="text-center mb-6">
                <div className="w-20 h-20 bg-gradient-to-br from-primary to-secondary rounded-full flex items-center justify-center text-white text-2xl font-bold mx-auto mb-4">
{contact.first_name_c?.[0]}{contact.last_name_c?.[0]}
                </div>
                <h2 className="text-xl font-bold text-primary mb-2">
{contact.first_name_c} {contact.last_name_c}
                </h2>
                <p className="text-gray-600 mb-3">{contact.company_c}</p>
                <Badge variant={contact.status_c === "Active" ? "success" : "default"}>
                  {contact.status_c}
                </Badge>
              </div>
              
              <div className="space-y-4">
                <div className="flex items-center text-gray-600">
                  <ApperIcon name="Mail" size={16} className="mr-3" />
<span className="text-sm">{contact.email_c}</span>
                </div>
                <div className="flex items-center text-gray-600">
                  <ApperIcon name="Phone" size={16} className="mr-3" />
<span className="text-sm">{contact.phone_c}</span>
                </div>
                <div className="flex items-center text-gray-600">
                  <ApperIcon name="Building2" size={16} className="mr-3" />
<span className="text-sm">{contact.company_c}</span>
                </div>
                <div className="flex items-center text-gray-600">
                  <ApperIcon name="Calendar" size={16} className="mr-3" />
                  <span className="text-sm">
Added {format(new Date(contact.created_at_c || contact.CreatedOn), "MMM dd, yyyy")}
                  </span>
                </div>
              </div>
              
              {/* Quick Stats */}
              <div className="mt-6 pt-6 border-t border-gray-200">
                <div className="grid grid-cols-2 gap-4">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-accent mb-1">
                      {formatCurrency(totalDealValue)}
                    </div>
                    <div className="text-sm text-gray-600">Total Value</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-success mb-1">
                      {activeDealCount}
                    </div>
                    <div className="text-sm text-gray-600">Active Deals</div>
                  </div>
                </div>
              </div>
            </Card>
          </div>
          
          {/* Content Area */}
          <div className="lg:col-span-2">
            {/* Tabs */}
            <div className="mb-6">
              <nav className="flex space-x-1">
                {[
                  { id: "overview", label: "Overview", icon: "BarChart3" },
                  { id: "deals", label: "Deals", icon: "DollarSign" },
                  { id: "activities", label: "Activities", icon: "Activity" }
                ].map(tab => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`flex items-center px-4 py-3 text-sm font-medium rounded-lg transition-all duration-200 ${
                      activeTab === tab.id
                        ? "bg-gradient-to-r from-accent to-accent/90 text-white shadow-lg"
                        : "text-gray-600 hover:text-primary hover:bg-gray-100"
                    }`}
                  >
                    <ApperIcon name={tab.icon} size={16} className="mr-2" />
                    {tab.label}
                  </button>
                ))}
              </nav>
            </div>
            
            {/* Tab Content */}
            {activeTab === "overview" && (
              <div className="space-y-6">
                <Card className="p-6 bg-gradient-to-br from-surface to-gray-50">
                  <h3 className="text-lg font-semibold text-primary mb-4">Recent Activity</h3>
                  {activities.slice(0, 3).length === 0 ? (
                    <Empty
                      icon="Activity"
                      title="No activities yet"
                      description="Start logging interactions with this contact"
                      action={() => navigate("/activities")}
                      actionLabel="Log Activity"
                    />
                  ) : (
                    <div className="space-y-4">
                      {activities.slice(0, 3).map(activity => (
                        <ActivityItem
key={activity.Id}
                          activity={activity}
                          contact={contact}
                          deal={activity.deal_id_c ? getDealById(activity.deal_id_c?.Id || activity.deal_id_c) : null}
                        />
                      ))}
                      {activities.length > 3 && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setActiveTab("activities")}
                          className="w-full"
                        >
                          View All Activities
                        </Button>
                      )}
                    </div>
                  )}
                </Card>
                
                <Card className="p-6 bg-gradient-to-br from-surface to-gray-50">
                  <h3 className="text-lg font-semibold text-primary mb-4">Active Deals</h3>
{deals.filter(deal => deal.stage_c !== "Closed").length === 0 ? (
                    <Empty
                      icon="DollarSign"
                      title="No active deals"
                      description="Create a deal to start tracking opportunities"
                      action={() => navigate("/deals")}
                      actionLabel="Create Deal"
                    />
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {deals.filter(deal => deal.stage !== "Closed").map(deal => (
                        <DealCard
                          key={deal.Id}
                          deal={deal}
                          contact={contact}
                          onEdit={() => navigate("/deals")}
                          onDelete={() => navigate("/deals")}
                          draggable={false}
                        />
                      ))}
                    </div>
                  )}
                </Card>
              </div>
            )}
            
            {activeTab === "deals" && (
              <Card className="p-6 bg-gradient-to-br from-surface to-gray-50">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-lg font-semibold text-primary">All Deals</h3>
                  <Button
                    onClick={() => navigate("/deals")}
                    size="sm"
                  >
                    <ApperIcon name="Plus" size={16} className="mr-2" />
                    New Deal
                  </Button>
                </div>
                
                {deals.length === 0 ? (
                  <Empty
                    icon="DollarSign"
                    title="No deals found"
                    description="Create the first deal for this contact"
                    action={() => navigate("/deals")}
                    actionLabel="Create Deal"
                  />
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {deals.map(deal => (
                      <DealCard
                        key={deal.Id}
                        deal={deal}
                        contact={contact}
                        onEdit={() => navigate("/deals")}
                        onDelete={() => navigate("/deals")}
                        draggable={false}
                      />
                    ))}
                  </div>
                )}
              </Card>
            )}
            
            {activeTab === "activities" && (
              <Card className="p-6 bg-gradient-to-br from-surface to-gray-50">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-lg font-semibold text-primary">All Activities</h3>
                  <Button
                    onClick={() => navigate("/activities")}
                    size="sm"
                  >
                    <ApperIcon name="Plus" size={16} className="mr-2" />
                    Log Activity
                  </Button>
                </div>
                
                {activities.length === 0 ? (
                  <Empty
                    icon="Activity"
                    title="No activities found"
                    description="Start logging interactions with this contact"
                    action={() => navigate("/activities")}
                    actionLabel="Log Activity"
                  />
                ) : (
                  <div className="space-y-4">
                    {activities.map(activity => (
                      <ActivityItem
key={activity.Id}
                        activity={activity}
                        contact={contact}
                        deal={activity.deal_id_c ? getDealById(activity.deal_id_c?.Id || activity.deal_id_c) : null}
                      />
                    ))}
                  </div>
                )}
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ContactDetail;