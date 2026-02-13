import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { motion, AnimatePresence } from "framer-motion";
import { Sparkles, X } from "lucide-react";
import DeStressor from "./DeStressor";

const moodOptions = [
  { type: "happy", emoji: "😊", color: "#FFD93D", label: "Happy" },
  { type: "excited", emoji: "🤩", color: "#FF6B9D", label: "Excited" },
  { type: "calm", emoji: "😌", color: "#B8E8D4", label: "Calm" },
  { type: "tired", emoji: "😴", color: "#C7CEEA", label: "Tired" },
  { type: "stressed", emoji: "😰", color: "#FFB6D9", label: "Stressed" },
  { type: "anxious", emoji: "😟", color: "#E0BBE4", label: "Anxious" },
  { type: "overwhelmed", emoji: "😵", color: "#FFF4C9", label: "Overwhelmed" },
];

export default function MoodTracker({ onClose }) {
  const [selectedMood, setSelectedMood] = useState(null);
  const [note, setNote] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showDeStressor, setShowDeStressor] = useState(false);
  const [todayMood, setTodayMood] = useState(null);

  useEffect(() => {
    checkTodayMood();
  }, []);

  const checkTodayMood = async () => {
    const today = new Date().toISOString().split('T')[0];
    const moods = await base44.entities.Mood.filter({ date: today });
    if (moods.length > 0) {
      setTodayMood(moods[0]);
    }
  };

  const handleMoodSelect = async (mood) => {
    setSelectedMood(mood);
    setIsSubmitting(true);

    try {
      const today = new Date().toISOString().split('T')[0];
      await base44.entities.Mood.create({
        mood_type: mood.type,
        date: today,
        note: note || undefined
      });

      // Award XP for logging mood
      if (window.awardPetXP) {
        window.awardPetXP(5);
      }

      setTodayMood({ mood_type: mood.type, date: today });

      // If stressed/anxious/overwhelmed, offer de-stressor
      if (["stressed", "anxious", "overwhelmed"].includes(mood.type)) {
        setTimeout(() => {
          setShowDeStressor(true);
          setIsSubmitting(false);
        }, 1000);
      } else {
        setTimeout(() => {
          onClose?.();
        }, 1500);
      }
    } catch (error) {
      console.error("Failed to log mood:", error);
      setIsSubmitting(false);
    }
  };

  if (showDeStressor) {
    return <DeStressor mood={selectedMood} onClose={onClose} />;
  }

  if (todayMood && !isSubmitting) {
    const mood = moodOptions.find(m => m.type === todayMood.mood_type);
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="pixel-card bg-white p-6 max-w-md mx-auto relative"
      >
        {onClose && (
          <button onClick={onClose} className="absolute top-4 right-4 p-2 hover:bg-gray-100 rounded">
            <X className="w-5 h-5" />
          </button>
        )}
        <div className="text-center">
          <div className="text-6xl mb-4 animate-bounce">{mood?.emoji}</div>
          <h3 className="pixel-text text-xl mb-2">You're feeling {mood?.label}!</h3>
          <p className="text-sm text-gray-600 mb-4">You've already logged your mood today. Come back tomorrow! 🌟</p>
          <button onClick={onClose} className="pixel-button bg-[#FFB6D9] text-white px-6 py-2">
            Close
          </button>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      className="pixel-card bg-white p-6 max-w-2xl mx-auto relative"
    >
      {onClose && (
        <button onClick={onClose} className="absolute top-4 right-4 p-2 hover:bg-gray-100 rounded">
          <X className="w-5 h-5" />
        </button>
      )}
      
      <div className="text-center mb-6">
        <h2 className="pixel-text text-2xl mb-2">How are you feeling? 💭</h2>
        <p className="text-sm text-gray-600">Log your daily mood and earn +5 XP!</p>
      </div>

      <AnimatePresence>
        {!isSubmitting ? (
          <motion.div
            initial={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <div className="grid grid-cols-3 sm:grid-cols-4 gap-3 mb-4">
              {moodOptions.map((mood) => (
                <motion.button
                  key={mood.type}
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => handleMoodSelect(mood)}
                  className="pixel-button p-4 flex flex-col items-center gap-2"
                  style={{ backgroundColor: mood.color }}
                >
                  <span className="text-4xl">{mood.emoji}</span>
                  <span className="text-xs font-bold">{mood.label}</span>
                </motion.button>
              ))}
            </div>

            <div className="mt-4">
              <label className="block text-sm font-bold mb-2">Any notes? (Optional)</label>
              <textarea
                value={note}
                onChange={(e) => setNote(e.target.value)}
                placeholder="How's your day going?"
                className="pixel-input w-full p-3 h-20 resize-none"
              />
            </div>
          </motion.div>
        ) : (
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center py-8"
          >
            <div className="text-6xl mb-4 animate-bounce">{selectedMood?.emoji}</div>
            <p className="pixel-text text-lg">Mood logged! ✨</p>
            <Sparkles className="w-8 h-8 mx-auto mt-4 text-yellow-500 animate-pulse" />
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}