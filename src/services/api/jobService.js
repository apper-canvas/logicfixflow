import { toast } from 'react-toastify';

class JobService {
  constructor() {
    // Initialize ApperClient with Project ID and Public Key
    const { ApperClient } = window.ApperSDK;
    this.apperClient = new ApperClient({
      apperProjectId: import.meta.env.VITE_APPER_PROJECT_ID,
      apperPublicKey: import.meta.env.VITE_APPER_PUBLIC_KEY
    });
    this.tableName = 'job_c';
  }

  async getAll(filters = {}) {
    try {
      const params = {
        fields: [
          { field: { Name: "Id" } },
          { field: { Name: "Name" } },
          { field: { Name: "Tags" } },
          { field: { Name: "scheduled_date_c" } },
          { field: { Name: "status_c" } },
          { field: { Name: "estimated_cost_c" } },
          { field: { Name: "estimated_duration_c" } },
          { field: { Name: "services_c" } },
          { field: { Name: "notes_c" } },
          { field: { Name: "photos_c" } },
          { field: { Name: "created_at_c" } },
          { field: { Name: "updated_at_c" } },
          { field: { Name: "price_c" } },
          { field: { Name: "service_id_c" } }
        ],
        pagingInfo: {
          limit: 100,
          offset: 0
        }
      };

      // Add filters if provided
      if (filters.status) {
        params.where = [{
          FieldName: "status_c",
          Operator: "EqualTo",
          Values: [filters.status]
        }];
      }

      const response = await this.apperClient.fetchRecords(this.tableName, params);
      
      if (!response.success) {
        console.error(response.message);
        toast.error(response.message);
        return [];
      }

      // Transform data to match expected format
      const transformedData = (response.data || []).map(job => ({
        Id: job.Id,
        clientName: job.Name || '',
        phone: '',
        address: '',
        serviceType: job.service_id_c?.Name || '',
        description: job.services_c || '',
        scheduledDate: job.scheduled_date_c || new Date().toISOString(),
        status: job.status_c || 'Scheduled',
        price: job.price_c || job.estimated_cost_c || 0,
        createdAt: job.created_at_c || new Date().toISOString(),
        updatedAt: job.updated_at_c,
        serviceId: job.service_id_c?.Id,
        estimatedCost: job.estimated_cost_c || 0,
        estimatedDuration: job.estimated_duration_c || 0,
        services: job.services_c || '',
        notes: job.notes_c ? JSON.parse(job.notes_c) : [],
        photos: job.photos_c ? JSON.parse(job.photos_c) : []
      }));

      return transformedData;
    } catch (error) {
      if (error?.response?.data?.message) {
        console.error("Error fetching jobs:", error?.response?.data?.message);
      } else {
        console.error(error.message);
      }
      return [];
    }
  }

  async getById(id) {
    try {
      const params = {
        fields: [
          { field: { Name: "Id" } },
          { field: { Name: "Name" } },
          { field: { Name: "Tags" } },
          { field: { Name: "scheduled_date_c" } },
          { field: { Name: "status_c" } },
          { field: { Name: "estimated_cost_c" } },
          { field: { Name: "estimated_duration_c" } },
          { field: { Name: "services_c" } },
          { field: { Name: "notes_c" } },
          { field: { Name: "photos_c" } },
          { field: { Name: "created_at_c" } },
          { field: { Name: "updated_at_c" } },
          { field: { Name: "price_c" } },
          { field: { Name: "service_id_c" } }
        ]
      };

      const response = await this.apperClient.getRecordById(this.tableName, parseInt(id), params);
      
      if (!response || !response.data) {
        return null;
      }

      const job = response.data;
      return {
        Id: job.Id,
        clientName: job.Name || '',
        phone: '',
        address: '',
        serviceType: job.service_id_c?.Name || '',
        description: job.services_c || '',
        scheduledDate: job.scheduled_date_c || new Date().toISOString(),
        status: job.status_c || 'Scheduled',
        price: job.price_c || job.estimated_cost_c || 0,
        createdAt: job.created_at_c || new Date().toISOString(),
        updatedAt: job.updated_at_c,
        serviceId: job.service_id_c?.Id,
        estimatedCost: job.estimated_cost_c || 0,
        estimatedDuration: job.estimated_duration_c || 0,
        services: job.services_c || '',
        notes: job.notes_c ? JSON.parse(job.notes_c) : [],
        photos: job.photos_c ? JSON.parse(job.photos_c) : []
      };
    } catch (error) {
      if (error?.response?.data?.message) {
        console.error(`Error fetching job with ID ${id}:`, error?.response?.data?.message);
      } else {
        console.error(error.message);
      }
      return null;
    }
  }

  async create(jobData) {
    try {
      const params = {
        records: [
          {
            Name: jobData.clientName || jobData.title || '',
            Tags: jobData.tags || '',
            scheduled_date_c: jobData.scheduledDate || new Date().toISOString(),
            status_c: jobData.status || 'Scheduled',
            estimated_cost_c: parseFloat(jobData.estimatedCost || jobData.price || 0),
            estimated_duration_c: parseFloat(jobData.estimatedDuration || 0),
            services_c: jobData.description || jobData.services || '',
            notes_c: JSON.stringify(jobData.notes || []),
            photos_c: JSON.stringify(jobData.photos || []),
            created_at_c: new Date().toISOString(),
            price_c: parseFloat(jobData.price || jobData.estimatedCost || 0),
            service_id_c: jobData.serviceId ? parseInt(jobData.serviceId) : null
          }
        ]
      };

      const response = await this.apperClient.createRecord(this.tableName, params);
      
      if (!response.success) {
        console.error(response.message);
        toast.error(response.message);
        return null;
      }

      if (response.results) {
        const successfulRecords = response.results.filter(result => result.success);
        const failedRecords = response.results.filter(result => !result.success);
        
        if (failedRecords.length > 0) {
          console.error(`Failed to create jobs ${failedRecords.length} records:${JSON.stringify(failedRecords)}`);
          
          failedRecords.forEach(record => {
            record.errors?.forEach(error => {
              toast.error(`${error.fieldLabel}: ${error.message}`);
            });
            if (record.message) toast.error(record.message);
          });
        }
        
        return successfulRecords.length > 0 ? successfulRecords[0].data : null;
      }
    } catch (error) {
      if (error?.response?.data?.message) {
        console.error("Error creating job:", error?.response?.data?.message);
      } else {
        console.error(error.message);
      }
      return null;
    }
  }

  async update(id, updateData) {
    try {
      const updateFields = {
        Id: parseInt(id)
      };

      // Only include updateable fields
      if (updateData.clientName !== undefined) updateFields.Name = updateData.clientName;
      if (updateData.tags !== undefined) updateFields.Tags = updateData.tags;
      if (updateData.scheduledDate !== undefined) updateFields.scheduled_date_c = updateData.scheduledDate;
      if (updateData.status !== undefined) updateFields.status_c = updateData.status;
      if (updateData.estimatedCost !== undefined) updateFields.estimated_cost_c = parseFloat(updateData.estimatedCost);
      if (updateData.estimatedDuration !== undefined) updateFields.estimated_duration_c = parseFloat(updateData.estimatedDuration);
      if (updateData.services !== undefined || updateData.description !== undefined) {
        updateFields.services_c = updateData.services || updateData.description || '';
      }
      if (updateData.notes !== undefined) updateFields.notes_c = JSON.stringify(updateData.notes);
      if (updateData.photos !== undefined) updateFields.photos_c = JSON.stringify(updateData.photos);
      if (updateData.price !== undefined) updateFields.price_c = parseFloat(updateData.price);
      if (updateData.serviceId !== undefined) updateFields.service_id_c = updateData.serviceId ? parseInt(updateData.serviceId) : null;

      updateFields.updated_at_c = new Date().toISOString();

      const params = {
        records: [updateFields]
      };

      const response = await this.apperClient.updateRecord(this.tableName, params);
      
      if (!response.success) {
        console.error(response.message);
        toast.error(response.message);
        return null;
      }

      if (response.results) {
        const successfulUpdates = response.results.filter(result => result.success);
        const failedUpdates = response.results.filter(result => !result.success);
        
        if (failedUpdates.length > 0) {
          console.error(`Failed to update jobs ${failedUpdates.length} records:${JSON.stringify(failedUpdates)}`);
          
          failedUpdates.forEach(record => {
            record.errors?.forEach(error => {
              toast.error(`${error.fieldLabel}: ${error.message}`);
            });
            if (record.message) toast.error(record.message);
          });
        }
        
        return successfulUpdates.length > 0 ? successfulUpdates[0].data : null;
      }
    } catch (error) {
      if (error?.response?.data?.message) {
        console.error("Error updating job:", error?.response?.data?.message);
      } else {
        console.error(error.message);
      }
      return null;
    }
  }

  async delete(id) {
    try {
      const params = {
        RecordIds: [parseInt(id)]
      };

      const response = await this.apperClient.deleteRecord(this.tableName, params);
      
      if (!response.success) {
        console.error(response.message);
        toast.error(response.message);
        return false;
      }

      if (response.results) {
        const successfulDeletions = response.results.filter(result => result.success);
        const failedDeletions = response.results.filter(result => !result.success);
        
        if (failedDeletions.length > 0) {
          console.error(`Failed to delete jobs ${failedDeletions.length} records:${JSON.stringify(failedDeletions)}`);
          
          failedDeletions.forEach(record => {
            if (record.message) toast.error(record.message);
          });
        }
        
        return successfulDeletions.length > 0;
      }
    } catch (error) {
      if (error?.response?.data?.message) {
        console.error("Error deleting job:", error?.response?.data?.message);
      } else {
        console.error(error.message);
      }
      return false;
    }
  }

  // Notes management methods
  async addNote(jobId, noteText) {
    const job = await this.getById(jobId);
    if (!job) throw new Error('Job not found');
    
    const newNote = {
      Id: Date.now(),
      text: noteText,
      createdAt: new Date().toISOString()
    };
    
    const updatedNotes = [...(job.notes || []), newNote];
    return await this.update(jobId, { notes: updatedNotes });
  }

  async updateNote(jobId, noteId, noteText) {
    const job = await this.getById(jobId);
    if (!job || !job.notes) throw new Error('Job or note not found');
    
    const noteIndex = job.notes.findIndex(note => note.Id === noteId);
    if (noteIndex === -1) throw new Error('Note not found');
    
    const updatedNotes = [...job.notes];
    updatedNotes[noteIndex] = {
      ...updatedNotes[noteIndex],
      text: noteText,
      updatedAt: new Date().toISOString()
    };
    
    return await this.update(jobId, { notes: updatedNotes });
  }

  async deleteNote(jobId, noteId) {
    const job = await this.getById(jobId);
    if (!job || !job.notes) throw new Error('Job or note not found');
    
    const updatedNotes = job.notes.filter(note => note.Id !== noteId);
    return await this.update(jobId, { notes: updatedNotes });
  }

  // Photos management methods
  async addPhoto(jobId, photoData) {
    const job = await this.getById(jobId);
    if (!job) throw new Error('Job not found');
    
    const newPhoto = {
      Id: Date.now(),
      name: photoData.name,
      url: photoData.url,
      size: photoData.size,
      type: photoData.type,
      createdAt: new Date().toISOString()
    };
    
    const updatedPhotos = [...(job.photos || []), newPhoto];
    return await this.update(jobId, { photos: updatedPhotos });
  }

  async deletePhoto(jobId, photoId) {
    const job = await this.getById(jobId);
    if (!job || !job.photos) throw new Error('Job or photo not found');
    
    const updatedPhotos = job.photos.filter(photo => photo.Id !== photoId);
    return await this.update(jobId, { photos: updatedPhotos });
  }

  // Print and Email estimate methods (keeping existing functionality)
  async printEstimate(estimateData) {
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