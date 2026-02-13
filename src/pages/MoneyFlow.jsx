import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { PieChart, Pie, Cell, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";
import { ShoppingBag, Coffee, Book, Gamepad2, Train, Cookie, Plus, TrendingUp, DollarSign, Target } from "lucide-react";
import { motion } from "framer-motion";
import { format, startOfMonth, endOfMonth } from "date-fns";
import ExpenseForm from "../components/finance/ExpenseForm";
import BudgetSetup from "../components/finance/BudgetSetup";

const CATEGORY_CONFIG = {
  clothes: { icon: ShoppingBag, color: "#FF6B9D", label: "Clothes" },
  snacks: { icon: Cookie, color: "#FFD93D", label: "Snacks" },
  books: { icon: Book, color: "#8B5CF6", label: "Books" },
  entertainment: { icon: Gamepad2, color: "#A8E6CF", label: "Fun" },
  transit: { icon: Train, color: "#C147E9", label: "Transit" },
  coffee: { icon: Coffee, color: "#FF6B6B", label: "Coffee" },
  other: { icon: DollarSign, color: "#94A3B8", label: "Other" }
};

export default function MoneyFlow() {
  const [expenses, setExpenses] = useState([]);
  const [budget, setBudget] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [showExpenseForm, setShowExpenseForm] = useState(false);
  const [showBudgetSetup, setShowBudgetSetup] = useState(false);

  const currentMonth = format(new Date(), 'yyyy-MM');

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setIsLoading(true);
    const user = await base44.auth.me();
    
    // Load expenses for current month
    const allExpenses = await base44.entities.Expense.filter({ created_by: user.email }, "-date");
    const monthStart = startOfMonth(new Date());
    const monthEnd = endOfMonth(new Date());
    
    const monthExpenses = allExpenses.filter(exp => {
      const expDate = new Date(exp.date);
      return expDate >= monthStart && expDate <= monthEnd;
    });
    
    setExpenses(monthExpenses);

    // Load budget
    const budgets = await base44.entities.Budget.filter({ 
      created_by: user.email,
      month: currentMonth 
    });
    
    if (budgets.length > 0) {
      setBudget(budgets[0]);
    }
    
    setIsLoading(false);
  };

  // Calculate totals
  const totalSpent = expenses.reduce((sum, exp) => sum + exp.amount, 0);
  const clothesSpent = expenses.filter(e => e.category === 'clothes').reduce((sum, exp) => sum + exp.amount, 0);
  
  const monthlyIncome = budget?.monthly_income || 0;
  const clothesBudget = budget?.clothes_budget || 0;
  const clothesPercent = clothesBudget > 0 ? (clothesSpent / clothesBudget * 100) : 0;
  const budgetPercent = monthlyIncome > 0 ? (totalSpent / monthlyIncome * 100) : 0;

  // Prepare pie chart data
  const pieData = Object.keys(CATEGORY_CONFIG).map(cat => {
    const total = expenses.filter(e => e.category === cat).reduce((sum, exp) => sum + exp.amount, 0);
    return {
      name: CATEGORY_CONFIG[cat].label,
      value: total,
      color: CATEGORY_CONFIG[cat].color
    };
  }).filter(d => d.value > 0);

  // Prepare line chart data (last 7 days)
  const lineData = [];
  for (let i = 6; i >= 0; i--) {
    const date = new Date();
    date.setDate(date.getDate() - i);
    const dateStr = format(date, 'yyyy-MM-dd');
    const dayExpenses = expenses.filter(e => e.date === dateStr).reduce((sum, exp) => sum + exp.amount, 0);
    
    lineData.push({
      date: format(date, 'MMM d'),
      spent: dayExpenses,
      budget: monthlyIncome / 30
    });
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="pixel-spinner"></div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="pixel-text text-3xl text-black flex items-center gap-3">
            💰 MoneyFlow
          </h1>
          <p className="text-gray-600 mt-1">Track your spending like a pro!</p>
        </div>
        <div className="flex gap-3">
          <Button
            onClick={() => setShowBudgetSetup(true)}
            className="pixel-button bg-[#A8E6CF] text-black"
          >
            <Target className="w-4 h-4 mr-2" />
            Set Budget
          </Button>
          <Button
            onClick={() => setShowExpenseForm(true)}
            className="pixel-button bg-[#FF6B9D] text-white"
          >
            <Plus className="w-4 h-4 mr-2" />
            Add Expense
          </Button>
        </div>
      </div>

      {/* Big Numbers */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="pixel-card bg-gradient-to-br from-[#FF6B9D] to-[#C147E9] text-white p-6"
        >
          <p className="text-sm opacity-90 mb-2">Spent This Month</p>
          <p className="text-4xl font-bold">${totalSpent.toFixed(2)}</p>
          <p className="text-sm mt-2 opacity-90">
            {budgetPercent.toFixed(0)}% of budget used
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0, transition: { delay: 0.1 } }}
          className="pixel-card bg-[#FFD93D] p-6"
        >
          <p className="text-sm text-gray-700 mb-2">Monthly Income</p>
          <p className="text-4xl font-bold text-black">${monthlyIncome.toFixed(0)}</p>
          <p className="text-sm mt-2 text-gray-700">
            ${(monthlyIncome - totalSpent).toFixed(2)} left
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0, transition: { delay: 0.2 } }}
          className="pixel-card bg-[#A8E6CF] p-6"
        >
          <p className="text-sm text-gray-700 mb-2">Clothes Budget</p>
          <p className="text-4xl font-bold text-black">${clothesSpent.toFixed(2)}</p>
          <p className="text-sm mt-2 text-gray-700">
            ${(clothesBudget - clothesSpent).toFixed(2)} left
          </p>
        </motion.div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Pie Chart */}
        <div className="pixel-card bg-white p-6">
          <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
            📊 Spending Breakdown
          </h3>
          {pieData.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  outerRadius={100}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {pieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} stroke="#000" strokeWidth={2} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-[300px] flex items-center justify-center text-gray-500">
              No expenses yet! Add some to see the breakdown.
            </div>
          )}
        </div>

        {/* Line Chart */}
        <div className="pixel-card bg-white p-6">
          <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
            📈 Spending Trend (7 Days)
          </h3>
          {lineData.some(d => d.spent > 0) ? (
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={lineData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#000" />
                <XAxis dataKey="date" stroke="#000" />
                <YAxis stroke="#000" />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey="spent" stroke="#FF6B9D" strokeWidth={3} name="Spent" />
                <Line type="monotone" dataKey="budget" stroke="#A8E6CF" strokeWidth={3} strokeDasharray="5 5" name="Daily Budget" />
              </LineChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-[300px] flex items-center justify-center text-gray-500">
              Track expenses for 7 days to see trends!
            </div>
          )}
        </div>
      </div>

      {/* Clothes Budget Gauge */}
      <div className="pixel-card bg-white p-6">
        <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
          👗 Clothes Budget Status
        </h3>
        <div className="max-w-md mx-auto">
          <div className="relative pt-1">
            <div className="flex mb-2 items-center justify-between">
              <div>
                <span className="text-xs font-semibold inline-block py-1 px-2 uppercase rounded-full text-black bg-[#FFD93D]">
                  {clothesPercent.toFixed(0)}% Used
                </span>
              </div>
              <div className="text-right">
                <span className="text-xs font-semibold inline-block text-black">
                  ${clothesSpent.toFixed(2)} / ${clothesBudget.toFixed(2)}
                </span>
              </div>
            </div>
            <div className="pixel-progress-bar">
              <div
                className={`pixel-progress-fill ${
                  clothesPercent > 100 ? 'bg-[#FF6B6B]' : 
                  clothesPercent > 80 ? 'bg-[#FFD93D]' : 
                  'bg-[#A8E6CF]'
                }`}
                style={{ width: `${Math.min(clothesPercent, 100)}%` }}
              ></div>
            </div>
          </div>
          <p className="text-center mt-4 text-sm text-gray-600">
            {clothesPercent < 80 ? "✅ You're doing great!" : 
             clothesPercent < 100 ? "⚠️ Almost at your limit!" : 
             "🚨 Over budget!"}
          </p>
        </div>
      </div>

      {/* Recent Expenses */}
      <div className="pixel-card bg-white p-6">
        <h3 className="font-bold text-lg mb-4">Recent Expenses</h3>
        {expenses.length > 0 ? (
          <div className="space-y-2">
            {expenses.slice(0, 5).map((expense, idx) => {
              const CategoryIcon = CATEGORY_CONFIG[expense.category].icon;
              return (
                <motion.div
                  key={expense.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0, transition: { delay: idx * 0.05 } }}
                  className="pixel-item bg-gray-50 p-3 flex items-center justify-between"
                >
                  <div className="flex items-center gap-3">
                    <div className="pixel-icon-sm" style={{ backgroundColor: CATEGORY_CONFIG[expense.category].color }}>
                      <CategoryIcon className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <p className="font-bold text-sm">{expense.note || CATEGORY_CONFIG[expense.category].label}</p>
                      <p className="text-xs text-gray-600">{format(new Date(expense.date), 'MMM d, yyyy')}</p>
                    </div>
                  </div>
                  <p className="font-bold text-lg">${expense.amount.toFixed(2)}</p>
                </motion.div>
              );
            })}
          </div>
        ) : (
          <p className="text-gray-500 text-center py-8">No expenses yet. Start tracking!</p>
        )}
      </div>

      {/* Forms */}
      {showExpenseForm && (
        <ExpenseForm 
          onClose={() => setShowExpenseForm(false)} 
          onSuccess={() => {
            setShowExpenseForm(false);
            loadData();
          }}
        />
      )}

      {showBudgetSetup && (
        <BudgetSetup
          currentBudget={budget}
          currentMonth={currentMonth}
          onClose={() => setShowBudgetSetup(false)}
          onSuccess={() => {
            setShowBudgetSetup(false);
            loadData();
          }}
        />
      )}
    </div>
  );
}