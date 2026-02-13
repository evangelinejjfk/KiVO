import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Upload, FileText, Sparkles, Brain, CheckCircle } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import ReactMarkdown from "react-markdown";

export default function DocumentAnalyzer() {
  const [file, setFile] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [summary, setSummary] = useState(null);
  const [questions, setQuestions] = useState(null);
  const [analysisType, setAnalysisType] = useState("summary");

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) {
      setFile(selectedFile);
      setSummary(null);
      setQuestions(null);
    }
  };

  const analyzeDocument = async () => {
    if (!file) return;

    setIsUploading(true);
    try {
      // Upload the file
      const { file_url } = await base44.integrations.Core.UploadFile({ file });

      setIsUploading(false);
      setIsAnalyzing(true);

      // Generate analysis based on type
      const prompt = analysisType === "summary"
        ? `Analyze this document and provide a comprehensive summary with:
1. **Main Points** - Key takeaways and important concepts
2. **Key Terms** - Important vocabulary or definitions
3. **Summary** - Overall overview in clear, student-friendly language

Format your response using markdown with headings, bullet points, and emojis to make it engaging.`
        : `Analyze this document and generate 10 practice questions that test understanding of the material:
1. Mix of question types (multiple choice concepts, short answer, application questions)
2. Range from easy to challenging
3. Focus on key concepts and critical thinking
4. Format as a numbered list with clear questions

Make the questions engaging and practical for student review.`;

      const response = await base44.integrations.Core.InvokeLLM({
        prompt: prompt,
        file_urls: [file_url],
        add_context_from_internet: false,
      });

      if (analysisType === "summary") {
        setSummary(response);
      } else {
        setQuestions(response);
      }

      // Award XP for document analysis
      if (window.awardXP) {
        window.awardXP(20, "Analyzed document! 📄");
      }
    } catch (error) {
      console.error("Failed to analyze document:", error);
      alert("Failed to analyze document. Please try again.");
    }
    setIsAnalyzing(false);
  };

  const resetAnalyzer = () => {
    setFile(null);
    setSummary(null);
    setQuestions(null);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="pixel-card bg-gradient-to-r from-blue-100 to-purple-100 p-8 text-center relative overflow-hidden"
      >
        <FileText className="w-16 h-16 mx-auto mb-4 text-[#9B4D96]" />
        <h1 className="pixel-text text-3xl mb-2">AI Document Analyzer</h1>
        <p className="text-gray-700 font-bold">
          Upload your lecture notes, articles, or study materials and get AI-powered summaries or practice questions
        </p>
      </motion.div>

      {/* Upload Section */}
      {!summary && !questions && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="pixel-card bg-white p-8"
        >
          <h2 className="pixel-text text-xl mb-4 text-center">Upload Your Document</h2>
          
          {/* Analysis Type Selection */}
          <div className="flex gap-4 mb-6">
            <button
              onClick={() => setAnalysisType("summary")}
              className={`flex-1 pixel-button p-4 ${
                analysisType === "summary"
                  ? "bg-[#9B4D96] text-white"
                  : "bg-gray-100 text-gray-700"
              }`}
            >
              <FileText className="w-6 h-6 mx-auto mb-2" />
              <p className="font-bold text-sm">Get Summary</p>
            </button>
            <button
              onClick={() => setAnalysisType("questions")}
              className={`flex-1 pixel-button p-4 ${
                analysisType === "questions"
                  ? "bg-[#9B4D96] text-white"
                  : "bg-gray-100 text-gray-700"
              }`}
            >
              <Brain className="w-6 h-6 mx-auto mb-2" />
              <p className="font-bold text-sm">Generate Questions</p>
            </button>
          </div>

          {/* File Input */}
          <div className="border-4 border-dashed border-[#9B4D96] rounded-xl p-8 text-center bg-purple-50">
            <Upload className="w-12 h-12 mx-auto mb-4 text-[#9B4D96]" />
            <input
              type="file"
              id="file-upload"
              onChange={handleFileChange}
              accept=".pdf,.txt,.doc,.docx,.png,.jpg,.jpeg"
              className="hidden"
            />
            <label
              htmlFor="file-upload"
              className="pixel-button bg-white text-gray-700 cursor-pointer inline-block mb-4"
            >
              Choose File
            </label>
            <p className="text-sm text-gray-600 font-bold">
              Supports: PDF, TXT, DOC, DOCX, Images
            </p>
            {file && (
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="mt-4 flex items-center justify-center gap-2"
              >
                <CheckCircle className="w-5 h-5 text-green-600" />
                <p className="font-bold text-gray-700">{file.name}</p>
              </motion.div>
            )}
          </div>

          {file && (
            <div className="mt-6 text-center">
              <Button
                onClick={analyzeDocument}
                disabled={isUploading || isAnalyzing}
                className="pixel-button bg-gradient-to-r from-[#9B4D96] to-[#FF6B9D] text-white px-8 py-6 text-lg"
              >
                {isUploading ? (
                  <>Uploading...</>
                ) : isAnalyzing ? (
                  <>
                    <Sparkles className="w-5 h-5 mr-2 animate-spin" />
                    Analyzing...
                  </>
                ) : (
                  <>
                    <Sparkles className="w-5 h-5 mr-2" />
                    Analyze Document
                  </>
                )}
              </Button>
            </div>
          )}
        </motion.div>
      )}

      {/* Results Section */}
      <AnimatePresence>
        {(summary || questions) && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="pixel-card bg-white p-8"
          >
            <div className="flex justify-between items-center mb-6">
              <h2 className="pixel-text text-xl">
                {summary ? "Document Summary" : "Practice Questions"}
              </h2>
              <Button
                onClick={resetAnalyzer}
                variant="outline"
                className="pixel-button"
              >
                Analyze Another
              </Button>
            </div>
            <div className="prose max-w-none">
              <ReactMarkdown>{summary || questions}</ReactMarkdown>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}