import clientsData from '@/services/mockData/clients.json';
import communicationsData from '@/services/mockData/communications.json';
import { toast } from 'react-toastify';

// Internal state management
let clients = [...clientsData];
let communications = [...communicationsData];
let nextClientId = Math.max(...clients.map(c => c.Id), 0) + 1;
let nextCommId = Math.max(...communications.map(c => c.Id), 0) + 1;

// Client CRUD operations
export const getClients = () => {
  return [...clients];
};

export const getClientById = (id) => {
  const numericId = parseInt(id);
  if (isNaN(numericId)) {
    toast.error('Invalid client ID format');
    return null;
  }
  
  const client = clients.find(c => c.Id === numericId);
  if (!client) {
    toast.error('Client not found');
    return null;
  }
  
  return { ...client };
};

export const createClient = (clientData) => {
  const newClient = {
    ...clientData,
    Id: nextClientId++,
    status: clientData.status || 'Active',
    totalJobs: 0,
    totalSpent: 0,
    clientSince: new Date().toISOString(),
    lastContact: new Date().toISOString()
  };
  
  clients.push(newClient);
  toast.success('Client created successfully');
  return { ...newClient };
};

export const updateClient = (id, updates) => {
  const numericId = parseInt(id);
  if (isNaN(numericId)) {
    toast.error('Invalid client ID format');
    return null;
  }
  
  const index = clients.findIndex(c => c.Id === numericId);
  if (index === -1) {
    toast.error('Client not found');
    return null;
  }
  
  clients[index] = { ...clients[index], ...updates };
  toast.success('Client updated successfully');
  return { ...clients[index] };
};

export const deleteClient = (id) => {
  const numericId = parseInt(id);
  if (isNaN(numericId)) {
    toast.error('Invalid client ID format');
    return false;
  }
  
  const index = clients.findIndex(c => c.Id === numericId);
  if (index === -1) {
    toast.error('Client not found');
    return false;
  }
  
  clients.splice(index, 1);
  // Also remove associated communications
  communications = communications.filter(c => c.clientId !== numericId);
  toast.success('Client deleted successfully');
  return true;
};

// Communication operations
export const getCommunicationsByClientId = (clientId) => {
  const numericId = parseInt(clientId);
  if (isNaN(numericId)) return [];
  
  return communications
    .filter(c => c.clientId === numericId)
    .sort((a, b) => new Date(b.date) - new Date(a.date));
};

export const addCommunication = (communication) => {
  const newComm = {
    ...communication,
    Id: nextCommId++,
    date: new Date().toISOString()
  };
  
  communications.push(newComm);
  
  // Update client's last contact
  const clientId = parseInt(communication.clientId);
  const clientIndex = clients.findIndex(c => c.Id === clientId);
  if (clientIndex !== -1) {
    clients[clientIndex].lastContact = newComm.date;
  }
  
  toast.success('Communication logged successfully');
  return { ...newComm };
};

// Search and filter operations
export const searchClients = (query) => {
  if (!query || query.trim() === '') {
    return [...clients];
  }
  
  const searchTerm = query.toLowerCase();
  return clients.filter(client => 
    client.name.toLowerCase().includes(searchTerm) ||
    client.email.toLowerCase().includes(searchTerm) ||
    client.company.toLowerCase().includes(searchTerm) ||
    client.phone.includes(searchTerm)
  );
};

export const filterClients = (status) => {
  if (!status || status === 'All') {
    return [...clients];
  }
  
  return clients.filter(client => client.status === status);
};

// Statistics
export const getClientStats = () => {
  const totalClients = clients.length;
  const activeClients = clients.filter(c => c.status === 'Active').length;
  const totalRevenue = clients.reduce((sum, c) => sum + c.totalSpent, 0);
  const avgJobsPerClient = totalClients > 0 
    ? clients.reduce((sum, c) => sum + c.totalJobs, 0) / totalClients 
    : 0;
  
  return {
    totalClients,
    activeClients,
    totalRevenue,
    avgJobsPerClient: Math.round(avgJobsPerClient * 10) / 10
  };
};