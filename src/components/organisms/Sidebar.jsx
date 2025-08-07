import { NavLink } from "react-router-dom";
import ApperIcon from "@/components/ApperIcon";
import { cn } from "@/utils/cn";

const Sidebar = ({ isOpen, onClose }) => {
  const menuItems = [
    { path: "/", label: "Dashboard", icon: "LayoutDashboard" },
    { path: "/jobs", label: "Jobs", icon: "Briefcase" },
    { path: "/clients", label: "Clients", icon: "Users" },
    { path: "/services", label: "Services", icon: "Settings" },
    { path: "/calendar", label: "Calendar", icon: "Calendar" },
    { path: "/reports", label: "Reports", icon: "BarChart3" }
  ];

  return (
    <>
      {/* Mobile Overlay */}
      <div
        className={cn(
          "lg:hidden fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-40 transition-opacity duration-300",
          isOpen ? "opacity-100" : "opacity-0 pointer-events-none"
        )}
        onClick={onClose}
      />

      {/* Sidebar */}
      <div
        className={cn(
          "fixed top-0 left-0 h-screen w-64 bg-white border-r border-slate-200 z-50 transition-transform duration-300 lg:translate-x-0",
          isOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
        )}
      >
        <div className="p-6 border-b border-slate-200">
          <div className="flex items-center gap-3">
            <div className="bg-gradient-to-br from-primary-500 to-primary-600 p-2 rounded-xl">
              <ApperIcon name="Wrench" className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-slate-900 font-display">FixFlow Pro</h1>
              <p className="text-xs text-slate-500">Handyman Manager</p>
            </div>
          </div>
        </div>

        <nav className="p-4">
          <ul className="space-y-2">
            {menuItems.map((item) => (
              <li key={item.path}>
                <NavLink
                  to={item.path}
                  className={({ isActive }) =>
                    cn(
                      "flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-all duration-200 relative",
                      isActive
                        ? "bg-gradient-to-r from-primary-50 to-primary-100 text-primary-700 border-l-4 border-primary-500"
                        : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                    )
                  }
                  onClick={() => window.innerWidth < 1024 && onClose()}
                >
                  <ApperIcon name={item.icon} className="w-5 h-5 flex-shrink-0" />
                  {item.label}
                </NavLink>
              </li>
            ))}
          </ul>
        </nav>
      </div>
    </>
  );
};

export default Sidebar;