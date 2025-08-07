import { toast } from 'react-toastify';

class ClientService {
  constructor() {
    // Initialize ApperClient with Project ID and Public Key
    const { ApperClient } = window.ApperSDK;
    this.apperClient = new ApperClient({
      apperProjectId: import.meta.env.VITE_APPER_PROJECT_ID,
      apperPublicKey: import.meta.env.VITE_APPER_PUBLIC_KEY
    });
    this.tableName = 'client_c';
  }

  async getClients() {
    try {
      const params = {
        fields: [
          { field: { Name: "Id" } },
          { field: { Name: "Name" } },
          { field: { Name: "Tags" } },
          { field: { Name: "email_c" } },
          { field: { Name: "company_c" } },
          { field: { Name: "phone_c" } },
          { field: { Name: "address_c" } },
          { field: { Name: "status_c" } },
          { field: { Name: "total_jobs_c" } },
          { field: { Name: "total_spent_c" } },
          { field: { Name: "client_since_c" } },
          { field: { Name: "last_contact_c" } }
        ],
        pagingInfo: {
          limit: 100,
          offset: 0
        }
      };

      const response = await this.apperClient.fetchRecords(this.tableName, params);
      
      if (!response.success) {
        console.error(response.message);
        toast.error(response.message);
        return [];
      }

      // Transform data to match expected format
      const transformedData = (response.data || []).map(client => ({
        Id: client.Id,
        name: client.Name || '',
        email: client.email_c || '',
        phone: client.phone_c || '',
        company: client.company_c || '',
        address: client.address_c || '',
        status: client.status_c || 'Active',
        totalJobs: client.total_jobs_c || 0,
        totalSpent: client.total_spent_c || 0,
        clientSince: client.client_since_c || new Date().toISOString(),
        lastContact: client.last_contact_c || new Date().toISOString(),
        preferredContact: 'email',
        notes: ''
      }));

      return transformedData;
    } catch (error) {
      if (error?.response?.data?.message) {
        console.error("Error fetching clients:", error?.response?.data?.message);
      } else {
        console.error(error.message);
      }
      return [];
    }
  }

  async getClientById(id) {
    try {
      const params = {
        fields: [
          { field: { Name: "Id" } },
          { field: { Name: "Name" } },
          { field: { Name: "Tags" } },
          { field: { Name: "email_c" } },
          { field: { Name: "company_c" } },
          { field: { Name: "phone_c" } },
          { field: { Name: "address_c" } },
          { field: { Name: "status_c" } },
          { field: { Name: "total_jobs_c" } },
          { field: { Name: "total_spent_c" } },
          { field: { Name: "client_since_c" } },
          { field: { Name: "last_contact_c" } }
        ]
      };

      const response = await this.apperClient.getRecordById(this.tableName, parseInt(id), params);
      
      if (!response || !response.data) {
        toast.error('Client not found');
        return null;
      }

      const client = response.data;
      return {
        Id: client.Id,
        name: client.Name || '',
        email: client.email_c || '',
        phone: client.phone_c || '',
        company: client.company_c || '',
        address: client.address_c || '',
        status: client.status_c || 'Active',
        totalJobs: client.total_jobs_c || 0,
        totalSpent: client.total_spent_c || 0,
        clientSince: client.client_since_c || new Date().toISOString(),
        lastContact: client.last_contact_c || new Date().toISOString(),
        preferredContact: 'email',
        notes: ''
      };
    } catch (error) {
      if (error?.response?.data?.message) {
        console.error(`Error fetching client with ID ${id}:`, error?.response?.data?.message);
      } else {
        console.error(error.message);
      }
      toast.error('Invalid client ID format');
      return null;
    }
  }

  async createClient(clientData) {
    try {
      const params = {
        records: [
          {
            Name: clientData.name || '',
            Tags: clientData.tags || '',
            email_c: clientData.email || '',
            company_c: clientData.company || '',
            phone_c: clientData.phone || '',
            address_c: clientData.address || '',
            status_c: clientData.status || 'Active',
            total_jobs_c: 0,
            total_spent_c: 0,
            client_since_c: new Date().toISOString(),
            last_contact_c: new Date().toISOString()
          }
        ]
      };

      const response = await this.apperClient.createRecord(this.tableName, params);
      
      if (!response.success) {
        console.error(response.message);
        toast.error(response.message);
        return null;
      }

      if (response.results) {
        const successfulRecords = response.results.filter(result => result.success);
        const failedRecords = response.results.filter(result => !result.success);
        
        if (failedRecords.length > 0) {
          console.error(`Failed to create clients ${failedRecords.length} records:${JSON.stringify(failedRecords)}`);
          
          failedRecords.forEach(record => {
            record.errors?.forEach(error => {
              toast.error(`${error.fieldLabel}: ${error.message}`);
            });
            if (record.message) toast.error(record.message);
          });
        }
        
        if (successfulRecords.length > 0) {
          toast.success('Client created successfully');
          return successfulRecords[0].data;
        }
      }
    } catch (error) {
      if (error?.response?.data?.message) {
        console.error("Error creating client:", error?.response?.data?.message);
      } else {
        console.error(error.message);
      }
      return null;
    }
  }

  async updateClient(id, updates) {
    try {
      const updateFields = {
        Id: parseInt(id)
      };

      // Only include updateable fields
      if (updates.name !== undefined) updateFields.Name = updates.name;
      if (updates.tags !== undefined) updateFields.Tags = updates.tags;
      if (updates.email !== undefined) updateFields.email_c = updates.email;
      if (updates.company !== undefined) updateFields.company_c = updates.company;
      if (updates.phone !== undefined) updateFields.phone_c = updates.phone;
      if (updates.address !== undefined) updateFields.address_c = updates.address;
      if (updates.status !== undefined) updateFields.status_c = updates.status;
      if (updates.totalJobs !== undefined) updateFields.total_jobs_c = updates.totalJobs;
      if (updates.totalSpent !== undefined) updateFields.total_spent_c = updates.totalSpent;

      const params = {
        records: [updateFields]
      };

      const response = await this.apperClient.updateRecord(this.tableName, params);
      
      if (!response.success) {
        console.error(response.message);
        toast.error(response.message);
        return null;
      }

      if (response.results) {
        const successfulUpdates = response.results.filter(result => result.success);
        const failedUpdates = response.results.filter(result => !result.success);
        
        if (failedUpdates.length > 0) {
          console.error(`Failed to update clients ${failedUpdates.length} records:${JSON.stringify(failedUpdates)}`);
          
          failedUpdates.forEach(record => {
            record.errors?.forEach(error => {
              toast.error(`${error.fieldLabel}: ${error.message}`);
            });
            if (record.message) toast.error(record.message);
          });
        }
        
        if (successfulUpdates.length > 0) {
          toast.success('Client updated successfully');
          return successfulUpdates[0].data;
        }
      }
    } catch (error) {
      if (error?.response?.data?.message) {
        console.error("Error updating client:", error?.response?.data?.message);
      } else {
        console.error(error.message);
      }
      toast.error('Invalid client ID format');
      return null;
    }
  }

  async deleteClient(id) {
    try {
      const params = {
        RecordIds: [parseInt(id)]
      };

      const response = await this.apperClient.deleteRecord(this.tableName, params);
      
      if (!response.success) {
        console.error(response.message);
        toast.error(response.message);
        return false;
      }

      if (response.results) {
        const successfulDeletions = response.results.filter(result => result.success);
        const failedDeletions = response.results.filter(result => !result.success);
        
        if (failedDeletions.length > 0) {
          console.error(`Failed to delete clients ${failedDeletions.length} records:${JSON.stringify(failedDeletions)}`);
          
          failedDeletions.forEach(record => {
            if (record.message) toast.error(record.message);
          });
        }
        
        if (successfulDeletions.length > 0) {
          toast.success('Client deleted successfully');
          return true;
        }
      }
    } catch (error) {
      if (error?.response?.data?.message) {
        console.error("Error deleting client:", error?.response?.data?.message);
      } else {
        console.error(error.message);
      }
      toast.error('Invalid client ID format');
      return false;
    }
  }

  async getClientStats() {
    try {
      const clients = await this.getClients();
      const totalClients = clients.length;
      const activeClients = clients.filter(c => c.status === 'Active').length;
      const totalRevenue = clients.reduce((sum, c) => sum + (c.totalSpent || 0), 0);
      const avgJobsPerClient = totalClients > 0 
        ? clients.reduce((sum, c) => sum + (c.totalJobs || 0), 0) / totalClients 
        : 0;
      
      return {
        totalClients,
        activeClients,
        totalRevenue,
        avgJobsPerClient: Math.round(avgJobsPerClient * 10) / 10
      };
    } catch (error) {
      console.error("Error calculating client stats:", error.message);
      return {
        totalClients: 0,
        activeClients: 0,
        totalRevenue: 0,
        avgJobsPerClient: 0
      };
    }
  }

  async searchClients(clients, query) {
    if (!query || query.trim() === '') {
      return clients;
    }
    
    const searchTerm = query.toLowerCase();
    return clients.filter(client => 
      (client.name || '').toLowerCase().includes(searchTerm) ||
      (client.email || '').toLowerCase().includes(searchTerm) ||
      (client.company || '').toLowerCase().includes(searchTerm) ||
      (client.phone || '').includes(searchTerm)
    );
  }
}

const clientService = new ClientService();

// Export service methods for use in components
export const getClients = () => clientService.getClients();
export const getClientById = (id) => clientService.getClientById(id);
export const createClient = (clientData) => clientService.createClient(clientData);
export const updateClient = (id, updates) => clientService.updateClient(id, updates);
export const deleteClient = (id) => clientService.deleteClient(id);
export const getClientStats = () => clientService.getClientStats();
export const searchClients = (clients, query) => clientService.searchClients(clients, query);
export const filterClients = (status) => {
  // This will be handled in the component level filtering
  return Promise.resolve([]);
};

// Communication operations - these will be handled by a separate communication service
export const getCommunicationsByClientId = (clientId) => {
  // This should be moved to a separate communication service
  return [];
};

export const addCommunication = (communication) => {
  // This should be moved to a separate communication service
  return Promise.resolve({ ...communication, Id: Date.now() });
};
// Review-related exports for ClientDetail integration
export { getReviewsByClientId, createReview, updateReview, deleteReview } from '@/services/api/reviewService';