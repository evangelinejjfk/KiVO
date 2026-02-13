import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { motion } from "framer-motion";
import { Trophy, Star, Zap, Target, Award, Lock } from "lucide-react";
import { format } from "date-fns";

const ACHIEVEMENT_CATEGORIES = {
  study: { icon: Star, color: "from-yellow-400 to-orange-400", label: "Study" },
  collaboration: { icon: Target, color: "from-blue-400 to-purple-400", label: "Collaboration" },
  consistency: { icon: Zap, color: "from-green-400 to-teal-400", label: "Consistency" },
  milestone: { icon: Trophy, color: "from-pink-400 to-red-400", label: "Milestone" },
};

export default function Achievements() {
  const [achievements, setAchievements] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [user, setUser] = useState(null);

  useEffect(() => {
    loadAchievements();
  }, []);

  const loadAchievements = async () => {
    setIsLoading(true);
    try {
      const currentUser = await base44.auth.me();
      setUser(currentUser);
      
      const data = await base44.entities.Achievement.filter({ created_by: currentUser.email }, "-earned_date", 50);
      setAchievements(data);
    } catch (error) {
      console.error("Failed to load achievements:", error);
    }
    setIsLoading(false);
  };

  const achievementsByCategory = achievements.reduce((acc, achievement) => {
    const category = achievement.category;
    if (!acc[category]) acc[category] = [];
    acc[category].push(achievement);
    return acc;
  }, {});

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="pixel-spinner"></div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="pixel-card bg-gradient-to-r from-yellow-100 to-orange-100 p-8 text-center relative overflow-hidden"
      >
        <Trophy className="w-16 h-16 mx-auto mb-4 text-[#9B4D96]" />
        <h1 className="pixel-text text-3xl mb-2">Your Achievements</h1>
        <p className="text-gray-700 font-bold">
          You've unlocked {achievements.length} achievement{achievements.length !== 1 ? 's' : ''}!
        </p>
      </motion.div>

      {/* User Level Card */}
      {user && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="pixel-card bg-gradient-to-r from-purple-100 to-pink-100 p-6"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              {user.profile_picture && (
                <img
                  src={user.profile_picture}
                  alt="Profile"
                  className="w-16 h-16 pixel-border-white"
                />
              )}
              <div>
                <h2 className="pixel-text text-xl">{user.username || user.full_name}</h2>
                <p className="font-bold text-gray-700">Level {user.level || 1}</p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-3xl font-bold">{user.total_xp || 0}</p>
              <p className="text-sm font-bold text-gray-600">Total XP</p>
            </div>
          </div>
        </motion.div>
      )}

      {/* Empty State */}
      {achievements.length === 0 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center py-16 pixel-card bg-white"
        >
          <Lock className="w-16 h-16 mx-auto mb-4 text-gray-400" />
          <h3 className="text-xl font-bold text-gray-600 mb-2">No Achievements Yet</h3>
          <p className="text-gray-500">
            Start studying, completing tasks, and being consistent to unlock achievements!
          </p>
        </motion.div>
      )}

      {/* Achievements by Category */}
      {Object.entries(ACHIEVEMENT_CATEGORIES).map(([categoryKey, categoryInfo]) => {
        const categoryAchievements = achievementsByCategory[categoryKey] || [];
        if (categoryAchievements.length === 0) return null;

        const CategoryIcon = categoryInfo.icon;

        return (
          <div key={categoryKey}>
            <div className="flex items-center gap-3 mb-4">
              <div className={`pixel-icon-sm bg-gradient-to-r ${categoryInfo.color} text-white`}>
                <CategoryIcon className="w-6 h-6" />
              </div>
              <h2 className="pixel-text text-xl">{categoryInfo.label}</h2>
              <span className="pixel-badge bg-white">
                {categoryAchievements.length}
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {categoryAchievements.map((achievement, index) => (
                <motion.div
                  key={achievement.id}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: index * 0.05 }}
                  className={`pixel-card bg-gradient-to-br ${categoryInfo.color} bg-opacity-10 p-6 relative overflow-hidden`}
                >
                  <div className="absolute top-2 right-2 text-4xl opacity-20">
                    {achievement.badge_icon}
                  </div>
                  <div className="relative z-10">
                    <div className="text-5xl mb-3">{achievement.badge_icon}</div>
                    <h3 className="font-bold text-lg mb-2">{achievement.title}</h3>
                    <p className="text-sm text-gray-700 mb-3">{achievement.description}</p>
                    <p className="text-xs font-bold text-gray-600">
                      Earned {format(new Date(achievement.earned_date), 'MMM d, yyyy')}
                    </p>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
}