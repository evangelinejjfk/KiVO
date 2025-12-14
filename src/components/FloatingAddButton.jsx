import React, { useState } from "react";
import { Plus, Brain, FileText, Upload, Calendar, Bot, BookOpen } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { createPageUrl } from "@/utils";
import { Link } from "react-router-dom";

const actions = [
  { name: "Add Homework", icon: BookOpen, href: createPageUrl("Dashboard"), action: "homework" },
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
                <motion.span 
                  className="p-2 bg-white text-black border-2 border-black rounded-lg text-sm font-semibold neo-shadow-small whitespace-nowrap"
                  initial={{ opacity: 0, x: 10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.1 }}
                >
                  {action.name}
                </motion.span>
                <Link to={action.href} onClick={() => handleActionClick(action)}>
                  <button className="w-12 h-12 bg-white border-2 border-black rounded-full flex items-center justify-center neo-shadow-small hover:neo-shadow active:shadow-none transform active:translate-x-[1px] active:translate-y-[1px] transition-all duration-150">
                    <action.icon className="w-5 h-5 text-black" />
                  </button>
                </Link>
              </motion.div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      <motion.button
        onClick={() => setIsOpen(!isOpen)}
        className="w-16 h-16 bg-[#98FB98] border-4 border-black rounded-full neo-shadow flex items-center justify-center text-3xl font-bold hover:neo-shadow-small active:shadow-none transform active:translate-x-[2px] active:translate-y-[2px] transition-all duration-150"
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        style={{ zIndex: 60 }} // Ensure it's always on top
      >
        <motion.div 
          variants={fabVariants} 
          animate={isOpen ? "open" : "closed"}
          transition={{ duration: 0.2 }}
        >
          <Plus className="w-8 h-8 text-black" />
        </motion.div>
      </motion.button>
    </div>
  );
}