import React, { useState } from "react";
import { motion } from "framer-motion";
import { Heart, Flower2, Puzzle, Sparkles } from "lucide-react";
import BreathingExercise from "./BreathingExercise";
import PixelGarden from "./PixelGarden";
import MindfulPuzzle from "./MindfulPuzzle";

export default function DeStressor({ mood, onClose }) {
  const [selectedActivity, setSelectedActivity] = useState(null);

  const activities = [
    { id: "breathing", name: "Breathing Exercise", icon: Heart, color: "#FFB6D9", component: BreathingExercise },
    { id: "garden", name: "Pixel Garden", icon: Flower2, color: "#B8E8D4", component: PixelGarden },
    { id: "puzzle", name: "Mindful Puzzle", icon: Puzzle, color: "#E0BBE4", component: MindfulPuzzle },
  ];

  if (selectedActivity) {
    const ActivityComponent = activities.find(a => a.id === selectedActivity).component;
    return <ActivityComponent onClose={onClose} onBack={() => setSelectedActivity(null)} />;
  }

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      className="pixel-card bg-white p-6 max-w-xl mx-auto"
    >
      <div className="text-center mb-6">
        <div className="text-6xl mb-3">🌟</div>
        <h2 className="pixel-text text-xl mb-2">Let's De-Stress Together!</h2>
        <p className="text-sm text-gray-600">
          Your Pixel Pal wants to help you feel better. Choose a calming activity:
        </p>
      </div>

      <div className="space-y-3 mb-6">
        {activities.map((activity) => (
          <motion.button
            key={activity.id}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => setSelectedActivity(activity.id)}
            className="pixel-button w-full p-4 flex items-center gap-4"
            style={{ backgroundColor: activity.color }}
          >
            <div className="pixel-icon-sm bg-white">
              <activity.icon className="w-6 h-6" />
            </div>
            <span className="font-bold text-lg">{activity.name}</span>
          </motion.button>
        ))}
      </div>

      <div className="text-center">
        <button
          onClick={onClose}
          className="pixel-button bg-gray-200 text-black px-6 py-2"
        >
          Maybe Later
        </button>
      </div>
    </motion.div>
  );
}