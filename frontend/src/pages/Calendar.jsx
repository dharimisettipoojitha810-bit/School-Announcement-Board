import React, { useEffect, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import api from '../services/api';
import { Calendar as CalendarIcon, ChevronLeft, ChevronRight, AlertCircle, Eye } from 'lucide-react';

const CalendarPage = () => {
  const { showToast } = useAuth();
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentDate, setCurrentDate] = useState(new Date(2026, 4, 21)); // Locked to May 2026 for seeder compatibility
  const [selectedDayEvents, setSelectedDayEvents] = useState([]);
  const [activeDay, setActiveDay] = useState(21); // Default selected active day in May

  useEffect(() => {
    const loadEvents = async () => {
      setLoading(true);
      try {
        const res = await api.announcements.getCalendar();
        setEvents(res.data);
        
        // Find events on default active day (May 21, 2026)
        const dayEvents = res.data.filter(e => {
          const eDate = new Date(e.eventDate);
          return eDate.getFullYear() === 2026 && eDate.getMonth() === 4 && eDate.getDate() === 21;
        });
        setSelectedDayEvents(dayEvents);
      } catch (error) {
        showToast('Error loading events: ' + error.message, 'error');
      } finally {
        setLoading(false);
      }
    };
    loadEvents();
  }, []);

  const getDaysInMonth = (year, month) => {
    return new Date(year, month + 1, 0).getDate();
  };

  const getFirstDayOfMonth = (year, month) => {
    return new Date(year, month, 1).getDay();
  };

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth(); // 4 = May
  
  const daysInMonth = getDaysInMonth(year, month);
  const firstDayIndex = getFirstDayOfMonth(year, month);

  // Month names array
  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  const handlePrevMonth = () => {
    setCurrentDate(new Date(year, month - 1, 1));
  };

  const handleNextMonth = () => {
    setCurrentDate(new Date(year, month + 1, 1));
  };

  const handleDayClick = (dayNum) => {
    setActiveDay(dayNum);
    const dayEvents = events.filter(e => {
      const eDate = new Date(e.eventDate);
      return eDate.getFullYear() === year && eDate.getMonth() === month && eDate.getDate() === dayNum;
    });
    setSelectedDayEvents(dayEvents);
  };

  // Generate calendar days structure
  const renderCalendarGrid = () => {
    const grid = [];
    // Add empty slots for days of prev month
    for (let i = 0; i < firstDayIndex; i++) {
      grid.push(<div key={`empty-${i}`} className="h-14 border border-gray-900 bg-gray-950/10 opacity-30" />);
    }

    // Add days of current month
    for (let day = 1; day <= daysInMonth; day++) {
      const isToday = day === 21 && month === 4 && year === 2026; // Highlight today
      const isActive = day === activeDay;
      
      // Check if day has any events
      const dayHasEvents = events.some(e => {
        const eDate = new Date(e.eventDate);
        return eDate.getFullYear() === year && eDate.getMonth() === month && eDate.getDate() === day;
      });

      // Get event bullet category color
      const dayEventItems = events.filter(e => {
        const eDate = new Date(e.eventDate);
        return eDate.getFullYear() === year && eDate.getMonth() === month && eDate.getDate() === day;
      });

      grid.push(
        <div
          key={`day-${day}`}
          onClick={() => handleDayClick(day)}
          className={`h-14 border border-gray-800/60 p-1 flex flex-col justify-between cursor-pointer transition-all relative ${
            isActive ? 'bg-indigo-600/10 border-indigo-500/40 text-white' : 'bg-gray-900/10 hover:bg-gray-850/30'
          }`}
        >
          <div className="flex justify-between items-center">
            <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${
              isToday ? 'bg-indigo-600 text-white font-bold' : isActive ? 'text-indigo-400' : 'text-gray-400'
            }`}>
              {day}
            </span>
          </div>

          {/* Dots representing events */}
          {dayHasEvents && (
            <div className="flex gap-1 overflow-x-hidden pb-0.5 justify-center">
              {dayEventItems.map((de, idx) => (
                <div
                  key={idx}
                  style={{ backgroundColor: de.category?.colorHex || '#6366F1' }}
                  className="w-1.5 h-1.5 rounded-full shrink-0"
                  title={de.title}
                />
              ))}
            </div>
          )}
        </div>
      );
    }

    return grid;
  };

  return (
    <div className="space-y-6">
      <div className="border-b border-gray-800 pb-5">
        <h1 className="text-2xl font-bold text-white tracking-tight flex items-center gap-2">
          <CalendarIcon className="text-indigo-400" />
          <span>Interactive School Calendar</span>
        </h1>
        <p className="text-sm text-gray-400 mt-1">Cross-check academic exam grids, sports day registers, and vacation dates.</p>
      </div>

      {loading ? (
        <div className="flex items-center justify-center min-h-[40vh]">
          <div className="w-8 h-8 border-3 border-indigo-500 border-t-transparent rounded-full animate-spin" />
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Columns: Monthly Calendar grid */}
          <div className="lg:col-span-2 glass-card p-5 rounded-3xl border border-gray-800">
            {/* Header navigator */}
            <div className="flex items-center justify-between mb-4 pb-2 border-b border-gray-800">
              <h2 className="text-md font-bold text-white tracking-tight">
                {monthNames[month]} {year}
              </h2>
              <div className="flex items-center gap-1.5">
                <button onClick={handlePrevMonth} className="p-1 border border-gray-800 bg-gray-900/30 hover:text-white text-gray-400 rounded-lg">
                  <ChevronLeft size={16} />
                </button>
                <button onClick={handleNextMonth} className="p-1 border border-gray-800 bg-gray-900/30 hover:text-white text-gray-400 rounded-lg">
                  <ChevronRight size={16} />
                </button>
              </div>
            </div>

            {/* Days label header */}
            <div className="grid grid-cols-7 gap-0 text-center text-[10px] font-bold text-gray-500 uppercase tracking-widest pb-2">
              <div>Sun</div>
              <div>Mon</div>
              <div>Tue</div>
              <div>Wed</div>
              <div>Thu</div>
              <div>Fri</div>
              <div>Sat</div>
            </div>

            {/* Main Calendar Grid */}
            <div className="grid grid-cols-7 gap-0 border-t border-l border-gray-800 rounded-lg overflow-hidden bg-gray-950/20">
              {renderCalendarGrid()}
            </div>
          </div>

          {/* Right Column: Day Schedule details agenda */}
          <div className="glass-card p-5 rounded-3xl border border-gray-800 flex flex-col h-fit justify-between">
            <div>
              <h3 className="text-sm font-bold text-white border-b border-gray-800 pb-3 mb-4">
                Events for {monthNames[month]} {activeDay}, {year}
              </h3>

              <div className="flex flex-col gap-3">
                {selectedDayEvents.length === 0 ? (
                  <div className="text-center py-8">
                    <AlertCircle className="mx-auto text-gray-600 mb-2" size={24} />
                    <p className="text-xs text-gray-500">No events scheduled for this academic day.</p>
                  </div>
                ) : (
                  selectedDayEvents.map(evt => (
                    <div
                      key={evt._id}
                      className="p-3 bg-gray-900/30 border border-gray-800/80 rounded-2xl space-y-1.5"
                    >
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <span 
                          style={{ backgroundColor: `${evt.category?.colorHex}15`, color: evt.category?.colorHex, borderColor: `${evt.category?.colorHex}30` }}
                          className="text-[9px] font-extrabold uppercase border px-2 py-0.5 rounded-full"
                        >
                          {evt.category?.name}
                        </span>
                        {evt.priority === 'urgent' && <span className="text-[9px] font-bold bg-red-500/10 text-red-400 px-2 py-0.5 rounded-full">Urgent</span>}
                      </div>

                      <h4 className="text-xs font-bold text-white tracking-tight leading-snug">{evt.title}</h4>
                      <p className="text-[10px] text-gray-400 line-clamp-2 leading-relaxed">{evt.content.replace(/\*\*|_/g, '')}</p>
                    </div>
                  ))
                )}
              </div>
            </div>

            <div className="border-t border-gray-800/60 pt-4 mt-6 text-[10px] text-gray-500 leading-relaxed">
              * Upcoming dates represent linked announcements. Click card details on the bulletin board page to view files, sign consent slips, or submit Q&A queries.
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CalendarPage;
