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
  
  // Calculate estimated cost and duration from service if provided
  let estimatedCost = jobData.estimatedCost || null;
  let estimatedDuration = jobData.estimatedDuration || null;
  
  if (jobData.serviceId && !estimatedCost) {
    // Import service data to calculate estimates
    const { getServiceById } = await import("@/services/api/serviceService");
    const service = getServiceById(jobData.serviceId);
    if (service) {
      estimatedDuration = service.estimatedDuration;
      if (service.pricingType === 'flat') {
        estimatedCost = service.flatRate;
      } else if (service.pricingType === 'hourly') {
        estimatedCost = service.hourlyRate * (service.estimatedDuration || 1);
      }
    }
  }
  
  const newJob = {
    ...jobData,
    Id: Math.max(...this.jobs.map(j => j.Id)) + 1,
    createdAt: new Date().toISOString(),
    status: jobData.status || "Scheduled",
    estimatedCost: jobData.price ? parseFloat(jobData.price) : estimatedCost,
    estimatedDuration: estimatedDuration,
    serviceId: jobData.serviceId || null,
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

  // Print and Email estimate methods
  async printEstimate(estimateData) {
    await delay(200);
    
    const { selectedServices, estimate, totalDuration } = estimateData;
    const suggestedTotal = estimate * 1.15;
    
    const printContent = `
      <html>
        <head>
          <title>Service Estimate</title>
          <style>
            body { font-family: Arial, sans-serif; margin: 40px; color: #333; }
            .header { border-bottom: 2px solid #2563eb; padding-bottom: 20px; margin-bottom: 30px; }
            .company { font-size: 24px; font-weight: bold; color: #2563eb; }
            .title { font-size: 20px; margin: 20px 0; }
            .service-item { border-bottom: 1px solid #eee; padding: 10px 0; display: flex; justify-content: space-between; }
            .totals { border-top: 2px solid #333; padding-top: 15px; margin-top: 20px; }
            .total-line { display: flex; justify-content: space-between; margin: 5px 0; }
            .final-total { font-size: 18px; font-weight: bold; border-top: 1px solid #333; padding-top: 10px; margin-top: 10px; }
            .footer { margin-top: 40px; font-size: 12px; color: #666; }
            @media print { body { margin: 20px; } }
          </style>
        </head>
        <body>
          <div class="header">
            <div class="company">FixFlow Pro</div>
            <div>Professional Service Estimate</div>
            <div>Date: ${new Date().toLocaleDateString()}</div>
          </div>
          
          <div class="title">Service Breakdown</div>
          
          ${selectedServices.map(service => {
            const serviceTotal = service.pricingType === 'hourly'
              ? service.hourlyRate * service.estimatedDuration * service.quantity
              : service.flatRate * service.quantity;
            
            return `
              <div class="service-item">
                <div>
                  <strong>${service.name}</strong> (Qty: ${service.quantity})<br>
                  <small>${service.description}</small><br>
                  <small>${service.pricingType === 'hourly' 
                    ? `$${service.hourlyRate}/hr × ${service.estimatedDuration}hrs` 
                    : `$${service.flatRate} flat rate`}</small>
                </div>
                <div>$${serviceTotal.toFixed(2)}</div>
              </div>
            `;
          }).join('')}
          
          <div class="totals">
            <div class="total-line">
              <span>Labor Cost:</span>
              <span>$${estimate.toFixed(2)}</span>
            </div>
            <div class="total-line">
              <span>Estimated Duration:</span>
              <span>${totalDuration.toFixed(1)} hours</span>
            </div>
            <div class="total-line">
              <span>Materials & Overhead (15%):</span>
              <span>$${(suggestedTotal - estimate).toFixed(2)}</span>
            </div>
            <div class="final-total">
              <span>Suggested Total:</span>
              <span>$${suggestedTotal.toFixed(2)}</span>
            </div>
          </div>
          
          <div class="footer">
            <p>This estimate is valid for 30 days. Actual costs may vary based on site conditions and material availability.</p>
            <p>Thank you for choosing FixFlow Pro for your service needs!</p>
          </div>
        </body>
      </html>
    `;
    
    const printWindow = window.open('', '_blank');
    printWindow.document.write(printContent);
    printWindow.document.close();
    printWindow.print();
    
    return { success: true, message: 'Estimate sent to printer' };
  }

  async emailEstimate(estimateData) {
    await delay(200);
    
    const { selectedServices, estimate, totalDuration } = estimateData;
    const suggestedTotal = estimate * 1.15;
    
    const servicesList = selectedServices.map(service => {
      const serviceTotal = service.pricingType === 'hourly'
        ? service.hourlyRate * service.estimatedDuration * service.quantity
        : service.flatRate * service.quantity;
      
      return `• ${service.name} (Qty: ${service.quantity}) - ${service.pricingType === 'hourly' 
        ? `$${service.hourlyRate}/hr × ${service.estimatedDuration}hrs` 
        : `$${service.flatRate} flat rate`} = $${serviceTotal.toFixed(2)}`;
    }).join('\n');
    
    const emailSubject = encodeURIComponent('Service Estimate from FixFlow Pro');
    const emailBody = encodeURIComponent(`Dear Valued Customer,

Please find your service estimate below:

SERVICE BREAKDOWN:
${servicesList}

ESTIMATE SUMMARY:
Labor Cost: $${estimate.toFixed(2)}
Estimated Duration: ${totalDuration.toFixed(1)} hours
Materials & Overhead (15%): $${(suggestedTotal - estimate).toFixed(2)}
-----------------------------------------
SUGGESTED TOTAL: $${suggestedTotal.toFixed(2)}

This estimate is valid for 30 days. Actual costs may vary based on site conditions and material availability.

To schedule this service or discuss any questions, please contact us directly.

Thank you for choosing FixFlow Pro!

Best regards,
FixFlow Pro Team`);
    
    const mailtoLink = `mailto:?subject=${emailSubject}&body=${emailBody}`;
    window.open(mailtoLink);
    
    return { success: true, message: 'Email client opened with estimate' };
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

// Named exports for convenient importing
export const create = (jobData) => jobService.create(jobData);
export const getAll = (filters) => jobService.getAll(filters);
export const getById = (id) => jobService.getById(id);
export const update = (id, updateData) => jobService.update(id, updateData);
export const deleteJob = (id) => jobService.delete(id);
export const addNote = (jobId, noteText) => jobService.addNote(jobId, noteText);
export const updateNote = (jobId, noteId, noteText) => jobService.updateNote(jobId, noteId, noteText);
export const deleteNote = (jobId, noteId) => jobService.deleteNote(jobId, noteId);
export const addPhoto = (jobId, photoData) => jobService.addPhoto(jobId, photoData);
export const deletePhoto = (jobId, photoId) => jobService.deletePhoto(jobId, photoId);
export const printEstimate = (estimateData) => jobService.printEstimate(estimateData);
export const emailEstimate = (estimateData) => jobService.emailEstimate(estimateData);