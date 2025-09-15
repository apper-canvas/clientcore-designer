import { NavLink } from "react-router-dom";
import ApperIcon from "@/components/ApperIcon";

const Sidebar = ({ isOpen, onClose }) => {
const navigation = [
    { name: "Dashboard", href: "/", icon: "BarChart3" },
    { name: "Contacts", href: "/contacts", icon: "Users" },
    { name: "Deals", href: "/deals", icon: "DollarSign" },
    { name: "Quotes", href: "/quotes", icon: "FileText" },
    { name: "Activities", href: "/activities", icon: "Activity" },
  ];

  const NavItem = ({ item }) => (
    <NavLink
      to={item.href}
      className={({ isActive }) =>
        `flex items-center px-4 py-3 text-sm font-medium rounded-lg transition-all duration-200 ${
          isActive
            ? "bg-gradient-to-r from-accent to-accent/90 text-white shadow-lg"
            : "text-gray-300 hover:bg-white/10 hover:text-white"
        }`
      }
      onClick={() => onClose && onClose()}
    >
      <ApperIcon name={item.icon} size={20} className="mr-3" />
      {item.name}
    </NavLink>
  );

  // Desktop Sidebar (static)
  const DesktopSidebar = () => (
    <div className="hidden lg:flex lg:flex-shrink-0">
      <div className="w-64 bg-gradient-to-b from-primary to-primary/90 backdrop-blur-lg border-r border-primary/20">
        <div className="flex flex-col h-full">
          <div className="flex items-center px-6 py-6">
            <div className="w-8 h-8 bg-gradient-to-br from-accent to-accent/80 rounded-lg flex items-center justify-center">
              <ApperIcon name="Building2" size={20} className="text-white" />
            </div>
            <h1 className="ml-3 text-xl font-bold text-white">ClientCore</h1>
          </div>
          
          <nav className="flex-1 px-4 pb-4 space-y-2">
            {navigation.map((item) => (
              <NavItem key={item.name} item={item} />
            ))}
          </nav>
        </div>
      </div>
    </div>
  );

  // Mobile Sidebar (overlay)
  const MobileSidebar = () => (
    <div className="lg:hidden">
      {/* Backdrop */}
      <div 
        className={`fixed inset-0 bg-black/50 backdrop-blur-sm z-40 transition-opacity duration-300 ${
          isOpen ? "opacity-100" : "opacity-0 pointer-events-none"
        }`}
        onClick={onClose}
      />
      
      {/* Sidebar */}
      <div 
        className={`fixed inset-y-0 left-0 z-50 w-64 bg-gradient-to-b from-primary to-primary/90 backdrop-blur-lg transform transition-transform duration-300 ease-out ${
          isOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex flex-col h-full">
          <div className="flex items-center justify-between px-6 py-6">
            <div className="flex items-center">
              <div className="w-8 h-8 bg-gradient-to-br from-accent to-accent/80 rounded-lg flex items-center justify-center">
                <ApperIcon name="Building2" size={20} className="text-white" />
              </div>
              <h1 className="ml-3 text-xl font-bold text-white">ClientCore</h1>
            </div>
            <button
              onClick={onClose}
              className="p-2 rounded-lg text-gray-300 hover:text-white hover:bg-white/10 transition-colors"
            >
              <ApperIcon name="X" size={20} />
            </button>
          </div>
          
          <nav className="flex-1 px-4 pb-4 space-y-2">
            {navigation.map((item) => (
              <NavItem key={item.name} item={item} />
            ))}
          </nav>
        </div>
      </div>
    </div>
  );

  return (
    <>
      <DesktopSidebar />
      <MobileSidebar />
    </>
  );
};

export default Sidebar;