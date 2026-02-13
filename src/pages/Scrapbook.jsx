import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { Button } from "@/components/ui/button";
import { Plus, BookOpen, Camera, Sparkles, ArrowRight } from "lucide-react";
import { motion } from "framer-motion";
import MemoryCard from "@/components/scrapbook/MemoryCard";
import MemoryForm from "@/components/scrapbook/MemoryForm";

export default function Scrapbook() {
  const [memories, setMemories] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);

  useEffect(() => {
    loadMemories();
  }, []);

  const loadMemories = async () => {
    setIsLoading(true);
    const data = await base44.entities.Memory.list("-date", 50);
    setMemories(data);
    setIsLoading(false);
  };

  const handleCreateMemory = async (memoryData) => {
    await base44.entities.Memory.create(memoryData);
    setShowForm(false);
    loadMemories();
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-4 border-black"></div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-3">
            <span className="bg-gradient-to-r from-purple-500 to-pink-500 bg-clip-text text-transparent">
              Senior Scrapbook
            </span>
            <Sparkles className="w-8 h-8 text-yellow-500" />
          </h1>
          <p className="text-gray-600 mt-1">Capture your senior year memories, one moment at a time</p>
        </div>

        <div className="flex gap-3">
          <Button
            onClick={() => setShowForm(!showForm)}
            className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white font-bold border-2 border-black neo-shadow"
          >
            <Camera className="w-4 h-4 mr-2" />
            Add Memory
          </Button>
          
          <Link to={createPageUrl("YearbookGenerator")}>
            <Button
              variant="outline"
              className="border-2 border-black font-bold neo-shadow hover:bg-yellow-100"
            >
              <BookOpen className="w-4 h-4 mr-2" />
              Generate Yearbook
            </Button>
          </Link>
        </div>
      </div>

      {/* Stats Bar */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gradient-to-br from-purple-100 to-purple-200 border-4 border-black rounded-xl p-4 neo-shadow"
        >
          <p className="text-3xl font-bold text-purple-800">{memories.length}</p>
          <p className="text-sm font-medium text-purple-600">Memories</p>
        </motion.div>
        
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0, transition: { delay: 0.1 } }}
          className="bg-gradient-to-br from-pink-100 to-pink-200 border-4 border-black rounded-xl p-4 neo-shadow"
        >
          <p className="text-3xl font-bold text-pink-800">
            {memories.filter(m => m.photo_url).length}
          </p>
          <p className="text-sm font-medium text-pink-600">Photos</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0, transition: { delay: 0.2 } }}
          className="bg-gradient-to-br from-yellow-100 to-orange-200 border-4 border-black rounded-xl p-4 neo-shadow"
        >
          <p className="text-3xl font-bold text-orange-800">
            {[...new Set(memories.flatMap(m => m.themes || []))].length}
          </p>
          <p className="text-sm font-medium text-orange-600">Themes</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0, transition: { delay: 0.3 } }}
          className="bg-gradient-to-br from-green-100 to-teal-200 border-4 border-black rounded-xl p-4 neo-shadow"
        >
          <p className="text-3xl font-bold text-teal-800">
            {[...new Set(memories.flatMap(m => m.mentioned_people || []))].length}
          </p>
          <p className="text-sm font-medium text-teal-600">People</p>
        </motion.div>
      </div>

      {/* Memory Form */}
      {showForm && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: "auto" }}
          exit={{ opacity: 0, height: 0 }}
        >
          <MemoryForm onSubmit={handleCreateMemory} onCancel={() => setShowForm(false)} />
        </motion.div>
      )}

      {/* Empty State */}
      {memories.length === 0 && !showForm && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center py-16 bg-gradient-to-br from-purple-50 to-pink-50 border-4 border-dashed border-purple-300 rounded-xl"
        >
          <div className="w-20 h-20 mx-auto mb-4 bg-purple-100 rounded-full flex items-center justify-center">
            <Camera className="w-10 h-10 text-purple-500" />
          </div>
          <h3 className="text-xl font-bold text-gray-800 mb-2">Start Your Senior Scrapbook!</h3>
          <p className="text-gray-600 mb-6 max-w-md mx-auto">
            Capture photos and journal entries throughout your senior year. 
            At the end, generate a beautiful AI-powered yearbook.
          </p>
          <Button
            onClick={() => setShowForm(true)}
            className="bg-gradient-to-r from-purple-500 to-pink-500 text-white font-bold border-2 border-black neo-shadow"
          >
            <Plus className="w-4 h-4 mr-2" />
            Add Your First Memory
          </Button>
        </motion.div>
      )}

      {/* Memory Timeline */}
      {memories.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {memories.map((memory, index) => (
            <MemoryCard key={memory.id} memory={memory} index={index} />
          ))}
        </div>
      )}

      {/* Generate Yearbook CTA */}
      {memories.length >= 5 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gradient-to-r from-purple-500 via-pink-500 to-orange-400 border-4 border-black rounded-xl p-6 neo-shadow text-white text-center"
        >
          <h3 className="text-2xl font-bold mb-2">Ready to create your yearbook? 📚</h3>
          <p className="mb-4 opacity-90">
            You have {memories.length} memories! That's enough to generate a beautiful, AI-powered yearbook.
          </p>
          <Link to={createPageUrl("YearbookGenerator")}>
            <Button className="bg-white text-purple-700 hover:bg-gray-100 font-bold border-2 border-black">
              Generate My Yearbook
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </Link>
        </motion.div>
      )}
    </div>
  );
}