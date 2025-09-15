import { useState } from "react";
import Button from "@/components/atoms/Button";
import SearchBar from "@/components/molecules/SearchBar";
import ApperIcon from "@/components/ApperIcon";

import { useContext } from "react";
import { useSelector } from "react-redux";
import { AuthContext } from "../../App";

const Header = ({ onMenuClick, title, subtitle, actions = [] }) => {
  const { logout } = useContext(AuthContext);
  const { user } = useSelector((state) => state.user);
  const [searchValue, setSearchValue] = useState("");

  return (
    <div className="bg-gradient-to-r from-surface to-gray-50 border-b border-gray-200 px-6 py-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center">
          <Button
            variant="ghost"
            size="sm"
            onClick={onMenuClick}
            className="lg:hidden mr-3 p-2"
          >
            <ApperIcon name="Menu" size={20} />
          </Button>
          
          <div>
            <h1 className="text-2xl font-bold text-primary bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
              {title}
            </h1>
            {subtitle && (
              <p className="text-gray-600 mt-1">{subtitle}</p>
            )}
          </div>
        </div>
        
        <div className="flex items-center gap-4">
          <SearchBar
            value={searchValue}
            onChange={(e) => setSearchValue(e.target.value)}
            placeholder="Search everything..."
            className="hidden sm:block w-64"
          />
          
          <div className="flex items-center gap-2">
            {actions.map((action, index) => (
              <Button
                key={index}
                variant={action.variant || "primary"}
                size="sm"
                onClick={action.onClick}
                className="flex items-center gap-2"
              >
                {action.icon && <ApperIcon name={action.icon} size={16} />}
                <span className="hidden sm:inline">{action.label}</span>
              </Button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Header;