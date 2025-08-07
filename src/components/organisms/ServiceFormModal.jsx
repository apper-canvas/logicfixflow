import { useState, useEffect } from 'react';
import Button from '@/components/atoms/Button';
import Input from '@/components/atoms/Input';
import Card from '@/components/atoms/Card';
import ApperIcon from '@/components/ApperIcon';
import { getServiceCategories } from '@/services/api/serviceService';

const ServiceFormModal = ({ isOpen, onClose, onSubmit, service = null }) => {
  const [formData, setFormData] = useState({
    name: '',
    category: '',
    description: '',
    pricingType: 'hourly',
    hourlyRate: '',
    flatRate: '',
    estimatedDuration: ''
  });

  const [categories] = useState(getServiceCategories());

  useEffect(() => {
    if (service) {
      setFormData({
        name: service.name || '',
        category: service.category || '',
        description: service.description || '',
        pricingType: service.pricingType || 'hourly',
        hourlyRate: service.hourlyRate || '',
        flatRate: service.flatRate || '',
        estimatedDuration: service.estimatedDuration || ''
      });
    } else {
      setFormData({
        name: '',
        category: '',
        description: '',
        pricingType: 'hourly',
        hourlyRate: '',
        flatRate: '',
        estimatedDuration: ''
      });
    }
  }, [service, isOpen]);

  const handleSubmit = (e) => {
    e.preventDefault();
    
    const submitData = {
      ...formData,
      hourlyRate: formData.pricingType === 'hourly' ? parseFloat(formData.hourlyRate) : null,
      flatRate: formData.pricingType === 'flat' ? parseFloat(formData.flatRate) : null,
      estimatedDuration: parseFloat(formData.estimatedDuration)
    };

    onSubmit(submitData);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="p-6">
<div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-slate-900 font-display">
              {service ? 'Edit Skill' : 'Add New Skill'}
            </h2>
            <Button
              variant="ghost"
              size="sm"
              onClick={onClose}
              className="h-8 w-8 p-0"
            >
              <ApperIcon name="X" size={18} />
            </Button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Skill Name *
                </label>
                <Input
                  name="name"
                  value={formData.name}
onChange={handleChange}
                  placeholder="e.g., Faucet Repair, Drywall Installation"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Category *
                </label>
                <select
                  name="category"
                  value={formData.category}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  required
                >
                  <option value="">Select a category</option>
                  {categories.map(category => (
                    <option key={category} value={category}>
                      {category}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Description *
              </label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleChange}
                rows={3}
rows={3}
                className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                placeholder="Describe what this skill includes and your experience level..."
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-3">
                Pricing Model *
              </label>
              <div className="flex gap-4 mb-4">
                <label className="flex items-center">
                  <input
                    type="radio"
                    name="pricingType"
                    value="hourly"
                    checked={formData.pricingType === 'hourly'}
                    onChange={handleChange}
                    className="mr-2"
                  />
                  Hourly Rate
                </label>
                <label className="flex items-center">
                  <input
                    type="radio"
                    name="pricingType"
                    value="flat"
                    checked={formData.pricingType === 'flat'}
                    onChange={handleChange}
                    className="mr-2"
                  />
                  Flat Rate
                </label>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {formData.pricingType === 'hourly' ? (
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">
                      Hourly Rate ($) *
                    </label>
                    <Input
                      name="hourlyRate"
                      type="number"
                      value={formData.hourlyRate}
                      onChange={handleChange}
                      placeholder="45"
                      min="0"
                      step="0.01"
                      required
                    />
                  </div>
                ) : (
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">
                      Flat Rate ($) *
                    </label>
                    <Input
                      name="flatRate"
                      type="number"
                      value={formData.flatRate}
                      onChange={handleChange}
                      placeholder="85"
                      min="0"
                      step="0.01"
                      required
                    />
                  </div>
                )}

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Estimated Duration (hours) *
                  </label>
                  <Input
                    name="estimatedDuration"
                    type="number"
                    value={formData.estimatedDuration}
                    onChange={handleChange}
                    placeholder="2"
                    min="0.1"
                    step="0.1"
                    required
                  />
                </div>
              </div>
            </div>

            <div className="flex gap-3 pt-4">
              <Button type="submit" className="flex-1">
                <ApperIcon name="Save" size={16} className="mr-2" />
                {service ? 'Update Service' : 'Add Service'}
              </Button>
              <Button type="button" variant="outline" onClick={onClose}>
                Cancel
              </Button>
            </div>
          </form>
        </div>
      </Card>
    </div>
  );
};

export default ServiceFormModal;