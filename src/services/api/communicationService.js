import { toast } from "react-toastify";
import React from "react";
import { create, getAll, getById, update } from "@/services/api/jobService";
import { addCommunication, getCommunicationsByClientId } from "@/services/api/clientService";
import Error from "@/components/ui/Error";

const tableName = 'communication_c';

// Initialize ApperClient
const getApperClient = () => {
  const { ApperClient } = window.ApperSDK;
  return new ApperClient({
    apperProjectId: import.meta.env.VITE_APPER_PROJECT_ID,
    apperPublicKey: import.meta.env.VITE_APPER_PUBLIC_KEY
  });
};

// Field definitions for communication_c table
const communicationFields = [
  { field: { Name: "Name" } },
  { field: { Name: "Tags" } },
  { field: { Name: "type_c" } },
  { field: { Name: "subject_c" } },
  { field: { Name: "details_c" } },
  { field: { Name: "date_c" } },
  { field: { Name: "client_id_c" } }
];

// Helper function to format data for API submission (only Updateable fields)
const formatCommunicationForSubmission = (commData) => {
  return {
    Name: commData.Name || commData.subject_c || commData.subject,
    Tags: commData.Tags,
    type_c: commData.type_c || commData.type,
    subject_c: commData.subject_c || commData.subject,
    details_c: commData.details_c || commData.details,
    date_c: commData.date_c || commData.date || new Date().toISOString(),
    client_id_c: parseInt(commData.client_id_c || commData.clientId)
  };
};

export const communicationService = {
  getAll: async () => {
    try {
      const apperClient = getApperClient();
      const params = {
        fields: communicationFields,
        orderBy: [
          {
            fieldName: "date_c",
            sorttype: "DESC"
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
        console.error("Error fetching communications:", error?.response?.data?.message);
        toast.error(error?.response?.data?.message);
      } else {
        console.error(error.message);
        toast.error("Failed to fetch communications");
      }
      return [];
    }
  },

  getById: async (id) => {
    try {
      const apperClient = getApperClient();
      const params = {
        fields: communicationFields
      };

      const response = await apperClient.getRecordById(tableName, parseInt(id), params);

      if (!response || !response.data) {
        throw new Error('Communication not found');
      }

      return response.data;
    } catch (error) {
      if (error?.response?.data?.message) {
        console.error(`Error fetching communication with ID ${id}:`, error?.response?.data?.message);
      } else {
        console.error(error.message);
      }
      throw error;
    }
  },

  create: async (commData) => {
    try {
      const apperClient = getApperClient();
      const formattedData = formatCommunicationForSubmission(commData);

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
          console.error(`Failed to create ${failedRecords.length} communication records:${JSON.stringify(failedRecords)}`);
          
          failedRecords.forEach(record => {
            record.errors?.forEach(error => {
              toast.error(`${error.fieldLabel}: ${error.message}`);
            });
            if (record.message) toast.error(record.message);
          });
        }

        if (successfulRecords.length > 0) {
          toast.success('Communication created successfully');
          return successfulRecords[0].data;
        }
      }

      return null;
    } catch (error) {
      if (error?.response?.data?.message) {
        console.error("Error creating communication:", error?.response?.data?.message);
        toast.error(error?.response?.data?.message);
      } else {
        console.error(error.message);
        toast.error("Failed to create communication");
      }
      return null;
    }
  },

  update: async (id, commData) => {
    try {
      const apperClient = getApperClient();
      const formattedData = {
        Id: parseInt(id),
        ...formatCommunicationForSubmission(commData)
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
          console.error(`Failed to update ${failedUpdates.length} communication records:${JSON.stringify(failedUpdates)}`);
          
          failedUpdates.forEach(record => {
            record.errors?.forEach(error => {
              toast.error(`${error.fieldLabel}: ${error.message}`);
            });
            if (record.message) toast.error(record.message);
          });
        }

        if (successfulUpdates.length > 0) {
          toast.success('Communication updated successfully');
          return successfulUpdates[0].data;
        }
      }

      return null;
    } catch (error) {
      if (error?.response?.data?.message) {
        console.error("Error updating communication:", error?.response?.data?.message);
        toast.error(error?.response?.data?.message);
      } else {
        console.error(error.message);
        toast.error("Failed to update communication");
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
          console.error(`Failed to delete ${failedDeletions.length} communication records:${JSON.stringify(failedDeletions)}`);
          
          failedDeletions.forEach(record => {
            if (record.message) toast.error(record.message);
          });
        }

        if (successfulDeletions.length > 0) {
          toast.success('Communication deleted successfully');
          return true;
        }
      }

      return false;
    } catch (error) {
      if (error?.response?.data?.message) {
        console.error("Error deleting communication:", error?.response?.data?.message);
        toast.error(error?.response?.data?.message);
      } else {
        console.error(error.message);
        toast.error("Failed to delete communication");
      }
      return false;
    }
  }
};
export default communicationService;