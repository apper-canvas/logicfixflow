import mockJobs from "@/services/mockData/jobs.json";

// Simulate API delay
const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

class JobService {
  constructor() {
    this.jobs = [...mockJobs];
  }

  async getAll() {
    await delay(300);
    return [...this.jobs];
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

export const jobService = new JobService();