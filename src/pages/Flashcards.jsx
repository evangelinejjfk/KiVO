import React, { useState, useEffect } from "react";
import { Flashcard } from "@/entities/Flashcard";
import { InvokeLLM } from "@/integrations/Core";
import { User } from "@/entities/User";
import { motion, AnimatePresence } from "framer-motion";
import { Brain, Plus, RotateCcw, Wand2 } from "lucide-react";

export default function Flashcards() {
  const [flashcards, setFlashcards] = useState([]);
  const [currentCard, setCurrentCard] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [isStudyMode, setIsStudyMode] = useState(false);
  const [selectedSubject, setSelectedSubject] = useState("all");
  const [isGenerating, setIsGenerating] = useState(false);

  const [newCard, setNewCard] = useState({
    question: "",
    answer: "",
    subject: "",
    difficulty: "medium"
  });

  const [aiTopic, setAiTopic] = useState("");

  const subjects = ["Math", "Science", "English", "History", "Geography", "Physics", "Chemistry", "Biology"];

  useEffect(() => {
    loadFlashcards();
  }, []);

  const loadFlashcards = async () => {
    try {
      const user = await User.me();
      const userCards = await Flashcard.filter({ created_by: user.email }, "-created_date");
      setFlashcards(userCards);
    } catch (error) {
      console.error("Failed to load flashcards:", error);
    }
  };

  const handleCreateCard = async (e) => {
    e.preventDefault();
    if (!newCard.question || !newCard.answer || !newCard.subject) {
      alert("Please fill in all fields.");
      return;
    }

    try {
      await Flashcard.create(newCard);
      setNewCard({ question: "", answer: "", subject: "", difficulty: "medium" });
      setShowCreateForm(false);
      loadFlashcards();
    } catch (error) {
      console.error("Failed to create flashcard:", error);
    }
  };

  const generateAIFlashcards = async () => {
    if (!aiTopic) return;
    setIsGenerating(true);

    try {
      const prompt = `Generate 5 educational flashcards for the topic: "${aiTopic}". Return a JSON object with an array called "flashcards", where each flashcard has "question", "answer", and "subject" fields. Make questions clear and concise, with detailed but brief answers.`;
      
      const response = await InvokeLLM({
        prompt,
        response_json_schema: {
          type: "object",
          properties: {
            flashcards: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  question: { type: "string" },
                  answer: { type: "string" },
                  subject: { type: "string" }
                }
              }
            }
          }
        }
      });

      if (response.flashcards && response.flashcards.length > 0) {
        for (const card of response.flashcards) {
          await Flashcard.create({
            question: card.question,
            answer: card.answer,
            subject: card.subject,
            difficulty: "medium"
          });
        }
        setAiTopic("");
        loadFlashcards();
        alert(`Generated ${response.flashcards.length} flashcards!`);
      }
    } catch (error) {
      console.error("Failed to generate flashcards:", error);
      alert("Failed to generate flashcards. Please try again.");
    }
    setIsGenerating(false);
  };

  const filteredCards = selectedSubject === "all" 
    ? flashcards 
    : flashcards.filter(card => card.subject === selectedSubject);

  const nextCard = () => {
    setCurrentCard((prev) => (prev + 1) % filteredCards.length);
    setIsFlipped(false);
  };

  const prevCard = () => {
    setCurrentCard((prev) => (prev - 1 + filteredCards.length) % filteredCards.length);
    setIsFlipped(false);
  };

  const inputStyle = "w-full p-3 bg-white border-2 border-black rounded-lg focus:outline-none focus:ring-2 focus:ring-[#87CEEB] focus:border-transparent neo-shadow-small";
  const buttonStyle = "py-3 px-6 bg-[#98FB98] border-2 border-black rounded-lg neo-shadow hover:neo-shadow-small active:shadow-none transform active:translate-x-[2px] active:translate-y-[2px] transition-all duration-150 font-bold";

  return (
    <div className="space-y-8">
      <div className="text-center">
        <Brain className="mx-auto h-16 w-16 mb-4" />
        <h1 className="text-4xl font-bold">Flashcards</h1>
        <p className="text-lg text-gray-700 mt-2">Create and study with personalized flashcards</p>
      </div>

      <div className="flex flex-col md:flex-row gap-4 justify-between">
        <div className="flex gap-4">
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

          {filteredCards.length > 0 && (
            <button
              onClick={() => setIsStudyMode(!isStudyMode)}
              className={buttonStyle + " " + (isStudyMode ? "bg-[#87CEEB]" : "")}
            >
              {isStudyMode ? "Exit Study Mode" : "Study Mode"}
            </button>
          )}
        </div>

        <button
          onClick={() => setShowCreateForm(!showCreateForm)}
          className={buttonStyle}
        >
          <Plus className="w-5 h-5 mr-2" />
          Create Card
        </button>
      </div>

      <AnimatePresence>
        {showCreateForm && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="p-6 bg-white border-4 border-black rounded-xl neo-shadow space-y-6"
          >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h3 className="text-xl font-bold mb-4">Create Manually</h3>
                <form onSubmit={handleCreateCard} className="space-y-4">
                  <div>
                    <label className="font-bold block mb-1">Question*</label>
                    <textarea
                      value={newCard.question}
                      onChange={(e) => setNewCard({ ...newCard, question: e.target.value })}
                      className={inputStyle + " h-24"}
                      placeholder="What is the capital of France?"
                    />
                  </div>
                  <div>
                    <label className="font-bold block mb-1">Answer*</label>
                    <textarea
                      value={newCard.answer}
                      onChange={(e) => setNewCard({ ...newCard, answer: e.target.value })}
                      className={inputStyle + " h-24"}
                      placeholder="Paris"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="font-bold block mb-1">Subject*</label>
                      <select
                        value={newCard.subject}
                        onChange={(e) => setNewCard({ ...newCard, subject: e.target.value })}
                        className={inputStyle}
                      >
                        <option value="">Select Subject</option>
                        {subjects.map(subject => (
                          <option key={subject} value={subject}>{subject}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="font-bold block mb-1">Difficulty</label>
                      <select
                        value={newCard.difficulty}
                        onChange={(e) => setNewCard({ ...newCard, difficulty: e.target.value })}
                        className={inputStyle}
                      >
                        <option value="easy">Easy</option>
                        <option value="medium">Medium</option>
                        <option value="hard">Hard</option>
                      </select>
                    </div>
                  </div>
                  <button type="submit" className={buttonStyle + " w-full"}>
                    Create Flashcard
                  </button>
                </form>
              </div>

              <div>
                <h3 className="text-xl font-bold mb-4">Generate with AI</h3>
                <div className="space-y-4">
                  <div>
                    <label className="font-bold block mb-1">Topic</label>
                    <input
                      type="text"
                      value={aiTopic}
                      onChange={(e) => setAiTopic(e.target.value)}
                      className={inputStyle}
                      placeholder="e.g., World War 2, Photosynthesis, Algebra"
                    />
                  </div>
                  <button
                    onClick={generateAIFlashcards}
                    disabled={isGenerating || !aiTopic}
                    className={buttonStyle + " w-full flex items-center justify-center gap-2"}
                  >
                    <Wand2 className="w-5 h-5" />
                    {isGenerating ? "Generating..." : "Generate 5 Cards"}
                  </button>
                  <p className="text-sm text-gray-600">
                    AI will create 5 flashcards on your chosen topic
                  </p>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {isStudyMode && filteredCards.length > 0 ? (
        <div className="max-w-2xl mx-auto">
          <div className="text-center mb-4">
            <p className="text-lg font-semibold">
              Card {currentCard + 1} of {filteredCards.length}
            </p>
          </div>

          <motion.div
            key={currentCard}
            initial={{ opacity: 0, rotateY: 180 }}
            animate={{ opacity: 1, rotateY: 0 }}
            className="relative h-80 cursor-pointer"
            onClick={() => setIsFlipped(!isFlipped)}
          >
            <div className={`absolute inset-0 w-full h-full transition-transform duration-500 preserve-3d ${isFlipped ? 'rotate-y-180' : ''}`}>
              <div className="absolute inset-0 w-full h-full backface-hidden bg-white border-4 border-black rounded-xl neo-shadow p-8 flex items-center justify-center">
                <div className="text-center">
                  <h3 className="text-2xl font-bold mb-4">Question</h3>
                  <p className="text-lg">{filteredCards[currentCard]?.question}</p>
                  <p className="text-sm text-gray-500 mt-4">Click to reveal answer</p>
                </div>
              </div>
              <div className="absolute inset-0 w-full h-full backface-hidden bg-[#87CEEB] border-4 border-black rounded-xl neo-shadow p-8 flex items-center justify-center rotate-y-180">
                <div className="text-center">
                  <h3 className="text-2xl font-bold mb-4">Answer</h3>
                  <p className="text-lg">{filteredCards[currentCard]?.answer}</p>
                </div>
              </div>
            </div>
          </motion.div>

          <div className="flex justify-center gap-4 mt-6">
            <button onClick={prevCard} className={buttonStyle}>
              ← Previous
            </button>
            <button
              onClick={() => setIsFlipped(!isFlipped)}
              className={buttonStyle + " bg-[#87CEEB]"}
            >
              <RotateCcw className="w-5 h-5 mr-2" />
              Flip Card
            </button>
            <button onClick={nextCard} className={buttonStyle}>
              Next →
            </button>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <AnimatePresence>
            {filteredCards.map((card) => (
              <motion.div
                key={card.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="p-5 bg-white border-4 border-black rounded-xl neo-shadow"
              >
                <div className="flex items-center justify-between mb-3">
                  <span className="px-2 py-1 text-xs font-bold bg-blue-200 border border-black rounded">
                    {card.subject}
                  </span>
                  <span className={`px-2 py-1 text-xs font-bold border border-black rounded ${
                    card.difficulty === "easy" ? "bg-green-200" :
                    card.difficulty === "hard" ? "bg-red-200" : "bg-yellow-200"
                  }`}>
                    {card.difficulty}
                  </span>
                </div>
                <h3 className="text-lg font-bold mb-2">Q: {card.question}</h3>
                <p className="text-sm text-gray-600">A: {card.answer}</p>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}

      {filteredCards.length === 0 && (
        <div className="text-center py-10 px-6 bg-white border-4 border-black rounded-xl neo-shadow">
          <h3 className="text-2xl font-bold">No Flashcards Yet</h3>
          <p className="mt-2 text-gray-600">
            Create your first flashcard to start studying!
          </p>
        </div>
      )}

      <style jsx>{`
        .preserve-3d {
          transform-style: preserve-3d;
        }
        .backface-hidden {
          backface-visibility: hidden;
        }
        .rotate-y-180 {
          transform: rotateY(180deg);
        }
      `}</style>
    </div>
  );
}