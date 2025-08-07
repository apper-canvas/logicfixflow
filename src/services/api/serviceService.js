import mockServices from '@/services/mockData/services.json';

let services = [...mockServices];
let nextId = Math.max(...services.map(s => s.Id)) + 1;

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

export const getServices = () => {
  return [...services];
};

export const getServicesByCategory = () => {
  const servicesByCategory = {};
  serviceCategories.forEach(category => {
    servicesByCategory[category] = services.filter(service => 
      service.category === category && service.isActive
    );
  });
  return servicesByCategory;
};

export const getServiceById = (id) => {
  const numericId = parseInt(id);
  if (isNaN(numericId)) {
    throw new Error('Service ID must be a number');
  }
  return services.find(service => service.Id === numericId);
};

export const createService = (serviceData) => {
  const newService = {
    ...serviceData,
    Id: nextId++,
    isActive: true
  };
  
  // Validate required fields
  if (!newService.name || !newService.category || !newService.description) {
    throw new Error('Name, category, and description are required');
  }
  
  // Validate pricing
  if (newService.pricingType === 'hourly' && (!newService.hourlyRate || newService.hourlyRate <= 0)) {
    throw new Error('Hourly rate must be greater than 0');
  }
  
  if (newService.pricingType === 'flat' && (!newService.flatRate || newService.flatRate <= 0)) {
    throw new Error('Flat rate must be greater than 0');
  }
  
  services.push(newService);
  return newService;
};

export const updateService = (id, serviceData) => {
  const numericId = parseInt(id);
  if (isNaN(numericId)) {
    throw new Error('Service ID must be a number');
  }
  
  const index = services.findIndex(service => service.Id === numericId);
  if (index === -1) {
    throw new Error('Service not found');
  }
  
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
  
  services[index] = { ...services[index], ...serviceData };
  return services[index];
};

export const deleteService = (id) => {
  const numericId = parseInt(id);
  if (isNaN(numericId)) {
    throw new Error('Service ID must be a number');
  }
  
  const index = services.findIndex(service => service.Id === numericId);
  if (index === -1) {
    throw new Error('Service not found');
  }
  
  services.splice(index, 1);
  return true;
};

export const getServiceCategories = () => {
  return [...serviceCategories];
};

export const searchServices = (query) => {
  if (!query) return services;
  
  const lowercaseQuery = query.toLowerCase();
  return services.filter(service =>
    service.name.toLowerCase().includes(lowercaseQuery) ||
    service.description.toLowerCase().includes(lowercaseQuery) ||
    service.category.toLowerCase().includes(lowercaseQuery)
  );
};