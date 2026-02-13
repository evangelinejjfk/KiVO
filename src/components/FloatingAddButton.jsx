import React, { useState } from "react";
import { Plus, Brain, FileText, Upload, Calendar, Bot, BookOpen } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { createPageUrl } from "@/utils";
import { Link } from "react-router-dom";

const actions = [
  { name: "Add Homework", icon: BookOpen, href: createPageUrl("CalendarView"), action: "homework" },
  { name: "Add Flashcard", icon: Brain, href: createPageUrl("Flashcards"), action: "flashcard" },
  { name: "Add Quick Ref", icon: FileText, href: createPageUrl("QuickReference"), action: "quickref" },
  { name: "Upload Note", icon: Upload, href: createPageUrl("ResourceHub"), action: "upload" },
  { name: "Add Event", icon: Calendar, href: createPageUrl("SharedCalendar"), action: "event" },
  { name: "Ask AI", icon: Bot, href: createPageUrl("AIChat"), action: "ai" },
];

export default function FloatingAddButton() {
  const [isOpen, setIsOpen] = useState(false);

  const fabVariants = {
    closed: { rotate: 0 },
    open: { rotate: 45 },
  };

  const menuVariants = {
    open: {
      transition: {
        staggerChildren: 0.07,
        delayChildren: 0.2,
      },
    },
    closed: {
      transition: {
        staggerChildren: 0.05,
        staggerDirection: -1,
      },
    },
  };

  const itemVariants = {
    open: {
      y: 0,
      opacity: 1,
      scale: 1,
      transition: {
        y: { stiffness: 1000, velocity: -100 },
      },
    },
    closed: {
      y: 50,
      opacity: 0,
      scale: 0.3,
      transition: {
        y: { stiffness: 1000 },
      },
    },
  };

  const handleActionClick = (action) => {
    setIsOpen(false);
    // Add any specific pre-filled template logic here
    if (action.action === "homework") {
      // Could add homework form logic
    }
  };

  return (
    <div className="fixed bottom-6 right-6 z-50">
      <AnimatePresence>
        {isOpen && (
          <motion.div
            variants={menuVariants}
            initial="closed"
            animate="open"
            exit="closed"
            className="flex flex-col items-end gap-3 mb-4"
          >
            {actions.map((action) => (
              <motion.div
                key={action.name}
                variants={itemVariants}
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
                className="flex items-center gap-3"
              >
                <Link to={action.href} onClick={() => handleActionClick(action)} className="w-full">
                  <button className="pixel-button bg-[#FFD93D] text-black px-4 py-2 flex items-center gap-2 text-sm w-full whitespace-nowrap">
                    <action.icon className="w-4 h-4 text-black" />
                    {action.name}
                  </button>
                </Link>
              </motion.div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      <motion.button
        onClick={() => setIsOpen(!isOpen)}
        className="pixel-button bg-[#FF6B9D] text-white w-14 h-14 flex items-center justify-center shadow-lg"
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        style={{ zIndex: 60 }}
      >
        <motion.div 
          variants={fabVariants} 
          animate={isOpen ? "open" : "closed"}
          transition={{ duration: 0.2 }}
        >
          <Plus className="w-6 h-6 text-white" />
        </motion.div>
      </motion.button>
    </div>
  );
}