import React from 'react';
import { format, isPast } from 'date-fns';
import { motion } from 'framer-motion';
import { Trash2 } from 'lucide-react';

// Function to generate a color from a string (subject)
const stringToColor = (str) => {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = str.charCodeAt(i) + ((hash << 5) - hash);
  }
  let color = '#';
  for (let i = 0; i < 3; i++) {
    const value = (hash >> (i * 8)) & 0xFF;
    color += ('00' + value.toString(16)).substr(-2);
  }
  return color;
};

// Simple function to get a contrasting text color
const getContrastingTextColor = (hexcolor) => {
  hexcolor = hexcolor.replace("#", "");
  const r = parseInt(hexcolor.substr(0, 2), 16);
  const g = parseInt(hexcolor.substr(2, 2), 16);
  const b = parseInt(hexcolor.substr(4, 2), 16);
  const yiq = ((r * 299) + (g * 587) + (b * 114)) / 1000;
  return (yiq >= 128) ? '#000000' : '#FFFFFF';
};

export default function TaskCard({ task, onStatusChange, onDelete, index }) {
  const subjectColor = stringToColor(task.subject);
  const textColor = getContrastingTextColor(subjectColor);
  const isOverdue = isPast(new Date(task.dueDate)) && task.status === 'pending';

  return (
    <motion.div
      initial={{ opacity: 0, y: 50, scale: 0.9 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, scale: 0.5, transition: { duration: 0.2 } }}
      transition={{ delay: index * 0.05 }}
      className={`p-5 border-4 border-black rounded-xl neo-shadow flex flex-col justify-between ${task.status === 'completed' ? 'bg-gray-300' : 'bg-white'}`}
    >
      <div>
        <div className="flex justify-between items-start mb-3">
          <span 
            className="px-3 py-1 text-sm font-bold rounded-full border-2 border-black"
            style={{ backgroundColor: subjectColor, color: textColor }}
          >
            {task.subject}
          </span>
          {isOverdue && (
             <span className="px-3 py-1 text-sm font-bold bg-red-500 border-2 border-black text-white rounded-lg">
                OVERDUE
             </span>
          )}
        </div>
        <h3 className={`text-xl font-bold ${task.status === 'completed' ? 'line-through' : ''}`}>{task.title}</h3>
        <p className="text-gray-600 mb-3">Due: {format(new Date(task.dueDate), 'E, MMM dd, yyyy')}</p>
        {task.notes && <p className="text-sm bg-yellow-100 border-2 border-black rounded p-2">{task.notes}</p>}
      </div>

      <div className="flex items-center justify-between mt-4">
        <label className="flex items-center gap-2 font-bold cursor-pointer">
          <input 
            type="checkbox" 
            checked={task.status === 'completed'}
            onChange={() => onStatusChange(task)}
            className="h-6 w-6 border-2 border-black rounded-md appearance-none checked:bg-black checked:border-black bg-white"
            style={{backgroundImage: `url("data:image/svg+xml,%3csvg viewBox='0 0 16 16' fill='white' xmlns='http://www.w3.org/2000/svg'%3e%3cpath d='M12.207 4.793a1 1 0 010 1.414l-5 5a1 1 0 01-1.414 0l-2-2a1 1 0 011.414-1.414L6.5 9.086l4.293-4.293a1 1 0 011.414 0z'/%3e%3c/svg%3e")`}}
          />
          {task.status === 'completed' ? 'Done!' : 'Mark as done'}
        </label>
        <button onClick={() => onDelete(task.id)} className="p-2 rounded-lg border-2 border-black bg-red-400 neo-shadow-small active:shadow-none transform active:translate-x-[1px] active:translate-y-[1px]">
          <Trash2 className="w-5 h-5"/>
        </button>
      </div>
    </motion.div>
  );
}