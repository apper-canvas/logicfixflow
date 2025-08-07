import { useState, useContext } from "react";
import { useSelector } from 'react-redux';
import Button from "@/components/atoms/Button";
import SearchBar from "@/components/molecules/SearchBar";
import ApperIcon from "@/components/ApperIcon";
import { AuthContext } from '../../App';

const Header = ({ onMenuToggle, onQuickAdd }) => {
  const [searchQuery, setSearchQuery] = useState("");
  const { logout } = useContext(AuthContext);
  const { user } = useSelector((state) => state.user);
  
  return (
    <header className="bg-white border-b border-slate-200 px-6 py-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={onMenuToggle}
            className="lg:hidden"
          >
            <ApperIcon name="Menu" className="w-5 h-5" />
          </Button>
          <div className="hidden sm:block w-80">
            <SearchBar
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search jobs, clients..."
            />
          </div>
        </div>

        <div className="flex items-center gap-3">
          <Button
            variant="accent"
            onClick={onQuickAdd}
            className="flex items-center gap-2"
          >
            <ApperIcon name="Plus" className="w-4 h-4" />
            <span className="hidden sm:inline">Quick Add Job</span>
          </Button>
          <div className="flex items-center gap-2 text-slate-600">
            <ApperIcon name="User" className="w-5 h-5" />
            <span className="hidden sm:inline font-medium">
              {user?.firstName ? `${user.firstName} ${user.lastName}` : 'User'}
            </span>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={logout}
            className="flex items-center gap-2 text-slate-600 hover:text-slate-800"
            title="Logout"
          >
            <ApperIcon name="LogOut" className="w-5 h-5" />
            <span className="hidden sm:inline">Logout</span>
          </Button>
        </div>
      </div>

      <div className="sm:hidden mt-4">
        <SearchBar
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search jobs, clients..."
        />
      </div>
    </header>
  );
};

export default Header;