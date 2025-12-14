import React, { useState } from "react";
import { Event } from "@/entities/Event";
import { motion } from "framer-motion";
import { X } from "lucide-react";

export default function EventForm({ selectedDate, onFormSubmit, onCancel }) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [type, setType] = useState("event");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!title) {
      alert("Please enter a title.");
      return;
    }
    setIsSubmitting(true);
    await Event.create({ 
      title, 
      description, 
      date: selectedDate, 
      type 
    });
    setIsSubmitting(false);
    onFormSubmit();
  };

  const inputStyle = "w-full p-3 bg-white border-2 border-black rounded-lg focus:outline-none focus:ring-2 focus:ring-[#87CEEB] focus:border-transparent neo-shadow-small";
  const selectStyle = "w-full p-3 bg-white border-2 border-black rounded-lg focus:outline-none focus:ring-2 focus:ring-[#87CEEB] focus:border-transparent neo-shadow-small";
  const buttonStyle = "py-3 px-6 border-2 border-black rounded-lg neo-shadow hover:neo-shadow-small active:shadow-none transform active:translate-x-[2px] active:translate-y-[2px] transition-all duration-150 font-bold";

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9 }}
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
    >
      <div className="bg-white border-4 border-black rounded-xl neo-shadow p-6 w-full max-w-md">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-2xl font-bold">Add Event</h3>
          <button onClick={onCancel} className="p-2 hover:bg-gray-100 rounded">
            <X className="w-5 h-5" />
          </button>
        </div>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="font-bold block mb-1">Title*</label>
            <input 
              type="text" 
              value={title} 
              onChange={(e) => setTitle(e.target.value)} 
              className={inputStyle} 
              placeholder="e.g. Science Fair Project"
              autoFocus
            />
          </div>
          
          <div>
            <label className="font-bold block mb-1">Type</label>
            <select 
              value={type} 
              onChange={(e) => setType(e.target.value)} 
              className={selectStyle}
            >
              <option value="event">Event</option>
              <option value="project">Project</option>
              <option value="deadline">Deadline</option>
              <option value="meeting">Meeting</option>
              <option value="exam">Exam</option>
            </select>
          </div>
          
          <div>
            <label className="font-bold block mb-1">Description</label>
            <textarea 
              value={description} 
              onChange={(e) => setDescription(e.target.value)} 
              className={inputStyle + " h-20"} 
              placeholder="Any additional details..."
            />
          </div>
          
          <div className="flex gap-3">
            <button 
              type="button" 
              onClick={onCancel}
              className={buttonStyle + " bg-gray-300 flex-1"}
            >
              Cancel
            </button>
            <button 
              type="submit" 
              className={buttonStyle + " bg-[#98FB98] flex-1"}
              disabled={isSubmitting}
            >
              {isSubmitting ? "Adding..." : "Add Event"}
            </button>
          </div>
        </form>
      </div>
    </motion.div>
  );
}