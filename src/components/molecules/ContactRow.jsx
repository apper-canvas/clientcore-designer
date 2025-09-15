import { useNavigate } from "react-router-dom";
import Button from "@/components/atoms/Button";
import StatusBadge from "@/components/molecules/StatusBadge";
import ApperIcon from "@/components/ApperIcon";
import { format } from "date-fns";

const ContactRow = ({ contact, onEdit, onDelete }) => {
  const navigate = useNavigate();

  const handleViewContact = () => {
    navigate(`/contacts/${contact.Id}`);
  };

  return (
    <tr className="hover:bg-gray-50 transition-colors duration-150">
      <td className="px-6 py-4 whitespace-nowrap">
        <div className="flex items-center">
          <div className="w-10 h-10 bg-gradient-to-br from-primary to-secondary rounded-full flex items-center justify-center text-white font-semibold">
{contact.first_name_c?.[0]}{contact.last_name_c?.[0]}
          </div>
          <div className="ml-4">
            <div className="text-sm font-medium text-primary">
{contact.first_name_c} {contact.last_name_c}
            </div>
            <div className="text-sm text-gray-500">{contact.email_c}</div>
          </div>
        </div>
      </td>
      <td className="px-6 py-4 whitespace-nowrap">
<div className="text-sm text-primary">{contact.company_c}</div>
      </td>
      <td className="px-6 py-4 whitespace-nowrap">
<div className="text-sm text-primary">{contact.phone_c}</div>
      </td>
      <td className="px-6 py-4 whitespace-nowrap">
<StatusBadge status={contact.status_c} />
      </td>
      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
{contact.last_activity_c ? format(new Date(contact.last_activity_c), "MMM dd, yyyy") : "Never"}
      </td>
      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={handleViewContact}
            className="p-2"
          >
            <ApperIcon name="Eye" size={16} />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onEdit(contact)}
            className="p-2"
          >
            <ApperIcon name="Edit" size={16} />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onDelete(contact.Id)}
            className="p-2 text-error hover:bg-error/10"
          >
            <ApperIcon name="Trash2" size={16} />
          </Button>
        </div>
      </td>
    </tr>
  );
};

export default ContactRow;