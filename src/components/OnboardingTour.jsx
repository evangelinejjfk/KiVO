import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, ArrowRight, ArrowLeft, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";

const tourSteps = [
  {
    title: "Welcome to KiVO! 🎮",
    description: "Your all-in-one student life companion! Let's take a quick tour to show you around.",
    highlight: null,
  },
  {
    title: "Meet Your Pet! 🐱",
    description: "Care for your virtual pet and earn XP by completing tasks, studying, and staying organized.",
    highlight: "pet",
  },
  {
    title: "Track Your Mood 💭",
    description: "Log how you're feeling each day. We'll provide personalized wellness suggestions based on your patterns.",
    highlight: "mood",
  },
  {
    title: "Stay Organized 📅",
    description: "Manage homework, events, and deadlines all in one place with our Calendar feature.",
    highlight: "calendar",
  },
  {
    title: "Smart Study Tools 🧠",
    description: "Create flashcards, quick references, and get AI-powered study help whenever you need it.",
    highlight: "study",
  },
  {
    title: "Money Management 💰",
    description: "Track your expenses and set budgets to stay on top of your finances.",
    highlight: "money",
  },
  {
    title: "You're All Set! ✨",
    description: "Ready to level up your student life? Let's get started!",
    highlight: null,
  },
];

export default function OnboardingTour({ onComplete }) {
  const [currentStep, setCurrentStep] = useState(0);

  const handleNext = () => {
    if (currentStep < tourSteps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      onComplete();
    }
  };

  const handlePrev = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSkip = () => {
    onComplete();
  };

  const step = tourSteps[currentStep];
  const progress = ((currentStep + 1) / tourSteps.length) * 100;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-60 p-4">
      <AnimatePresence mode="wait">
        <motion.div
          key={currentStep}
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: -20 }}
          className="pixel-card bg-white max-w-lg w-full p-8 relative"
        >
          <button
            onClick={handleSkip}
            className="absolute top-4 right-4 p-2 hover:bg-gray-100 rounded-lg transition-colors"
            aria-label="Skip tour"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="text-center mb-6">
            <img 
              src="https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/698f4fc393c74430f4d2e3a3/4223e3009_ChatGPT_Image_Feb_13__2026__02_44_22_PM-removebg-preview.png"
              alt="Kivy the mascot"
              className="w-24 h-24 mx-auto mb-4 object-contain animate-bounce"
            />
            <h2 className="pixel-text text-xl mb-3">{step.title}</h2>
            <p className="text-gray-700 font-bold">{step.description}</p>
          </div>

          {/* Progress Bar */}
          <div className="pixel-progress-bar mb-6">
            <div
              className="pixel-progress-fill bg-gradient-to-r from-[#9B4D96] to-[#FF6B9D]"
              style={{ width: `${progress}%` }}
            />
          </div>

          {/* Navigation */}
          <div className="flex justify-between items-center">
            <Button
              onClick={handlePrev}
              disabled={currentStep === 0}
              variant="outline"
              className="pixel-button bg-white"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back
            </Button>

            <span className="text-sm font-bold text-gray-600">
              {currentStep + 1} / {tourSteps.length}
            </span>

            <Button
              onClick={handleNext}
              className="pixel-button bg-[#9B4D96] text-white"
            >
              {currentStep === tourSteps.length - 1 ? "Get Started" : "Next"}
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </div>
        </motion.div>
      </AnimatePresence>
    </div>
  );
}