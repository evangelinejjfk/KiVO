import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { BookOpen, Sparkles, Loader2, ArrowLeft, Download, ChevronDown, ChevronUp } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import YearbookPreview from "@/components/scrapbook/YearbookPreview";

export default function YearbookGenerator() {
  const [memories, setMemories] = useState([]);
  const [yearbooks, setYearbooks] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isGenerating, setIsGenerating] = useState(false);
  const [generationProgress, setGenerationProgress] = useState("");
  const [selectedYearbook, setSelectedYearbook] = useState(null);
  const [yearbookTitle, setYearbookTitle] = useState("");
  const [showPastYearbooks, setShowPastYearbooks] = useState(false);
  const [user, setUser] = useState(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setIsLoading(true);
    const [memoriesData, yearbooksData, userData] = await Promise.all([
      base44.entities.Memory.list("-date"),
      base44.entities.Yearbook.list("-created_date"),
      base44.auth.me()
    ]);
    setMemories(memoriesData);
    setYearbooks(yearbooksData);
    setUser(userData);
    setYearbookTitle(`${userData.full_name || "My"}'s Senior Year`);
    setIsLoading(false);
  };

  const generateYearbook = async () => {
    if (memories.length < 3) return;

    setIsGenerating(true);
    setGenerationProgress("Analyzing your memories...");

    // Prepare memories for AI
    const memorySummaries = memories.map(m => ({
      date: m.date,
      journal: m.journal,
      sentiment: m.sentiment,
      themes: m.themes,
      people: m.mentioned_people,
      hasPhoto: !!m.photo_url
    }));

    setGenerationProgress("Detecting themes and patterns...");

    // Get current school year
    const now = new Date();
    const year = now.getMonth() >= 8 ? now.getFullYear() : now.getFullYear() - 1;
    const schoolYear = `${year}-${year + 1}`;

    setGenerationProgress("Crafting your narrative...");

    // Generate yearbook content with AI
    const yearbookContent = await base44.integrations.Core.InvokeLLM({
      prompt: `Create a heartfelt, personalized high school yearbook from these ${memories.length} senior year memories.

Student name: ${user?.full_name || "Student"}
School year: ${schoolYear}

MEMORIES:
${JSON.stringify(memorySummaries, null, 2)}

Generate a beautiful yearbook in markdown format with:

1. **Title Page** - Personalized title with the student's name and school year

2. **Timeline of Magic Moments** - Select 8-12 peak moments, formatted as:
   📸 [Date]: [Brief moment description] → "[Quote from journal]"

3. **Chapter 1: [Auto-detect best theme, e.g., "Friends Who Made It Special"]**
   - Weave together memories that share this theme
   - Include direct quotes from journal entries
   - Warm, celebratory tone

4. **Chapter 2: [Second major theme, e.g., "Academic Journey" or "Growth & Milestones"]**
   - Show progression and growth
   - Highlight achievements and challenges overcome

5. **Chapter 3: [Third theme, e.g., "Moments You'll Never Forget"]**
   - Most emotionally impactful memories
   - Celebratory highlights

6. **Final Letter to Future Me**
   - Write a touching letter as if from the student to their future self
   - Reference specific memories and people
   - Tone: nostalgic, hopeful, grateful

Make it emotional, celebratory, and deeply personal. Use the actual journal content.
Output ONLY the markdown content, no explanations.`,
      response_json_schema: {
        type: "object",
        properties: {
          content: { type: "string" },
          main_themes: { type: "array", items: { type: "string" } }
        }
      }
    });

    setGenerationProgress("Saving your yearbook...");

    // Create yearbook record
    const newYearbook = await base44.entities.Yearbook.create({
      title: yearbookTitle,
      school_year: schoolYear,
      content_markdown: yearbookContent.content,
      themes_detected: yearbookContent.main_themes,
      memory_count: memories.length,
      status: "completed"
    });

    setYearbooks([newYearbook, ...yearbooks]);
    setSelectedYearbook(newYearbook);

    setIsGenerating(false);
    setGenerationProgress("");
  };

  const downloadAsPDF = async (yearbook) => {
    // Create printable HTML
    const printWindow = window.open('', '_blank');
    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
      <head>
        <title>${yearbook.title}</title>
        <style>
          body { font-family: Georgia, serif; max-width: 800px; margin: 0 auto; padding: 40px; line-height: 1.8; }
          h1 { color: #7c3aed; border-bottom: 3px solid #ec4899; padding-bottom: 10px; }
          h2 { color: #db2777; margin-top: 40px; }
          h3 { color: #374151; }
          blockquote { border-left: 4px solid #a855f7; padding-left: 20px; font-style: italic; background: #faf5ff; padding: 15px 20px; margin: 20px 0; }
          p { margin-bottom: 16px; }
          @media print { body { padding: 20px; } }
        </style>
      </head>
      <body>
        ${yearbook.content_markdown
          .replace(/^# (.*$)/gm, '<h1>$1</h1>')
          .replace(/^## (.*$)/gm, '<h2>$1</h2>')
          .replace(/^### (.*$)/gm, '<h3>$1</h3>')
          .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
          .replace(/\*(.*?)\*/g, '<em>$1</em>')
          .replace(/^> (.*$)/gm, '<blockquote>$1</blockquote>')
          .replace(/\n\n/g, '</p><p>')
          .replace(/^(.+)$/gm, '<p>$1</p>')
        }
      </body>
      </html>
    `);
    printWindow.document.close();
    printWindow.print();
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-4 border-black"></div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link to={createPageUrl("Scrapbook")}>
          <Button variant="outline" size="icon" className="border-2 border-black">
            <ArrowLeft className="w-5 h-5" />
          </Button>
        </Link>
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-3">
            <BookOpen className="w-8 h-8 text-purple-600" />
            Yearbook Generator
          </h1>
          <p className="text-gray-600">Transform your memories into a beautiful yearbook</p>
        </div>
      </div>

      {/* Selected Yearbook Preview */}
      {selectedYearbook && (
        <YearbookPreview yearbook={selectedYearbook} onDownload={() => downloadAsPDF(selectedYearbook)} />
      )}

      {/* Generator Card */}
      {!selectedYearbook && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white border-4 border-black rounded-xl overflow-hidden neo-shadow"
        >
          <div className="bg-gradient-to-r from-purple-500 via-pink-500 to-orange-400 p-6 text-white">
            <h2 className="text-2xl font-bold mb-2">✨ Create Your Yearbook</h2>
            <p className="opacity-90">
              Our AI will weave your {memories.length} memories into a narrative-driven yearbook
            </p>
          </div>

          <div className="p-6 space-y-6">
            {/* Memory count check */}
            {memories.length < 3 ? (
              <div className="text-center py-8">
                <p className="text-gray-600 mb-4">
                  You need at least 3 memories to generate a yearbook. 
                  You currently have {memories.length}.
                </p>
                <Link to={createPageUrl("Scrapbook")}>
                  <Button className="bg-purple-500 hover:bg-purple-600 text-white font-bold border-2 border-black">
                    Add More Memories
                  </Button>
                </Link>
              </div>
            ) : (
              <>
                {/* Yearbook Title */}
                <div>
                  <label className="block text-sm font-bold mb-2">Yearbook Title</label>
                  <Input
                    value={yearbookTitle}
                    onChange={(e) => setYearbookTitle(e.target.value)}
                    className="border-2 border-black text-lg"
                    placeholder="My Senior Year"
                  />
                </div>

                {/* Preview Stats */}
                <div className="grid grid-cols-3 gap-4">
                  <div className="bg-purple-50 border-2 border-purple-200 rounded-lg p-4 text-center">
                    <p className="text-2xl font-bold text-purple-700">{memories.length}</p>
                    <p className="text-sm text-purple-600">Memories</p>
                  </div>
                  <div className="bg-pink-50 border-2 border-pink-200 rounded-lg p-4 text-center">
                    <p className="text-2xl font-bold text-pink-700">
                      {[...new Set(memories.flatMap(m => m.themes || []))].length}
                    </p>
                    <p className="text-sm text-pink-600">Themes</p>
                  </div>
                  <div className="bg-orange-50 border-2 border-orange-200 rounded-lg p-4 text-center">
                    <p className="text-2xl font-bold text-orange-700">
                      {[...new Set(memories.flatMap(m => m.mentioned_people || []))].length}
                    </p>
                    <p className="text-sm text-orange-600">People</p>
                  </div>
                </div>

                {/* Generate Button */}
                <Button
                  onClick={generateYearbook}
                  disabled={isGenerating}
                  className="w-full bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white font-bold py-4 text-lg border-2 border-black neo-shadow"
                >
                  {isGenerating ? (
                    <>
                      <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                      {generationProgress}
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-5 h-5 mr-2" />
                      Generate My Yearbook
                    </>
                  )}
                </Button>

                {isGenerating && (
                  <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
                    <motion.div
                      className="h-full bg-gradient-to-r from-purple-500 to-pink-500"
                      initial={{ width: "0%" }}
                      animate={{ width: "100%" }}
                      transition={{ duration: 30, ease: "linear" }}
                    />
                  </div>
                )}
              </>
            )}
          </div>
        </motion.div>
      )}

      {/* Past Yearbooks */}
      {yearbooks.length > 0 && (
        <div className="bg-white border-4 border-black rounded-xl overflow-hidden neo-shadow">
          <button
            onClick={() => setShowPastYearbooks(!showPastYearbooks)}
            className="w-full p-4 flex items-center justify-between hover:bg-gray-50 transition-colors"
          >
            <span className="font-bold">Past Yearbooks ({yearbooks.length})</span>
            {showPastYearbooks ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
          </button>

          <AnimatePresence>
            {showPastYearbooks && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                className="border-t-2 border-black"
              >
                {yearbooks.map((yb) => (
                  <div
                    key={yb.id}
                    className="p-4 border-b last:border-b-0 flex items-center justify-between hover:bg-gray-50 cursor-pointer"
                    onClick={() => setSelectedYearbook(yb)}
                  >
                    <div>
                      <p className="font-bold">{yb.title}</p>
                      <p className="text-sm text-gray-600">{yb.school_year} • {yb.memory_count} memories</p>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      className="border-2 border-black"
                      onClick={(e) => {
                        e.stopPropagation();
                        downloadAsPDF(yb);
                      }}
                    >
                      <Download className="w-4 h-4" />
                    </Button>
                  </div>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      )}

      {/* Back to create new */}
      {selectedYearbook && (
        <Button
          onClick={() => setSelectedYearbook(null)}
          variant="outline"
          className="w-full border-2 border-black font-bold"
        >
          Create Another Yearbook
        </Button>
      )}
    </div>
  );
}