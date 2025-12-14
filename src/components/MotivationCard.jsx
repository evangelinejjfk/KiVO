import React, { useState, useEffect, useCallback } from "react";
import { StudyTip } from "@/entities/StudyTip";
import { User } from "@/entities/User";
import { InvokeLLM } from "@/integrations/Core";
import { Lightbulb, X, RefreshCw } from "lucide-react";
import { format } from "date-fns";
import { motion, AnimatePresence } from "framer-motion";

export default function MotivationCard() {
  const [todaysTip, setTodaysTip] = useState(null);
  const [showTip, setShowTip] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);

  const loadTodaysTip = useCallback(async () => {
    try {
      const today = format(new Date(), 'yyyy-MM-dd');
      const user = await User.me();
      
      const existingTips = await StudyTip.filter({ 
        created_by: user.email, 
        date: today 
      });

      if (existingTips.length > 0) {
        setTodaysTip(existingTips[0]);
        setShowTip(true);
      } else {
        await generateDailyTip(true);
      }
    } catch (error) {
      console.error("Failed to load today's tip:", error);
    }
  }, []);

  useEffect(() => {
    const isDismissed = sessionStorage.getItem("motivationCardDismissed");
    if (!isDismissed) {
      loadTodaysTip();
    }
  }, [loadTodaysTip]);

  const generateDailyTip = async (isInitialLoad = false) => {
    setIsGenerating(true);
    if (!isInitialLoad) {
      setShowTip(true);
    }
    
    try {
      const tips = [
        "study_tip: Give me a practical study tip for students",
        "fun_fact: Share an interesting educational fun fact",
        "motivation: Provide a motivational quote or message for students"
      ];
      
      const randomTip = tips[Math.floor(Math.random() * tips.length)];
      const [category, prompt] = randomTip.split(": ");
      
      const response = await InvokeLLM({ 
        prompt: `${prompt}. Keep it concise, engaging, and under 100 words.` 
      });

      const today = format(new Date(), 'yyyy-MM-dd');
      
      const user = await User.me();
      const existingTips = await StudyTip.filter({ created_by: user.email, date: today });
      
      let newTip;
      if (existingTips.length > 0) {
        newTip = await StudyTip.update(existingTips[0].id, { tip: response, category: category });
      } else {
        newTip = await StudyTip.create({
          tip: response,
          date: today,
          category: category
        });
      }

      setTodaysTip(newTip);
      setShowTip(true);
    } catch (error) {
      console.error("Failed to generate daily tip:", error);
    }
    setIsGenerating(false);
  };
  
  const handleDismiss = () => {
      setShowTip(false);
      sessionStorage.setItem("motivationCardDismissed", "true");
  }

  const getCategoryIcon = (category) => {
    switch (category) {
      case "fun_fact": return "🤓";
      case "motivation": return "💪";
      default: return "💡";
    }
  };

  const getCategoryColor = (category) => {
    switch (category) {
      case "fun_fact": return "bg-purple-200";
      case "motivation": return "bg-green-200";
      default: return "bg-yellow-200";
    }
  };

  if (!showTip && !isGenerating) {
    return (
      <motion.div
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        className="fixed top-6 right-6 z-40"
      >
        <button
          onClick={() => {
             sessionStorage.removeItem("motivationCardDismissed");
             loadTodaysTip();
          }}
          className="p-3 bg-[#98FB98] border-2 border-black rounded-full neo-shadow hover:neo-shadow-small active:shadow-none transform active:translate-x-[2px] active:translate-y-[2px] transition-all duration-150"
          title="Daily Motivation"
        >
          <Lightbulb className="w-5 h-5" />
        </button>
      </motion.div>
    );
  }

  return (
    <AnimatePresence>
      {(showTip || isGenerating) && (
        <motion.div
          initial={{ opacity: 0, x: 100 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: 100 }}
          className="fixed top-6 right-6 z-40 max-w-sm w-[calc(100vw-3rem)]"
        >
          <div className="p-4 bg-white border-4 border-black rounded-xl neo-shadow">
            <div className="flex justify-between items-start mb-3">
              <div className="flex items-center gap-2">
                <span className="text-xl">
                  {todaysTip ? getCategoryIcon(todaysTip.category) : "🔄"}
                </span>
                <span className={`px-2 py-1 text-xs font-bold border border-black rounded ${
                  todaysTip ? getCategoryColor(todaysTip.category) : "bg-gray-200"
                }`}>
                  {isGenerating ? "Generating..." : todaysTip?.category?.replace("_", " ") || "Daily Tip"}
                </span>
              </div>
              <button
                onClick={handleDismiss}
                className="p-1 hover:bg-gray-100 rounded"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {isGenerating ? (
              <div className="flex items-center gap-3">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-black"></div>
                <p className="text-sm">Generating your daily motivation...</p>
              </div>
            ) : (
              <>
                <p className="text-sm mb-3">{todaysTip?.tip}</p>
                <div className="flex justify-between items-center">
                  <span className="text-xs text-gray-500">
                    {format(new Date(), 'MMM d, yyyy')}
                  </span>
                  <button
                    onClick={() => generateDailyTip()}
                    className="p-1 hover:bg-gray-100 rounded"
                    title="Generate new tip"
                    disabled={isGenerating}
                  >
                    <RefreshCw className={`w-4 h-4 ${isGenerating ? 'animate-spin' : ''}`} />
                  </button>
                </div>
              </>
            )}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}