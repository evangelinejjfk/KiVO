import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Search as SearchIcon, Calendar, TrendingUp, BookOpen, Bell, Upload, FileText, Image, Link as LinkIcon, Sparkles, Heart, Apple } from "lucide-react";
import { format, isToday, isTomorrow, addDays } from "date-fns";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import TamagotchiWidget from "../components/TamagotchiWidget";

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
      const currentUser = await base44.auth.me();
      setUser(currentUser);

      if (!currentUser.class_name) {
        setIsLoading(false);
        return;
      }

      // Load upcoming events (next 7 days)
      const personalEvents = await base44.entities.Event.filter({ created_by: currentUser.email }, "-date");
      const sharedEvents = await base44.entities.SharedEvent.filter({ class_name: currentUser.class_name }, "-date");
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
      const recentResources = await base44.entities.Resource.filter({ class_name: currentUser.class_name }, "-created_date", 5);

      // Load recent activity to calculate streak
      const activities = await base44.entities.UserActivity.filter({ created_by: currentUser.email }, "-created_date");
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
      <div className="flex items-center justify-center min-h-screen bg-[#FFE5E5]">
        <div className="pixel-spinner"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Pixel Header */}
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="pixel-card bg-gradient-to-r from-[#FF6B9D] via-[#C147E9] to-[#8B5CF6] text-white p-8 relative overflow-hidden"
      >
        <div className="absolute top-0 left-0 w-full h-full opacity-10">
          <div className="pixel-grid"></div>
        </div>
        <div className="relative z-10">
          <h1 className="pixel-text text-4xl mb-2">
            Hey {user?.username || user?.full_name?.split(' ')[0] || 'Player'}! ✨
          </h1>
          <p className="text-xl opacity-90">Level up your learning adventure! 🎮</p>
        </div>
        {user?.profile_picture && (
          <img 
            src={user.profile_picture} 
            alt="Profile" 
            className="absolute right-8 top-1/2 -translate-y-1/2 w-20 h-20 pixel-border-white hidden md:block" 
          />
        )}
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - Pet + Stats */}
        <div className="space-y-6">
          <TamagotchiWidget />
          
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="pixel-card bg-[#FFD93D] p-6"
          >
            <div className="flex items-center gap-4">
              <div className="pixel-icon bg-[#FF6B9D] text-white">
                <TrendingUp className="w-8 h-8" />
              </div>
              <div>
                <p className="pixel-text text-5xl text-[#FF6B9D]">{dashboardData.streak}</p>
                <p className="text-sm font-bold mt-1">Day Streak 🔥</p>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Middle Column - Upcoming Events */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0, transition: { delay: 0.1 } }}
          className="pixel-card bg-[#A8E6CF] p-6"
        >
          <div className="flex items-center justify-between mb-4">
            <h3 className="pixel-text text-xl flex items-center gap-2">
              <Calendar className="w-6 h-6" />
              Upcoming Quests
            </h3>
            <Bell className="w-6 h-6 text-[#FF6B9D]" />
          </div>
          {dashboardData.upcomingEvents.length > 0 ? (
            <div className="space-y-3">
              {dashboardData.upcomingEvents.slice(0, 4).map((event, idx) => (
                <motion.div 
                  key={`${event.type}-${event.id}`}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0, transition: { delay: idx * 0.1 } }}
                  className="pixel-item bg-white p-3 flex items-center gap-3"
                >
                  <div className="pixel-date bg-[#FF6B9D] text-white">
                    {format(new Date(event.date), 'dd')}
                  </div>
                  <div className="flex-1 overflow-hidden">
                    <h4 className="font-bold text-sm truncate">{event.title}</h4>
                    <p className="text-xs text-gray-600">{getDateLabel(event.date)}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-gray-600">
              <p className="pixel-text">No quests yet! 🎯</p>
            </div>
          )}
        </motion.div>

        {/* Right Column - Recent Uploads */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0, transition: { delay: 0.2 } }}
          className="pixel-card bg-[#C7CEEA] p-6"
        >
          <h3 className="pixel-text text-xl mb-4 flex items-center gap-2">
            <Upload className="w-6 h-6" />
            Recent Loot
          </h3>
          {dashboardData.recentUploads.length > 0 ? (
            <div className="space-y-3">
              {dashboardData.recentUploads.slice(0, 4).map((resource, idx) => (
                <motion.div 
                  key={resource.id}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0, transition: { delay: idx * 0.1 } }}
                  className="pixel-item bg-white p-3 flex items-center gap-3"
                >
                  <div className="pixel-icon-sm bg-[#8B5CF6] text-white">
                    {getResourceIcon(resource.type)}
                  </div>
                  <div className="flex-1 overflow-hidden">
                    <h4 className="font-bold text-sm truncate">{resource.title}</h4>
                    <p className="text-xs text-gray-600">{resource.subject}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-gray-600">
              <p className="pixel-text">No loot yet! 📦</p>
            </div>
          )}
        </motion.div>
      </div>

      {/* Search Bar */}
      <Link to={createPageUrl("Search")}>
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1, transition: { delay: 0.3 } }}
          className="pixel-card bg-white p-4 cursor-pointer hover:bg-[#FFE5E5] transition-colors relative"
        >
          <div className="flex items-center gap-3">
            <SearchIcon className="w-6 h-6 text-[#FF6B9D]" />
            <span className="text-gray-500">Search flashcards, notes, chats...</span>
          </div>
          <Sparkles className="absolute right-4 top-1/2 -translate-y-1/2 w-6 h-6 text-[#FFD93D]" />
        </motion.div>
      </Link>
    </div>
  );
}