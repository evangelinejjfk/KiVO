import React, { useState } from "react";
import { motion } from "framer-motion";
import { ArrowLeft, Flower2, Sparkles } from "lucide-react";

const plantEmojis = ["🌱", "🌷", "🌻", "🌺", "🌸", "🪴", "🌵", "🍄", "🌹", "🌼"];

export default function PixelGarden({ onClose, onBack }) {
  const [garden, setGarden] = useState([]);
  const [isComplete, setIsComplete] = useState(false);

  const addPlant = (plant) => {
    const newGarden = [...garden, { plant, id: Date.now() }];
    setGarden(newGarden);
    
    if (newGarden.length >= 8 && !isComplete) {
      setIsComplete(true);
      if (window.awardPetXP) {
        window.awardPetXP(10);
      }
    }
  };

  const clearGarden = () => {
    setGarden([]);
    setIsComplete(false);
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="pixel-card bg-[#B8E8D4] p-6 max-w-2xl mx-auto"
    >
      <button onClick={onBack} className="pixel-button bg-white p-2 mb-4">
        <ArrowLeft className="w-5 h-5" />
      </button>

      <div className="text-center mb-6">
        <h2 className="pixel-text text-xl mb-2">Pixel Garden 🌸</h2>
        <p className="text-sm text-gray-700">
          Plant flowers to create your calming garden. {isComplete ? "Beautiful! 🌟" : `(${garden.length}/8)`}
        </p>
      </div>

      {/* Garden Grid */}
      <div className="pixel-card bg-gradient-to-b from-green-100 to-green-200 p-6 mb-6 min-h-[200px]">
        <div className="grid grid-cols-4 gap-3">
          {garden.map((item, idx) => (
            <motion.div
              key={item.id}
              initial={{ scale: 0, rotate: -180 }}
              animate={{ scale: 1, rotate: 0 }}
              className="text-5xl text-center"
            >
              {item.plant}
            </motion.div>
          ))}
        </div>
        {garden.length === 0 && (
          <div className="text-center text-gray-500 py-8">
            <p className="text-sm">Your garden is empty. Start planting! 🌱</p>
          </div>
        )}
      </div>

      {/* Plant Selection */}
      <div className="grid grid-cols-5 gap-2 mb-4">
        {plantEmojis.map((plant) => (
          <motion.button
            key={plant}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={() => addPlant(plant)}
            className="pixel-button bg-white text-4xl p-3"
          >
            {plant}
          </motion.button>
        ))}
      </div>

      {isComplete && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="pixel-card bg-yellow-100 p-4 mb-4 text-center"
        >
          <Sparkles className="w-6 h-6 mx-auto mb-2 text-yellow-600" />
          <p className="font-bold text-sm">Your garden is blooming! +10 XP earned 🎮</p>
        </motion.div>
      )}

      <div className="flex gap-3 justify-center">
        <button onClick={clearGarden} className="pixel-button bg-white px-6 py-2">
          Clear Garden
        </button>
        <button onClick={onClose} className="pixel-button bg-[#FFB6D9] text-white px-6 py-2">
          Done
        </button>
      </div>
    </motion.div>
  );
}