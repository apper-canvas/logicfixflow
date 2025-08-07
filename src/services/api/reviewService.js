import { toast } from 'react-toastify';

// Mock reviews data
const mockReviews = [
  {
    Id: 1,
    clientId: 1,
    jobId: 3,
    jobDescription: "Annual furnace maintenance and filter replacement",
    rating: 5,
    comment: "Excellent service! Very professional and thorough. The technician explained everything clearly and the system is running perfectly now.",
    createdAt: "2024-01-12T14:30:00.000Z",
    updatedAt: "2024-01-12T14:30:00.000Z"
  },
  {
    Id: 2,
    clientId: 1,
    jobId: 4,
    jobDescription: "Build custom shelving unit in home office",
    rating: 5,
    comment: "Amazing craftsmanship! The shelving unit fits perfectly and looks exactly like we envisioned. Highly recommend!",
    createdAt: "2024-01-10T16:00:00.000Z",
    updatedAt: "2024-01-10T16:00:00.000Z"
  },
  {
    Id: 3,
    clientId: 2,
    jobId: 10,
    jobDescription: "Install additional outlets in garage workshop area",
    rating: 4,
    comment: "Good work on the electrical installation. Everything works as expected. Would have liked a bit more communication about timing.",
    createdAt: "2024-01-13T17:15:00.000Z",
    updatedAt: "2024-01-13T17:15:00.000Z"
  },
  {
    Id: 4,
    clientId: 3,
    jobId: 2,
    jobDescription: "Install new ceiling fan in master bedroom",
    rating: 5,
    comment: "Perfect installation! The fan is quiet and the controls work flawlessly. Very satisfied with the service.",
    createdAt: "2024-01-14T18:30:00.000Z",
    updatedAt: "2024-01-14T18:30:00.000Z"
  }
];

// Internal state management
let reviews = [...mockReviews];
let nextReviewId = Math.max(...reviews.map(r => r.Id), 0) + 1;

// Basic CRUD Operations
export const getReviews = () => {
  return [...reviews];
};

export const getReviewById = (id) => {
  if (typeof id !== 'number' || id <= 0) {
    throw new Error('Invalid review ID');
  }
  
  const review = reviews.find(r => r.Id === id);
  if (!review) {
    throw new Error('Review not found');
  }
  
  return { ...review };
};

export const getReviewsByClientId = (clientId) => {
  if (typeof clientId !== 'number' || clientId <= 0) {
    return [];
  }
  
  return reviews
    .filter(r => r.clientId === clientId)
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
    .map(r => ({ ...r }));
};

export const getReviewsByJobId = (jobId) => {
  if (typeof jobId !== 'number' || jobId <= 0) {
    return [];
  }
  
  return reviews
    .filter(r => r.jobId === jobId)
    .map(r => ({ ...r }));
};

export const createReview = (reviewData) => {
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
  const existingReview = reviews.find(r => r.jobId === reviewData.jobId);
  if (existingReview) {
    toast.error('A review already exists for this job');
    throw new Error('Review already exists for this job');
  }
  
  const newReview = {
    Id: nextReviewId++,
    clientId: parseInt(reviewData.clientId),
    jobId: parseInt(reviewData.jobId),
    jobDescription: reviewData.jobDescription || '',
    rating: parseInt(reviewData.rating),
    comment: reviewData.comment.trim(),
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };
  
  reviews.push(newReview);
  toast.success('Review added successfully!');
  
  return { ...newReview };
};

export const updateReview = (id, updateData) => {
  if (typeof id !== 'number' || id <= 0) {
    toast.error('Invalid review ID');
    throw new Error('Invalid review ID');
  }
  
  const index = reviews.findIndex(r => r.Id === id);
  if (index === -1) {
    toast.error('Review not found');
    throw new Error('Review not found');
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
  
  const updatedReview = {
    ...reviews[index],
    ...updateData,
    updatedAt: new Date().toISOString()
  };
  
  // Ensure immutable fields stay the same
  updatedReview.Id = reviews[index].Id;
  updatedReview.clientId = reviews[index].clientId;
  updatedReview.jobId = reviews[index].jobId;
  updatedReview.createdAt = reviews[index].createdAt;
  
  reviews[index] = updatedReview;
  toast.success('Review updated successfully!');
  
  return { ...updatedReview };
};

export const deleteReview = (id) => {
  if (typeof id !== 'number' || id <= 0) {
    toast.error('Invalid review ID');
    throw new Error('Invalid review ID');
  }
  
  const index = reviews.findIndex(r => r.Id === id);
  if (index === -1) {
    toast.error('Review not found');
    throw new Error('Review not found');
  }
  
  const deletedReview = reviews.splice(index, 1)[0];
  toast.success('Review deleted successfully!');
  
  return { ...deletedReview };
};

// Utility functions
export const getAverageRatingByClient = (clientId) => {
  const clientReviews = getReviewsByClientId(clientId);
  if (clientReviews.length === 0) return 0;
  
  const total = clientReviews.reduce((sum, review) => sum + review.rating, 0);
  return Math.round((total / clientReviews.length) * 10) / 10;
};

export const getReviewStats = () => {
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
};

export const searchReviews = (query) => {
  if (!query || query.trim() === '') {
    return [...reviews];
  }
  
  const searchTerm = query.toLowerCase();
  return reviews.filter(review => 
    review.comment.toLowerCase().includes(searchTerm) ||
    review.jobDescription.toLowerCase().includes(searchTerm)
  );
};

export const filterReviewsByRating = (rating) => {
  if (!rating || rating === 'All') {
    return [...reviews];
  }
  
  const targetRating = parseInt(rating);
  if (targetRating < 1 || targetRating > 5) {
    return [...reviews];
  }
  
  return reviews.filter(review => review.rating === targetRating);
};