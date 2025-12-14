import React, { useState, useEffect } from "react";
import { Resource } from "@/entities/Resource";
import { User } from "@/entities/User";
import { UploadFile } from "@/integrations/Core";
import { Upload, FileText, Link as LinkIcon, Image, BookOpen, ExternalLink } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { format } from "date-fns";

const classes = [
  "6A", "6B", "6C",
  "7A", "7B", "7C", 
  "8A", "8B", "8C",
  "9A", "9B", "9C",
  "10A", "10B", "10C",
  "11A", "11B", "11C",
  "12A", "12B", "12C"
];

export default function ResourceHub() {
  const [resources, setResources] = useState([]);
  const [showUploadForm, setShowUploadForm] = useState(false);
  const [user, setUser] = useState(null);
  const [selectedSubject, setSelectedSubject] = useState("all");
  const [isLoading, setIsLoading] = useState(true);
  const [selectedClass, setSelectedClass] = useState("");

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    subject: "",
    type: "note",
    file_url: "",
    file: null
  });
  const [isUploading, setIsUploading] = useState(false);

  const subjects = ["Math", "Science", "English", "History", "Geography", "Physics", "Chemistry", "Biology"];

  useEffect(() => {
    loadUser();
  }, []);

  useEffect(() => {
    if (selectedClass) {
      loadResources();
    }
  }, [selectedClass]);

  const loadUser = async () => {
    setIsLoading(true);
    try {
      const currentUser = await User.me();
      setUser(currentUser);
      if (currentUser.account_type === 'teacher') {
        setSelectedClass(classes[0]);
      } else {
        setSelectedClass(currentUser.class_name);
      }
    } catch (error) {
      console.error("Failed to load user:", error);
    }
    setIsLoading(false);
  };
  
  const loadResources = async () => {
     if (!selectedClass) return;
    try {
      const classResources = await Resource.filter({ class_name: selectedClass }, "-created_date");
      setResources(classResources);
    } catch (error) {
      console.error("Failed to load resources:", error);
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    setFormData({ ...formData, file });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.title || !formData.subject) {
      alert("Please fill in required fields.");
      return;
    }

    setIsUploading(true);
    try {
      let fileUrl = formData.file_url;
      
      if (formData.file && formData.type !== "link") {
        const uploadResult = await UploadFile({ file: formData.file });
        fileUrl = uploadResult.file_url;
      }

      await Resource.create({
        title: formData.title,
        description: formData.description,
        subject: formData.subject,
        type: formData.type,
        file_url: fileUrl,
        class_name: selectedClass,
        shared_by: user.full_name
      });

      setFormData({ title: "", description: "", subject: "", type: "note", file_url: "", file: null });
      setShowUploadForm(false);
      loadResources();
    } catch (error) {
      console.error("Failed to upload resource:", error);
      alert("Failed to upload resource. Please try again.");
    }
    setIsUploading(false);
  };

  const filteredResources = selectedSubject === "all" 
    ? resources 
    : resources.filter(r => r.subject === selectedSubject);

  const getResourceIcon = (type) => {
    switch (type) {
      case "link": return <LinkIcon className="w-5 h-5" />;
      case "image": return <Image className="w-5 h-5" />;
      case "question_paper": return <FileText className="w-5 h-5" />;
      default: return <BookOpen className="w-5 h-5" />;
    }
  };

  const inputStyle = "w-full p-3 bg-white border-2 border-black rounded-lg focus:outline-none focus:ring-2 focus:ring-[#87CEEB] focus:border-transparent neo-shadow-small";
  const buttonStyle = "py-3 px-6 bg-[#98FB98] border-2 border-black rounded-lg neo-shadow hover:neo-shadow-small active:shadow-none transform active:translate-x-[2px] active:translate-y-[2px] transition-all duration-150 font-bold";

  if (isLoading) {
    return (
      <div className="text-center py-10">
        <div className="animate-spin rounded-full h-12 w-12 border-b-4 border-black mx-auto"></div>
        <p className="mt-4 font-bold">Loading resources...</p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="text-center">
        <Upload className="mx-auto h-16 w-16 mb-4" />
        <h1 className="text-4xl font-bold">Resource Hub</h1>
        <p className="text-lg text-gray-700 mt-2">Share and access study materials for Class {selectedClass}</p>
      </div>

      <div className="flex flex-col md:flex-row gap-4 justify-between items-center">
        <div className="flex gap-4">
            {user?.account_type === 'teacher' && (
                <div>
                    <label className="font-bold text-sm block mb-1">View Resources For:</label>
                    <select
                        value={selectedClass}
                        onChange={(e) => setSelectedClass(e.target.value)}
                        className={inputStyle + " w-48"}
                    >
                        {classes.map(c => <option key={c} value={c}>Class {c}</option>)}
                    </select>
                </div>
            )}
            <div>
                 <label className="font-bold text-sm block mb-1">Filter by Subject:</label>
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
            </div>
        </div>

        <button
          onClick={() => setShowUploadForm(!showUploadForm)}
          className={buttonStyle}
        >
          <Upload className="w-5 h-5 mr-2" />
          Share Resource
        </button>
      </div>

      <AnimatePresence>
        {showUploadForm && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="p-6 bg-white border-4 border-black rounded-xl neo-shadow"
          >
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="font-bold block mb-1">Title*</label>
                  <input
                    type="text"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    className={inputStyle}
                    placeholder="e.g., Math Chapter 5 Notes"
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
                <label className="font-bold block mb-1">Type</label>
                <select
                  value={formData.type}
                  onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                  className={inputStyle}
                >
                  <option value="note">Study Notes</option>
                  <option value="question_paper">Question Paper</option>
                  <option value="link">External Link</option>
                  <option value="image">Image/Photo</option>
                  <option value="document">Document</option>
                </select>
              </div>

              {formData.type === "link" ? (
                <div>
                  <label className="font-bold block mb-1">Link URL*</label>
                  <input
                    type="url"
                    value={formData.file_url}
                    onChange={(e) => setFormData({ ...formData, file_url: e.target.value })}
                    className={inputStyle}
                    placeholder="https://docs.google.com/..."
                  />
                </div>
              ) : (
                <div>
                  <label className="font-bold block mb-1">Upload File</label>
                  <input
                    type="file"
                    onChange={handleFileChange}
                    className={inputStyle}
                    accept="image/*,.pdf,.doc,.docx,.txt"
                  />
                </div>
              )}

              <div>
                <label className="font-bold block mb-1">Description</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className={inputStyle + " h-24"}
                  placeholder="Brief description of this resource..."
                />
              </div>

              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => setShowUploadForm(false)}
                  className="py-3 px-6 bg-gray-300 border-2 border-black rounded-lg neo-shadow hover:neo-shadow-small active:shadow-none transform active:translate-x-[2px] active:translate-y-[2px] transition-all duration-150 font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className={buttonStyle}
                  disabled={isUploading}
                >
                  {isUploading ? "Uploading..." : "Share Resource"}
                </button>
              </div>
            </form>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <AnimatePresence>
          {filteredResources.map((resource) => (
            <motion.div
              key={resource.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="p-5 bg-white border-4 border-black rounded-xl neo-shadow"
            >
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-2">
                  {getResourceIcon(resource.type)}
                  <span className="px-2 py-1 text-xs font-bold bg-blue-200 border border-black rounded">
                    {resource.subject}
                  </span>
                </div>
                <span className="text-xs text-gray-500">
                  {format(new Date(resource.created_date), "MMM d")}
                </span>
              </div>

              <h3 className="text-lg font-bold mb-2">{resource.title}</h3>
              {resource.description && (
                <p className="text-sm text-gray-600 mb-3">{resource.description}</p>
              )}

              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-500">by {resource.shared_by}</span>
                {resource.file_url && (
                  <a
                    href={resource.file_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1 text-blue-600 hover:text-blue-800 font-semibold"
                  >
                    <ExternalLink className="w-4 h-4" />
                    Open
                  </a>
                )}
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {filteredResources.length === 0 && (
        <div className="text-center py-10 px-6 bg-white border-4 border-black rounded-xl neo-shadow">
          <h3 className="text-2xl font-bold">No Resources Yet</h3>
          <p className="mt-2 text-gray-600">
            Be the first to share study materials with your class!
          </p>
        </div>
      )}
    </div>
  );
}