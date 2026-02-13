import React, { useState, useEffect, useRef, useCallback } from "react";
import { Message } from "@/entities/Message";
import { User } from "@/entities/User";
import { Send, Users, User as UserIconSingle, Flag, AlertTriangle } from "lucide-react";
import { format } from "date-fns";
import { motion, AnimatePresence } from "framer-motion";

export default function ClassChat() {
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSending, setIsSending] = useState(false);
  const [activeChat, setActiveChat] = useState("with_teacher");
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const loadMessages = useCallback(async () => {
    if (!user?.class_name) return;
    try {
      const classMessages = await Message.filter(
        { class_name: user.class_name, chat_type: activeChat },
        "created_date",
        50
      );
      setMessages(classMessages);
    } catch (error) {
      console.error("Failed to load messages:", error);
    }
  }, [user?.class_name, activeChat]);

  const loadUser = async () => {
    try {
      const currentUser = await User.me();
      setUser(currentUser);
    } catch (error) {
      console.error("Failed to load user:", error);
    }
    setIsLoading(false);
  };

  useEffect(() => {
    loadUser();
  }, []);

  useEffect(() => {
    if (user) {
      loadMessages();
      const interval = setInterval(loadMessages, 5000); // refresh every 5 seconds
      return () => clearInterval(interval);
    }
  }, [user, loadMessages]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim() || !user) return;

    setIsSending(true);
    try {
      await Message.create({
        content: newMessage.trim(),
        class_name: user.class_name,
        chat_type: activeChat,
        sender_name: user.full_name,
        sender_type: user.account_type
      });
      setNewMessage("");
      await loadMessages();
    } catch (error) {
      console.error("Failed to send message:", error);
    }
    setIsSending(false);
  };
  
  const handleFlagMessage = async (message) => {
    if(window.confirm("Are you sure you want to flag this message for review?")) {
        try {
            await Message.update(message.id, {
                is_flagged: true,
                flagged_by: user.email
            });
            await loadMessages();
        } catch(error) {
            console.error("Failed to flag message:", error);
            alert("Could not flag message.");
        }
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="animate-spin rounded-full h-12 w-12 border-b-4 border-black"></div>
      </div>
    );
  }

  const renderMessage = (message) => {
    const isCurrentUser = message.created_by === user.email;
    const canFlag = false;

    return (
      <motion.div
        key={message.id}
        layout
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className={`flex items-end gap-2 group ${isCurrentUser ? "justify-end" : "justify-start"}`}
      >
        {isCurrentUser && canFlag && (
          <button onClick={() => handleFlagMessage(message)} className="opacity-0 group-hover:opacity-100 p-1 text-gray-400 hover:text-red-500 transition-opacity">
            <Flag className="w-4 h-4" />
          </button>
        )}
        <div className={`max-w-xs lg:max-w-md p-3 rounded-2xl border-2 border-black neo-shadow-small ${
          isCurrentUser
            ? "bg-[#98FB98] rounded-br-none"
            : "bg-white rounded-bl-none"
        }`}>
          {!isCurrentUser && (
            <div className="flex items-center gap-2 mb-1">
              <span className="font-bold text-xs text-gray-700">{message.sender_name}</span>
            </div>
          )}
          {message.is_flagged && (
             <div className="flex items-center gap-1 text-red-600 mb-1">
                <AlertTriangle className="w-3 h-3" />
                <span className="text-xs font-bold">Flagged for review</span>
             </div>
          )}
          <p className="text-sm break-words">{message.content}</p>
          <p className="text-xs text-gray-500 mt-1 text-right">
            {format(new Date(message.created_date), "HH:mm")}
          </p>
        </div>
        {!isCurrentUser && canFlag && (
          <button onClick={() => handleFlagMessage(message)} className="opacity-0 group-hover:opacity-100 p-1 text-gray-400 hover:text-red-500 transition-opacity">
            <Flag className="w-4 h-4" />
          </button>
        )}
      </motion.div>
    );
  };

  return (
    <div className="flex flex-col h-[calc(100vh-4rem)] max-w-4xl mx-auto bg-white border-4 border-black rounded-xl neo-shadow">
      {/* Chat Header */}
      <div className="p-4 border-b-4 border-black">
        <div className="text-center mb-4">
          <h1 className="text-2xl font-bold">Class {user.class_name} Chat</h1>
        </div>

        {/* Chat Type Tabs */}
        <div className="flex bg-gray-100 rounded-lg p-1 border-2 border-black">
          <button 
            onClick={() => setActiveChat("with_teacher")}
            className={`flex-1 py-2 px-4 rounded-md font-semibold text-sm transition-colors flex items-center justify-center gap-2 ${
              activeChat === "with_teacher" 
                ? "bg-white border-2 border-black neo-shadow-small" 
                : "text-gray-600"
            }`}
          >
            <Users className="w-4 h-4" />
            Class Chat
          </button>
          <button 
            onClick={() => setActiveChat("without_teacher")}
            className={`flex-1 py-2 px-4 rounded-md font-semibold text-sm transition-colors flex items-center justify-center gap-2 ${
              activeChat === "without_teacher" 
                ? "bg-white border-2 border-black neo-shadow-small" 
                : "text-gray-600"
            }`}
          >
            <UserIconSingle className="w-4 h-4" />
            Private Chat
          </button>
        </div>
      </div>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50">
        <AnimatePresence>
          {messages.map(renderMessage)}
        </AnimatePresence>
        <div ref={messagesEndRef} />
      </div>

      {/* Message Input */}
      <div className="p-4 bg-white border-t-4 border-black">
        <form onSubmit={handleSendMessage} className="flex gap-2">
          <input
            type="text"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder="Type your message..."
            className="flex-1 p-3 bg-gray-50 border-2 border-black rounded-lg focus:outline-none focus:ring-2 focus:ring-[#87CEEB]"
            maxLength={300}
            disabled={isSending}
          />
          <button 
            type="submit" 
            disabled={isSending || !newMessage.trim()}
            className="p-3 bg-[#98FB98] border-2 border-black rounded-lg neo-shadow hover:neo-shadow-small active:shadow-none disabled:opacity-50"
          >
            <Send className="w-5 h-5" />
          </button>
        </form>
      </div>
    </div>
  );
}