import React from "react";
import ReactMarkdown from "react-markdown";
import { Book, Download, Share2, Calendar } from "lucide-react";
import { Button } from "@/components/ui/button";
import { format } from "date-fns";

export default function YearbookPreview({ yearbook, onDownload }) {
  if (!yearbook) return null;

  return (
    <div className="bg-white border-4 border-black rounded-xl overflow-hidden neo-shadow">
      {/* Header */}
      <div className="bg-gradient-to-r from-purple-500 via-pink-500 to-orange-400 p-6 text-white">
        <div className="flex items-center gap-3 mb-2">
          <Book className="w-8 h-8" />
          <h2 className="text-2xl font-bold">{yearbook.title}</h2>
        </div>
        <div className="flex items-center gap-4 text-sm opacity-90">
          <span className="flex items-center gap-1">
            <Calendar className="w-4 h-4" />
            {yearbook.school_year}
          </span>
          <span>📸 {yearbook.memory_count} memories</span>
        </div>
      </div>

      {/* Themes */}
      {yearbook.themes_detected && yearbook.themes_detected.length > 0 && (
        <div className="px-6 py-3 bg-gray-50 border-b-2 border-black flex flex-wrap gap-2">
          <span className="text-sm font-bold text-gray-600">Themes:</span>
          {yearbook.themes_detected.map((theme) => (
            <span key={theme} className="px-2 py-1 bg-purple-100 text-purple-800 rounded-full text-xs font-bold">
              {theme}
            </span>
          ))}
        </div>
      )}

      {/* Content */}
      <div className="p-6 max-h-[60vh] overflow-y-auto">
        <div className="prose prose-lg max-w-none">
          <ReactMarkdown
            components={{
              h1: ({ children }) => <h1 className="text-3xl font-bold mb-4 text-purple-800 border-b-4 border-purple-200 pb-2">{children}</h1>,
              h2: ({ children }) => <h2 className="text-2xl font-bold mt-8 mb-3 text-pink-700">{children}</h2>,
              h3: ({ children }) => <h3 className="text-xl font-bold mt-6 mb-2 text-gray-800">{children}</h3>,
              p: ({ children }) => <p className="mb-4 text-gray-700 leading-relaxed">{children}</p>,
              blockquote: ({ children }) => (
                <blockquote className="border-l-4 border-purple-400 pl-4 italic bg-purple-50 py-2 rounded-r-lg my-4">
                  {children}
                </blockquote>
              ),
              ul: ({ children }) => <ul className="list-disc pl-6 space-y-2 mb-4">{children}</ul>,
              li: ({ children }) => <li className="text-gray-700">{children}</li>,
            }}
          >
            {yearbook.content_markdown}
          </ReactMarkdown>
        </div>
      </div>

      {/* Actions */}
      <div className="p-4 bg-gray-50 border-t-2 border-black flex gap-3">
        <Button
          onClick={onDownload}
          className="flex-1 bg-black text-white hover:bg-gray-800 font-bold border-2 border-black"
        >
          <Download className="w-4 h-4 mr-2" />
          Download PDF
        </Button>
      </div>

      <p className="px-4 pb-4 text-xs text-gray-500 text-center">
        Generated on {format(new Date(yearbook.created_date), "MMMM d, yyyy")}
      </p>
    </div>
  );
}