import { useState } from 'react';
import Button from '@/components/atoms/Button';
import Input from '@/components/atoms/Input';
import Card from '@/components/atoms/Card';
import ApperIcon from '@/components/ApperIcon';

const CommunicationModal = ({ client, isOpen, onClose, onSubmit }) => {
  const [formData, setFormData] = useState({
    type: 'email',
    subject: '',
    message: '',
    direction: 'outbound',
    contactPerson: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      await onSubmit({
        ...formData,
        clientId: client.Id
      });
      
      // Reset form
      setFormData({
        type: 'email',
        subject: '',
        message: '',
        direction: 'outbound',
        contactPerson: ''
      });
      
      onClose();
    } catch (error) {
      console.error('Error submitting communication:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  if (!isOpen || !client) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-lg max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-xl font-semibold text-slate-900 font-display">
                Log Communication
              </h2>
              <p className="text-sm text-slate-600 mt-1">
                with {client.name}
              </p>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={onClose}
            >
              <ApperIcon name="X" size={20} />
            </Button>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Communication Type and Direction */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Type
                </label>
                <select
                  name="type"
                  value={formData.type}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                >
                  <option value="email">Email</option>
                  <option value="phone">Phone Call</option>
                  <option value="meeting">Meeting</option>
                  <option value="text">Text Message</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Direction
                </label>
                <select
                  name="direction"
                  value={formData.direction}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                >
                  <option value="outbound">Outbound</option>
                  <option value="inbound">Inbound</option>
                </select>
              </div>
            </div>

            {/* Subject */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Subject/Topic *
              </label>
              <Input
                name="subject"
                value={formData.subject}
                onChange={handleChange}
                placeholder="Brief description of the communication"
                required
              />
            </div>

            {/* Contact Person */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Contact Person
              </label>
              <Input
                name="contactPerson"
                value={formData.contactPerson}
                onChange={handleChange}
                placeholder="Who handled this communication"
              />
            </div>

            {/* Message */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Details/Message
              </label>
              <textarea
                name="message"
                value={formData.message}
                onChange={handleChange}
                rows={4}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent resize-none"
                placeholder="Enter the details of the communication..."
              />
            </div>

            {/* Actions */}
            <div className="flex justify-end space-x-3 pt-4">
              <Button
                type="button"
                variant="ghost"
                onClick={onClose}
                disabled={isSubmitting}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <>
                    <ApperIcon name="Loader2" size={16} className="animate-spin mr-2" />
                    Logging...
                  </>
                ) : (
                  <>
                    <ApperIcon name="Save" size={16} className="mr-2" />
                    Log Communication
                  </>
                )}
              </Button>
            </div>
          </form>
        </div>
      </Card>
    </div>
  );
};

export default CommunicationModal;