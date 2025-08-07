import React, { useState, useEffect, useCallback } from 'react';
import { toast } from 'react-toastify';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, startOfWeek, endOfWeek, addDays, subDays, addWeeks, subWeeks, addMonths, subMonths, isSameDay, isSameMonth, isToday, parseISO, setHours, setMinutes } from 'date-fns';
import { DndProvider, useDrag, useDrop } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import { TouchBackend } from 'react-dnd-touch-backend';
import { MultiBackend, TouchTransition } from 'react-dnd-multi-backend';
import ApperIcon from '@/components/ApperIcon';
import Button from '@/components/atoms/Button';
import Card from '@/components/atoms/Card';
import Loading from '@/components/ui/Loading';
import Error from '@/components/ui/Error';
import { jobService } from '@/services/api/jobService';

const HTML5toTouch = {
  backends: [
    {
      id: 'html5',
      backend: HTML5Backend,
    },
    {
      id: 'touch',
      backend: TouchBackend,
      options: { enableMouseEvents: true },
      preview: true,
      transition: TouchTransition,
    },
  ],
};

const serviceTypeColors = {
  'Plumbing': 'bg-blue-100 border-blue-300 text-blue-800',
  'Electrical': 'bg-yellow-100 border-yellow-300 text-yellow-800',
  'HVAC': 'bg-green-100 border-green-300 text-green-800',
  'Carpentry': 'bg-orange-100 border-orange-300 text-orange-800',
  'Painting': 'bg-purple-100 border-purple-300 text-purple-800',
  'Roofing': 'bg-red-100 border-red-300 text-red-800',
  'Flooring': 'bg-indigo-100 border-indigo-300 text-indigo-800',
  'Appliance Repair': 'bg-pink-100 border-pink-300 text-pink-800',
  'General Maintenance': 'bg-gray-100 border-gray-300 text-gray-800',
};

const JobCard = ({ job, onUpdate }) => {
  const [{ isDragging }, drag] = useDrag({
    type: 'job',
    item: { job },
    collect: (monitor) => ({
      isDragging: monitor.isDragging(),
    }),
  });

  const serviceColorClass = serviceTypeColors[job.serviceType] || 'bg-gray-100 border-gray-300 text-gray-800';

  return (
    <div
      ref={drag}
      className={`calendar-job-card p-2 mb-1 border rounded cursor-move text-xs ${serviceColorClass} ${
        isDragging ? 'opacity-50' : 'hover:shadow-sm'
      }`}
    >
      <div className="font-medium truncate">{job.clientName}</div>
      <div className="text-xs opacity-75 truncate">{job.serviceType}</div>
      <div className="text-xs opacity-75">{format(parseISO(job.scheduledDate), 'HH:mm')}</div>
    </div>
  );
};

const TimeSlot = ({ date, hour, jobs, onJobDrop, view }) => {
  const [{ isOver }, drop] = useDrop({
    accept: 'job',
    drop: (item) => {
      const newDate = setHours(setMinutes(date, 0), hour);
      onJobDrop(item.job, newDate);
    },
    collect: (monitor) => ({
      isOver: monitor.isOver(),
    }),
  });

  const slotJobs = jobs.filter(job => {
    const jobDate = parseISO(job.scheduledDate);
    return isSameDay(jobDate, date) && jobDate.getHours() === hour;
  });

  return (
    <div
      ref={drop}
      className={`calendar-time-slot min-h-16 border-r border-b border-gray-200 p-1 ${
        isOver ? 'bg-primary-50' : 'hover:bg-gray-50'
      }`}
    >
      {slotJobs.map(job => (
        <JobCard key={job.Id} job={job} />
      ))}
    </div>
  );
};

const DayCell = ({ date, jobs, onJobDrop, isCurrentMonth, view }) => {
  const [{ isOver }, drop] = useDrop({
    accept: 'job',
    drop: (item) => {
      const newDate = setHours(setMinutes(date, 9), 0); // Default to 9 AM
      onJobDrop(item.job, newDate);
    },
    collect: (monitor) => ({
      isOver: monitor.isOver(),
    }),
  });

  const dayJobs = jobs.filter(job => isSameDay(parseISO(job.scheduledDate), date));

  return (
    <div
      ref={drop}
      className={`calendar-day-cell min-h-32 border-r border-b border-gray-200 p-2 ${
        !isCurrentMonth ? 'bg-gray-50 text-gray-400' : ''
      } ${isToday(date) ? 'bg-blue-50 border-blue-300' : ''} ${
        isOver ? 'bg-primary-50' : 'hover:bg-gray-50'
      }`}
    >
      <div className="font-medium text-sm mb-1">{format(date, 'd')}</div>
      <div className="space-y-1">
        {dayJobs.slice(0, 3).map(job => (
          <JobCard key={job.Id} job={job} />
        ))}
        {dayJobs.length > 3 && (
          <div className="text-xs text-gray-500 font-medium">
            +{dayJobs.length - 3} more
          </div>
        )}
      </div>
    </div>
  );
};

const Calendar = () => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [view, setView] = useState('month'); // month, week, day
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const loadJobs = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await jobService.getAll();
      setJobs(data);
    } catch (err) {
      setError('Failed to load jobs');
      console.error('Error loading jobs:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadJobs();
  }, [loadJobs]);

  const handleJobDrop = async (job, newDate) => {
    try {
      const updatedJob = await jobService.update(job.Id, {
        scheduledDate: newDate.toISOString()
      });
      
      setJobs(prev => prev.map(j => j.Id === job.Id ? updatedJob : j));
      toast.success(`Job rescheduled to ${format(newDate, 'MMM d, yyyy HH:mm')}`);
    } catch (err) {
      toast.error('Failed to reschedule job');
      console.error('Error updating job:', err);
    }
  };

  const navigatePrevious = () => {
    if (view === 'month') {
      setCurrentDate(prev => subMonths(prev, 1));
    } else if (view === 'week') {
      setCurrentDate(prev => subWeeks(prev, 1));
    } else {
      setCurrentDate(prev => subDays(prev, 1));
    }
  };

  const navigateNext = () => {
    if (view === 'month') {
      setCurrentDate(prev => addMonths(prev, 1));
    } else if (view === 'week') {
      setCurrentDate(prev => addWeeks(prev, 1));
    } else {
      setCurrentDate(prev => addDays(prev, 1));
    }
  };

  const navigateToday = () => {
    setCurrentDate(new Date());
  };

  const getDateRange = () => {
    if (view === 'month') {
      const start = startOfWeek(startOfMonth(currentDate));
      const end = endOfWeek(endOfMonth(currentDate));
      return eachDayOfInterval({ start, end });
    } else if (view === 'week') {
      const start = startOfWeek(currentDate);
      const end = endOfWeek(currentDate);
      return eachDayOfInterval({ start, end });
    } else {
      return [currentDate];
    }
  };

  const getViewTitle = () => {
    if (view === 'month') {
      return format(currentDate, 'MMMM yyyy');
    } else if (view === 'week') {
      const start = startOfWeek(currentDate);
      const end = endOfWeek(currentDate);
      return `${format(start, 'MMM d')} - ${format(end, 'MMM d, yyyy')}`;
    } else {
      return format(currentDate, 'EEEE, MMMM d, yyyy');
    }
  };

  const renderMonthView = () => {
    const days = getDateRange();
    const weekDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

    return (
      <div className="calendar-grid">
        <div className="grid grid-cols-7 border-b border-gray-300">
          {weekDays.map(day => (
            <div key={day} className="p-3 font-semibold text-center bg-gray-100 border-r border-gray-200 last:border-r-0">
              {day}
            </div>
          ))}
        </div>
        <div className="grid grid-cols-7">
          {days.map((date, index) => (
            <DayCell
              key={index}
              date={date}
              jobs={jobs}
              onJobDrop={handleJobDrop}
              isCurrentMonth={isSameMonth(date, currentDate)}
              view={view}
            />
          ))}
        </div>
      </div>
    );
  };

  const renderWeekView = () => {
    const days = getDateRange();
    const hours = Array.from({ length: 12 }, (_, i) => i + 7); // 7 AM to 6 PM

    return (
      <div className="calendar-grid">
        <div className="grid grid-cols-8 border-b border-gray-300">
          <div className="p-3 font-semibold bg-gray-100 border-r border-gray-200">Time</div>
          {days.map(date => (
            <div key={date.toISOString()} className="p-3 font-semibold text-center bg-gray-100 border-r border-gray-200 last:border-r-0">
              <div>{format(date, 'EEE')}</div>
              <div className={`text-sm ${isToday(date) ? 'text-blue-600 font-bold' : ''}`}>
                {format(date, 'd')}
              </div>
            </div>
          ))}
        </div>
        {hours.map(hour => (
          <div key={hour} className="grid grid-cols-8">
            <div className="p-2 text-sm font-medium text-gray-600 bg-gray-50 border-r border-b border-gray-200">
              {format(setHours(new Date(), hour), 'h:mm a')}
            </div>
            {days.map(date => (
              <TimeSlot
                key={`${date.toISOString()}-${hour}`}
                date={date}
                hour={hour}
                jobs={jobs}
                onJobDrop={handleJobDrop}
                view={view}
              />
            ))}
          </div>
        ))}
      </div>
    );
  };

  const renderDayView = () => {
    const hours = Array.from({ length: 12 }, (_, i) => i + 7); // 7 AM to 6 PM

    return (
      <div className="calendar-grid">
        <div className="grid grid-cols-2 border-b border-gray-300">
          <div className="p-3 font-semibold bg-gray-100 border-r border-gray-200">Time</div>
          <div className="p-3 font-semibold text-center bg-gray-100">
            <div>{format(currentDate, 'EEEE')}</div>
            <div className={`text-sm ${isToday(currentDate) ? 'text-blue-600 font-bold' : ''}`}>
              {format(currentDate, 'MMMM d, yyyy')}
            </div>
          </div>
        </div>
        {hours.map(hour => (
          <div key={hour} className="grid grid-cols-2">
            <div className="p-3 text-sm font-medium text-gray-600 bg-gray-50 border-r border-b border-gray-200">
              {format(setHours(new Date(), hour), 'h:mm a')}
            </div>
            <TimeSlot
              date={currentDate}
              hour={hour}
              jobs={jobs}
              onJobDrop={handleJobDrop}
              view={view}
            />
          </div>
        ))}
      </div>
    );
  };

  if (loading) return <Loading />;
  if (error) return <Error message={error} onRetry={loadJobs} />;

  return (
    <DndProvider backend={MultiBackend} options={HTML5toTouch}>
      <div className="space-y-6">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-slate-900 font-display">
              Schedule Calendar
            </h1>
            <p className="text-slate-600 mt-1">
              Drag and drop jobs to reschedule them visually
            </p>
          </div>

          <div className="flex items-center gap-3">
            <div className="flex rounded-lg border border-gray-300 overflow-hidden">
              {['month', 'week', 'day'].map(viewType => (
                <Button
                  key={viewType}
                  variant={view === viewType ? 'primary' : 'outline'}
                  size="sm"
                  className={`rounded-none border-0 ${
                    view === viewType ? 'bg-primary-600 text-white' : 'bg-white hover:bg-gray-50'
                  }`}
                  onClick={() => setView(viewType)}
                >
                  {viewType.charAt(0).toUpperCase() + viewType.slice(1)}
                </Button>
              ))}
            </div>
          </div>
        </div>

        <Card className="p-0">
          <div className="flex items-center justify-between p-4 border-b border-gray-200">
            <div className="flex items-center gap-3">
              <Button variant="outline" size="sm" onClick={navigatePrevious}>
                <ApperIcon name="ChevronLeft" size={16} />
              </Button>
              <Button variant="outline" size="sm" onClick={navigateNext}>
                <ApperIcon name="ChevronRight" size={16} />
              </Button>
              <Button variant="outline" size="sm" onClick={navigateToday}>
                Today
              </Button>
            </div>

            <h2 className="text-xl font-semibold text-slate-900 font-display">
              {getViewTitle()}
            </h2>

            <div className="flex items-center gap-2">
              <ApperIcon name="Info" size={16} className="text-gray-500" />
              <span className="text-sm text-gray-600">Drag jobs to reschedule</span>
            </div>
          </div>

          <div className="overflow-auto">
            {view === 'month' && renderMonthView()}
            {view === 'week' && renderWeekView()}
            {view === 'day' && renderDayView()}
          </div>
        </Card>

        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-3 p-4 bg-gray-50 rounded-lg">
          <div className="text-sm font-semibold text-gray-700 col-span-full mb-2">Service Types:</div>
          {Object.entries(serviceTypeColors).map(([type, colorClass]) => (
            <div key={type} className={`flex items-center gap-2 text-xs p-2 rounded border ${colorClass}`}>
              <div className="w-2 h-2 rounded-full bg-current opacity-60"></div>
              <span className="truncate">{type}</span>
            </div>
          ))}
        </div>
      </div>
    </DndProvider>
  );
};

export default Calendar;