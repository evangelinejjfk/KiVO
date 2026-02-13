import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Calendar, Brain, Sparkles, Clock, Target } from "lucide-react";
import { motion } from "framer-motion";
import ReactMarkdown from "react-markdown";

export default function StudyPlanner() {
  const [isGenerating, setIsGenerating] = useState(false);
  const [studyPlan, setStudyPlan] = useState(null);
  const [homework, setHomework] = useState([]);
  const [events, setEvents] = useState([]);
  const [flashcards, setFlashcards] = useState([]);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const user = await base44.auth.me();
      const [homeworkData, eventsData, flashcardsData] = await Promise.all([
        base44.entities.Homework.filter({ created_by: user.email, status: "pending" }),
        base44.entities.Event.filter({ created_by: user.email, status: "planned" }),
        base44.entities.Flashcard.filter({ created_by: user.email }),
      ]);
      setHomework(homeworkData);
      setEvents(eventsData);
      setFlashcards(flashcardsData);
    } catch (error) {
      console.error("Failed to load data:", error);
    }
  };

  const generateStudyPlan = async () => {
    setIsGenerating(true);
    try {
      const upcomingHomework = homework.slice(0, 10).map(hw => ({
        title: hw.title,
        subject: hw.subject,
        dueDate: hw.dueDate,
      }));

      const upcomingEvents = events.slice(0, 10).map(ev => ({
        title: ev.title,
        type: ev.type,
        date: ev.date,
      }));

      const subjectCounts = flashcards.reduce((acc, card) => {
        acc[card.subject] = (acc[card.subject] || 0) + 1;
        return acc;
      }, {});

      const prompt = `You are an AI study coach helping a student create a personalized study plan.

**Student's Current Situation:**
- Pending Homework: ${upcomingHomework.length > 0 ? JSON.stringify(upcomingHomework) : "None"}
- Upcoming Events/Exams: ${upcomingEvents.length > 0 ? JSON.stringify(upcomingEvents) : "None"}
- Flashcard Topics: ${Object.keys(subjectCounts).length > 0 ? JSON.stringify(subjectCounts) : "None"}

Create a detailed, actionable 7-day study plan that:
1. Prioritizes urgent homework and upcoming exams
2. Allocates balanced study time across subjects
3. Includes breaks and wellness activities
4. Suggests specific times for flashcard review
5. Provides motivational tips

Format the plan with clear daily schedules using markdown with headings, bullet points, and emojis.`;

      const response = await base44.integrations.Core.InvokeLLM({
        prompt: prompt,
        add_context_from_internet: false,
      });

      setStudyPlan(response);
      
      // Award XP for generating study plan
      if (window.awardXP) {
        window.awardXP(15, "Created study plan! 📚");
      }
    } catch (error) {
      console.error("Failed to generate study plan:", error);
      alert("Failed to generate study plan. Please try again.");
    }
    setIsGenerating(false);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="pixel-card bg-gradient-to-r from-purple-100 to-pink-100 p-8 text-center relative overflow-hidden"
      >
        <Brain className="w-16 h-16 mx-auto mb-4 text-[#9B4D96]" />
        <h1 className="pixel-text text-3xl mb-2">AI Study Planner</h1>
        <p className="text-gray-700 font-bold">
          Get a personalized 7-day study schedule based on your homework, exams, and learning progress
        </p>
      </motion.div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        <div className="pixel-card bg-[#FFE5F4] p-4 text-center">
          <Target className="w-8 h-8 mx-auto mb-2 text-[#9B4D96]" />
          <p className="text-2xl font-bold">{homework.length}</p>
          <p className="text-sm font-bold text-gray-600">Pending Tasks</p>
        </div>
        <div className="pixel-card bg-[#FFF4C9] p-4 text-center">
          <Calendar className="w-8 h-8 mx-auto mb-2 text-[#9B4D96]" />
          <p className="text-2xl font-bold">{events.length}</p>
          <p className="text-sm font-bold text-gray-600">Upcoming Events</p>
        </div>
        <div className="pixel-card bg-[#B8E8D4] p-4 text-center">
          <Brain className="w-8 h-8 mx-auto mb-2 text-[#9B4D96]" />
          <p className="text-2xl font-bold">{Object.keys(flashcards.reduce((acc, card) => {
            acc[card.subject] = true;
            return acc;
          }, {})).length}</p>
          <p className="text-sm font-bold text-gray-600">Study Topics</p>
        </div>
      </div>

      {/* Generate Button */}
      {!studyPlan && (
        <div className="text-center">
          <Button
            onClick={generateStudyPlan}
            disabled={isGenerating}
            className="pixel-button bg-gradient-to-r from-[#9B4D96] to-[#FF6B9D] text-white text-lg px-8 py-6"
          >
            {isGenerating ? (
              <>
                <Clock className="w-5 h-5 mr-2 animate-spin" />
                Generating Your Plan...
              </>
            ) : (
              <>
                <Sparkles className="w-5 h-5 mr-2" />
                Generate My Study Plan
              </>
            )}
          </Button>
        </div>
      )}

      {/* Study Plan Display */}
      {studyPlan && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="pixel-card bg-white p-8"
        >
          <div className="flex justify-between items-center mb-6">
            <h2 className="pixel-text text-xl">Your Personalized Plan</h2>
            <Button
              onClick={generateStudyPlan}
              disabled={isGenerating}
              variant="outline"
              className="pixel-button"
            >
              <Sparkles className="w-4 h-4 mr-2" />
              Regenerate
            </Button>
          </div>
          <div className="prose max-w-none">
            <ReactMarkdown>{studyPlan}</ReactMarkdown>
          </div>
        </motion.div>
      )}
    </div>
  );
}