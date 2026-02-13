import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function BudgetSetup({ currentBudget, currentMonth, onClose, onSuccess }) {
  const [monthlyIncome, setMonthlyIncome] = useState(currentBudget?.monthly_income || "");
  const [clothesBudget, setClothesBudget] = useState(currentBudget?.clothes_budget || "");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!monthlyIncome || !clothesBudget) {
      alert("Please fill in both fields!");
      return;
    }

    setIsSubmitting(true);
    try {
      if (currentBudget) {
        await base44.entities.Budget.update(currentBudget.id, {
          monthly_income: parseFloat(monthlyIncome),
          clothes_budget: parseFloat(clothesBudget)
        });
      } else {
        await base44.entities.Budget.create({
          month: currentMonth,
          monthly_income: parseFloat(monthlyIncome),
          clothes_budget: parseFloat(clothesBudget)
        });
      }
      onSuccess();
    } catch (error) {
      console.error("Failed to save budget:", error);
      alert("Failed to save budget. Please try again.");
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
          className="pixel-card bg-white p-6 max-w-md w-full"
        >
          <div className="flex items-center justify-between mb-6">
            <h2 className="pixel-text text-xl">Set Budget</h2>
            <button onClick={onClose} className="pixel-button bg-gray-200 text-black p-2">
              <X className="w-4 h-4" />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block font-bold mb-2">Monthly Income/Allowance ($)</label>
              <Input
                type="number"
                step="0.01"
                value={monthlyIncome}
                onChange={(e) => setMonthlyIncome(e.target.value)}
                placeholder="200.00"
                className="pixel-input text-2xl font-bold text-center"
                required
              />
              <p className="text-xs text-gray-600 mt-1">How much money do you get per month?</p>
            </div>

            <div>
              <label className="block font-bold mb-2">Clothes Budget ($)</label>
              <Input
                type="number"
                step="0.01"
                value={clothesBudget}
                onChange={(e) => setClothesBudget(e.target.value)}
                placeholder="120.00"
                className="pixel-input text-2xl font-bold text-center"
                required
              />
              <p className="text-xs text-gray-600 mt-1">How much can you spend on clothes?</p>
            </div>

            <Button
              type="submit"
              disabled={isSubmitting}
              className="pixel-button bg-[#A8E6CF] text-black w-full py-3"
            >
              {isSubmitting ? "Saving..." : "Save Budget 🎯"}
            </Button>
          </form>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}