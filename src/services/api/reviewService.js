import { toast } from "react-toastify";
import React from "react";
import { create, getAll, getById, update } from "@/services/api/jobService";
import Error from "@/components/ui/Error";

const tableName = 'review_c';

// Initialize ApperClient
const getApperClient = () => {
  const { ApperClient } = window.ApperSDK;
  return new ApperClient({
    apperProjectId: import.meta.env.VITE_APPER_PROJECT_ID,
    apperPublicKey: import.meta.env.VITE_APPER_PUBLIC_KEY
  });
};

// Field definitions for review_c table
const reviewFields = [
  { field: { Name: "Name" } },
  { field: { Name: "Tags" } },
  { field: { Name: "client_id_c" } },
  { field: { Name: "job_id_c" } },
  { field: { Name: "job_description_c" } },
  { field: { Name: "rating_c" } },
  { field: { Name: "comment_c" } },
  { field: { Name: "created_at_c" } },
  { field: { Name: "updated_at_c" } }
];

// Helper function to format data for API submission (only Updateable fields)
const formatReviewForSubmission = (reviewData) => {
  return {
    Name: reviewData.Name || `Review for ${reviewData.job_description_c || reviewData.jobDescription || 'Job'}`,
    Tags: reviewData.Tags,
    client_id_c: parseInt(reviewData.client_id_c || reviewData.clientId),
    job_id_c: parseInt(reviewData.job_id_c || reviewData.jobId),
    job_description_c: reviewData.job_description_c || reviewData.jobDescription,
    rating_c: `${reviewData.rating_c || reviewData.rating || 5}`,
    comment_c: reviewData.comment_c || reviewData.comment,
    created_at_c: reviewData.created_at_c || new Date().toISOString(),
    updated_at_c: new Date().toISOString()
  };
};

export const reviewService = {
  getAll: async () => {
    try {
      const apperClient = getApperClient();
      const params = {
        fields: reviewFields,
        orderBy: [
          {
            fieldName: "created_at_c",
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
        console.error("Error fetching reviews:", error?.response?.data?.message);
        toast.error(error?.response?.data?.message);
      } else {
        console.error(error.message);
        toast.error("Failed to fetch reviews");
      }
      return [];
    }
  },

  getById: async (id) => {
    try {
      const apperClient = getApperClient();
      const params = {
        fields: reviewFields
      };

      const response = await apperClient.getRecordById(tableName, parseInt(id), params);

      if (!response || !response.data) {
        throw new Error('Review not found');
      }

      return response.data;
    } catch (error) {
      if (error?.response?.data?.message) {
        console.error(`Error fetching review with ID ${id}:`, error?.response?.data?.message);
      } else {
        console.error(error.message);
      }
      throw error;
    }
  },

  create: async (reviewData) => {
    try {
      const apperClient = getApperClient();
      const formattedData = formatReviewForSubmission(reviewData);

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
          console.error(`Failed to create ${failedRecords.length} review records:${JSON.stringify(failedRecords)}`);
          
          failedRecords.forEach(record => {
            record.errors?.forEach(error => {
              toast.error(`${error.fieldLabel}: ${error.message}`);
            });
            if (record.message) toast.error(record.message);
          });
        }

        if (successfulRecords.length > 0) {
          toast.success('Review created successfully');
          return successfulRecords[0].data;
        }
      }

      return null;
    } catch (error) {
      if (error?.response?.data?.message) {
        console.error("Error creating review:", error?.response?.data?.message);
        toast.error(error?.response?.data?.message);
      } else {
        console.error(error.message);
        toast.error("Failed to create review");
      }
      return null;
    }
  },

  update: async (id, reviewData) => {
    try {
      const apperClient = getApperClient();
      const formattedData = {
        Id: parseInt(id),
        ...formatReviewForSubmission(reviewData)
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
          console.error(`Failed to update ${failedUpdates.length} review records:${JSON.stringify(failedUpdates)}`);
          
          failedUpdates.forEach(record => {
            record.errors?.forEach(error => {
              toast.error(`${error.fieldLabel}: ${error.message}`);
            });
            if (record.message) toast.error(record.message);
          });
        }

        if (successfulUpdates.length > 0) {
          toast.success('Review updated successfully');
          return successfulUpdates[0].data;
        }
      }

      return null;
    } catch (error) {
      if (error?.response?.data?.message) {
        console.error("Error updating review:", error?.response?.data?.message);
        toast.error(error?.response?.data?.message);
      } else {
        console.error(error.message);
        toast.error("Failed to update review");
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
          console.error(`Failed to delete ${failedDeletions.length} review records:${JSON.stringify(failedDeletions)}`);
          
          failedDeletions.forEach(record => {
            if (record.message) toast.error(record.message);
          });
        }

        if (successfulDeletions.length > 0) {
          toast.success('Review deleted successfully');
          return true;
        }
      }

      return false;
    } catch (error) {
      if (error?.response?.data?.message) {
        console.error("Error deleting review:", error?.response?.data?.message);
        toast.error(error?.response?.data?.message);
      } else {
        console.error(error.message);
        toast.error("Failed to delete review");
      }
      return false;
    }
  }
},

  getByClientId: async (clientId) => {
    try {
      if (!clientId || (typeof clientId !== 'number' && typeof clientId !== 'string')) {
        return [];
      }

      const apperClient = getApperClient();
      const params = {
        fields: reviewFields,
        where: [{
          FieldName: "client_id_c",
          Operator: "EqualTo",
          Values: [parseInt(clientId)]
        }],
        orderBy: [{
          fieldName: "created_at_c",
          sorttype: "DESC"
        }]
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
        console.error("Error fetching reviews by client ID:", error?.response?.data?.message);
        toast.error(error?.response?.data?.message);
      } else {
        console.error("Error fetching reviews by client ID:", error.message);
        toast.error("Failed to fetch client reviews");
      }
      return [];
    }
  },

  getByJobId: async (jobId) => {
    try {
      if (!jobId || (typeof jobId !== 'number' && typeof jobId !== 'string')) {
        return [];
      }

      const apperClient = getApperClient();
      const params = {
        fields: reviewFields,
        where: [{
          FieldName: "job_id_c",
          Operator: "EqualTo",
          Values: [parseInt(jobId)]
        }],
        orderBy: [{
          fieldName: "created_at_c",
          sorttype: "DESC"
        }]
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
        console.error("Error fetching reviews by job ID:", error?.response?.data?.message);
        toast.error(error?.response?.data?.message);
      } else {
        console.error("Error fetching reviews by job ID:", error.message);
        toast.error("Failed to fetch job reviews");
      }
      return [];
    }
  },

  getStats: async () => {
    try {
      const reviews = await reviewService.getAll();
      const totalReviews = reviews.length;
      
      if (totalReviews === 0) {
        return {
          totalReviews: 0,
          averageRating: 0,
          ratingDistribution: { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 }
        };
      }

      const ratings = reviews.map(r => parseInt(r.rating_c) || 0);
      const averageRating = Math.round((ratings.reduce((sum, r) => sum + r, 0) / totalReviews) * 10) / 10;
      
      const ratingDistribution = {
        5: ratings.filter(r => r === 5).length,
        4: ratings.filter(r => r === 4).length,
        3: ratings.filter(r => r === 3).length,
        2: ratings.filter(r => r === 2).length,
        1: ratings.filter(r => r === 1).length
      };

      return {
        totalReviews,
        averageRating,
        ratingDistribution
      };
    } catch (error) {
      console.error("Error calculating review stats:", error.message);
      return {
        totalReviews: 0,
        averageRating: 0,
        ratingDistribution: { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 }
      };
    }
  },

  getAverageRatingByClient: async (clientId) => {
    try {
      const clientReviews = await reviewService.getByClientId(clientId);
      if (clientReviews.length === 0) return 0;
      
      const ratings = clientReviews.map(r => parseInt(r.rating_c) || 0);
      const total = ratings.reduce((sum, rating) => sum + rating, 0);
      return Math.round((total / clientReviews.length) * 10) / 10;
    } catch (error) {
      console.error("Error calculating average rating:", error.message);
      return 0;
    }
  }
};

export default reviewService;