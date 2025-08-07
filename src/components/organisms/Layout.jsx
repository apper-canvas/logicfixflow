import { useState } from "react";
import { Outlet } from "react-router-dom";
import Sidebar from "@/components/organisms/Sidebar";
import Header from "@/components/organisms/Header";
import JobFormModal from "@/components/organisms/JobFormModal";
import QuickEstimateModal from "@/components/organisms/QuickEstimateModal";

const Layout = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isJobFormOpen, setIsJobFormOpen] = useState(false);
  const [isEstimateOpen, setIsEstimateOpen] = useState(false);
  const handleMenuToggle = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  const handleCloseSidebar = () => {
    setIsSidebarOpen(false);
  };

const handleQuickAdd = () => {
  setIsJobFormOpen(true);
};

const handleQuickEstimate = () => {
  setIsEstimateOpen(true);
};
  return (
    <div className="flex min-h-screen">
<Sidebar isOpen={isSidebarOpen} onClose={handleCloseSidebar} />

<div className="flex-1 lg:ml-64">
  <Header 
    onMenuToggle={handleMenuToggle} 
    onQuickAdd={handleQuickAdd}
    onQuickEstimate={handleQuickEstimate}
  />
  <main className="p-6">
    <Outlet />
  </main>
</div>

{isJobFormOpen && (
  <JobFormModal
    isOpen={isJobFormOpen}
    onClose={() => setIsJobFormOpen(false)}
  />
)}

<QuickEstimateModal
  isOpen={isEstimateOpen}
  onClose={() => setIsEstimateOpen(false)}
/>
</div>
);
};

export default Layout;