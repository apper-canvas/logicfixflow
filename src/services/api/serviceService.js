import { toast } from "react-toastify";
import React from "react";
import Error from "@/components/ui/Error";
const tableName = 'service_c';

// Initialize ApperClient
const getApperClient = () => {
  const { ApperClient } = window.ApperSDK;
  return new ApperClient({
    apperProjectId: import.meta.env.VITE_APPER_PROJECT_ID,
    apperPublicKey: import.meta.env.VITE_APPER_PUBLIC_KEY
  });
};

// Field definitions for service_c table
const serviceFields = [
  { field: { Name: "Name" } },
  { field: { Name: "Tags" } },
  { field: { Name: "category_c" } },
  { field: { Name: "description_c" } },
  { field: { Name: "pricing_type_c" } },
  { field: { Name: "hourly_rate_c" } },
  { field: { Name: "flat_rate_c" } },
  { field: { Name: "estimated_duration_c" } },
  { field: { Name: "is_active_c" } }
];

// Helper function to format data for API submission (only Updateable fields)
const formatServiceForSubmission = (serviceData) => {
  return {
    Name: serviceData.Name || serviceData.name,
    Tags: serviceData.Tags,
    category_c: serviceData.category_c || serviceData.category,
    description_c: serviceData.description_c || serviceData.description,
    pricing_type_c: serviceData.pricing_type_c || serviceData.pricingType,
    hourly_rate_c: serviceData.hourly_rate_c || serviceData.hourlyRate,
    flat_rate_c: serviceData.flat_rate_c || serviceData.flatRate,
    estimated_duration_c: serviceData.estimated_duration_c || serviceData.estimatedDuration,
    is_active_c: serviceData.is_active_c !== undefined ? serviceData.is_active_c : (serviceData.isActive !== false)
  };
};

export const getServicesByCategory = async (category) => {
  const apperClient = getApperClient();
  const params = {
    fields: serviceFields,
    where: [
      {
        FieldName: "category_c",
        Operator: "EqualTo",
        Values: [category],
        Include: true
      }
    ],
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

  try {
    const response = await apperClient.fetchRecords(tableName, params);

    if (!response.success) {
      console.error(response.message);
      toast.error(response.message);
      return [];
    }

    return response.data || [];
  } catch (error) {
    if (error?.response?.data?.message) {
      console.error("Error fetching services by category:", error?.response?.data?.message);
      toast.error(error?.response?.data?.message);
    } else {
      console.error(error.message);
      toast.error("Failed to fetch services by category");
    }
    return [];
  }
};

export const serviceService = {
  getAll: async () => {
    try {
      const apperClient = getApperClient();
      const params = {
        fields: serviceFields,
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
        console.error("Error fetching services:", error?.response?.data?.message);
        toast.error(error?.response?.data?.message);
      } else {
        console.error(error.message);
        toast.error("Failed to fetch services");
      }
      return [];
    }
},

  getServicesByCategory: async (category) => {
    try {
      const apperClient = getApperClient();
      const params = {
        fields: serviceFields,
        where: [
          {
            FieldName: "category_c",
            Operator: "EqualTo",
            Values: [category],
            Include: true
          }
        ],
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
        console.error("Error fetching services by category:", error?.response?.data?.message);
        toast.error(error?.response?.data?.message);
      } else {
        console.error(error.message);
        toast.error("Failed to fetch services by category");
      }
return [];
    }
  },

  getById: async (id) => {
    try {
      const apperClient = getApperClient();
      const params = {
        fields: serviceFields
      };

      const response = await apperClient.getRecordById(tableName, parseInt(id), params);

      if (!response || !response.data) {
        throw new Error('Service not found');
      }

      return response.data;
    } catch (error) {
      if (error?.response?.data?.message) {
        console.error(`Error fetching service with ID ${id}:`, error?.response?.data?.message);
      } else {
        console.error(error.message);
      }
      throw error;
    }
  },

  create: async (serviceData) => {
    try {
      const apperClient = getApperClient();
      const formattedData = formatServiceForSubmission(serviceData);

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
          console.error(`Failed to create ${failedRecords.length} service records:${JSON.stringify(failedRecords)}`);
          
          failedRecords.forEach(record => {
            record.errors?.forEach(error => {
              toast.error(`${error.fieldLabel}: ${error.message}`);
            });
            if (record.message) toast.error(record.message);
          });
        }

        if (successfulRecords.length > 0) {
          toast.success('Service created successfully');
          return successfulRecords[0].data;
        }
      }

      return null;
    } catch (error) {
      if (error?.response?.data?.message) {
        console.error("Error creating service:", error?.response?.data?.message);
        toast.error(error?.response?.data?.message);
      } else {
        console.error(error.message);
        toast.error("Failed to create service");
      }
      return null;
    }
  },

  update: async (id, serviceData) => {
    try {
      const apperClient = getApperClient();
      const formattedData = {
        Id: parseInt(id),
        ...formatServiceForSubmission(serviceData)
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
          console.error(`Failed to update ${failedUpdates.length} service records:${JSON.stringify(failedUpdates)}`);
          
          failedUpdates.forEach(record => {
            record.errors?.forEach(error => {
              toast.error(`${error.fieldLabel}: ${error.message}`);
            });
            if (record.message) toast.error(record.message);
          });
        }

        if (successfulUpdates.length > 0) {
          toast.success('Service updated successfully');
          return successfulUpdates[0].data;
        }
      }

      return null;
    } catch (error) {
      if (error?.response?.data?.message) {
        console.error("Error updating service:", error?.response?.data?.message);
        toast.error(error?.response?.data?.message);
      } else {
        console.error(error.message);
        toast.error("Failed to update service");
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
          console.error(`Failed to delete ${failedDeletions.length} service records:${JSON.stringify(failedDeletions)}`);
          
          failedDeletions.forEach(record => {
            if (record.message) toast.error(record.message);
          });
        }

        if (successfulDeletions.length > 0) {
          toast.success('Service deleted successfully');
          return true;
        }
      }

      return false;
    } catch (error) {
      if (error?.response?.data?.message) {
        console.error("Error deleting service:", error?.response?.data?.message);
        toast.error(error?.response?.data?.message);
      } else {
        console.error(error.message);
        toast.error("Failed to delete service");
      }
      return false;
    }
  }
};

export default serviceService;