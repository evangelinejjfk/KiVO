import React, { useState } from "react";
import { Homework } from "@/entities/Homework";
import { motion } from "framer-motion";

export default function HomeworkForm({ onFormSubmit }) {
  const [title, setTitle] = useState("");
  const [subject, setSubject] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [notes, setNotes] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!title || !subject || !dueDate) {
      alert("Please fill in all required fields.");
      return;
    }
    setIsSubmitting(true);
    await Homework.create({ title, subject, dueDate, notes });
    setIsSubmitting(false);
    onFormSubmit();
  };

  const inputStyle = "w-full p-3 bg-white border-2 border-black rounded-lg focus:outline-none focus:ring-2 focus:ring-[#87CEEB] focus:border-transparent neo-shadow-small";
  const buttonStyle = "w-full py-3 px-4 bg-[#98FB98] border-2 border-black rounded-lg neo-shadow hover:neo-shadow-small active:shadow-none transform active:translate-x-[2px] active:translate-y-[2px] transition-all duration-150 font-bold text-lg disabled:opacity-50";

  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      className="p-6 bg-white border-4 border-black rounded-xl neo-shadow"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="font-bold block mb-1">Title*</label>
            <input type="text" value={title} onChange={(e) => setTitle(e.target.value)} className={inputStyle} placeholder="e.g. Algebra Chapter 5"/>
          </div>
          <div>
            <label className="font-bold block mb-1">Subject*</label>
            <input type="text" value={subject} onChange={(e) => setSubject(e.target.value)} className={inputStyle} placeholder="e.g. Math"/>
          </div>
        </div>
        <div>
          <label className="font-bold block mb-1">Due Date*</label>
          <input type="date" value={dueDate} onChange={(e) => setDueDate(e.target.value)} className={inputStyle} />
        </div>
        <div>
          <label className="font-bold block mb-1">Notes</label>
          <textarea value={notes} onChange={(e) => setNotes(e.target.value)} className={inputStyle + " h-24"} placeholder="Any specific instructions..."></textarea>
        </div>
        <button type="submit" className={buttonStyle} disabled={isSubmitting}>
          {isSubmitting ? "Adding..." : "Add Homework"}
        </button>
      </form>
    </motion.div>
  );
}