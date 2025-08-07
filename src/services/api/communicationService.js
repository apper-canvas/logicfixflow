import { toast } from 'react-toastify';

class CommunicationService {
  constructor() {
    // Initialize ApperClient with Project ID and Public Key
    const { ApperClient } = window.ApperSDK;
    this.apperClient = new ApperClient({
      apperProjectId: import.meta.env.VITE_APPER_PROJECT_ID,
      apperPublicKey: import.meta.env.VITE_APPER_PUBLIC_KEY
    });
    this.tableName = 'communication_c';
  }

  async getCommunications() {
    try {
      const params = {
        fields: [
          { field: { Name: "Id" } },
          { field: { Name: "Name" } },
          { field: { Name: "Tags" } },
          { field: { Name: "client_id_c" } },
          { field: { Name: "type_c" } },
          { field: { Name: "subject_c" } },
          { field: { Name: "details_c" } },
          { field: { Name: "date_c" } }
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
      const transformedData = (response.data || []).map(comm => ({
        Id: comm.Id,
        clientId: comm.client_id_c?.Id || comm.client_id_c,
        type: comm.type_c || 'email',
        subject: comm.subject_c || '',
        message: comm.details_c || '',
        details: comm.details_c || '',
        date: comm.date_c || new Date().toISOString(),
        direction: 'outbound',
        contactPerson: ''
      }));

      return transformedData;
} catch (error) {
      if (error.code === 'NETWORK_ERROR' || error.message === 'Network Error') {
        console.error("Network error fetching communications - check internet connection and API availability");
      } else if (error?.response?.data?.message) {
        console.error("Error fetching communications:", error?.response?.data?.message);
      } else {
        console.error("Error fetching communications:", error.message);
      }
      return [];
    }
  }

  async getCommunicationsByClientId(clientId) {
    try {
      const numericId = parseInt(clientId);
      if (isNaN(numericId)) return [];

      const params = {
        fields: [
          { field: { Name: "Id" } },
          { field: { Name: "Name" } },
          { field: { Name: "Tags" } },
          { field: { Name: "client_id_c" } },
          { field: { Name: "type_c" } },
          { field: { Name: "subject_c" } },
          { field: { Name: "details_c" } },
          { field: { Name: "date_c" } }
        ],
        where: [{
          FieldName: "client_id_c",
          Operator: "EqualTo",
          Values: [numericId]
        }],
        orderBy: [{
          fieldName: "date_c",
          sorttype: "DESC"
        }]
      };

      const response = await this.apperClient.fetchRecords(this.tableName, params);
      
      if (!response.success) {
        console.error(response.message);
        return [];
      }

      return (response.data || []).map(comm => ({
        Id: comm.Id,
        clientId: comm.client_id_c?.Id || comm.client_id_c,
        type: comm.type_c || 'email',
        subject: comm.subject_c || '',
        message: comm.details_c || '',
        details: comm.details_c || '',
        date: comm.date_c || new Date().toISOString(),
        direction: 'outbound',
        contactPerson: ''
      }));
} catch (error) {
      if (error.code === 'NETWORK_ERROR' || error.message === 'Network Error') {
        console.error("Network error fetching communications by client ID - check internet connection and API availability");
      } else {
        console.error("Error fetching communications by client ID:", error.message);
      }
      return [];
    }
  }

  async addCommunication(communication) {
    try {
      const params = {
        records: [
          {
            Name: communication.subject || 'Communication',
            Tags: '',
            client_id_c: parseInt(communication.clientId),
            type_c: communication.type || 'email',
            subject_c: communication.subject || '',
            details_c: communication.message || communication.details || '',
            date_c: new Date().toISOString()
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
          console.error(`Failed to create communications ${failedRecords.length} records:${JSON.stringify(failedRecords)}`);
          
          failedRecords.forEach(record => {
            record.errors?.forEach(error => {
              toast.error(`${error.fieldLabel}: ${error.message}`);
            });
            if (record.message) toast.error(record.message);
          });
        }
        
        if (successfulRecords.length > 0) {
          toast.success('Communication logged successfully');
          const newComm = successfulRecords[0].data;
          
          return {
            Id: newComm.Id,
            clientId: parseInt(communication.clientId),
            type: communication.type || 'email',
            subject: communication.subject || '',
            message: communication.message || communication.details || '',
            date: new Date().toISOString(),
            direction: communication.direction || 'outbound',
            contactPerson: communication.contactPerson || ''
          };
        }
      }
} catch (error) {
      if (error.code === 'NETWORK_ERROR' || error.message === 'Network Error') {
        console.error("Network error creating communication - check internet connection and API availability");
      } else if (error?.response?.data?.message) {
        console.error("Error creating communication:", error?.response?.data?.message);
      } else {
        console.error("Error creating communication:", error.message);
      }
      return null;
    }
  }
}

const communicationService = new CommunicationService();

// Export service methods for use in components
export const getCommunicationsByClientId = (clientId) => communicationService.getCommunicationsByClientId(clientId);
export const addCommunication = (communication) => communicationService.addCommunication(communication);