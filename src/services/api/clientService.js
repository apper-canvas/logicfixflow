import { toast } from "react-toastify";
import React from "react";
import { addCommunication, getCommunicationsByClientId } from "@/services/api/communicationService";
import { create, getAll, getById, update } from "@/services/api/jobService";
import { createReview, deleteReview, getReviewsByClientId, updateReview } from "@/services/api/reviewService";
import Error from "@/components/ui/Error";

const tableName = 'client_c';

// Initialize ApperClient
const getApperClient = () => {
  const { ApperClient } = window.ApperSDK;
  return new ApperClient({
    apperProjectId: import.meta.env.VITE_APPER_PROJECT_ID,
    apperPublicKey: import.meta.env.VITE_APPER_PUBLIC_KEY
  });
};

// Field definitions for client_c table
const clientFields = [
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
];

// Helper function to format data for API submission (only Updateable fields)
const formatClientForSubmission = (clientData) => {
  return {
    Name: clientData.Name || clientData.name,
    Tags: clientData.Tags,
    email_c: clientData.email_c || clientData.email,
    company_c: clientData.company_c || clientData.company,
    phone_c: clientData.phone_c || clientData.phone,
    address_c: clientData.address_c || clientData.address,
    status_c: clientData.status_c || clientData.status,
    total_jobs_c: clientData.total_jobs_c || clientData.totalJobs || 0,
    total_spent_c: clientData.total_spent_c || clientData.totalSpent || 0.0,
    client_since_c: clientData.client_since_c || clientData.clientSince || new Date().toISOString(),
    last_contact_c: clientData.last_contact_c || clientData.lastContact
  };
};

export const clientService = {
  getAll: async () => {
    try {
      const apperClient = getApperClient();
      const params = {
        fields: clientFields,
        orderBy: [
          {
            fieldName: "Name",
            sorttype: "ASC"
          }
        ],
        pagingInfo: {
          limit: 50,
          offset: 0
        }
      };

      const response = await apperClient.fetchRecords(tableName, params);

      if (!response.success) {
        console.error(response.message);
        toast.error(response.message);
        return [];
      }

      return response.data || [];
    } catch (error) {
      if (error?.response?.data?.message) {
        console.error("Error fetching clients:", error?.response?.data?.message);
        toast.error(error?.response?.data?.message);
      } else {
        console.error(error.message);
        toast.error("Failed to fetch clients");
      }
      return [];
    }
  },

  getById: async (id) => {
    try {
      const apperClient = getApperClient();
      const params = {
        fields: clientFields
      };

      const response = await apperClient.getRecordById(tableName, parseInt(id), params);

      if (!response || !response.data) {
        throw new Error('Client not found');
      }

      return response.data;
    } catch (error) {
      if (error?.response?.data?.message) {
        console.error(`Error fetching client with ID ${id}:`, error?.response?.data?.message);
      } else {
        console.error(error.message);
      }
      throw error;
    }
  },

  create: async (clientData) => {
    try {
      const apperClient = getApperClient();
      const formattedData = formatClientForSubmission(clientData);

      const params = {
        records: [formattedData]
      };

      const response = await apperClient.createRecord(tableName, params);

      if (!response.success) {
        console.error(response.message);
        toast.error(response.message);
        return null;
      }

      if (response.results) {
        const successfulRecords = response.results.filter(result => result.success);
        const failedRecords = response.results.filter(result => !result.success);

        if (failedRecords.length > 0) {
          console.error(`Failed to create ${failedRecords.length} client records:${JSON.stringify(failedRecords)}`);
          
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

      return null;
    } catch (error) {
      if (error?.response?.data?.message) {
        console.error("Error creating client:", error?.response?.data?.message);
        toast.error(error?.response?.data?.message);
      } else {
        console.error(error.message);
        toast.error("Failed to create client");
      }
      return null;
    }
  },

  update: async (id, clientData) => {
    try {
      const apperClient = getApperClient();
      const formattedData = {
        Id: parseInt(id),
        ...formatClientForSubmission(clientData)
      };

      const params = {
        records: [formattedData]
      };

      const response = await apperClient.updateRecord(tableName, params);

      if (!response.success) {
        console.error(response.message);
        toast.error(response.message);
        return null;
      }

      if (response.results) {
        const successfulUpdates = response.results.filter(result => result.success);
        const failedUpdates = response.results.filter(result => !result.success);

        if (failedUpdates.length > 0) {
          console.error(`Failed to update ${failedUpdates.length} client records:${JSON.stringify(failedUpdates)}`);
          
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

      return null;
    } catch (error) {
      if (error?.response?.data?.message) {
        console.error("Error updating client:", error?.response?.data?.message);
        toast.error(error?.response?.data?.message);
      } else {
        console.error(error.message);
        toast.error("Failed to update client");
      }
      return null;
    }
  },

  delete: async (id) => {
    try {
      const apperClient = getApperClient();
      const params = {
        RecordIds: [parseInt(id)]
      };

      const response = await apperClient.deleteRecord(tableName, params);

      if (!response.success) {
        console.error(response.message);
        toast.error(response.message);
        return false;
      }

      if (response.results) {
        const successfulDeletions = response.results.filter(result => result.success);
        const failedDeletions = response.results.filter(result => !result.success);

        if (failedDeletions.length > 0) {
          console.error(`Failed to delete ${failedDeletions.length} client records:${JSON.stringify(failedDeletions)}`);
          
          failedDeletions.forEach(record => {
            if (record.message) toast.error(record.message);
          });
        }

        if (successfulDeletions.length > 0) {
          toast.success('Client deleted successfully');
          return true;
        }
      }

      return false;
    } catch (error) {
      if (error?.response?.data?.message) {
        console.error("Error deleting client:", error?.response?.data?.message);
        toast.error(error?.response?.data?.message);
      } else {
        console.error(error.message);
        toast.error("Failed to delete client");
      }
      return false;
    }
  }
};

export default clientService;
export default clientService;