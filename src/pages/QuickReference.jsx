import React, { useState, useEffect } from "react";
import { QuickReference } from "@/entities/QuickReference";
import { User } from "@/entities/User";
import { FileText, Plus, Palette, Share2, Tag } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function QuickReferencePage() {
  const [references, setReferences] = useState([]);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [selectedSubject, setSelectedSubject] = useState("all");
  const [isLoading, setIsLoading] = useState(true);

  const [formData, setFormData] = useState({
    title: "",
    content: "",
    subject: "",
    tags: "",
    color: "#FFE4B5",
    is_shared: false
  });

  const subjects = ["Math", "Science", "English", "History", "Geography", "Physics", "Chemistry", "Biology"];
  const cardColors = [
    "#FFE4B5", // Moccasin
    "#FFB6C1", // Light Pink
    "#DDA0DD", // Plum
    "#98FB98", // Pale Green
    "#87CEEB", // Sky Blue
    "#F0E68C", // Khaki
    "#FFA07A", // Light Salmon
    "#E6E6FA"  // Lavender
  ];

  useEffect(() => {
    loadReferences();
  }, []);

  const loadReferences = async () => {
    try {
      const user = await User.me();
      const userRefs = await QuickReference.filter({ created_by: user.email }, "-created_date");
      setReferences(userRefs);
    } catch (error) {
      console.error("Failed to load quick references:", error);
    }
    setIsLoading(false);
  };

  const handleCreateReference = async (e) => {
    e.preventDefault();
    if (!formData.title || !formData.content || !formData.subject) {
      alert("Please fill in all required fields.");
      return;
    }

    try {
      await QuickReference.create(formData);
      setFormData({
        title: "",
        content: "",
        subject: "",
        tags: "",
        color: "#FFE4B5",
        is_shared: false
      });
      setShowCreateForm(false);
      loadReferences();
    } catch (error) {
      console.error("Failed to create quick reference:", error);
    }
  };

  const filteredReferences = selectedSubject === "all" 
    ? references 
    : references.filter(ref => ref.subject === selectedSubject);

  const inputStyle = "w-full p-3 bg-white border-2 border-black rounded-lg focus:outline-none focus:ring-2 focus:ring-[#87CEEB] focus:border-transparent neo-shadow-small";
  const buttonStyle = "py-3 px-6 bg-[#98FB98] border-2 border-black rounded-lg neo-shadow hover:neo-shadow-small active:shadow-none transform active:translate-x-[2px] active:translate-y-[2px] transition-all duration-150 font-bold";

  return (
    <div className="space-y-8">
      <div className="text-center">
        <FileText className="mx-auto h-16 w-16 mb-4" />
        <h1 className="text-4xl font-bold">Quick Reference Cards</h1>
        <p className="text-lg text-gray-700 mt-2">
          Create bite-sized study sheets for instant recall
        </p>
      </div>

      <div className="flex flex-col md:flex-row gap-4 justify-between items-center">
        <select
          value={selectedSubject}
          onChange={(e) => setSelectedSubject(e.target.value)}
          className={inputStyle + " w-48"}
        >
          <option value="all">All Subjects</option>
          {subjects.map(subject => (
            <option key={subject} value={subject}>{subject}</option>
          ))}
        </select>

        <button
          onClick={() => setShowCreateForm(!showCreateForm)}
          className={buttonStyle}
        >
          <Plus className="w-5 h-5 mr-2" />
          Create Reference Card
        </button>
      </div>

      <AnimatePresence>
        {showCreateForm && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="p-6 bg-white border-4 border-black rounded-xl neo-shadow"
          >
            <form onSubmit={handleCreateReference} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="font-bold block mb-1">Title*</label>
                  <input
                    type="text"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    className={inputStyle}
                    placeholder="e.g., Pythagorean Theorem"
                  />
                </div>
                <div>
                  <label className="font-bold block mb-1">Subject*</label>
                  <select
                    value={formData.subject}
                    onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                    className={inputStyle}
                  >
                    <option value="">Select Subject</option>
                    {subjects.map(subject => (
                      <option key={subject} value={subject}>{subject}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="font-bold block mb-1">Content*</label>
                <textarea
                  value={formData.content}
                  onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                  className={inputStyle + " h-32"}
                  placeholder="Key points, formulas, definitions..."
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="font-bold block mb-1">Tags</label>
                  <input
                    type="text"
                    value={formData.tags}
                    onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
                    className={inputStyle}
                    placeholder="formula, geometry, quick-review"
                  />
                </div>
                <div>
                  <label className="font-bold block mb-1 flex items-center gap-2">
                    <Palette className="w-4 h-4" />
                    Card Color
                  </label>
                  <div className="flex gap-2 flex-wrap">
                    {cardColors.map(color => (
                      <button
                        key={color}
                        type="button"
                        onClick={() => setFormData({ ...formData, color })}
                        className={`w-8 h-8 rounded-full border-2 ${
                          formData.color === color ? 'border-black' : 'border-gray-300'
                        }`}
                        style={{ backgroundColor: color }}
                      />
                    ))}
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.is_shared}
                    onChange={(e) => setFormData({ ...formData, is_shared: e.target.checked })}
                    className="w-4 h-4"
                  />
                  <Share2 className="w-4 h-4" />
                  <span className="font-semibold">Share with class</span>
                </label>
              </div>

              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => setShowCreateForm(false)}
                  className="py-3 px-6 bg-gray-300 border-2 border-black rounded-lg neo-shadow hover:neo-shadow-small active:shadow-none transform active:translate-x-[2px] active:translate-y-[2px] transition-all duration-150 font-bold"
                >
                  Cancel
                </button>
                <button type="submit" className={buttonStyle}>
                  Create Reference Card
                </button>
              </div>
            </form>
          </motion.div>
        )}
      </AnimatePresence>

      {isLoading ? (
        <div className="text-center py-10">
          <div className="animate-spin rounded-full h-12 w-12 border-b-4 border-black mx-auto"></div>
          <p className="mt-4 font-bold">Loading references...</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          <AnimatePresence>
            {filteredReferences.map((ref) => (
              <motion.div
                key={ref.id}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                className="p-4 border-2 border-black rounded-lg neo-shadow h-fit"
                style={{ backgroundColor: ref.color }}
              >
                <div className="flex justify-between items-start mb-3">
                  <h3 className="text-lg font-bold">{ref.title}</h3>
                  {ref.is_shared && (
                    <Share2 className="w-4 h-4 text-blue-600" title="Shared with class" />
                  )}
                </div>
                
                <p className="text-sm mb-3 whitespace-pre-line">{ref.content}</p>
                
                <div className="flex justify-between items-end">
                  <span className="px-2 py-1 text-xs font-bold bg-white border border-black rounded">
                    {ref.subject}
                  </span>
                  {ref.tags && (
                    <div className="flex items-center gap-1">
                      <Tag className="w-3 h-3" />
                      <span className="text-xs">{ref.tags}</span>
                    </div>
                  )}
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}

      {filteredReferences.length === 0 && !isLoading && (
        <div className="text-center py-10 px-6 bg-white border-4 border-black rounded-xl neo-shadow">
          <FileText className="mx-auto h-16 w-16 mb-4 text-gray-300" />
          <h3 className="text-2xl font-bold">No Reference Cards Yet</h3>
          <p className="mt-2 text-gray-600">
            Create your first quick reference card for instant recall!
          </p>
        </div>
      )}
    </div>
  );
}