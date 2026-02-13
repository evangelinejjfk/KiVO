import React from "react";
import { format } from "date-fns";
import { MapPin, Users, Sparkles } from "lucide-react";
import { motion } from "framer-motion";

const sentimentEmojis = {
  happy: "😊",
  excited: "🎉",
  nostalgic: "🥹",
  proud: "🏆",
  grateful: "🙏",
  stressed: "😤",
  hopeful: "✨"
};

const themeColors = {
  friends: "bg-pink-100 text-pink-800",
  academic: "bg-blue-100 text-blue-800",
  milestones: "bg-yellow-100 text-yellow-800",
  sports: "bg-green-100 text-green-800",
  arts: "bg-purple-100 text-purple-800",
  family: "bg-orange-100 text-orange-800",
  travel: "bg-teal-100 text-teal-800"
};

export default function MemoryCard({ memory, index = 0 }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1 }}
      className="bg-white border-4 border-black rounded-xl overflow-hidden neo-shadow hover:translate-x-1 hover:translate-y-1 hover:shadow-none transition-all"
    >
      {memory.photo_url && (
        <div className="relative h-48 overflow-hidden">
          <img
            src={memory.photo_url}
            alt="Memory"
            className="w-full h-full object-cover"
          />
          <div className="absolute top-2 right-2 bg-white border-2 border-black rounded-full px-2 py-1 text-sm font-bold">
            {sentimentEmojis[memory.sentiment] || "📸"}
          </div>
        </div>
      )}
      
      <div className="p-4 space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-sm font-bold text-gray-600">
            {format(new Date(memory.date), "MMM d, yyyy")}
          </span>
          {memory.location && (
            <span className="flex items-center gap-1 text-xs text-gray-500">
              <MapPin className="w-3 h-3" />
              {memory.location}
            </span>
          )}
        </div>

        <p className="text-gray-800 font-medium leading-relaxed">
          {memory.journal}
        </p>

        {memory.ai_caption && (
          <div className="flex items-start gap-2 p-2 bg-gradient-to-r from-purple-50 to-pink-50 rounded-lg border-2 border-purple-200">
            <Sparkles className="w-4 h-4 text-purple-500 flex-shrink-0 mt-0.5" />
            <p className="text-sm text-purple-700 italic">{memory.ai_caption}</p>
          </div>
        )}

        {memory.themes && memory.themes.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {memory.themes.map((theme) => (
              <span
                key={theme}
                className={`px-2 py-1 rounded-full text-xs font-bold border-2 border-black ${themeColors[theme] || "bg-gray-100 text-gray-800"}`}
              >
                {theme}
              </span>
            ))}
          </div>
        )}

        {memory.mentioned_people && memory.mentioned_people.length > 0 && (
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <Users className="w-4 h-4" />
            <span>{memory.mentioned_people.join(", ")}</span>
          </div>
        )}
      </div>
    </motion.div>
  );
}