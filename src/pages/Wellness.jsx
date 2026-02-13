import React, { useState } from "react";
import { motion } from "framer-motion";
import { Heart, Flower2, Puzzle, Smile, Sparkles } from "lucide-react";
import MoodTracker from "../components/mood/MoodTracker";
import BreathingExercise from "../components/mood/BreathingExercise";
import PixelGarden from "../components/mood/PixelGarden";
import MindfulPuzzle from "../components/mood/MindfulPuzzle";

export default function WellnessPage() {
  const [activeView, setActiveView] = useState(null);

  const activities = [
    { id: "mood", name: "Mood Tracker", icon: Smile, color: "#FFB6D9", description: "Log how you're feeling today" },
    { id: "breathing", name: "Breathing Exercise", icon: Heart, color: "#B8E8D4", description: "4-4-4 calming breaths" },
    { id: "garden", name: "Pixel Garden", icon: Flower2, color: "#E0BBE4", description: "Plant your peaceful garden" },
    { id: "puzzle", name: "Mindful Puzzle", icon: Puzzle, color: "#FFF4C9", description: "Match pairs mindfully" },
  ];

  const renderActiveView = () => {
    switch (activeView) {
      case "mood":
        return <MoodTracker onClose={() => setActiveView(null)} />;
      case "breathing":
        return <BreathingExercise onClose={() => setActiveView(null)} onBack={() => setActiveView(null)} />;
      case "garden":
        return <PixelGarden onClose={() => setActiveView(null)} onBack={() => setActiveView(null)} />;
      case "puzzle":
        return <MindfulPuzzle onClose={() => setActiveView(null)} onBack={() => setActiveView(null)} />;
      default:
        return null;
    }
  };

  if (activeView) {
    return (
      <div className="max-w-4xl mx-auto">
        {renderActiveView()}
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="pixel-card bg-gradient-to-br from-pink-100 to-purple-100 p-8 text-center relative overflow-hidden"
      >
        <div className="absolute top-4 right-4 text-6xl opacity-20">🌸</div>
        <div className="absolute bottom-4 left-4 text-5xl opacity-20">✨</div>
        <Sparkles className="w-16 h-16 mx-auto mb-4 text-purple-500" />
        <h1 className="pixel-text text-3xl mb-2">Wellness Center 🌟</h1>
        <p className="text-lg font-bold text-gray-700">
          Take a moment for yourself. Your Pixel Pal is here to help you relax and recharge!
        </p>
      </motion.div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {activities.map((activity, idx) => (
          <motion.button
            key={activity.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0, transition: { delay: idx * 0.1 } }}
            whileHover={{ scale: 1.05, y: -5 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => setActiveView(activity.id)}
            className="pixel-card p-6 text-left relative overflow-hidden"
            style={{ backgroundColor: activity.color }}
          >
            <div className="absolute top-2 right-2 text-4xl opacity-20">
              {activity.id === "mood" && "💭"}
              {activity.id === "breathing" && "🌬️"}
              {activity.id === "garden" && "🌺"}
              {activity.id === "puzzle" && "🧩"}
            </div>
            <div className="flex items-start gap-4 relative z-10">
              <div className="pixel-icon-sm bg-white">
                <activity.icon className="w-6 h-6 text-gray-800" />
              </div>
              <div>
                <h3 className="pixel-text text-lg mb-2">{activity.name}</h3>
                <p className="text-sm font-bold text-gray-700">{activity.description}</p>
              </div>
            </div>
          </motion.button>
        ))}
      </div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1, transition: { delay: 0.4 } }}
        className="pixel-card bg-white p-6"
      >
        <h3 className="pixel-text text-lg mb-3">💡 Wellness Tips</h3>
        <div className="space-y-2 text-sm text-gray-700">
          <p className="font-bold">🌟 Take regular breaks while studying</p>
          <p className="font-bold">💧 Stay hydrated throughout the day</p>
          <p className="font-bold">😴 Get 7-9 hours of sleep each night</p>
          <p className="font-bold">🚶 Move your body - even a short walk helps!</p>
          <p className="font-bold">🧘 Practice mindfulness for a few minutes daily</p>
        </div>
      </motion.div>
    </div>
  );
}