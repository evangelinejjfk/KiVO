import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Search as SearchIcon, Sparkles, Smile } from "lucide-react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import TamagotchiWidget from "../components/TamagotchiWidget";
import MoodTracker from "../components/mood/MoodTracker";
import OnboardingTour from "../components/OnboardingTour";
import WellnessCoach from "../components/WellnessCoach";

export default function Dashboard() {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [showMoodTracker, setShowMoodTracker] = useState(false);
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [showWellnessCoach, setShowWellnessCoach] = useState(false);

  useEffect(() => {
    loadUserData();
    checkWellnessCoaching();
  }, []);

  const loadUserData = async () => {
    setIsLoading(true);
    try {
      const currentUser = await base44.auth.me();
      setUser(currentUser);
      
      // Check if onboarding is needed
      if (!currentUser.onboarding_completed) {
        setShowOnboarding(true);
      }
    } catch (error) {
      console.error("Failed to load user data:", error);
    }
    setIsLoading(false);
  };

  const checkWellnessCoaching = async () => {
    try {
      const currentUser = await base44.auth.me();
      const today = new Date().toISOString().split('T')[0];
      
      // Only check once per day
      if (currentUser.last_wellness_check === today) return;
      
      // Get recent moods
      const recentMoods = await base44.entities.Mood.filter({ created_by: currentUser.email });
      const last7Days = recentMoods.slice(0, 7);
      
      const negativeMoods = last7Days.filter(mood => 
        ['stressed', 'anxious', 'overwhelmed', 'tired'].includes(mood.mood_type)
      );
      
      // Show wellness coach if 3+ negative moods in last 7 days
      if (negativeMoods.length >= 3) {
        setTimeout(() => setShowWellnessCoach(true), 2000);
      }
    } catch (error) {
      console.error("Wellness check failed:", error);
    }
  };

  const handleCompleteOnboarding = async () => {
    try {
      await base44.auth.updateMe({ onboarding_completed: true });
      setShowOnboarding(false);
    } catch (error) {
      console.error("Failed to complete onboarding:", error);
    }
  };

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
        className="pixel-card bg-[#E0BBE4] text-gray-800 p-8 relative overflow-hidden"
      >
        <div className="absolute top-0 left-0 w-full h-full opacity-20">
          <div className="pixel-grid"></div>
        </div>
        <div className="absolute top-4 right-4 text-6xl animate-bounce opacity-30">🎮</div>
        <div className="absolute bottom-4 left-4 text-4xl animate-pulse opacity-30">⭐</div>
        <div className="relative z-10">
          <h1 className="pixel-text text-4xl mb-2">
            Hey {user?.username || user?.full_name?.split(' ')[0] || 'Player'}! ✨
          </h1>
          <p className="text-xl font-bold">Level up your learning adventure! 🎮</p>
        </div>
        {user?.profile_picture && (
          <img 
            src={user.profile_picture} 
            alt="Profile" 
            className="absolute right-8 top-1/2 -translate-y-1/2 w-24 h-24 pixel-border-white hidden md:block shadow-2xl" 
          />
        )}
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left Column - Pet */}
        <div className="space-y-6">
          <TamagotchiWidget />
          
          <motion.button
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            whileHover={{ scale: 1.05 }}
            onClick={() => setShowMoodTracker(true)}
            className="pixel-card bg-gradient-to-br from-pink-100 to-purple-100 p-6 w-full text-left relative overflow-hidden"
          >
            <div className="absolute bottom-0 right-0 text-6xl opacity-20">💭</div>
            <div className="flex items-center gap-4 relative z-10">
              <div className="pixel-icon-sm bg-[#E0BBE4] text-white">
                <Smile className="w-6 h-6" />
              </div>
              <div>
                <p className="pixel-text text-sm mb-1">How are you?</p>
                <p className="text-xs font-bold text-gray-700">Log your mood +5 XP</p>
              </div>
            </div>
          </motion.button>
        </div>

        {/* Right Column - Quick Links */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0, transition: { delay: 0.1 } }}
          className="pixel-card bg-[#B8E8D4] p-6 relative overflow-hidden"
        >
          <div className="absolute bottom-0 right-0 text-8xl opacity-10">🎯</div>
          <h3 className="pixel-text text-xl mb-4 relative z-10">Quick Access</h3>
          <div className="space-y-3 relative z-10">
            <Link to={createPageUrl("CalendarView")}>
              <div className="pixel-item bg-white p-4 hover:bg-[#FFF4C9] transition-colors">
                <p className="font-bold">📅 Calendar</p>
                <p className="text-xs text-gray-600">View homework & events</p>
              </div>
            </Link>
            <Link to={createPageUrl("Flashcards")}>
              <div className="pixel-item bg-white p-4 hover:bg-[#FFF4C9] transition-colors">
                <p className="font-bold">🧠 Flashcards</p>
                <p className="text-xs text-gray-600">Study with cards</p>
              </div>
            </Link>
            <Link to={createPageUrl("Scrapbook")}>
              <div className="pixel-item bg-white p-4 hover:bg-[#FFF4C9] transition-colors">
                <p className="font-bold">📸 Scrapbook</p>
                <p className="text-xs text-gray-600">Capture memories</p>
              </div>
            </Link>
            <Link to={createPageUrl("MoneyFlow")}>
              <div className="pixel-item bg-white p-4 hover:bg-[#FFF4C9] transition-colors">
                <p className="font-bold">💰 MoneyFlow</p>
                <p className="text-xs text-gray-600">Track expenses</p>
              </div>
            </Link>
          </div>
        </motion.div>
      </div>

      {/* Search Bar */}
      <Link to={createPageUrl("Search")}>
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1, transition: { delay: 0.3 } }}
          whileHover={{ scale: 1.02 }}
          className="pixel-card bg-white p-4 cursor-pointer hover:bg-[#FFF4C9] transition-all relative overflow-hidden"
        >
          <div className="flex items-center gap-3 relative z-10">
            <SearchIcon className="w-6 h-6 text-[#9B4D96]" />
            <span className="text-gray-700 font-bold">Search flashcards, notes, chats...</span>
          </div>
          <Sparkles className="absolute right-4 top-1/2 -translate-y-1/2 w-6 h-6 text-[#9B4D96]" />
        </motion.div>
      </Link>

      {/* Mood Tracker Modal */}
      {showMoodTracker && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <MoodTracker onClose={() => setShowMoodTracker(false)} />
        </div>
      )}

      {/* Onboarding Tour */}
      {showOnboarding && (
        <OnboardingTour onComplete={handleCompleteOnboarding} />
      )}

      {/* Wellness Coach */}
      {showWellnessCoach && (
        <WellnessCoach onClose={() => setShowWellnessCoach(false)} />
      )}
    </div>
  );
}