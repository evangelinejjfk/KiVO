import React, { useState, useEffect } from "react";
import { AIChat } from "@/entities/AIChat";
import { User } from "@/entities/User";
import ReactMarkdown from "react-markdown";
import { motion, AnimatePresence } from "framer-motion";
import { History } from "lucide-react";

export default function ChatHistoryPage() {
  const [chats, setChats] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadChats = async () => {
      try {
        const user = await User.me();
        const userChats = await AIChat.filter({ created_by: user.email }, "-created_date");
        setChats(userChats);
      } catch (error) {
        console.error("Failed to load chat history:", error);
      } finally {
        setIsLoading(false);
      }
    };
    loadChats();
  }, []);

  return (
    <div className="space-y-8">
      <div className="text-center">
        <History className="mx-auto h-16 w-16 mb-4" />
        <h1 className="text-4xl font-bold">AI Chat History</h1>
        <p className="text-lg text-gray-700 mt-2">
          A log of all your conversations with StudyBot.
        </p>
      </div>

      {isLoading ? (
        <div className="text-center py-10">
          <div className="animate-spin rounded-full h-12 w-12 border-b-4 border-black mx-auto"></div>
          <p className="mt-4 font-bold">Loading history...</p>
        </div>
      ) : (
        <div className="space-y-6">
          <AnimatePresence>
            {chats.length > 0 ? (
              chats.map((chat, index) => (
                <motion.div
                  key={chat.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="p-6 bg-white border-4 border-black rounded-xl neo-shadow"
                >
                  <div className="mb-4">
                    <p className="font-bold text-lg">You asked:</p>
                    <p className="p-3 bg-green-100 border-2 border-black rounded-lg mt-1">{chat.topic}</p>
                  </div>
                  <div className="prose prose-lg max-w-none prose-headings:font-bold prose-h1:text-2xl prose-h2:text-xl border-t-2 border-dashed border-black pt-4">
                    <p className="font-bold text-lg">StudyBot answered:</p>
                    <ReactMarkdown>{chat.notes}</ReactMarkdown>
                  </div>
                </motion.div>
              ))
            ) : (
              <div className="text-center py-10 px-6 bg-white border-4 border-black rounded-xl neo-shadow">
                <h3 className="text-2xl font-bold">No History Found</h3>
                <p className="mt-2 text-gray-600">
                  Head over to the AI Chat page to start a conversation with StudyBot!
                </p>
              </div>
            )}
          </AnimatePresence>
        </div>
      )}
    </div>
  );
}