import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Camera, Calendar as CalendarIcon, MapPin, Sparkles, Loader2, X } from "lucide-react";
import { format } from "date-fns";
import { base44 } from "@/api/base44Client";

export default function MemoryForm({ onSubmit, onCancel }) {
  const [journal, setJournal] = useState("");
  const [date, setDate] = useState(new Date());
  const [location, setLocation] = useState("");
  const [photoFile, setPhotoFile] = useState(null);
  const [photoPreview, setPhotoPreview] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handlePhotoChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setPhotoFile(file);
      const reader = new FileReader();
      reader.onloadend = () => setPhotoPreview(reader.result);
      reader.readAsDataURL(file);
    }
  };

  const removePhoto = () => {
    setPhotoFile(null);
    setPhotoPreview(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!journal.trim()) return;

    setIsSubmitting(true);
    let photoUrl = null;
    
    // Upload photo if exists
    if (photoFile) {
      const { file_url } = await base44.integrations.Core.UploadFile({ file: photoFile });
      photoUrl = file_url;
    }

    // Use AI to analyze the journal and photo
    const analysisPrompt = `Analyze this high school memory journal entry and return JSON:
Journal: "${journal}"
${location ? `Location: ${location}` : ""}
${photoUrl ? "A photo was also attached." : ""}

Return:
{
  "sentiment": "happy|excited|nostalgic|proud|grateful|stressed|hopeful",
  "themes": ["friends", "academic", "milestones", "sports", "arts", "family", "travel"] (pick 1-3 that apply),
  "mentioned_people": ["names mentioned in the journal"] (empty array if none),
  "ai_caption": "A short, warm, celebratory caption (max 15 words) that captures the essence of this moment"
}`;

    const analysis = await base44.integrations.Core.InvokeLLM({
      prompt: analysisPrompt,
      response_json_schema: {
        type: "object",
        properties: {
          sentiment: { type: "string" },
          themes: { type: "array", items: { type: "string" } },
          mentioned_people: { type: "array", items: { type: "string" } },
          ai_caption: { type: "string" }
        }
      },
      file_urls: photoUrl ? [photoUrl] : undefined
    });

    await onSubmit({
      journal,
      date: format(date, "yyyy-MM-dd"),
      location: location || null,
      photo_url: photoUrl,
      sentiment: analysis.sentiment,
      themes: analysis.themes,
      mentioned_people: analysis.mentioned_people,
      ai_caption: analysis.ai_caption
    });

    // Reset form
    setJournal("");
    setDate(new Date());
    setLocation("");
    setPhotoFile(null);
    setPhotoPreview(null);
    setIsSubmitting(false);
  };

  return (
    <form onSubmit={handleSubmit} className="bg-white border-4 border-black rounded-xl p-6 neo-shadow space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-xl font-bold flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-purple-500" />
          Capture a Memory
        </h3>
        {onCancel && (
          <Button type="button" variant="ghost" size="icon" onClick={onCancel}>
            <X className="w-5 h-5" />
          </Button>
        )}
      </div>

      {/* Photo Upload */}
      <div>
        {photoPreview ? (
          <div className="relative">
            <img src={photoPreview} alt="Preview" className="w-full h-48 object-cover rounded-lg border-2 border-black" />
            <Button
              type="button"
              variant="destructive"
              size="icon"
              className="absolute top-2 right-2"
              onClick={removePhoto}
            >
              <X className="w-4 h-4" />
            </Button>
          </div>
        ) : (
          <label className="flex flex-col items-center justify-center h-32 border-4 border-dashed border-gray-300 rounded-lg cursor-pointer hover:border-purple-400 transition-colors">
            <Camera className="w-8 h-8 text-gray-400 mb-2" />
            <span className="text-sm text-gray-500">Add a photo (optional)</span>
            <input type="file" accept="image/*" className="hidden" onChange={handlePhotoChange} />
          </label>
        )}
      </div>

      {/* Journal Entry */}
      <Textarea
        placeholder="What happened today? Who were you with? How did you feel?"
        value={journal}
        onChange={(e) => setJournal(e.target.value)}
        className="min-h-24 border-2 border-black text-base"
        required
      />

      {/* Date and Location */}
      <div className="flex flex-wrap gap-3">
        <Popover>
          <PopoverTrigger asChild>
            <Button type="button" variant="outline" className="border-2 border-black">
              <CalendarIcon className="w-4 h-4 mr-2" />
              {format(date, "MMM d, yyyy")}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0">
            <Calendar mode="single" selected={date} onSelect={(d) => d && setDate(d)} />
          </PopoverContent>
        </Popover>

        <div className="flex-1 min-w-[150px]">
          <div className="relative">
            <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <Input
              placeholder="Location (optional)"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              className="pl-9 border-2 border-black"
            />
          </div>
        </div>
      </div>

      {/* Submit */}
      <Button
        type="submit"
        disabled={!journal.trim() || isSubmitting}
        className="w-full bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white font-bold py-3 border-2 border-black neo-shadow"
      >
        {isSubmitting ? (
          <>
            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            Saving memory...
          </>
        ) : (
          <>
            <Sparkles className="w-4 h-4 mr-2" />
            Save Memory
          </>
        )}
      </Button>
    </form>
  );
}