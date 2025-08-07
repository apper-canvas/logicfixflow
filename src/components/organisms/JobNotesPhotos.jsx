import { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import { format } from 'date-fns';
import Button from '@/components/atoms/Button';
import Input from '@/components/atoms/Input';
import Card from '@/components/atoms/Card';
import Loading from '@/components/ui/Loading';
import ApperIcon from '@/components/ApperIcon';
import { jobService } from '@/services/api/jobService';

const JobNotesPhotos = ({ jobId, onClose }) => {
  const [job, setJob] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('notes');
  const [newNote, setNewNote] = useState('');
  const [editingNote, setEditingNote] = useState(null);
  const [editNoteText, setEditNoteText] = useState('');
  const [addingNote, setAddingNote] = useState(false);
  const [uploadingPhoto, setUploadingPhoto] = useState(false);

  useEffect(() => {
    loadJob();
  }, [jobId]);

  const loadJob = async () => {
    try {
      setLoading(true);
      const jobData = await jobService.getById(jobId);
      setJob(jobData);
    } catch (err) {
      toast.error('Failed to load job details');
    } finally {
      setLoading(false);
    }
  };

  const handleAddNote = async () => {
    if (!newNote.trim()) {
      toast.error('Please enter a note');
      return;
    }

    try {
      setAddingNote(true);
      await jobService.addNote(jobId, newNote.trim());
      setNewNote('');
      toast.success('Note added successfully');
      await loadJob();
    } catch (err) {
      toast.error('Failed to add note');
    } finally {
      setAddingNote(false);
    }
  };

  const handleEditNote = (note) => {
    setEditingNote(note.Id);
    setEditNoteText(note.text);
  };

  const handleSaveNote = async () => {
    if (!editNoteText.trim()) {
      toast.error('Please enter a note');
      return;
    }

    try {
      await jobService.updateNote(jobId, editingNote, editNoteText.trim());
      setEditingNote(null);
      setEditNoteText('');
      toast.success('Note updated successfully');
      await loadJob();
    } catch (err) {
      toast.error('Failed to update note');
    }
  };

  const handleDeleteNote = async (noteId) => {
    if (!confirm('Are you sure you want to delete this note?')) return;

    try {
      await jobService.deleteNote(jobId, noteId);
      toast.success('Note deleted successfully');
      await loadJob();
    } catch (err) {
      toast.error('Failed to delete note');
    }
  };

  const handlePhotoUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast.error('Please select an image file');
      return;
    }

    // Validate file size (5MB limit)
    if (file.size > 5 * 1024 * 1024) {
      toast.error('Image must be less than 5MB');
      return;
    }

    try {
      setUploadingPhoto(true);
      
      // Convert file to base64 (simulating upload)
      const reader = new FileReader();
      reader.onload = async (e) => {
        const photoData = {
          name: file.name,
          url: e.target.result,
          size: file.size,
          type: file.type
        };

        await jobService.addPhoto(jobId, photoData);
        toast.success('Photo uploaded successfully');
        await loadJob();
        setUploadingPhoto(false);
      };
      reader.readAsDataURL(file);
    } catch (err) {
      toast.error('Failed to upload photo');
      setUploadingPhoto(false);
    }
  };

  const handleDeletePhoto = async (photoId) => {
    if (!confirm('Are you sure you want to delete this photo?')) return;

    try {
      await jobService.deletePhoto(jobId, photoId);
      toast.success('Photo deleted successfully');
      await loadJob();
    } catch (err) {
      toast.error('Failed to delete photo');
    }
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  if (loading) return <Loading type="notes" />;
  if (!job) return <div>Job not found</div>;

  return (
    <div className="space-y-6">
      {/* Tab Navigation */}
      <div className="border-b border-slate-200">
        <nav className="flex space-x-8">
          <button
            onClick={() => setActiveTab('notes')}
            className={`py-2 px-1 border-b-2 font-medium text-sm transition-colors duration-200 ${
              activeTab === 'notes'
                ? 'border-primary-500 text-primary-600'
                : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300'
            }`}
          >
            <div className="flex items-center gap-2">
              <ApperIcon name="FileText" size={16} />
              Notes ({job.notes?.length || 0})
            </div>
          </button>
          <button
            onClick={() => setActiveTab('photos')}
            className={`py-2 px-1 border-b-2 font-medium text-sm transition-colors duration-200 ${
              activeTab === 'photos'
                ? 'border-primary-500 text-primary-600'
                : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300'
            }`}
          >
            <div className="flex items-center gap-2">
              <ApperIcon name="Camera" size={16} />
              Photos ({job.photos?.length || 0})
            </div>
          </button>
        </nav>
      </div>

      {/* Notes Tab */}
      {activeTab === 'notes' && (
        <div className="space-y-4">
          {/* Add New Note */}
          <Card className="p-4">
            <div className="space-y-3">
              <h3 className="font-medium text-slate-900">Add New Note</h3>
              <div className="flex gap-3">
                <div className="flex-1">
                  <textarea
                    value={newNote}
                    onChange={(e) => setNewNote(e.target.value)}
                    placeholder="Enter your note here..."
                    rows={3}
                    className="w-full px-4 py-3 rounded-lg border-2 border-slate-200 bg-white text-slate-900 placeholder:text-slate-400 focus:border-primary-500 focus:ring-2 focus:ring-primary-100 focus:outline-none transition-colors duration-200 resize-none"
                  />
                </div>
                <div className="flex flex-col gap-2">
                  <Button
                    onClick={handleAddNote}
                    disabled={addingNote || !newNote.trim()}
                    className="px-4 py-2"
                  >
                    {addingNote ? (
                      <ApperIcon name="Loader2" size={16} className="animate-spin" />
                    ) : (
                      <ApperIcon name="Plus" size={16} />
                    )}
                  </Button>
                </div>
              </div>
            </div>
          </Card>

          {/* Notes List */}
          <div className="space-y-3">
            {job.notes && job.notes.length > 0 ? (
              job.notes.map((note) => (
                <Card key={note.Id} className="p-4">
                  <div className="space-y-3">
                    {editingNote === note.Id ? (
                      <div className="space-y-3">
                        <textarea
                          value={editNoteText}
                          onChange={(e) => setEditNoteText(e.target.value)}
                          rows={3}
                          className="w-full px-4 py-3 rounded-lg border-2 border-slate-200 bg-white text-slate-900 focus:border-primary-500 focus:ring-2 focus:ring-primary-100 focus:outline-none transition-colors duration-200 resize-none"
                        />
                        <div className="flex gap-2">
                          <Button size="sm" onClick={handleSaveNote}>
                            <ApperIcon name="Check" size={14} className="mr-1" />
                            Save
                          </Button>
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            onClick={() => {
                              setEditingNote(null);
                              setEditNoteText('');
                            }}
                          >
                            Cancel
                          </Button>
                        </div>
                      </div>
                    ) : (
                      <>
                        <p className="text-slate-700">{note.text}</p>
                        <div className="flex justify-between items-center">
                          <div className="text-xs text-slate-500">
                            Added {format(new Date(note.createdAt), 'MMM d, yyyy h:mm a')}
                            {note.updatedAt && (
                              <span> • Updated {format(new Date(note.updatedAt), 'MMM d, yyyy h:mm a')}</span>
                            )}
                          </div>
                          <div className="flex gap-2">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleEditNote(note)}
                            >
                              <ApperIcon name="Edit2" size={14} />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleDeleteNote(note.Id)}
                              className="text-red-600 hover:text-red-700"
                            >
                              <ApperIcon name="Trash2" size={14} />
                            </Button>
                          </div>
                        </div>
                      </>
                    )}
                  </div>
                </Card>
              ))
            ) : (
              <Card className="p-8 text-center">
                <div className="space-y-3">
                  <div className="w-16 h-16 mx-auto bg-slate-100 rounded-full flex items-center justify-center">
                    <ApperIcon name="FileText" size={24} className="text-slate-400" />
                  </div>
                  <h3 className="font-medium text-slate-900">No notes yet</h3>
                  <p className="text-slate-600">Add your first note to keep track of important details for this job.</p>
                </div>
              </Card>
            )}
          </div>
        </div>
      )}

      {/* Photos Tab */}
      {activeTab === 'photos' && (
        <div className="space-y-4">
          {/* Upload Photo */}
          <Card className="p-4">
            <div className="space-y-3">
              <h3 className="font-medium text-slate-900">Upload Photo</h3>
              <div className="flex items-center gap-3">
                <label className="flex-1">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handlePhotoUpload}
                    className="hidden"
                    disabled={uploadingPhoto}
                  />
                  <div className="border-2 border-dashed border-slate-300 rounded-lg p-6 text-center hover:border-primary-400 cursor-pointer transition-colors">
                    {uploadingPhoto ? (
                      <div className="flex items-center justify-center gap-2">
                        <ApperIcon name="Loader2" size={20} className="animate-spin text-primary-500" />
                        <span className="text-slate-600">Uploading...</span>
                      </div>
                    ) : (
                      <div className="space-y-2">
                        <ApperIcon name="Upload" size={24} className="text-slate-400 mx-auto" />
                        <p className="text-slate-600">Click to select image or drag and drop</p>
                        <p className="text-xs text-slate-500">PNG, JPG, GIF up to 5MB</p>
                      </div>
                    )}
                  </div>
                </label>
              </div>
            </div>
          </Card>

          {/* Photos Grid */}
          {job.photos && job.photos.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {job.photos.map((photo) => (
                <Card key={photo.Id} className="p-3">
                  <div className="space-y-3">
                    <div className="aspect-square bg-slate-100 rounded-lg overflow-hidden">
                      <img
                        src={photo.url}
                        alt={photo.name}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="space-y-2">
                      <p className="font-medium text-sm truncate" title={photo.name}>
                        {photo.name}
                      </p>
                      <div className="flex justify-between items-center text-xs text-slate-500">
                        <span>{formatFileSize(photo.size)}</span>
                        <span>{format(new Date(photo.createdAt), 'MMM d, yyyy')}</span>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDeletePhoto(photo.Id)}
                        className="w-full text-red-600 hover:text-red-700"
                      >
                        <ApperIcon name="Trash2" size={14} className="mr-1" />
                        Delete
                      </Button>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          ) : (
            <Card className="p-8 text-center">
              <div className="space-y-3">
                <div className="w-16 h-16 mx-auto bg-slate-100 rounded-full flex items-center justify-center">
                  <ApperIcon name="Camera" size={24} className="text-slate-400" />
                </div>
                <h3 className="font-medium text-slate-900">No photos yet</h3>
                <p className="text-slate-600">Upload photos to document the job progress and results.</p>
              </div>
            </Card>
          )}
        </div>
      )}

      {/* Close Button */}
      <div className="flex justify-end pt-4 border-t border-slate-200">
        <Button variant="ghost" onClick={onClose}>
          Close
        </Button>
      </div>
    </div>
  );
};

export default JobNotesPhotos;