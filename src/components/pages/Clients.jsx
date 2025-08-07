import React, { useEffect, useState } from "react";
import ClientCard from "@/components/molecules/ClientCard";
import ClientFormModal from "@/components/organisms/ClientFormModal";
import CommunicationModal from "@/components/organisms/CommunicationModal";
import { addCommunication, createClient, deleteClient, filterClients, getClientStats, getClients, searchClients, updateClient } from "@/services/api/clientService";
import ApperIcon from "@/components/ApperIcon";
import FilterBar from "@/components/molecules/FilterBar";
import SearchBar from "@/components/molecules/SearchBar";
import Loading from "@/components/ui/Loading";
import Error from "@/components/ui/Error";
import Empty from "@/components/ui/Empty";
import Jobs from "@/components/pages/Jobs";
import Button from "@/components/atoms/Button";
const Clients = () => {
  const [clients, setClients] = useState([]);
  const [filteredClients, setFilteredClients] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Modal states
  const [showClientModal, setShowClientModal] = useState(false);
  const [showCommunicationModal, setShowCommunicationModal] = useState(false);
  const [selectedClient, setSelectedClient] = useState(null);
  const [editingClient, setEditingClient] = useState(null);
  
  // Stats
  const [stats, setStats] = useState({
    totalClients: 0,
    activeClients: 0,
    totalRevenue: 0,
    avgJobsPerClient: 0
  });

  useEffect(() => {
    loadClients();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [clients, searchQuery, statusFilter]);

const loadClients = async () => {
    try {
      setIsLoading(true);
      const clientsData = await getClients();
      const statsData = await getClientStats();
      
      setClients(clientsData);
      setStats(statsData);
      setError(null);
    } catch (err) {
      setError('Failed to load clients');
      console.error('Error loading clients:', err);
    } finally {
      setIsLoading(false);
    }
  };

const applyFilters = () => {
    let result = clients;
    
    // Apply search
    if (searchQuery) {
      result = searchClients(result, searchQuery);
    }
    
    // Apply status filter
    if (statusFilter !== 'All') {
      result = result.filter(client => client.status === statusFilter);
    }
    
    setFilteredClients(result);
  };

const handleCreateClient = async (clientData) => {
    await createClient(clientData);
    await loadClients();
  };

  const handleUpdateClient = async (clientData) => {
    if (editingClient) {
      await updateClient(editingClient.Id, clientData);
      await loadClients();
    }
  };

  const handleDeleteClient = async (client) => {
    if (window.confirm(`Are you sure you want to delete ${client.name}? This action cannot be undone.`)) {
      await deleteClient(client.Id);
      await loadClients();
    }
  };

  const handleAddCommunication = async (communicationData) => {
    await addCommunication(communicationData);
    await loadClients(); // Refresh to update lastContact
  };

  const handleEditClient = (client) => {
    setEditingClient(client);
    setShowClientModal(true);
  };

  const handleCommunicationClick = (client) => {
    setSelectedClient(client);
    setShowCommunicationModal(true);
  };

  const handleCloseClientModal = () => {
    setShowClientModal(false);
    setEditingClient(null);
  };

  const handleCloseCommunicationModal = () => {
    setShowCommunicationModal(false);
    setSelectedClient(null);
  };

  const filterOptions = [
    { label: 'All Clients', value: 'All' },
    { label: 'Active', value: 'Active' },
    { label: 'Inactive', value: 'Inactive' },
    { label: 'Leads', value: 'Lead' }
  ];

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0
    }).format(amount);
  };

  if (isLoading) {
    return <Loading />;
  }

  if (error) {
    return <Error message={error} onRetry={loadClients} />;
  }

return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 font-display">
            Client Directory
          </h1>
          <p className="text-slate-600 mt-1">
            Manage client contacts, communication history, and service relationships
          </p>
        </div>
        
        <Button onClick={() => setShowClientModal(true)}>
          <ApperIcon name="Plus" size={16} className="mr-2" />
          Add Client
        </Button>
      </div>

      {/* Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl p-6 border border-slate-200">
          <div className="flex items-center">
            <ApperIcon name="Users" size={20} className="text-primary-500 mr-3" />
            <div>
              <p className="text-sm text-slate-600">Total Clients</p>
              <p className="text-2xl font-bold text-slate-900">{stats.totalClients}</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-xl p-6 border border-slate-200">
          <div className="flex items-center">
            <ApperIcon name="UserCheck" size={20} className="text-green-500 mr-3" />
            <div>
              <p className="text-sm text-slate-600">Active Clients</p>
              <p className="text-2xl font-bold text-slate-900">{stats.activeClients}</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-xl p-6 border border-slate-200">
          <div className="flex items-center">
            <ApperIcon name="DollarSign" size={20} className="text-orange-500 mr-3" />
            <div>
              <p className="text-sm text-slate-600">Total Revenue</p>
              <p className="text-2xl font-bold text-slate-900">{formatCurrency(stats.totalRevenue)}</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-xl p-6 border border-slate-200">
          <div className="flex items-center">
            <ApperIcon name="BarChart3" size={20} className="text-blue-500 mr-3" />
            <div>
              <p className="text-sm text-slate-600">Avg Jobs/Client</p>
              <p className="text-2xl font-bold text-slate-900">{stats.avgJobsPerClient}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="flex flex-col lg:flex-row gap-4">
        <div className="flex-1">
          <SearchBar 
            value={searchQuery}
            onChange={setSearchQuery}
            placeholder="Search clients by name, email, company, or phone..."
          />
        </div>
        <div className="lg:w-64">
          <FilterBar
            options={filterOptions}
            value={statusFilter}
            onChange={setStatusFilter}
            placeholder="Filter by status"
          />
        </div>
      </div>

      {/* Client Grid */}
      {filteredClients.length === 0 ? (
        <Empty
          title={searchQuery || statusFilter !== 'All' ? 'No Clients Found' : 'No Clients Yet'}
          description={
            searchQuery || statusFilter !== 'All' 
              ? 'Try adjusting your search or filter criteria'
              : 'Get started by adding your first client'
          }
          icon="Users"
          actionLabel={searchQuery || statusFilter !== 'All' ? 'Clear Filters' : 'Add Client'}
          onAction={() => {
            if (searchQuery || statusFilter !== 'All') {
              setSearchQuery('');
              setStatusFilter('All');
            } else {
              setShowClientModal(true);
            }
          }}
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredClients.map((client) => (
            <ClientCard
              key={client.Id}
              client={client}
              onEdit={handleEditClient}
              onDelete={handleDeleteClient}
              onAddCommunication={handleCommunicationClick}
            />
          ))}
        </div>
      )}

      {/* Modals */}
      <ClientFormModal
        client={editingClient}
        isOpen={showClientModal}
        onClose={handleCloseClientModal}
        onSubmit={editingClient ? handleUpdateClient : handleCreateClient}
      />

      <CommunicationModal
        client={selectedClient}
        isOpen={showCommunicationModal}
        onClose={handleCloseCommunicationModal}
        onSubmit={handleAddCommunication}
      />
    </div>
  );
};

export default Clients;