import React, { useState, useEffect, useRef } from "react";
import { InvokeLLM } from "@/integrations/Core";
import { AIChat } from "@/entities/AIChat";
import { User } from "@/entities/User";
import ReactMarkdown from "react-markdown";
import { Send, BrainCircuit, Bot, User as UserIcon } from "lucide-react";

export default function AIChatPage() {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [explanationMode, setExplanationMode] = useState("Normal");
  const [subject, setSubject] = useState("General");

  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);
  
  const subjects = ["General", "Math", "Science", "English", "History", "Geography", "Physics", "Chemistry", "Biology"];

  const handleSend = async () => {
    if (!input.trim()) return;
    
    const userMessage = { role: 'user', content: input };
    setMessages(prev => [...prev, userMessage]);
    setInput("");
    setIsLoading(true);

    try {
      const chatHistory = await AIChat.filter({ created_by: (await User.me()).email }, "-created_date", 5);
      const historyPrompt = chatHistory.reverse().map(c => `Human: ${c.topic}\nAI: ${c.notes}`).join('\n\n');

      const prompt = `You are StudyBot, a friendly and encouraging AI study buddy. Your goal is to help students understand topics without giving away answers directly unless asked. Be conversational and sometimes use emojis.

Here is our recent conversation history:
${historyPrompt}

Current subject context: ${subject}
Explain in a ${explanationMode} manner.

Human: ${input}
AI:`;

      const response = await InvokeLLM({ prompt });
      
      const aiMessage = { role: 'ai', content: response };
      setMessages(prev => [...prev, aiMessage]);

      await AIChat.create({ topic: input, notes: response });
    } catch (error) {
      console.error("Error communicating with AI:", error);
      const errorMessage = { role: 'ai', content: "Oops! I'm having a little trouble connecting. Please try again in a moment." };
      setMessages(prev => [...prev, errorMessage]);
    }
    
    setIsLoading(false);
  };

  const handleQuickAction = (text) => {
    setInput(text);
    // Automatically focus the input field after setting the text
    const inputField = document.getElementById("ai-chat-input");
    if(inputField) {
        inputField.focus();
    }
  };

  return (
    <div className="flex flex-col h-[calc(100vh-4rem)] max-w-4xl mx-auto bg-white border-4 border-black rounded-xl neo-shadow">
      {/* Compact Header */}
      <div className="p-3 bg-white border-b-4 border-black">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <BrainCircuit className="h-6 w-6"/>
            <h1 className="text-xl font-bold">AI Study Buddy</h1>
          </div>
        </div>
      </div>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-3 space-y-3 bg-gray-50">
        {messages.length === 0 && !isLoading && (
          <div className="text-center py-8 text-gray-500">
            <BrainCircuit className="w-12 h-12 mx-auto mb-2 opacity-50" />
            <p className="font-semibold">Ask me anything!</p>
            <div className="flex flex-wrap justify-center gap-2 mt-4">
                <button onClick={() => handleQuickAction("Explain photosynthesis")} className="px-3 py-1 text-xs bg-green-100 border border-black rounded-full font-semibold hover:bg-green-200">Explain photosynthesis</button>
                <button onClick={() => handleQuickAction("Summarize the causes of World War 1")} className="px-3 py-1 text-xs bg-blue-100 border border-black rounded-full font-semibold hover:bg-blue-200">Causes of WW1</button>
                <button onClick={() => handleQuickAction("Quiz me on basic algebra")} className="px-3 py-1 text-xs bg-yellow-100 border border-black rounded-full font-semibold hover:bg-yellow-200">Quiz me on algebra</button>
            </div>
          </div>
        )}
        
        {messages.map((msg, index) => (
          <div key={index} className={`flex items-end gap-2 ${msg.role === 'ai' ? '' : 'justify-end'}`}>
            {msg.role === 'ai' && (
              <div className="w-7 h-7 bg-blue-100 rounded-full flex items-center justify-center border border-black flex-shrink-0 mb-1">
                <Bot className="w-4 h-4" />
              </div>
            )}
            <div className={`max-w-lg p-3 rounded-2xl border-2 border-black neo-shadow-small ${
              msg.role === 'ai' ? 'bg-white rounded-bl-none' : 'bg-[#98FB98] rounded-br-none'
            }`}>
              <ReactMarkdown className="text-sm prose prose-sm max-w-none">{msg.content}</ReactMarkdown>
            </div>
            {msg.role === 'user' && (
              <div className="w-7 h-7 bg-green-100 rounded-full flex items-center justify-center border border-black flex-shrink-0 mb-1">
                <UserIcon className="w-4 h-4" />
              </div>
            )}
          </div>
        ))}
        
        {isLoading && (
          <div className="flex items-end gap-2">
            <div className="w-7 h-7 bg-blue-100 rounded-full flex items-center justify-center border border-black flex-shrink-0 mb-1">
              <Bot className="w-4 h-4" />
            </div>
            <div className="p-3 bg-white rounded-2xl border-2 border-black neo-shadow-small rounded-bl-none">
              <div className="flex items-center gap-2">
                <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-black"></div>
                <span className="text-sm">Thinking...</span>
              </div>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Compact Input */}
      <div className="p-3 bg-white border-t-4 border-black">
        <div className="flex flex-col gap-2">
            <div className="flex items-center gap-2">
                <select
                value={explanationMode}
                onChange={(e) => setExplanationMode(e.target.value)}
                className="px-2 py-1 text-xs bg-gray-100 border border-black rounded"
                >
                <option value="Simple">Simple</option>
                <option value="Normal">Normal</option>
                <option value="Advanced">Advanced</option>
                </select>
                
                <select 
                value={subject} 
                onChange={e => setSubject(e.target.value)} 
                className="px-2 py-1 text-xs bg-gray-100 border border-black rounded"
                >
                {subjects.map(s => <option key={s} value={s}>{s}</option>)}
                </select>
            </div>
            <div className="flex gap-2">
                <input
                    id="ai-chat-input"
                    type="text"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && !isLoading && handleSend()}
                    placeholder="Ask your study buddy anything..."
                    className="flex-1 p-3 bg-gray-50 border-2 border-black rounded-lg focus:outline-none focus:ring-2 focus:ring-[#87CEEB]"
                    disabled={isLoading}
                />
                <button 
                    onClick={handleSend} 
                    disabled={isLoading || !input.trim()}
                    className="p-3 bg-[#98FB98] border-2 border-black rounded-lg neo-shadow hover:neo-shadow-small active:shadow-none disabled:opacity-50"
                >
                    <Send className="w-5 h-5"/>
                </button>
            </div>
        </div>
      </div>
    </div>
  );
}