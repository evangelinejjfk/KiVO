import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { motion, AnimatePresence } from "framer-motion";
import { Heart, X, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import ReactMarkdown from "react-markdown";
import { format, subDays } from "date-fns";

export default function WellnessCoach({ onClose }) {
  const [suggestions, setSuggestions] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    generateSuggestions();
  }, []);

  const generateSuggestions = async () => {
    setIsLoading(true);
    try {
      const user = await base44.auth.me();
      
      // Get mood logs from past 7 days
      const sevenDaysAgo = format(subDays(new Date(), 7), 'yyyy-MM-dd');
      const recentMoods = await base44.entities.Mood.filter({
        created_by: user.email,
      });

      const moodsInRange = recentMoods.filter(mood => mood.date >= sevenDaysAgo);

      // Count negative moods
      const negativeMoods = moodsInRange.filter(mood => 
        ['stressed', 'anxious', 'overwhelmed', 'tired'].includes(mood.mood_type)
      );

      if (negativeMoods.length >= 2) {
        const moodSummary = moodsInRange.map(m => ({
          date: m.date,
          mood: m.mood_type,
          note: m.note
        }));

        const prompt = `You are a supportive wellness coach for students. Based on their recent mood logs, provide personalized advice.

**Recent Mood Pattern:**
${JSON.stringify(moodSummary, null, 2)}

The student has been feeling stressed or anxious recently. Provide:
1. **Understanding & Validation** - Acknowledge their feelings
2. **Immediate Coping Strategies** - 3-4 quick techniques they can use right now
3. **Wellness Activities** - Suggest specific activities from the app (breathing exercises, pixel garden, mindful puzzle)
4. **Long-term Tips** - Gentle advice for managing stress over time
5. **Encouragement** - Positive, supportive closing message

Use a warm, friendly, student-appropriate tone. Format with markdown, emojis, and clear sections.`;

        const response = await base44.integrations.Core.InvokeLLM({
          prompt: prompt,
          add_context_from_internet: false,
        });

        setSuggestions(response);

        // Update last wellness check
        await base44.auth.updateMe({
          last_wellness_check: format(new Date(), 'yyyy-MM-dd')
        });
      } else {
        setSuggestions("Great job maintaining your wellness! 🎉 Keep logging your moods and we'll provide personalized support when needed.");
      }
    } catch (error) {
      console.error("Failed to generate suggestions:", error);
      setSuggestions("Unable to generate suggestions right now. Please try again later.");
    }
    setIsLoading(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-60 p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="pixel-card bg-white max-w-2xl w-full max-h-[80vh] overflow-y-auto p-8 relative"
      >
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 hover:bg-gray-100 rounded-lg transition-colors"
          aria-label="Close wellness coach"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="text-center mb-6">
          <Heart className="w-12 h-12 mx-auto mb-4 text-[#FF6B9D]" />
          <h2 className="pixel-text text-xl mb-2">Wellness Check-In</h2>
        </div>

        {isLoading ? (
          <div className="text-center py-8">
            <div className="pixel-spinner mx-auto mb-4"></div>
            <p className="font-bold text-gray-600">Analyzing your wellness patterns...</p>
          </div>
        ) : (
          <div className="prose max-w-none">
            <ReactMarkdown>{suggestions}</ReactMarkdown>
          </div>
        )}

        <div className="mt-6 text-center">
          <Button
            onClick={onClose}
            className="pixel-button bg-[#FF6B9D] text-white"
          >
            Thank You!
          </Button>
        </div>
      </motion.div>
    </div>
  );
}