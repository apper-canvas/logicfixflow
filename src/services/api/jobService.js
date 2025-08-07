import { toast } from "react-toastify";
import React from "react";
import Error from "@/components/ui/Error";

const tableName = 'job_c';

// Initialize ApperClient
const getApperClient = () => {
  const { ApperClient } = window.ApperSDK;
  return new ApperClient({
    apperProjectId: import.meta.env.VITE_APPER_PROJECT_ID,
    apperPublicKey: import.meta.env.VITE_APPER_PUBLIC_KEY
  });
};

// Field definitions for job_c table
const jobFields = [
  { field: { Name: "Name" } },
  { field: { Name: "Tags" } },
  { field: { Name: "scheduled_date_c" } },
  { field: { Name: "status_c" } },
  { field: { Name: "estimated_cost_c" } },
  { field: { Name: "estimated_duration_c" } },
  { field: { Name: "services_c" } },
  { field: { Name: "notes_c" } },
  { field: { Name: "photos_c" } },
  { field: { Name: "price_c" } },
  { field: { Name: "service_id_c" } },
  { field: { Name: "created_at_c" } },
  { field: { Name: "updated_at_c" } }
];

// Helper function to format data for API submission (only Updateable fields)
const formatJobForSubmission = (jobData) => {
  return {
    Name: jobData.Name || jobData.title,
    Tags: jobData.Tags,
    scheduled_date_c: jobData.scheduled_date_c || jobData.scheduledDate,
    status_c: jobData.status_c || jobData.status,
    estimated_cost_c: jobData.estimated_cost_c || jobData.estimatedCost,
    estimated_duration_c: jobData.estimated_duration_c || jobData.estimatedDuration,
    services_c: jobData.services_c || jobData.services,
    notes_c: jobData.notes_c || jobData.notes,
    photos_c: jobData.photos_c || jobData.photos,
    price_c: jobData.price_c || jobData.price,
    service_id_c: jobData.service_id_c || jobData.serviceId,
    created_at_c: jobData.created_at_c,
    updated_at_c: new Date().toISOString()
  };
};

export const jobService = {
  getAll: async () => {
    try {
      const apperClient = getApperClient();
      const params = {
        fields: jobFields,
        orderBy: [
          {
            fieldName: "scheduled_date_c",
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
        console.error("Error fetching jobs:", error?.response?.data?.message);
        toast.error(error?.response?.data?.message);
      } else {
        console.error(error.message);
        toast.error("Failed to fetch jobs");
      }
      return [];
    }
  },

  getById: async (id) => {
    try {
      const apperClient = getApperClient();
      const params = {
        fields: jobFields
      };

      const response = await apperClient.getRecordById(tableName, parseInt(id), params);

      if (!response || !response.data) {
        throw new Error('Job not found');
      }

      return response.data;
    } catch (error) {
      if (error?.response?.data?.message) {
        console.error(`Error fetching job with ID ${id}:`, error?.response?.data?.message);
      } else {
        console.error(error.message);
      }
      throw error;
    }
  },

  create: async (jobData) => {
    try {
      const apperClient = getApperClient();
      const formattedData = formatJobForSubmission({
        ...jobData,
        created_at_c: new Date().toISOString()
      });

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
          console.error(`Failed to create ${failedRecords.length} job records:${JSON.stringify(failedRecords)}`);
          
          failedRecords.forEach(record => {
            record.errors?.forEach(error => {
              toast.error(`${error.fieldLabel}: ${error.message}`);
            });
            if (record.message) toast.error(record.message);
          });
        }

        if (successfulRecords.length > 0) {
          toast.success('Job created successfully');
          return successfulRecords[0].data;
        }
      }

      return null;
    } catch (error) {
      if (error?.response?.data?.message) {
        console.error("Error creating job:", error?.response?.data?.message);
        toast.error(error?.response?.data?.message);
      } else {
        console.error(error.message);
        toast.error("Failed to create job");
      }
      return null;
    }
  },

  update: async (id, jobData) => {
    try {
      const apperClient = getApperClient();
      const formattedData = {
        Id: parseInt(id),
        ...formatJobForSubmission(jobData)
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
          console.error(`Failed to update ${failedUpdates.length} job records:${JSON.stringify(failedUpdates)}`);
          
          failedUpdates.forEach(record => {
            record.errors?.forEach(error => {
              toast.error(`${error.fieldLabel}: ${error.message}`);
            });
            if (record.message) toast.error(record.message);
          });
        }

        if (successfulUpdates.length > 0) {
          toast.success('Job updated successfully');
          return successfulUpdates[0].data;
        }
      }

      return null;
    } catch (error) {
      if (error?.response?.data?.message) {
        console.error("Error updating job:", error?.response?.data?.message);
        toast.error(error?.response?.data?.message);
      } else {
        console.error(error.message);
        toast.error("Failed to update job");
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
          console.error(`Failed to delete ${failedDeletions.length} job records:${JSON.stringify(failedDeletions)}`);
          
          failedDeletions.forEach(record => {
            if (record.message) toast.error(record.message);
          });
        }

        if (successfulDeletions.length > 0) {
          toast.success('Job deleted successfully');
          return true;
        }
      }

      return false;
    } catch (error) {
      if (error?.response?.data?.message) {
        console.error("Error deleting job:", error?.response?.data?.message);
        toast.error(error?.response?.data?.message);
      } else {
        console.error(error.message);
        toast.error("Failed to delete job");
      }
      return false;
    }
  }
};

// Named exports for individual methods
export const create = jobService.create;
export const printEstimate = jobService.printEstimate;
export const emailEstimate = jobService.emailEstimate;

export default jobService;