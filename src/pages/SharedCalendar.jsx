import React, { useState, useEffect } from "react";
import { SharedEvent } from "@/entities/SharedEvent";
import { Event } from "@/entities/Event";
import { User } from "@/entities/User";
import { UserActivity } from "@/entities/UserActivity";
import { format, startOfMonth, endOfMonth, startOfWeek, endOfWeek, eachDayOfInterval, addMonths, subMonths, isSameMonth, isSameDay } from "date-fns";
import { ChevronLeft, ChevronRight, Plus, Users, Calendar as CalendarIcon, Copy } from "lucide-react";
import SharedEventForm from "../components/SharedEventForm";
import { AnimatePresence } from "framer-motion";

export default function SharedCalendar() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [sharedEvents, setSharedEvents] = useState([]);
  const [personalEvents, setPersonalEvents] = useState([]);
  const [showEventForm, setShowEventForm] = useState(false);
  const [selectedDate, setSelectedDate] = useState("");
  const [user, setUser] = useState(null);
  const [viewMode, setViewMode] = useState("shared"); // shared or personal

  useEffect(() => {
    loadUser();
  }, []);

  useEffect(() => {
    if (user) {
      loadEvents();
    }
  }, [user, viewMode]);

  const loadUser = async () => {
    try {
      const currentUser = await User.me();
      setUser(currentUser);
    } catch (error) {
      console.error("Failed to load user:", error);
    }
  };

  const loadEvents = async () => {
    if (!user) return;
    try {
      if (viewMode === "shared") {
        const classEvents = await SharedEvent.filter({ class_name: user.class_name }, "-created_date");
        setSharedEvents(classEvents);
      } else {
        const userEvents = await Event.filter({ created_by: user.email }, "-created_date");
        setPersonalEvents(userEvents);
      }
    } catch (error) {
      console.error("Failed to load events:", error);
    }
  };

  const monthStart = startOfMonth(currentDate);
  const monthEnd = endOfMonth(currentDate);
  const startDate = startOfWeek(monthStart);
  const endDate = endOfWeek(monthEnd);

  const days = eachDayOfInterval({ start: startDate, end: endDate });
  const dayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

  const currentEvents = viewMode === "shared" ? sharedEvents : personalEvents;
  const eventsByDate = currentEvents.reduce((acc, event) => {
    const date = format(new Date(event.date), 'yyyy-MM-dd');
    if (!acc[date]) {
      acc[date] = [];
    }
    acc[date].push(event);
    return acc;
  }, {});

  const handleDateClick = (day) => {
    const dateString = format(day, 'yyyy-MM-dd');
    setSelectedDate(dateString);
    setShowEventForm(true);
  };

  const handleEventFormSubmit = async () => {
    setShowEventForm(false);
    await UserActivity.create({
      activity_type: "event_created",
      activity_date: format(new Date(), 'yyyy-MM-dd'),
      details: `Created ${viewMode} event`
    });
    loadEvents();
  };

  const copyToPersonal = async (sharedEvent) => {
    try {
      await Event.create({
        title: `📋 ${sharedEvent.title}`,
        description: `Copied from shared calendar: ${sharedEvent.description}`,
        date: sharedEvent.date,
        type: sharedEvent.type,
        status: "planned"
      });
      alert("Event copied to your personal calendar!");
    } catch (error) {
      console.error("Failed to copy event:", error);
    }
  };

  const getEventTypeColor = (type) => {
    const colors = {
      assignment: '#FFB6C1',
      test: '#FFA07A',
      project: '#DDA0DD',
      event: '#98FB98',
      deadline: '#F0E68C',
      meeting: '#87CEEB',
      exam: '#FFD700'
    };
    return colors[type] || '#E0E0E0';
  };

  const buttonStyle = "p-3 bg-white border-2 border-black rounded-lg neo-shadow hover:neo-shadow-small active:shadow-none transform active:translate-x-[2px] active:translate-y-[2px] transition-all duration-150 font-bold";

  if (!user) {
    return <div className="text-center py-10">Loading calendar...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="text-center">
        <div className="flex items-center justify-center gap-3 mb-4">
          <Users className="h-12 w-12" />
          <CalendarIcon className="h-12 w-12" />
        </div>
        <h1 className="text-4xl font-bold">Class Calendar</h1>
        <p className="text-lg text-gray-700 mt-2">
          {viewMode === "shared" 
            ? `Shared events for Class ${user.class_name}` 
            : "Your personal calendar"}
        </p>
      </div>

      <div className="flex justify-center gap-4 mb-6">
        <button
          onClick={() => setViewMode("shared")}
          className={`${buttonStyle} ${viewMode === "shared" ? "bg-[#98FB98]" : "bg-white"}`}
        >
          <Users className="w-5 h-5 mr-2" />
          Shared Calendar
        </button>
        <button
          onClick={() => setViewMode("personal")}
          className={`${buttonStyle} ${viewMode === "personal" ? "bg-[#87CEEB]" : "bg-white"}`}
        >
          <CalendarIcon className="w-5 h-5 mr-2" />
          Personal Calendar
        </button>
      </div>

      <div className="p-4 bg-white border-4 border-black rounded-xl neo-shadow">
        <div className="flex justify-between items-center mb-6">
          <button onClick={() => setCurrentDate(subMonths(currentDate, 1))} className={buttonStyle}>
            <ChevronLeft />
          </button>
          <h2 className="text-3xl font-bold">{format(currentDate, "MMMM yyyy")}</h2>
          <button onClick={() => setCurrentDate(addMonths(currentDate, 1))} className={buttonStyle}>
            <ChevronRight />
          </button>
        </div>

        <div className="mb-4 p-3 bg-[#F0F8FF] border-2 border-black rounded-lg">
          <p className="text-sm font-semibold">
            💡 <strong>Tip:</strong> Click on any date to add events! 
            {viewMode === "shared" && " Shared events are visible to your entire class."}
          </p>
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
              <div className={`font-bold ${!isSameMonth(day, monthStart) ? "text-gray-400" : ""}`}>
                {format(day, "d")}
              </div>
              <div className="space-y-1 mt-1">
                {(eventsByDate[format(day, 'yyyy-MM-dd')] || []).map(event => (
                  <div key={`${event.id}`} className="relative group">
                    <div 
                      className="p-1 text-xs font-semibold rounded-md border border-black truncate" 
                      style={{ backgroundColor: getEventTypeColor(event.type) }}
                      title={`${event.title} - ${event.type}${event.subject ? ` (${event.subject})` : ''}`}
                    >
                      {viewMode === "shared" ? "🌐" : "👤"} {event.title}
                    </div>
                    {viewMode === "shared" && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          copyToPersonal(event);
                        }}
                        className="absolute -top-1 -right-1 w-4 h-4 bg-white border border-black rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity text-xs hover:bg-gray-100"
                        title="Copy to personal calendar"
                      >
                        <Copy className="w-2 h-2" />
                      </button>
                    )}
                  </div>
                ))}
              </div>
              <div className="absolute bottom-1 right-1 opacity-0 hover:opacity-100 transition-opacity">
                <Plus className="w-4 h-4 text-gray-600" />
              </div>
            </div>
          ))}
        </div>
      </div>

      <AnimatePresence>
        {showEventForm && (
          <SharedEventForm
            selectedDate={selectedDate}
            onFormSubmit={handleEventFormSubmit}
            onCancel={() => setShowEventForm(false)}
            isShared={viewMode === "shared"}
            user={user}
          />
        )}
      </AnimatePresence>
    </div>
  );
}