import React, { useState, useEffect } from "react";
import { Flashcard } from "@/entities/Flashcard";
import { AIChat } from "@/entities/AIChat";
import { Resource } from "@/entities/Resource";
import { QuickReference } from "@/entities/QuickReference";
import { User } from "@/entities/User";
import { Search as SearchIcon, FileText, Brain, Bot, BookOpen, ExternalLink } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { format } from "date-fns";

export default function SearchPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState({
    flashcards: [],
    chats: [],
    resources: [],
    quickRefs: []
  });
  const [isSearching, setIsSearching] = useState(false);
  const [user, setUser] = useState(null);

  useEffect(() => {
    loadUser();
  }, []);

  useEffect(() => {
    if (searchQuery.trim() && user) {
      performSearch();
    } else {
      setSearchResults({ flashcards: [], chats: [], resources: [], quickRefs: [] });
    }
  }, [searchQuery, user]);

  const loadUser = async () => {
    try {
      const currentUser = await User.me();
      setUser(currentUser);
    } catch (error) {
      console.error("Failed to load user:", error);
    }
  };

  const performSearch = async () => {
    if (!searchQuery.trim() || !user) return;
    
    setIsSearching(true);
    try {
      const query = searchQuery.toLowerCase();
      
      // Search user's flashcards
      const allFlashcards = await Flashcard.filter({ created_by: user.email });
      const matchingFlashcards = allFlashcards.filter(card =>
        card.question.toLowerCase().includes(query) ||
        card.answer.toLowerCase().includes(query) ||
        card.subject.toLowerCase().includes(query)
      );

      // Search user's AI chats
      const allChats = await AIChat.filter({ created_by: user.email });
      const matchingChats = allChats.filter(chat =>
        chat.topic.toLowerCase().includes(query) ||
        chat.notes.toLowerCase().includes(query)
      );

      // Search class resources
      const allResources = await Resource.filter({ class_name: user.class_name });
      const matchingResources = allResources.filter(resource =>
        resource.title.toLowerCase().includes(query) ||
        resource.description?.toLowerCase().includes(query) ||
        resource.subject.toLowerCase().includes(query)
      );

      // Search user's quick references
      const allQuickRefs = await QuickReference.filter({ created_by: user.email });
      const matchingQuickRefs = allQuickRefs.filter(ref =>
        ref.title.toLowerCase().includes(query) ||
        ref.content.toLowerCase().includes(query) ||
        ref.subject.toLowerCase().includes(query) ||
        ref.tags?.toLowerCase().includes(query)
      );

      setSearchResults({
        flashcards: matchingFlashcards,
        chats: matchingChats,
        resources: matchingResources,
        quickRefs: matchingQuickRefs
      });
    } catch (error) {
      console.error("Search failed:", error);
    }
    setIsSearching(false);
  };

  const totalResults = Object.values(searchResults).reduce((sum, arr) => sum + arr.length, 0);

  const inputStyle = "w-full p-4 bg-white border-2 border-black rounded-lg focus:outline-none focus:ring-2 focus:ring-[#87CEEB] focus:border-transparent neo-shadow-small text-lg";

  return (
    <div className="space-y-6">
      <div className="text-center">
        <SearchIcon className="mx-auto h-16 w-16 mb-4" />
        <h1 className="text-4xl font-bold">Smart Search</h1>
        <p className="text-lg text-gray-700 mt-2">
          Search across all your flashcards, notes, resources, and quick references
        </p>
      </div>

      <div className="max-w-2xl mx-auto">
        <div className="relative">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search for anything..."
            className={inputStyle}
            autoFocus
          />
          <SearchIcon className="absolute right-4 top-1/2 transform -translate-y-1/2 w-6 h-6 text-gray-400" />
        </div>
        
        {searchQuery && (
          <div className="mt-4 text-center">
            <p className="text-sm text-gray-600">
              {isSearching ? "Searching..." : `Found ${totalResults} result${totalResults !== 1 ? 's' : ''} for "${searchQuery}"`}
            </p>
          </div>
        )}
      </div>

      <AnimatePresence>
        {searchQuery && totalResults > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-8"
          >
            {/* Flashcards Results */}
            {searchResults.flashcards.length > 0 && (
              <div>
                <h3 className="text-2xl font-bold mb-4 flex items-center gap-2">
                  <Brain className="w-6 h-6" />
                  Flashcards ({searchResults.flashcards.length})
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {searchResults.flashcards.map((card) => (
                    <div key={card.id} className="p-4 bg-white border-2 border-black rounded-lg neo-shadow">
                      <div className="flex justify-between items-start mb-2">
                        <span className="px-2 py-1 text-xs font-bold bg-blue-200 border border-black rounded">
                          {card.subject}
                        </span>
                        <span className="text-xs text-gray-500">{card.difficulty}</span>
                      </div>
                      <h4 className="font-bold mb-2">Q: {card.question}</h4>
                      <p className="text-sm text-gray-600">A: {card.answer}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Quick References Results */}
            {searchResults.quickRefs.length > 0 && (
              <div>
                <h3 className="text-2xl font-bold mb-4 flex items-center gap-2">
                  <FileText className="w-6 h-6" />
                  Quick References ({searchResults.quickRefs.length})
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {searchResults.quickRefs.map((ref) => (
                    <div 
                      key={ref.id} 
                      className="p-4 border-2 border-black rounded-lg neo-shadow"
                      style={{ backgroundColor: ref.color }}
                    >
                      <h4 className="font-bold mb-2">{ref.title}</h4>
                      <p className="text-sm mb-2">{ref.content}</p>
                      <div className="flex justify-between text-xs">
                        <span className="font-semibold">{ref.subject}</span>
                        {ref.tags && <span className="text-gray-600">#{ref.tags}</span>}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* AI Chat Results */}
            {searchResults.chats.length > 0 && (
              <div>
                <h3 className="text-2xl font-bold mb-4 flex items-center gap-2">
                  <Bot className="w-6 h-6" />
                  AI Chat History ({searchResults.chats.length})
                </h3>
                <div className="space-y-4">
                  {searchResults.chats.map((chat) => (
                    <div key={chat.id} className="p-4 bg-white border-2 border-black rounded-lg neo-shadow">
                      <h4 className="font-bold mb-2">{chat.topic}</h4>
                      <p className="text-sm text-gray-600 line-clamp-3">
                        {chat.notes.substring(0, 200)}...
                      </p>
                      <p className="text-xs text-gray-500 mt-2">
                        {format(new Date(chat.created_date), 'MMM d, yyyy')}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Resources Results */}
            {searchResults.resources.length > 0 && (
              <div>
                <h3 className="text-2xl font-bold mb-4 flex items-center gap-2">
                  <BookOpen className="w-6 h-6" />
                  Resources ({searchResults.resources.length})
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {searchResults.resources.map((resource) => (
                    <div key={resource.id} className="p-4 bg-white border-2 border-black rounded-lg neo-shadow">
                      <div className="flex justify-between items-start mb-2">
                        <span className="px-2 py-1 text-xs font-bold bg-green-200 border border-black rounded">
                          {resource.subject}
                        </span>
                        <span className="text-xs text-gray-500">{resource.type}</span>
                      </div>
                      <h4 className="font-bold mb-2">{resource.title}</h4>
                      {resource.description && (
                        <p className="text-sm text-gray-600 mb-2">{resource.description}</p>
                      )}
                      <div className="flex justify-between items-center">
                        <span className="text-xs text-gray-500">by {resource.shared_by}</span>
                        {resource.file_url && (
                          <a
                            href={resource.file_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-blue-600 hover:text-blue-800 text-sm flex items-center gap-1"
                          >
                            <ExternalLink className="w-4 h-4" />
                            Open
                          </a>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {searchQuery && totalResults === 0 && !isSearching && (
        <div className="text-center py-10">
          <SearchIcon className="mx-auto h-16 w-16 text-gray-300 mb-4" />
          <h3 className="text-xl font-bold text-gray-600">No results found</h3>
          <p className="text-gray-500 mt-2">
            Try different keywords or check your spelling
          </p>
        </div>
      )}
    </div>
  );
}