import mockJobs from "@/services/mockData/jobs.json";

// Simulate API delay
const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

class JobService {
  constructor() {
    this.jobs = [...mockJobs];
  }

async getAll(filters = {}) {
    await delay(300);
    let filtered = [...this.jobs];
    
    // Filter by date range if provided
    if (filters.startDate && filters.endDate) {
      filtered = filtered.filter(job => {
        const jobDate = new Date(job.scheduledDate);
        return jobDate >= new Date(filters.startDate) && jobDate <= new Date(filters.endDate);
      });
    }
    
    // Filter by status if provided
    if (filters.status) {
      filtered = filtered.filter(job => job.status === filters.status);
    }
    
    return filtered;
  }

  async getById(id) {
    await delay(200);
    const job = this.jobs.find(j => j.Id === parseInt(id));
    if (!job) {
      throw new Error("Job not found");
    }
    return { ...job };
  }

async create(jobData) {
  await delay(400);
  const newJob = {
    ...jobData,
    Id: Math.max(...this.jobs.map(j => j.Id)) + 1,
    createdAt: new Date().toISOString(),
    status: jobData.status || "Scheduled",
    estimatedCost: jobData.estimatedCost || null,
    estimatedDuration: jobData.estimatedDuration || null,
    services: jobData.services || [],
    notes: [],
    photos: []
  };
  this.jobs.push(newJob);
  return { ...newJob };
}

async update(id, updateData) {
    await delay(300);
    const index = this.jobs.findIndex(j => j.Id === parseInt(id));
    if (index === -1) {
      throw new Error("Job not found");
    }
    
    // Validate scheduledDate if provided
    if (updateData.scheduledDate) {
      const date = new Date(updateData.scheduledDate);
      if (isNaN(date.getTime())) {
        throw new Error("Invalid scheduled date");
      }
    }
    
    this.jobs[index] = {
      ...this.jobs[index],
      ...updateData,
      updatedAt: new Date().toISOString()
    };
    
    return { ...this.jobs[index] };
  }

  async delete(id) {
    await delay(300);
    const index = this.jobs.findIndex(j => j.Id === parseInt(id));
    if (index === -1) {
      throw new Error("Job not found");
    }
    
    const deletedJob = this.jobs.splice(index, 1)[0];
    return { ...deletedJob };
}

  // Notes management methods
  async addNote(jobId, noteText) {
    await delay(300);
    const job = await this.getById(jobId);
    if (!job) throw new Error('Job not found');
    
    const newNote = {
      Id: Date.now(), // Simple ID generation for notes
      text: noteText,
      createdAt: new Date().toISOString()
    };
    
    if (!job.notes) job.notes = [];
    job.notes.push(newNote);
    
    return await this.update(jobId, { notes: job.notes });
  }

  async updateNote(jobId, noteId, noteText) {
    await delay(300);
    const job = await this.getById(jobId);
    if (!job || !job.notes) throw new Error('Job or note not found');
    
    const noteIndex = job.notes.findIndex(note => note.Id === noteId);
    if (noteIndex === -1) throw new Error('Note not found');
    
    job.notes[noteIndex] = {
      ...job.notes[noteIndex],
      text: noteText,
      updatedAt: new Date().toISOString()
    };
    
    return await this.update(jobId, { notes: job.notes });
  }

  async deleteNote(jobId, noteId) {
    await delay(300);
    const job = await this.getById(jobId);
    if (!job || !job.notes) throw new Error('Job or note not found');
    
    job.notes = job.notes.filter(note => note.Id !== noteId);
    return await this.update(jobId, { notes: job.notes });
  }

  // Photos management methods
  async addPhoto(jobId, photoData) {
    await delay(500); // Simulate upload time
    const job = await this.getById(jobId);
    if (!job) throw new Error('Job not found');
    
    const newPhoto = {
      Id: Date.now(), // Simple ID generation for photos
      name: photoData.name,
      url: photoData.url, // In real app, this would be uploaded to storage
      size: photoData.size,
      type: photoData.type,
      createdAt: new Date().toISOString()
    };
    
    if (!job.photos) job.photos = [];
    job.photos.push(newPhoto);
    
    return await this.update(jobId, { photos: job.photos });
  }

  async deletePhoto(jobId, photoId) {
    await delay(300);
    const job = await this.getById(jobId);
    if (!job || !job.photos) throw new Error('Job or photo not found');
    
    job.photos = job.photos.filter(photo => photo.Id !== photoId);
    return await this.update(jobId, { photos: job.photos });
  }
}

// Calendar-specific helper methods
export const calendarService = {
  async getJobsForDateRange(startDate, endDate) {
    return await jobService.getAll({ startDate, endDate });
  },
  
  async rescheduleJob(jobId, newDate) {
    return await jobService.update(jobId, { scheduledDate: newDate.toISOString() });
  }
};

export const jobService = new JobService();