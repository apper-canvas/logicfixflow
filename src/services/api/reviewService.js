import { toast } from 'react-toastify';

import { toast } from 'react-toastify';

class ReviewService {
  constructor() {
    // Initialize ApperClient with Project ID and Public Key
    const { ApperClient } = window.ApperSDK;
    this.apperClient = new ApperClient({
      apperProjectId: import.meta.env.VITE_APPER_PROJECT_ID,
      apperPublicKey: import.meta.env.VITE_APPER_PUBLIC_KEY
    });
    this.tableName = 'review_c';
  }

  async getReviews() {
    try {
      const params = {
        fields: [
          { field: { Name: "Id" } },
          { field: { Name: "Name" } },
          { field: { Name: "Tags" } },
          { field: { Name: "client_id_c" } },
          { field: { Name: "job_id_c" } },
          { field: { Name: "job_description_c" } },
          { field: { Name: "rating_c" } },
          { field: { Name: "comment_c" } },
          { field: { Name: "created_at_c" } },
          { field: { Name: "updated_at_c" } }
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
      const transformedData = (response.data || []).map(review => ({
        Id: review.Id,
        clientId: review.client_id_c?.Id || review.client_id_c,
        jobId: review.job_id_c?.Id || review.job_id_c,
        jobDescription: review.job_description_c || '',
        rating: review.rating_c || 0,
        comment: review.comment_c || '',
        createdAt: review.created_at_c || new Date().toISOString(),
        updatedAt: review.updated_at_c || new Date().toISOString()
      }));

      return transformedData;
    } catch (error) {
      if (error?.response?.data?.message) {
        console.error("Error fetching reviews:", error?.response?.data?.message);
      } else {
        console.error(error.message);
      }
      return [];
    }
  }

  async getReviewById(id) {
    try {
      if (typeof id !== 'number' || id <= 0) {
        throw new Error('Invalid review ID');
      }

      const params = {
        fields: [
          { field: { Name: "Id" } },
          { field: { Name: "Name" } },
          { field: { Name: "Tags" } },
          { field: { Name: "client_id_c" } },
          { field: { Name: "job_id_c" } },
          { field: { Name: "job_description_c" } },
          { field: { Name: "rating_c" } },
          { field: { Name: "comment_c" } },
          { field: { Name: "created_at_c" } },
          { field: { Name: "updated_at_c" } }
        ]
      };

      const response = await this.apperClient.getRecordById(this.tableName, parseInt(id), params);
      
      if (!response || !response.data) {
        throw new Error('Review not found');
      }

      const review = response.data;
      return {
        Id: review.Id,
        clientId: review.client_id_c?.Id || review.client_id_c,
        jobId: review.job_id_c?.Id || review.job_id_c,
        jobDescription: review.job_description_c || '',
        rating: review.rating_c || 0,
        comment: review.comment_c || '',
        createdAt: review.created_at_c || new Date().toISOString(),
        updatedAt: review.updated_at_c || new Date().toISOString()
      };
    } catch (error) {
      if (error?.response?.data?.message) {
        console.error(`Error fetching review with ID ${id}:`, error?.response?.data?.message);
      } else {
        console.error(error.message);
      }
      throw error;
    }
  }

  async getReviewsByClientId(clientId) {
    try {
      if (typeof clientId !== 'number' || clientId <= 0) {
        return [];
      }
      
      const params = {
        fields: [
          { field: { Name: "Id" } },
          { field: { Name: "Name" } },
          { field: { Name: "Tags" } },
          { field: { Name: "client_id_c" } },
          { field: { Name: "job_id_c" } },
          { field: { Name: "job_description_c" } },
          { field: { Name: "rating_c" } },
          { field: { Name: "comment_c" } },
          { field: { Name: "created_at_c" } },
          { field: { Name: "updated_at_c" } }
        ],
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

      const response = await this.apperClient.fetchRecords(this.tableName, params);
      
      if (!response.success) {
        console.error(response.message);
        return [];
      }

      return (response.data || []).map(review => ({
        Id: review.Id,
        clientId: review.client_id_c?.Id || review.client_id_c,
        jobId: review.job_id_c?.Id || review.job_id_c,
        jobDescription: review.job_description_c || '',
        rating: review.rating_c || 0,
        comment: review.comment_c || '',
        createdAt: review.created_at_c || new Date().toISOString(),
        updatedAt: review.updated_at_c || new Date().toISOString()
      }));
    } catch (error) {
      console.error("Error fetching reviews by client ID:", error.message);
      return [];
    }
  }

  async getReviewsByJobId(jobId) {
    try {
      if (typeof jobId !== 'number' || jobId <= 0) {
        return [];
      }
      
      const params = {
        fields: [
          { field: { Name: "Id" } },
          { field: { Name: "Name" } },
          { field: { Name: "Tags" } },
          { field: { Name: "client_id_c" } },
          { field: { Name: "job_id_c" } },
          { field: { Name: "job_description_c" } },
          { field: { Name: "rating_c" } },
          { field: { Name: "comment_c" } },
          { field: { Name: "created_at_c" } },
          { field: { Name: "updated_at_c" } }
        ],
        where: [{
          FieldName: "job_id_c",
          Operator: "EqualTo",
          Values: [parseInt(jobId)]
        }]
      };

      const response = await this.apperClient.fetchRecords(this.tableName, params);
      
      if (!response.success) {
        console.error(response.message);
        return [];
      }

      return (response.data || []).map(review => ({
        Id: review.Id,
        clientId: review.client_id_c?.Id || review.client_id_c,
        jobId: review.job_id_c?.Id || review.job_id_c,
        jobDescription: review.job_description_c || '',
        rating: review.rating_c || 0,
        comment: review.comment_c || '',
        createdAt: review.created_at_c || new Date().toISOString(),
        updatedAt: review.updated_at_c || new Date().toISOString()
      }));
    } catch (error) {
      console.error("Error fetching reviews by job ID:", error.message);
      return [];
    }
  }

  async createReview(reviewData) {
    try {
      // Validate required fields
      if (!reviewData.clientId || typeof reviewData.clientId !== 'number') {
        toast.error('Invalid client ID');
        throw new Error('Valid client ID is required');
      }
      
      if (!reviewData.jobId || typeof reviewData.jobId !== 'number') {
        toast.error('Invalid job ID');
        throw new Error('Valid job ID is required');
      }
      
      if (!reviewData.rating || reviewData.rating < 1 || reviewData.rating > 5) {
        toast.error('Rating must be between 1 and 5 stars');
        throw new Error('Rating must be between 1 and 5');
      }
      
      if (!reviewData.comment || reviewData.comment.trim().length === 0) {
        toast.error('Review comment is required');
        throw new Error('Review comment is required');
      }

      // Check if review already exists for this job
      const existingReviews = await this.getReviewsByJobId(reviewData.jobId);
      if (existingReviews.length > 0) {
        toast.error('A review already exists for this job');
        throw new Error('Review already exists for this job');
      }

      const params = {
        records: [
          {
            Name: `Review ${reviewData.jobId}`,
            Tags: '',
            client_id_c: parseInt(reviewData.clientId),
            job_id_c: parseInt(reviewData.jobId),
            job_description_c: reviewData.jobDescription || '',
            rating_c: parseInt(reviewData.rating),
            comment_c: reviewData.comment.trim(),
            created_at_c: new Date().toISOString(),
            updated_at_c: new Date().toISOString()
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
          console.error(`Failed to create reviews ${failedRecords.length} records:${JSON.stringify(failedRecords)}`);
          
          failedRecords.forEach(record => {
            record.errors?.forEach(error => {
              toast.error(`${error.fieldLabel}: ${error.message}`);
            });
            if (record.message) toast.error(record.message);
          });
          
          if (successfulRecords.length === 0) {
            throw new Error('Failed to create review');
          }
        }
        
        if (successfulRecords.length > 0) {
          toast.success('Review added successfully!');
          return successfulRecords[0].data;
        }
      }
    } catch (error) {
      if (error?.response?.data?.message) {
        console.error("Error creating review:", error?.response?.data?.message);
      } else {
        console.error(error.message);
      }
      throw error;
    }
  }

  async updateReview(id, updateData) {
    try {
      if (typeof id !== 'number' || id <= 0) {
        toast.error('Invalid review ID');
        throw new Error('Invalid review ID');
      }
      
      // Validate rating if provided
      if (updateData.rating && (updateData.rating < 1 || updateData.rating > 5)) {
        toast.error('Rating must be between 1 and 5 stars');
        throw new Error('Rating must be between 1 and 5');
      }
      
      // Validate comment if provided
      if (updateData.comment !== undefined && updateData.comment.trim().length === 0) {
        toast.error('Review comment cannot be empty');
        throw new Error('Review comment cannot be empty');
      }

      const updateFields = {
        Id: parseInt(id),
        updated_at_c: new Date().toISOString()
      };

      if (updateData.jobDescription !== undefined) updateFields.job_description_c = updateData.jobDescription;
      if (updateData.rating !== undefined) updateFields.rating_c = parseInt(updateData.rating);
      if (updateData.comment !== undefined) updateFields.comment_c = updateData.comment.trim();

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
          console.error(`Failed to update reviews ${failedUpdates.length} records:${JSON.stringify(failedUpdates)}`);
          
          failedUpdates.forEach(record => {
            record.errors?.forEach(error => {
              toast.error(`${error.fieldLabel}: ${error.message}`);
            });
            if (record.message) toast.error(record.message);
          });
          
          if (successfulUpdates.length === 0) {
            throw new Error('Failed to update review');
          }
        }
        
        if (successfulUpdates.length > 0) {
          toast.success('Review updated successfully!');
          return successfulUpdates[0].data;
        }
      }
    } catch (error) {
      if (error?.response?.data?.message) {
        console.error("Error updating review:", error?.response?.data?.message);
      } else {
        console.error(error.message);
      }
      throw error;
    }
  }

  async deleteReview(id) {
    try {
      if (typeof id !== 'number' || id <= 0) {
        toast.error('Invalid review ID');
        throw new Error('Invalid review ID');
      }

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
          console.error(`Failed to delete reviews ${failedDeletions.length} records:${JSON.stringify(failedDeletions)}`);
          
          failedDeletions.forEach(record => {
            if (record.message) toast.error(record.message);
          });
          
          if (successfulDeletions.length === 0) {
            throw new Error('Failed to delete review');
          }
        }
        
        if (successfulDeletions.length > 0) {
          toast.success('Review deleted successfully!');
          return true;
        }
      }
    } catch (error) {
      if (error?.response?.data?.message) {
        console.error("Error deleting review:", error?.response?.data?.message);
      } else {
        console.error(error.message);
      }
      throw error;
    }
  }

  // Utility functions
  async getAverageRatingByClient(clientId) {
    try {
      const clientReviews = await this.getReviewsByClientId(clientId);
      if (clientReviews.length === 0) return 0;
      
      const total = clientReviews.reduce((sum, review) => sum + review.rating, 0);
      return Math.round((total / clientReviews.length) * 10) / 10;
    } catch (error) {
      console.error("Error calculating average rating:", error.message);
      return 0;
    }
  }

  async getReviewStats() {
    try {
      const reviews = await this.getReviews();
      const totalReviews = reviews.length;
      const averageRating = totalReviews > 0 
        ? Math.round((reviews.reduce((sum, r) => sum + r.rating, 0) / totalReviews) * 10) / 10
        : 0;
      
      const ratingDistribution = {
        5: reviews.filter(r => r.rating === 5).length,
        4: reviews.filter(r => r.rating === 4).length,
        3: reviews.filter(r => r.rating === 3).length,
        2: reviews.filter(r => r.rating === 2).length,
        1: reviews.filter(r => r.rating === 1).length
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
  }

  async searchReviews(query) {
    try {
      const reviews = await this.getReviews();
      
      if (!query || query.trim() === '') {
        return reviews;
      }
      
      const searchTerm = query.toLowerCase();
      return reviews.filter(review => 
        review.comment.toLowerCase().includes(searchTerm) ||
        review.jobDescription.toLowerCase().includes(searchTerm)
      );
    } catch (error) {
      console.error("Error searching reviews:", error.message);
      return [];
    }
  }

  async filterReviewsByRating(rating) {
    try {
      const reviews = await this.getReviews();
      
      if (!rating || rating === 'All') {
        return reviews;
      }
      
      const targetRating = parseInt(rating);
      if (targetRating < 1 || targetRating > 5) {
        return reviews;
      }
      
      return reviews.filter(review => review.rating === targetRating);
    } catch (error) {
      console.error("Error filtering reviews by rating:", error.message);
      return [];
    }
  }
}

const reviewService = new ReviewService();

// Export service methods for use in components
export const getReviews = () => reviewService.getReviews();
export const getReviewById = (id) => reviewService.getReviewById(id);
export const getReviewsByClientId = (clientId) => reviewService.getReviewsByClientId(clientId);
export const getReviewsByJobId = (jobId) => reviewService.getReviewsByJobId(jobId);
export const createReview = (reviewData) => reviewService.createReview(reviewData);
export const updateReview = (id, updateData) => reviewService.updateReview(id, updateData);
export const deleteReview = (id) => reviewService.deleteReview(id);
export const getAverageRatingByClient = (clientId) => reviewService.getAverageRatingByClient(clientId);
export const getReviewStats = () => reviewService.getReviewStats();
export const searchReviews = (query) => reviewService.searchReviews(query);
export const filterReviewsByRating = (rating) => reviewService.filterReviewsByRating(rating);