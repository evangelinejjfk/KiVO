import React, { useState, useEffect } from "react";
import { UserActivity } from "@/entities/UserActivity";
import { Achievement } from "@/entities/Achievement";
import { User } from "@/entities/User";
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";
import { Trophy, TrendingUp, Calendar, Brain, Award } from "lucide-react";
import { format, subDays, startOfWeek, endOfWeek, eachDayOfInterval } from "date-fns";
import { motion } from "framer-motion";

export default function Analytics() {
  const [activities, setActivities] = useState([]);
  const [achievements, setAchievements] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [user, setUser] = useState(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const currentUser = await User.me();
      setUser(currentUser);
      
      const userActivities = await UserActivity.filter({ created_by: currentUser.email }, "-activity_date");
      setActivities(userActivities);
      
      const userAchievements = await Achievement.filter({ created_by: currentUser.email }, "-earned_date");
      setAchievements(userAchievements);
      
      // Check for new achievements
      await checkAchievements(userActivities, userAchievements);
    } catch (error) {
      console.error("Failed to load analytics data:", error);
    }
    setIsLoading(false);
  };

  const checkAchievements = async (activities, currentAchievements) => {
    const achievementTitles = currentAchievements.map(a => a.title);
    
    // Count different activity types
    const counts = activities.reduce((acc, activity) => {
      acc[activity.activity_type] = (acc[activity.activity_type] || 0) + 1;
      return acc;
    }, {});

    const newAchievements = [];

    // Define achievements
    const achievementRules = [
      { title: "First Steps", description: "Used StudyBuddy for the first time", badge_icon: "🌟", category: "milestone", condition: activities.length >= 1 },
      { title: "Flashcard Master", description: "Studied 10 flashcard sets", badge_icon: "🧠", category: "study", condition: (counts.flashcard_studied || 0) >= 10 },
      { title: "AI Enthusiast", description: "Had 5 conversations with AI", badge_icon: "🤖", category: "study", condition: (counts.ai_chat || 0) >= 5 },
      { title: "Resource Hero", description: "Uploaded 3 resources", badge_icon: "📚", category: "collaboration", condition: (counts.resource_uploaded || 0) >= 3 },
      { title: "Chatterbox", description: "Sent 20 messages", badge_icon: "💬", category: "collaboration", condition: (counts.message_sent || 0) >= 20 },
      { title: "Event Planner", description: "Created 5 events", badge_icon: "📅", category: "milestone", condition: (counts.event_created || 0) >= 5 },
      { title: "Week Warrior", description: "Active for 7 consecutive days", badge_icon: "🔥", category: "consistency", condition: checkConsecutiveDays(activities, 7) }
    ];

    for (const rule of achievementRules) {
      if (rule.condition && !achievementTitles.includes(rule.title)) {
        await Achievement.create({
          title: rule.title,
          description: rule.description,
          badge_icon: rule.badge_icon,
          earned_date: format(new Date(), 'yyyy-MM-dd'),
          category: rule.category
        });
        newAchievements.push(rule.title);
      }
    }

    if (newAchievements.length > 0) {
      setTimeout(() => {
        alert(`🎉 New Achievement${newAchievements.length > 1 ? 's' : ''} Unlocked!\n${newAchievements.join('\n')}`);
      }, 1000);
    }
  };

  const checkConsecutiveDays = (activities, days) => {
    const uniqueDates = [...new Set(activities.map(a => a.activity_date))].sort().reverse();
    let consecutive = 0;
    let currentDate = new Date();
    
    for (let i = 0; i < days; i++) {
      const checkDate = format(subDays(currentDate, i), 'yyyy-MM-dd');
      if (uniqueDates.includes(checkDate)) {
        consecutive++;
      } else {
        break;
      }
    }
    return consecutive >= days;
  };

  const getWeeklyData = () => {
    const weekStart = startOfWeek(new Date());
    const weekEnd = endOfWeek(new Date());
    const weekDays = eachDayOfInterval({ start: weekStart, end: weekEnd });
    
    return weekDays.map(day => {
      const dateStr = format(day, 'yyyy-MM-dd');
      const dayActivities = activities.filter(a => a.activity_date === dateStr);
      return {
        day: format(day, 'EEE'),
        activities: dayActivities.length
      };
    });
  };

  const getActivityBreakdown = () => {
    const activityTypes = {
      flashcard_studied: "Flashcards",
      ai_chat: "AI Chats",
      resource_viewed: "Resources Viewed",
      resource_uploaded: "Resources Uploaded",
      message_sent: "Messages",
      event_created: "Events Created"
    };

    const counts = activities.reduce((acc, activity) => {
      acc[activity.activity_type] = (acc[activity.activity_type] || 0) + 1;
      return acc;
    }, {});

    return Object.entries(counts).map(([type, count]) => ({
      name: activityTypes[type] || type,
      value: count
    }));
  };

  const getStreakDays = () => {
    const uniqueDates = [...new Set(activities.map(a => a.activity_date))].sort().reverse();
    let streak = 0;
    let currentDate = new Date();
    
    for (let i = 0; i < 30; i++) {
      const checkDate = format(subDays(currentDate, i), 'yyyy-MM-dd');
      if (uniqueDates.includes(checkDate)) {
        streak++;
      } else if (i > 0) {
        break;
      }
    }
    return streak;
  };

  const cardStyle = "p-6 bg-white border-4 border-black rounded-xl neo-shadow";
  const COLORS = ['#98FB98', '#87CEEB', '#DDA0DD', '#FFB6C1', '#F0E68C', '#FFA07A'];

  if (isLoading) {
    return (
      <div className="text-center py-10">
        <div className="animate-spin rounded-full h-12 w-12 border-b-4 border-black mx-auto"></div>
        <p className="mt-4 font-bold">Loading your progress...</p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="text-center">
        <TrendingUp className="mx-auto h-16 w-16 mb-4" />
        <h1 className="text-4xl font-bold">Your Learning Journey</h1>
        <p className="text-lg text-gray-700 mt-2">Track your progress and celebrate achievements!</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className={cardStyle}>
          <div className="flex items-center gap-3 mb-3">
            <Calendar className="w-8 h-8 text-blue-600" />
            <div>
              <h3 className="text-2xl font-bold">{getStreakDays()}</h3>
              <p className="text-sm text-gray-600">Day Streak 🔥</p>
            </div>
          </div>
          <p className="text-xs text-gray-500">Keep up the daily learning!</p>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className={cardStyle}>
          <div className="flex items-center gap-3 mb-3">
            <Brain className="w-8 h-8 text-purple-600" />
            <div>
              <h3 className="text-2xl font-bold">{activities.length}</h3>
              <p className="text-sm text-gray-600">Total Activities</p>
            </div>
          </div>
          <p className="text-xs text-gray-500">Every action counts!</p>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className={cardStyle}>
          <div className="flex items-center gap-3 mb-3">
            <Award className="w-8 h-8 text-yellow-600" />
            <div>
              <h3 className="text-2xl font-bold">{achievements.length}</h3>
              <p className="text-sm text-gray-600">Achievements</p>
            </div>
          </div>
          <p className="text-xs text-gray-500">Unlock more badges!</p>
        </motion.div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} className={cardStyle}>
          <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
            <BarChart className="w-6 h-6" />
            This Week's Activity
          </h3>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={getWeeklyData()}>
              <XAxis dataKey="day" />
              <YAxis />
              <Bar dataKey="activities" fill="#98FB98" stroke="#000" strokeWidth={2} />
            </BarChart>
          </ResponsiveContainer>
        </motion.div>

        <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className={cardStyle}>
          <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
            <PieChart className="w-6 h-6" />
            Activity Breakdown
          </h3>
          <ResponsiveContainer width="100%" height={200}>
            <PieChart>
              <Pie
                data={getActivityBreakdown()}
                cx="50%"
                cy="50%"
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
                stroke="#000"
                strokeWidth={2}
              >
                {getActivityBreakdown().map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
            </PieChart>
          </ResponsiveContainer>
          <div className="grid grid-cols-2 gap-2 mt-4 text-xs">
            {getActivityBreakdown().map((item, index) => (
              <div key={item.name} className="flex items-center gap-2">
                <div
                  className="w-3 h-3 rounded border border-black"
                  style={{ backgroundColor: COLORS[index % COLORS.length] }}
                />
                <span>{item.name}: {item.value}</span>
              </div>
            ))}
          </div>
        </motion.div>
      </div>

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className={cardStyle}>
        <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
          <Trophy className="w-6 h-6" />
          Your Achievements
        </h3>
        {achievements.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {achievements.map((achievement) => (
              <motion.div
                key={achievement.id}
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className="p-4 bg-gradient-to-br from-yellow-100 to-yellow-200 border-2 border-black rounded-lg"
              >
                <div className="text-center">
                  <div className="text-3xl mb-2">{achievement.badge_icon}</div>
                  <h4 className="font-bold">{achievement.title}</h4>
                  <p className="text-sm text-gray-600 mt-1">{achievement.description}</p>
                  <p className="text-xs text-gray-500 mt-2">
                    {format(new Date(achievement.earned_date), 'MMM d, yyyy')}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8">
            <Trophy className="mx-auto h-16 w-16 mb-4 text-gray-300" />
            <p className="text-gray-600">Start using StudyBuddy to earn your first achievement!</p>
          </div>
        )}
      </motion.div>
    </div>
  );
}