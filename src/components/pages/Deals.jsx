import React, { useEffect, useState } from "react";
import { useOutletContext } from "react-router-dom";
import { dealService } from "@/services/api/dealService";
import { contactService } from "@/services/api/contactService";
import { toast } from "react-toastify";
import ApperIcon from "@/components/ApperIcon";
import Header from "@/components/organisms/Header";
import DealForm from "@/components/organisms/DealForm";
import DealCard from "@/components/molecules/DealCard";
import Button from "@/components/atoms/Button";
import Card from "@/components/atoms/Card";
import Empty from "@/components/ui/Empty";
import Loading from "@/components/ui/Loading";
import Error from "@/components/ui/Error";
const Deals = () => {
  const { onMenuClick } = useOutletContext();
  
  const [deals, setDeals] = useState([]);
  const [contacts, setContacts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [editingDeal, setEditingDeal] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const stages = ["Lead", "Qualified", "Proposal", "Negotiation", "Closed"];

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      setError("");
      
      const [dealsData, contactsData] = await Promise.all([
        dealService.getAll(),
        contactService.getAll()
      ]);
      
      setDeals(dealsData);
      setContacts(contactsData);
    } catch (err) {
      setError("Failed to load deals data");
      console.error("Deals loading error:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleAddDeal = () => {
    setEditingDeal(null);
    setShowForm(true);
  };

  const handleEditDeal = (deal) => {
    setEditingDeal(deal);
    setShowForm(true);
  };

  const handleDeleteDeal = async (id) => {
    if (window.confirm("Are you sure you want to delete this deal?")) {
      try {
        await dealService.delete(id);
        setDeals(prev => prev.filter(deal => deal.Id !== id));
        toast.success("Deal deleted successfully!");
      } catch (err) {
        toast.error("Failed to delete deal");
        console.error("Delete error:", err);
      }
    }
  };

  const handleSubmitDeal = async (dealData) => {
    try {
      setIsSubmitting(true);
      
if (editingDeal) {
        const updated = await dealService.update(editingDeal.Id, dealData);
        if (updated) {
          setDeals(prev => prev.map(deal => 
            deal.Id === editingDeal.Id ? updated : deal
          ));
        }
        toast.success("Deal updated successfully!");
      } else {
        const newDeal = await dealService.create(dealData);
        setDeals(prev => [newDeal, ...prev]);
        toast.success("Deal added successfully!");
      }
      
      setShowForm(false);
      setEditingDeal(null);
    } catch (err) {
      toast.error(editingDeal ? "Failed to update deal" : "Failed to add deal");
      console.error("Submit error:", err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancelForm = () => {
    setShowForm(false);
    setEditingDeal(null);
  };

  const getDealsByStage = (stage) => {
return deals.filter(deal => deal.stage_c === stage);
  };

  const getContactById = (id) => {
    return contacts.find(contact => contact.Id === id);
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const calculateStageValue = (stage) => {
return getDealsByStage(stage).reduce((sum, deal) => sum + (deal.value_c || 0), 0);
  };

  if (loading) return <Loading type="kanban" />;
  if (error) return <Error message={error} onRetry={loadData} />;

  const headerActions = [
    {
      label: "Add Deal",
      icon: "Plus",
      onClick: handleAddDeal,
      variant: "primary"
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-gray-100">
      <Header
        onMenuClick={onMenuClick}
        title="Deals Pipeline"
        subtitle={`Track your ${deals.length} deals through the sales process`}
        actions={headerActions}
      />
      
      <div className="p-6">
        {showForm ? (
          <div className="mb-8">
            <DealForm
              deal={editingDeal}
              onSubmit={handleSubmitDeal}
              onCancel={handleCancelForm}
              isSubmitting={isSubmitting}
            />
          </div>
        ) : (
          <>
            {deals.length === 0 ? (
              <div className="mt-12">
                <Empty
                  icon="DollarSign"
                  title="No deals in pipeline"
                  description="Start tracking your sales opportunities by adding your first deal"
                  action={handleAddDeal}
                  actionLabel="Create First Deal"
                />
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6">
                {stages.map(stage => {
                  const stageDeals = getDealsByStage(stage);
                  const stageValue = calculateStageValue(stage);
                  
                  return (
                    <div key={stage} className="bg-gray-50 rounded-lg p-4">
                      <div className="mb-4">
                        <div className="flex items-center justify-between mb-2">
                          <h3 className="font-semibold text-primary">{stage}</h3>
                          <span className="text-sm bg-gradient-to-r from-accent to-accent/80 bg-clip-text text-transparent font-bold">
                            {stageDeals.length}
                          </span>
                        </div>
                        <div className="text-sm text-gray-600">
                          {formatCurrency(stageValue)}
                        </div>
                      </div>
                      
                      <div className="space-y-3 min-h-[400px]">
                        {stageDeals.length === 0 ? (
                          <div className="flex items-center justify-center h-32 text-gray-400">
                            <div className="text-center">
                              <ApperIcon name="Plus" size={24} className="mx-auto mb-2 opacity-50" />
                              <p className="text-sm">No deals</p>
                            </div>
                          </div>
                        ) : (
                          stageDeals.map(deal => {
                            const contact = getContactById(deal.contactId);
                            return (
                              <DealCard
                                key={deal.Id}
                                deal={deal}
                                contact={contact}
                                onEdit={handleEditDeal}
                                onDelete={handleDeleteDeal}
                              />
                            );
                          })
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
            
            {/* Pipeline Summary */}
            {deals.length > 0 && (
              <Card className="mt-8 p-6 bg-gradient-to-br from-surface to-gray-50">
                <h3 className="text-lg font-semibold text-primary mb-4">Pipeline Summary</h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                  <div className="text-center">
                    <div className="text-2xl font-bold bg-gradient-to-r from-accent to-accent/80 bg-clip-text text-transparent mb-1">
                      {deals.length}
                    </div>
                    <div className="text-sm text-gray-600">Total Deals</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold bg-gradient-to-r from-success to-success/80 bg-clip-text text-transparent mb-1">
{formatCurrency(deals.reduce((sum, deal) => sum + (deal.value_c || 0), 0))}
                    </div>
                    <div className="text-sm text-gray-600">Total Value</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold bg-gradient-to-r from-info to-info/80 bg-clip-text text-transparent mb-1">
                      {Math.round(deals.reduce((sum, deal) => sum + deal.probability, 0) / deals.length)}%
                    </div>
                    <div className="text-sm text-gray-600">Avg Probability</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold bg-gradient-to-r from-warning to-warning/80 bg-clip-text text-transparent mb-1">
                      {getDealsByStage("Closed").length}
                    </div>
                    <div className="text-sm text-gray-600">Closed Won</div>
                  </div>
                </div>
              </Card>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default Deals;