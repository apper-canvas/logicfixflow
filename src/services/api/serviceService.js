import { toast } from "react-toastify";
import React from "react";
import Error from "@/components/ui/Error";

class ServiceService {
  constructor() {
    // Initialize ApperClient with Project ID and Public Key
    const { ApperClient } = window.ApperSDK;
    this.apperClient = new ApperClient({
      apperProjectId: import.meta.env.VITE_APPER_PROJECT_ID,
      apperPublicKey: import.meta.env.VITE_APPER_PUBLIC_KEY
    });
    this.tableName = 'service_c';
  }

  async getServices() {
    try {
      const params = {
        fields: [
          { field: { Name: "Id" } },
          { field: { Name: "Name" } },
          { field: { Name: "Tags" } },
          { field: { Name: "category_c" } },
          { field: { Name: "description_c" } },
          { field: { Name: "pricing_type_c" } },
          { field: { Name: "hourly_rate_c" } },
          { field: { Name: "flat_rate_c" } },
          { field: { Name: "estimated_duration_c" } },
          { field: { Name: "is_active_c" } }
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
      const transformedData = (response.data || []).map(service => ({
        Id: service.Id,
        name: service.Name || '',
        category: service.category_c || '',
        description: service.description_c || '',
        pricingType: service.pricing_type_c || 'hourly',
        hourlyRate: service.hourly_rate_c || 0,
        flatRate: service.flat_rate_c || 0,
        estimatedDuration: service.estimated_duration_c || 0,
        isActive: service.is_active_c !== false
      }));

      return transformedData;
} catch (error) {
      if (error.code === 'NETWORK_ERROR' || error.message === 'Network Error') {
        console.error("Network error fetching services - check internet connection and API availability");
      } else if (error?.response?.data?.message) {
        console.error("Error fetching services:", error?.response?.data?.message);
      } else {
        console.error("Error fetching services:", error.message);
      }
      return [];
    }
  }

  async getServicesByCategory() {
    try {
      const services = await this.getServices();
      const serviceCategories = [
        'Plumbing',
        'Electrical', 
        'Carpentry',
        'Painting',
        'HVAC',
        'Roofing',
        'Flooring',
        'Drywall',
        'Landscaping',
        'Appliance Repair',
        'General Repair'
      ];

      const servicesByCategory = {};
      serviceCategories.forEach(category => {
        servicesByCategory[category] = services.filter(service => 
          service.category === category && service.isActive
        );
      });
      return servicesByCategory;
} catch (error) {
      if (error.code === 'NETWORK_ERROR' || error.message === 'Network Error') {
        console.error("Network error getting services by category - check internet connection and API availability");
      } else {
        console.error("Error getting services by category:", error.message);
      }
      return {};
    }
  }

  async getServiceById(id) {
    try {
      const params = {
        fields: [
          { field: { Name: "Id" } },
          { field: { Name: "Name" } },
          { field: { Name: "Tags" } },
          { field: { Name: "category_c" } },
          { field: { Name: "description_c" } },
          { field: { Name: "pricing_type_c" } },
          { field: { Name: "hourly_rate_c" } },
          { field: { Name: "flat_rate_c" } },
          { field: { Name: "estimated_duration_c" } },
          { field: { Name: "is_active_c" } }
        ]
      };

      const response = await this.apperClient.getRecordById(this.tableName, parseInt(id), params);
      
      if (!response || !response.data) {
        throw new Error('Service not found');
      }

      const service = response.data;
      return {
        Id: service.Id,
        name: service.Name || '',
        category: service.category_c || '',
        description: service.description_c || '',
        pricingType: service.pricing_type_c || 'hourly',
        hourlyRate: service.hourly_rate_c || 0,
        flatRate: service.flat_rate_c || 0,
        estimatedDuration: service.estimated_duration_c || 0,
        isActive: service.is_active_c !== false
      };
    } catch (error) {
if (error.code === 'NETWORK_ERROR' || error.message === 'Network Error') {
        console.error(`Network error fetching service with ID ${id} - check internet connection and API availability`);
        throw new Error('Network error - check your connection');
      } else if (error?.response?.data?.message) {
        console.error(`Error fetching service with ID ${id}:`, error?.response?.data?.message);
        throw new Error('Service ID must be a number');
      } else {
        console.error(`Error fetching service with ID ${id}:`, error.message);
        throw new Error('Service ID must be a number');
      }
    }
  }

  async createService(serviceData) {
    try {
      // Validate required fields
      if (!serviceData.name || !serviceData.category || !serviceData.description) {
        throw new Error('Name, category, and description are required');
      }
      
      // Validate pricing
      if (serviceData.pricingType === 'hourly' && (!serviceData.hourlyRate || serviceData.hourlyRate <= 0)) {
        throw new Error('Hourly rate must be greater than 0');
      }
      
      if (serviceData.pricingType === 'flat' && (!serviceData.flatRate || serviceData.flatRate <= 0)) {
        throw new Error('Flat rate must be greater than 0');
      }

      const params = {
        records: [
          {
            Name: serviceData.name,
            Tags: serviceData.tags || '',
            category_c: serviceData.category,
            description_c: serviceData.description,
            pricing_type_c: serviceData.pricingType,
            hourly_rate_c: serviceData.pricingType === 'hourly' ? parseFloat(serviceData.hourlyRate) : null,
            flat_rate_c: serviceData.pricingType === 'flat' ? parseFloat(serviceData.flatRate) : null,
            estimated_duration_c: parseFloat(serviceData.estimatedDuration),
            is_active_c: true
          }
        ]
      };

      const response = await this.apperClient.createRecord(this.tableName, params);
      
      if (!response.success) {
        console.error(response.message);
        toast.error(response.message);
        throw new Error(response.message);
      }

      if (response.results) {
        const successfulRecords = response.results.filter(result => result.success);
        const failedRecords = response.results.filter(result => !result.success);
        
        if (failedRecords.length > 0) {
          console.error(`Failed to create services ${failedRecords.length} records:${JSON.stringify(failedRecords)}`);
          
          failedRecords.forEach(record => {
            record.errors?.forEach(error => {
              toast.error(`${error.fieldLabel}: ${error.message}`);
            });
            if (record.message) toast.error(record.message);
          });
          
          if (successfulRecords.length === 0) {
            throw new Error('Failed to create service');
          }
        }
        
        return successfulRecords[0].data;
      }
} catch (error) {
      if (error.code === 'NETWORK_ERROR' || error.message === 'Network Error') {
        console.error("Network error creating service - check internet connection and API availability");
      } else if (error?.response?.data?.message) {
        console.error("Error creating service:", error?.response?.data?.message);
      } else {
        console.error("Error creating service:", error.message);
      }
      throw error;
    }
  }

  async updateService(id, serviceData) {
    try {
      // Validate required fields
      if (!serviceData.name || !serviceData.category || !serviceData.description) {
        throw new Error('Name, category, and description are required');
      }
      
      // Validate pricing
      if (serviceData.pricingType === 'hourly' && (!serviceData.hourlyRate || serviceData.hourlyRate <= 0)) {
        throw new Error('Hourly rate must be greater than 0');
      }
      
      if (serviceData.pricingType === 'flat' && (!serviceData.flatRate || serviceData.flatRate <= 0)) {
        throw new Error('Flat rate must be greater than 0');
      }

      const updateFields = {
        Id: parseInt(id),
        Name: serviceData.name,
        Tags: serviceData.tags || '',
        category_c: serviceData.category,
        description_c: serviceData.description,
        pricing_type_c: serviceData.pricingType,
        hourly_rate_c: serviceData.pricingType === 'hourly' ? parseFloat(serviceData.hourlyRate) : null,
        flat_rate_c: serviceData.pricingType === 'flat' ? parseFloat(serviceData.flatRate) : null,
        estimated_duration_c: parseFloat(serviceData.estimatedDuration)
      };

      const params = {
        records: [updateFields]
      };

      const response = await this.apperClient.updateRecord(this.tableName, params);
      
      if (!response.success) {
        console.error(response.message);
        toast.error(response.message);
        throw new Error(response.message);
      }

      if (response.results) {
        const successfulUpdates = response.results.filter(result => result.success);
        const failedUpdates = response.results.filter(result => !result.success);
        
        if (failedUpdates.length > 0) {
          console.error(`Failed to update services ${failedUpdates.length} records:${JSON.stringify(failedUpdates)}`);
          
          failedUpdates.forEach(record => {
            record.errors?.forEach(error => {
              toast.error(`${error.fieldLabel}: ${error.message}`);
            });
            if (record.message) toast.error(record.message);
          });
          
          if (successfulUpdates.length === 0) {
            throw new Error('Failed to update service');
          }
        }
        
        return successfulUpdates[0].data;
      }
} catch (error) {
      if (error.code === 'NETWORK_ERROR' || error.message === 'Network Error') {
        console.error("Network error updating service - check internet connection and API availability");
        throw new Error('Network error - check your connection');
      } else if (error?.response?.data?.message) {
        console.error("Error updating service:", error?.response?.data?.message);
        throw new Error('Service ID must be a number');
      } else {
        console.error("Error updating service:", error.message);
        throw new Error('Service ID must be a number');
      }
    }
  }

  async deleteService(id) {
    try {
      const params = {
        RecordIds: [parseInt(id)]
      };

      const response = await this.apperClient.deleteRecord(this.tableName, params);
      
      if (!response.success) {
        console.error(response.message);
        toast.error(response.message);
        throw new Error(response.message);
      }

      if (response.results) {
        const successfulDeletions = response.results.filter(result => result.success);
        const failedDeletions = response.results.filter(result => !result.success);
        
        if (failedDeletions.length > 0) {
          console.error(`Failed to delete services ${failedDeletions.length} records:${JSON.stringify(failedDeletions)}`);
          
          failedDeletions.forEach(record => {
            if (record.message) toast.error(record.message);
          });
          
          if (successfulDeletions.length === 0) {
            throw new Error('Failed to delete service');
          }
        }
        
        return true;
      }
} catch (error) {
      if (error.code === 'NETWORK_ERROR' || error.message === 'Network Error') {
        console.error("Network error deleting service - check internet connection and API availability");
        throw new Error('Network error - check your connection');
      } else if (error?.response?.data?.message) {
        console.error("Error deleting service:", error?.response?.data?.message);
        throw new Error('Service ID must be a number');
      } else {
        console.error("Error deleting service:", error.message);
        throw new Error('Service ID must be a number');
      }
    }
  }

  getServiceCategories() {
    return [
      'Plumbing',
      'Electrical', 
      'Carpentry',
      'Painting',
      'HVAC',
      'Roofing',
      'Flooring',
      'Drywall',
      'Landscaping',
      'Appliance Repair',
      'General Repair'
    ];
  }

  async searchServices(query) {
    try {
      const services = await this.getServices();
      
      if (!query) return services;
      
      const lowercaseQuery = query.toLowerCase();
      return services.filter(service =>
        service.name.toLowerCase().includes(lowercaseQuery) ||
        service.description.toLowerCase().includes(lowercaseQuery) ||
        service.category.toLowerCase().includes(lowercaseQuery)
      );
    } catch (error) {
      console.error("Error searching services:", error.message);
      return [];
    }
  }
}

const serviceService = new ServiceService();

// Export service methods for use in components
export const getServices = () => serviceService.getServices();
export const getServicesByCategory = () => serviceService.getServicesByCategory();
export const getServiceById = (id) => serviceService.getServiceById(id);
export const createService = (serviceData) => serviceService.createService(serviceData);
export const updateService = (id, serviceData) => serviceService.updateService(id, serviceData);
export const deleteService = (id) => serviceService.deleteService(id);
export const getServiceCategories = () => serviceService.getServiceCategories();
export const searchServices = (query) => serviceService.searchServices(query);