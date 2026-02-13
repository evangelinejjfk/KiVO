import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { ShoppingBag, Coffee, Book, Gamepad2, Train, Cookie, DollarSign, X, Upload } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { format } from "date-fns";

const CATEGORIES = [
  { id: "clothes", icon: ShoppingBag, color: "#FF6B9D", label: "Clothes" },
  { id: "snacks", icon: Cookie, color: "#FFD93D", label: "Snacks" },
  { id: "books", icon: Book, color: "#8B5CF6", label: "Books" },
  { id: "entertainment", icon: Gamepad2, color: "#A8E6CF", label: "Fun" },
  { id: "transit", icon: Train, color: "#C147E9", label: "Transit" },
  { id: "coffee", icon: Coffee, color: "#FF6B6B", label: "Coffee" },
  { id: "other", icon: DollarSign, color: "#94A3B8", label: "Other" }
];

export default function ExpenseForm({ onClose, onSuccess }) {
  const [category, setCategory] = useState("");
  const [amount, setAmount] = useState("");
  const [note, setNote] = useState("");
  const [date, setDate] = useState(format(new Date(), 'yyyy-MM-dd'));
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!category || !amount) {
      alert("Please select a category and enter an amount!");
      return;
    }

    setIsSubmitting(true);
    try {
      await base44.entities.Expense.create({
        category,
        amount: parseFloat(amount),
        note: note.trim() || null,
        date
      });
      
      // Award XP for tracking expense
      if (window.awardPetXP) {
        await window.awardPetXP(3);
      }
      
      onSuccess();
    } catch (error) {
      console.error("Failed to create expense:", error);
      alert("Failed to save expense. Please try again.");
    }
    setIsSubmitting(false);
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          onClick={(e) => e.stopPropagation()}
          className="pixel-card bg-white p-6 max-w-md w-full max-h-[90vh] overflow-y-auto"
        >
          <div className="flex items-center justify-between mb-6">
            <h2 className="pixel-text text-xl">Add Expense</h2>
            <button onClick={onClose} className="pixel-button bg-gray-200 text-black p-2">
              <X className="w-4 h-4" />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Category Selection */}
            <div>
              <label className="block font-bold mb-3">Pick a Category</label>
              <div className="grid grid-cols-4 gap-2">
                {CATEGORIES.map((cat) => {
                  const Icon = cat.icon;
                  return (
                    <button
                      key={cat.id}
                      type="button"
                      onClick={() => setCategory(cat.id)}
                      className={`pixel-button p-3 flex flex-col items-center gap-1 ${
                        category === cat.id ? 'ring-4 ring-black' : ''
                      }`}
                      style={{ backgroundColor: category === cat.id ? cat.color : '#f3f4f6' }}
                    >
                      <Icon className="w-6 h-6" style={{ color: category === cat.id ? '#fff' : '#000' }} />
                      <span className="text-xs font-bold" style={{ color: category === cat.id ? '#fff' : '#000' }}>
                        {cat.label}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Amount */}
            <div>
              <label className="block font-bold mb-2">Amount ($)</label>
              <Input
                type="number"
                step="0.01"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="0.00"
                className="pixel-input text-2xl font-bold text-center"
                required
              />
            </div>

            {/* Date */}
            <div>
              <label className="block font-bold mb-2">Date</label>
              <Input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="pixel-input"
                required
              />
            </div>

            {/* Note */}
            <div>
              <label className="block font-bold mb-2">Note (Optional)</label>
              <Textarea
                value={note}
                onChange={(e) => setNote(e.target.value)}
                placeholder="What did you buy?"
                className="pixel-input"
                rows={2}
              />
            </div>

            {/* Submit */}
            <Button
              type="submit"
              disabled={isSubmitting}
              className="pixel-button bg-[#FF6B9D] text-white w-full py-3"
            >
              {isSubmitting ? "Saving..." : "Add Expense 💰"}
            </Button>
          </form>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}