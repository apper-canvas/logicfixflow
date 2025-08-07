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
      status: jobData.status || "Scheduled"
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