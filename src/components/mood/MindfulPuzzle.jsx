import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { ArrowLeft, Sparkles } from "lucide-react";

const colors = ["#FFB6D9", "#B8E8D4", "#E0BBE4", "#FFF4C9", "#C7CEEA"];

export default function MindfulPuzzle({ onClose, onBack }) {
  const [tiles, setTiles] = useState([]);
  const [selectedTiles, setSelectedTiles] = useState([]);
  const [matchedPairs, setMatchedPairs] = useState([]);
  const [isComplete, setIsComplete] = useState(false);

  useEffect(() => {
    initializeGame();
  }, []);

  const initializeGame = () => {
    const emojis = ["🌟", "🌈", "🦋", "🌸", "✨", "🎨"];
    const pairs = [...emojis, ...emojis];
    const shuffled = pairs.sort(() => Math.random() - 0.5).map((emoji, idx) => ({
      id: idx,
      emoji,
      matched: false,
    }));
    setTiles(shuffled);
    setSelectedTiles([]);
    setMatchedPairs([]);
    setIsComplete(false);
  };

  const handleTileClick = (tile) => {
    if (selectedTiles.length === 2 || tile.matched || selectedTiles.includes(tile.id)) return;

    const newSelected = [...selectedTiles, tile.id];
    setSelectedTiles(newSelected);

    if (newSelected.length === 2) {
      const [first, second] = newSelected.map(id => tiles.find(t => t.id === id));
      
      if (first.emoji === second.emoji) {
        setTimeout(() => {
          setTiles(tiles.map(t => 
            t.id === first.id || t.id === second.id ? { ...t, matched: true } : t
          ));
          setMatchedPairs([...matchedPairs, first.emoji]);
          setSelectedTiles([]);
          
          if (matchedPairs.length + 1 === 6) {
            setIsComplete(true);
            if (window.awardPetXP) {
              window.awardPetXP(10);
            }
          }
        }, 500);
      } else {
        setTimeout(() => setSelectedTiles([]), 1000);
      }
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="pixel-card bg-[#E0BBE4] p-6 max-w-lg mx-auto"
    >
      <button onClick={onBack} className="pixel-button bg-white p-2 mb-4">
        <ArrowLeft className="w-5 h-5" />
      </button>

      <div className="text-center mb-6">
        <h2 className="pixel-text text-xl mb-2">Mindful Puzzle 🧩</h2>
        <p className="text-sm text-gray-700">
          Match the pairs to complete the puzzle. Focus and relax! ({matchedPairs.length}/6)
        </p>
      </div>

      <div className="grid grid-cols-4 gap-3 mb-6">
        {tiles.map((tile) => (
          <motion.button
            key={tile.id}
            whileHover={!tile.matched ? { scale: 1.05 } : {}}
            whileTap={!tile.matched ? { scale: 0.95 } : {}}
            onClick={() => handleTileClick(tile)}
            className="pixel-button aspect-square text-3xl"
            style={{
              backgroundColor: tile.matched 
                ? "#A8E6CF" 
                : selectedTiles.includes(tile.id) 
                ? "#FFD93D" 
                : "white"
            }}
          >
            {tile.matched || selectedTiles.includes(tile.id) ? tile.emoji : "?"}
          </motion.button>
        ))}
      </div>

      {isComplete && (
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          className="pixel-card bg-yellow-100 p-4 mb-4 text-center"
        >
          <Sparkles className="w-8 h-8 mx-auto mb-2 text-yellow-600" />
          <p className="pixel-text text-lg mb-2">Puzzle Complete! ✨</p>
          <p className="text-sm font-bold">+10 XP earned 🎮</p>
        </motion.div>
      )}

      <div className="flex gap-3 justify-center">
        <button onClick={initializeGame} className="pixel-button bg-white px-6 py-2">
          New Puzzle
        </button>
        <button onClick={onClose} className="pixel-button bg-[#FFB6D9] text-white px-6 py-2">
          Done
        </button>
      </div>
    </motion.div>
  );
}