import React, { useState, useEffect } from "react";
import { Homework } from "@/entities/Homework";
import { Event } from "@/entities/Event";
import { User } from "@/entities/User";
import { format, startOfMonth, endOfMonth, startOfWeek, endOfWeek, eachDayOfInterval, isSameMonth, isSameDay, addMonths, subMonths, parseISO } from "date-fns";
import { ChevronLeft, ChevronRight, Plus } from "lucide-react";
import EventForm from "../components/EventForm";
import { AnimatePresence } from "framer-motion";

// Helper to generate color from subject string
const stringToColor = (str) => {
  if (!str) return '#ccc';
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = str.charCodeAt(i) + ((hash << 5) - hash);
  }
  let color = '#';
  for (let i = 0; i < 3; i++) {
    const value = (hash >> (i * 8)) & 0xFF;
    color += ('00' + value.toString(16)).substr(-2);
  }
  return color;
};

const eventTypeColors = {
  project: '#FFB6C1',     // Light Pink
  event: '#DDA0DD',       // Plum
  deadline: '#FFA07A',    // Light Salmon
  meeting: '#98FB98',     // Pale Green
  exam: '#F0E68C'         // Khaki
};

export default function CalendarView() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [homeworks, setHomeworks] = useState([]);
  const [events, setEvents] = useState([]);
  const [showEventForm, setShowEventForm] = useState(false);
  const [selectedDate, setSelectedDate] = useState("");

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const user = await User.me(); // Fetch current user
      if (user && user.email) {
        const homeworkData = await Homework.filter({ created_by: user.email }); // Filter by user email
        const eventData = await Event.filter({ created_by: user.email });     // Filter by user email
        setHomeworks(homeworkData);
        setEvents(eventData);
      } else {
        // Handle case where user is not logged in or email is not available
        console.warn("User not logged in or email not found. Displaying no user-specific data.");
        setHomeworks([]);
        setEvents([]);
      }
    } catch (error) {
      console.error("Failed to load calendar data:", error);
      // Optionally clear data or show error message to user
      setHomeworks([]);
      setEvents([]);
    }
  };

  const monthStart = startOfMonth(currentDate);
  const monthEnd = endOfMonth(currentDate);
  const startDate = startOfWeek(monthStart);
  const endDate = endOfWeek(monthEnd);

  const days = eachDayOfInterval({ start: startDate, end: endDate });
  const dayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

  const homeworkByDate = homeworks.reduce((acc, hw) => {
    const date = hw.dueDate;
    if (!acc[date]) {
      acc[date] = [];
    }
    acc[date].push({ ...hw, type: 'homework' });
    return acc;
  }, {});

  const eventsByDate = events.reduce((acc, event) => {
    const date = event.date;
    if (!acc[date]) {
      acc[date] = [];
    }
    acc[date].push({ ...event, type: 'event' });
    return acc;
  }, {});

  // Combine homework and events
  const allItemsByDate = {};
  Object.keys(homeworkByDate).forEach(date => {
    allItemsByDate[date] = [...(homeworkByDate[date] || [])];
  });
  Object.keys(eventsByDate).forEach(date => {
    if (!allItemsByDate[date]) {
      allItemsByDate[date] = [];
    }
    allItemsByDate[date].push(...eventsByDate[date]);
  });

  const handleDateClick = (day) => {
    const dateString = format(day, 'yyyy-MM-dd');
    setSelectedDate(dateString);
    setShowEventForm(true);
  };

  const handleEventFormSubmit = () => {
    setShowEventForm(false);
    loadData(); // Reload data after form submission
  };

  const neoBrutalistButtonStyle = "p-3 bg-white border-2 border-black rounded-lg shadow-[4px_4px_0px_#000] hover:shadow-[2px_2px_0px_#000] active:shadow-[0px_0px_0px_#000] transform active:translate-x-[2px] active:translate-y-[2px] transition-all duration-150 font-bold";

  return (
    <div className="p-4 bg-white border-4 border-black rounded-xl neo-shadow">
      <div className="flex justify-between items-center mb-6">
        <button onClick={() => setCurrentDate(subMonths(currentDate, 1))} className={neoBrutalistButtonStyle}>
          <ChevronLeft />
        </button>
        <h2 className="text-3xl font-bold">{format(currentDate, "MMMM yyyy")}</h2>
        <button onClick={() => setCurrentDate(addMonths(currentDate, 1))} className={neoBrutalistButtonStyle}>
          <ChevronRight />
        </button>
      </div>

      <div className="mb-4 p-3 bg-[#F0F8FF] border-2 border-black rounded-lg">
        <p className="text-sm font-semibold">💡 <strong>Tip:</strong> Click on any date to add events or projects!</p>
      </div>

      <div className="grid grid-cols-7 border-t-2 border-l-2 border-black">
        {dayNames.map((day) => (
          <div key={day} className="font-bold text-center py-3 border-b-2 border-r-2 border-black bg-gray-200">
            {day}
          </div>
        ))}
        {days.map((day) => (
          <div
            key={day.toString()}
            onClick={() => handleDateClick(day)}
            className={`h-40 p-2 border-b-2 border-r-2 border-black overflow-y-auto cursor-pointer hover:bg-blue-50 transition-colors ${!isSameMonth(day, monthStart) ? "bg-gray-100" : "bg-white"} ${isSameDay(day, new Date()) ? 'bg-yellow-200' : ''}`}
          >
            <div className={`font-bold ${!isSameMonth(day, monthStart) ? "text-gray-400" : ""}`}>{format(day, "d")}</div>
            <div className="space-y-1 mt-1">
              {(allItemsByDate[format(day, 'yyyy-MM-dd')] || []).map(item => (
                <div 
                  key={`${item.type}-${item.id}`} 
                  className="p-1 text-xs font-semibold rounded-md border border-black truncate" 
                  style={{
                    backgroundColor: item.type === 'homework' 
                      ? stringToColor(item.subject) 
                      : eventTypeColors[item.type] || eventTypeColors.event
                  }}
                  title={item.type === 'homework' ? `${item.title} (${item.subject})` : `${item.title} (${item.type})`}
                >
                  {item.type === 'homework' ? '📚' : '📅'} {item.title}
                </div>
              ))}
            </div>
            <div className="absolute bottom-1 right-1 opacity-0 hover:opacity-100 transition-opacity">
              <Plus className="w-4 h-4 text-gray-600" />
            </div>
          </div>
        ))}
      </div>

      <AnimatePresence>
        {showEventForm && (
          <EventForm
            selectedDate={selectedDate}
            onFormSubmit={handleEventFormSubmit}
            onCancel={() => setShowEventForm(false)}
          />
        )}
      </AnimatePresence>
    </div>
  );
}