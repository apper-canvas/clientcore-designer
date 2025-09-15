import { format } from "date-fns";
import React from "react";
import ApperIcon from "@/components/ApperIcon";
import Button from "@/components/atoms/Button";
import Card from "@/components/atoms/Card";
import Badge from "@/components/atoms/Badge";

const DealCard = ({ deal, contact, onEdit, onDelete, draggable = true }) => {
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(amount);
  };

  return (
    <Card 
      hoverable 
      className={`p-4 mb-3 ${draggable ? "cursor-move" : ""} bg-gradient-to-br from-surface to-gray-50`}
      draggable={draggable}
    >
      <div className="flex justify-between items-start mb-3">
<h4 className="font-semibold text-primary text-sm">{deal.title_c}</h4>
        <div className="flex gap-1">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onEdit(deal)}
            className="p-1"
          >
            <ApperIcon name="Edit" size={14} />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onDelete(deal.Id)}
            className="p-1 text-error hover:bg-error/10"
          >
            <ApperIcon name="Trash2" size={14} />
          </Button>
        </div>
      </div>
      
      <div className="space-y-2">
<div className="flex items-center justify-between">
          <span className="text-lg font-bold bg-gradient-to-r from-accent to-accent/80 bg-clip-text text-transparent">
            {formatCurrency(deal.value_c)}
          </span>
          <Badge variant="info">{deal.probability_c}%</Badge>
        </div>
        
        {contact && (
          <div className="flex items-center text-sm text-gray-600">
            <ApperIcon name="User" size={14} className="mr-2" />
{contact.first_name_c} {contact.last_name_c}
          </div>
        )}
        
        <div className="flex items-center text-sm text-gray-600">
          <ApperIcon name="Calendar" size={14} className="mr-2" />
{format(new Date(deal.expected_close_date_c), "MMM dd, yyyy")}
        </div>
        
        {deal.notes && (
<p className="text-sm text-gray-600 line-clamp-2">{deal.notes_c}</p>
        )}
      </div>
    </Card>
  );
};

export default DealCard;