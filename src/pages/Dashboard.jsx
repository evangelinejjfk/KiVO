
import React, { useState, useEffect } from "react";
import { Event } from "@/entities/Event";
import { SharedEvent } from "@/entities/SharedEvent";
import { Resource } from "@/entities/Resource";
import { User } from "@/entities/User";
import { UserActivity } from "@/entities/UserActivity";
import { Search as SearchIcon, Calendar, TrendingUp, BookOpen, Bell, Upload, FileText, Image, Link as LinkIcon } from "lucide-react";
import { format, isToday, isTomorrow, addDays } from "date-fns";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";

export default function Dashboard() {
  const [user, setUser] = useState(null);
  const [dashboardData, setDashboardData] = useState({
    upcomingEvents: [],
    recentUploads: [],
    streak: 0,
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    setIsLoading(true);
    try {
      const currentUser = await User.me();
      setUser(currentUser);

      if (!currentUser.class_name) {
        setIsLoading(false);
        return;
      }

      // Load upcoming events (next 7 days)
      const personalEvents = await Event.filter({ created_by: currentUser.email }, "-date");
      const sharedEvents = await SharedEvent.filter({ class_name: currentUser.class_name }, "-date");
      const allEvents = [...personalEvents, ...sharedEvents];
      const upcomingEvents = allEvents
        .filter(event => {
          const eventDate = new Date(event.date);
          const today = new Date();
          const weekFromNow = addDays(today, 7);
          return eventDate >= today && eventDate <= weekFromNow;
        })
        .sort((a, b) => new Date(a.date) - new Date(b.date))
        .slice(0, 5);

      // Load recent uploads (notes, resources)
      const recentResources = await Resource.filter({ class_name: currentUser.class_name }, "-created_date", 5);

      // Load recent activity to calculate streak
      const activities = await UserActivity.filter({ created_by: currentUser.email }, "-created_date");
      const uniqueDates = [...new Set(activities.map(a => a.activity_date))].sort().reverse();
      let streak = 0;
      let currentDate = new Date();
      
      for (let i = 0; i < 30; i++) {
        const checkDate = format(addDays(currentDate, -i), 'yyyy-MM-dd');
        if (uniqueDates.includes(checkDate)) {
          streak++;
        } else if (i > 0) {
          break;
        }
      }

      setDashboardData({
        upcomingEvents,
        recentUploads: recentResources,
        streak,
      });

    } catch (error) {
      console.error("Failed to load dashboard data:", error);
    }
    setIsLoading(false);
  };

  const getDateLabel = (date) => {
    if (isToday(new Date(date))) return "Today";
    if (isTomorrow(new Date(date))) return "Tomorrow";
    return format(new Date(date), "MMM d");
  };

  const getResourceIcon = (type) => {
    const icons = {
      note: <BookOpen className="w-5 h-5 text-blue-600" />,
      question_paper: <FileText className="w-5 h-5 text-green-600" />,
      link: <LinkIcon className="w-5 h-5 text-purple-600" />,
      image: <Image className="w-5 h-5 text-orange-600" />,
      document: <FileText className="w-5 h-5 text-red-600" />,
    };
    return icons[type] || <BookOpen className="w-5 h-5 text-gray-600" />;
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-4 border-black"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      {/* Header with Global Search */}
      <div className="text-center space-y-4">
        <h1 className="text-4xl font-bold">Welcome back{user?.full_name ? `, ${user.full_name.split(' ')[0]}` : ''}! 👋</h1>
        
        <Link to={createPageUrl("Search")} className="max-w-2xl mx-auto relative block">
          <div className="w-full p-4 bg-white border-2 border-black rounded-lg focus:outline-none focus:ring-2 focus:ring-[#87CEEB] neo-shadow text-lg text-left text-gray-500 pr-12 cursor-pointer">
            Search flashcards, notes, chats...
          </div>
          <SearchIcon className="absolute right-4 top-1/2 transform -translate-y-1/2 w-6 h-6 text-gray-400" />
        </Link>
      </div>

      {/* Quick Stats Widgets */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <motion.div 
          initial={{ opacity: 0, y: 20 }} 
          animate={{ opacity: 1, y: 0 }}
          className="p-6 bg-gradient-to-br from-yellow-200 to-orange-200 border-4 border-black rounded-xl neo-shadow"
        >
          <div className="flex items-center gap-3">
            <TrendingUp className="w-8 h-8 text-orange-800" />
            <div>
              <h3 className="text-2xl font-bold text-orange-800">{dashboardData.streak}</h3>
              <p className="text-sm font-semibold text-orange-700">Day Streak 🔥</p>
            </div>
          </div>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, y: 20 }} 
          animate={{ opacity: 1, y: 0, transition: { delay: 0.1 } }}
          className="p-6 bg-white border-4 border-black rounded-xl neo-shadow"
        >
           <div className="flex items-center justify-between mb-2">
            <h3 className="text-xl font-bold flex items-center gap-2">
              <Calendar className="w-6 h-6" />
              Upcoming
            </h3>
            <Bell className="w-5 h-5 text-gray-500" />
          </div>
           {dashboardData.upcomingEvents.length > 0 ? (
            <div className="space-y-2">
              {dashboardData.upcomingEvents.map((event) => (
                <div key={`${event.type}-${event.id}`} className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center border-2 border-black flex-shrink-0">
                    <span className="text-xs font-bold text-blue-800">
                      {format(new Date(event.date), 'dd')}
                    </span>
                  </div>
                  <div className="flex-1 overflow-hidden">
                    <h4 className="font-semibold text-sm truncate">{event.title}</h4>
                    <p className="text-xs text-gray-600">{getDateLabel(event.date)} • {event.type}</p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-4 text-gray-500">
              <p>No upcoming events.</p>
            </div>
          )}
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, y: 20 }} 
          animate={{ opacity: 1, y: 0, transition: { delay: 0.2 } }}
          className="p-6 bg-white border-4 border-black rounded-xl neo-shadow"
        >
          <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
            <Upload className="w-6 h-6" />
            Recent Uploads
          </h3>
           {dashboardData.recentUploads.length > 0 ? (
            <div className="space-y-2">
              {dashboardData.recentUploads.map((resource) => (
                <div key={resource.id} className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center border-2 border-black flex-shrink-0">
                    {getResourceIcon(resource.type)}
                  </div>
                  <div className="flex-1 overflow-hidden">
                    <h4 className="font-semibold text-sm truncate">{resource.title}</h4>
                    <p className="text-xs text-gray-600">{resource.subject} • by {resource.shared_by}</p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
             <div className="text-center py-4 text-gray-500">
              <p>No recent uploads.</p>
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
}
