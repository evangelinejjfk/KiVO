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
    <div className="space-y-8 max-w-7xl mx-auto">
      {/* Header with Profile Section */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-bold text-slate-800 mb-1">
            Welcome back{user?.username ? `, ${user.username}` : user?.full_name ? `, ${user.full_name.split(' ')[0]}` : ''}! 👋
          </h1>
          <p className="text-slate-600">Here's what's happening with your studies today</p>
        </div>
        {user?.profile_picture && (
          <img src={user.profile_picture} alt="Profile" className="w-16 h-16 rounded-full object-cover border-4 border-blue-600 shadow-lg hidden md:block" />
        )}
      </div>

      {/* Global Search */}
      <Link to={createPageUrl("Search")} className="block">
        <div className="relative">
          <div className="w-full p-4 bg-white border border-slate-200 rounded-xl shadow-sm hover:shadow-md transition-shadow text-lg text-left text-slate-400 pr-12 cursor-pointer">
            Search flashcards, notes, chats...
          </div>
          <SearchIcon className="absolute right-4 top-1/2 transform -translate-y-1/2 w-6 h-6 text-slate-400" />
        </div>
      </Link>

      {/* Quick Stats Widgets */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <motion.div 
          initial={{ opacity: 0, y: 20 }} 
          animate={{ opacity: 1, y: 0 }}
          className="p-6 bg-gradient-to-br from-amber-400 to-amber-500 rounded-2xl shadow-lg hover:shadow-xl transition-shadow"
        >
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 bg-white/20 rounded-xl flex items-center justify-center">
              <TrendingUp className="w-8 h-8 text-white" />
            </div>
            <div>
              <h3 className="text-4xl font-bold text-white">{dashboardData.streak}</h3>
              <p className="text-sm font-medium text-white/90">Day Streak 🔥</p>
            </div>
          </div>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, y: 20 }} 
          animate={{ opacity: 1, y: 0, transition: { delay: 0.1 } }}
          className="p-6 bg-white rounded-2xl shadow-lg border border-slate-200"
        >
           <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2">
              <Calendar className="w-5 h-5 text-blue-600" />
              Upcoming Events
            </h3>
            <Bell className="w-5 h-5 text-slate-400" />
          </div>
           {dashboardData.upcomingEvents.length > 0 ? (
            <div className="space-y-3">
              {dashboardData.upcomingEvents.slice(0, 3).map((event) => (
                <div key={`${event.type}-${event.id}`} className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center flex-shrink-0">
                    <span className="text-sm font-bold text-blue-700">
                      {format(new Date(event.date), 'dd')}
                    </span>
                  </div>
                  <div className="flex-1 overflow-hidden">
                    <h4 className="font-semibold text-sm text-slate-800 truncate">{event.title}</h4>
                    <p className="text-xs text-slate-500">{getDateLabel(event.date)}</p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-6 text-slate-400">
              <p className="text-sm">No upcoming events</p>
            </div>
          )}
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, y: 20 }} 
          animate={{ opacity: 1, y: 0, transition: { delay: 0.2 } }}
          className="p-6 bg-white rounded-2xl shadow-lg border border-slate-200"
        >
          <h3 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
            <Upload className="w-5 h-5 text-emerald-600" />
            Recent Uploads
          </h3>
           {dashboardData.recentUploads.length > 0 ? (
            <div className="space-y-3">
              {dashboardData.recentUploads.slice(0, 3).map((resource) => (
                <div key={resource.id} className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-emerald-100 rounded-xl flex items-center justify-center flex-shrink-0">
                    {getResourceIcon(resource.type)}
                  </div>
                  <div className="flex-1 overflow-hidden">
                    <h4 className="font-semibold text-sm text-slate-800 truncate">{resource.title}</h4>
                    <p className="text-xs text-slate-500">{resource.subject}</p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
             <div className="text-center py-6 text-slate-400">
              <p className="text-sm">No recent uploads</p>
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
}