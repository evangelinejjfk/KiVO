import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Heart, Apple, Sparkles, Plus } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const petEmojis = {
  cat: "🐱",
  dog: "🐶",
  dragon: "🐲",
  bunny: "🐰",
  fox: "🦊"
};

export default function TamagotchiWidget() {
  const [pet, setPet] = useState(null);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [petName, setPetName] = useState("");
  const [petType, setPetType] = useState("cat");
  const [isFeeding, setIsFeeding] = useState(false);
  const [showXPGain, setShowXPGain] = useState(null);

  useEffect(() => {
    loadPet();
  }, []);

  const loadPet = async () => {
    const pets = await base44.entities.Pet.list();
    if (pets.length > 0) {
      setPet(pets[0]);
      updateHunger(pets[0]);
    }
  };

  const updateHunger = async (currentPet) => {
    if (!currentPet.last_fed) return;
    const hoursSinceLastFed = (Date.now() - new Date(currentPet.last_fed).getTime()) / (1000 * 60 * 60);
    const newHunger = Math.min(100, currentPet.hunger + Math.floor(hoursSinceLastFed * 5));
    if (newHunger !== currentPet.hunger) {
      await base44.entities.Pet.update(currentPet.id, { hunger: newHunger });
      setPet({ ...currentPet, hunger: newHunger });
    }
  };

  const createPet = async (e) => {
    e.preventDefault();
    const newPet = await base44.entities.Pet.create({
      name: petName,
      type: petType,
      level: 1,
      xp: 0,
      happiness: 80,
      hunger: 20,
      last_fed: new Date().toISOString(),
      color: "#FF6B9D"
    });
    setPet(newPet);
    setShowCreateForm(false);
  };

  const feedPet = async () => {
    if (isFeeding || !pet) return;
    setIsFeeding(true);
    
    const newHunger = Math.max(0, pet.hunger - 30);
    const newHappiness = Math.min(100, pet.happiness + 10);

    await base44.entities.Pet.update(pet.id, {
      hunger: newHunger,
      happiness: newHappiness,
      last_fed: new Date().toISOString()
    });

    setPet({
      ...pet,
      hunger: newHunger,
      happiness: newHappiness,
      last_fed: new Date().toISOString()
    });

    setTimeout(() => setIsFeeding(false), 1000);
  };

  // Global XP award function
  const awardXP = async (points) => {
    if (!pet) return;
    
    const newXP = pet.xp + points;
    const xpForNextLevel = pet.level * 100;
    
    let newLevel = pet.level;
    let finalXP = newXP;
    
    if (newXP >= xpForNextLevel) {
      newLevel = pet.level + 1;
      finalXP = newXP - xpForNextLevel;
    }
    
    const updatedPet = {
      ...pet,
      xp: finalXP,
      level: newLevel,
      happiness: Math.min(100, pet.happiness + 5)
    };
    
    await base44.entities.Pet.update(pet.id, updatedPet);
    setPet(updatedPet);
    
    // Update user level too
    await base44.auth.updateMe({ level: newLevel, xp: finalXP });
    
    // Show XP gain animation
    setShowXPGain(points);
    setTimeout(() => setShowXPGain(null), 2000);
  };

  // Expose awardXP globally for other components
  useEffect(() => {
    if (pet) {
      window.awardPetXP = awardXP;
    }
  }, [pet]);

  if (!pet && !showCreateForm) {
    return (
      <motion.div 
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        whileHover={{ scale: 1.02 }}
        className="pixel-card bg-gradient-to-br from-[#FFE5E5] via-[#FFD93D] to-[#A8E6CF] p-8 text-center relative overflow-hidden"
      >
        <div className="absolute top-0 right-0 text-6xl opacity-20">✨</div>
        <div className="text-6xl mb-4 animate-bounce">🥚</div>
        <p className="pixel-text text-lg mb-4 drop-shadow">Adopt Your Study Buddy!</p>
        <button
          onClick={() => setShowCreateForm(true)}
          className="pixel-button bg-gradient-to-r from-[#FF6B9D] to-[#C147E9] text-white px-6 py-3 flex items-center gap-2 mx-auto"
        >
          <Plus className="w-5 h-5" />
          Create Pet
        </button>
      </motion.div>
    );
  }

  if (showCreateForm) {
    return (
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="pixel-card bg-white p-6"
      >
        <h3 className="pixel-text text-xl mb-4">Create Your Pet! 🎮</h3>
        <form onSubmit={createPet} className="space-y-4">
          <div>
            <label className="block font-bold mb-2">Pet Name:</label>
            <input
              type="text"
              value={petName}
              onChange={(e) => setPetName(e.target.value)}
              className="pixel-input w-full p-3"
              placeholder="Enter name..."
              required
            />
          </div>
          <div>
            <label className="block font-bold mb-2">Choose Type:</label>
            <div className="grid grid-cols-5 gap-2">
              {Object.entries(petEmojis).map(([type, emoji]) => (
                <button
                  key={type}
                  type="button"
                  onClick={() => setPetType(type)}
                  className={`pixel-button p-4 text-3xl ${petType === type ? 'bg-[#FFD93D]' : 'bg-gray-100'}`}
                >
                  {emoji}
                </button>
              ))}
            </div>
          </div>
          <button type="submit" className="pixel-button bg-gradient-to-r from-[#FF6B9D] to-[#C147E9] text-white w-full py-3">
            <Sparkles className="w-5 h-5 inline mr-2" />
            Hatch Pet!
          </button>
        </form>
      </motion.div>
    );
  }

  const xpProgress = (pet.xp / (pet.level * 100)) * 100;

  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      whileHover={{ scale: 1.02 }}
      className="pixel-card bg-gradient-to-br from-[#FF6B9D] via-[#FFD93D] to-[#FFA500] p-6 relative overflow-hidden"
    >
      <div className="absolute top-0 left-0 w-full h-full opacity-10">
        <div className="pixel-grid"></div>
      </div>
      
      {isFeeding && (
        <motion.div
          initial={{ opacity: 0, scale: 0, y: 0 }}
          animate={{ opacity: 1, scale: 1.5, y: -50 }}
          exit={{ opacity: 0 }}
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-6xl z-20"
        >
          💖
        </motion.div>
      )}

      {showXPGain && (
        <motion.div
          initial={{ opacity: 0, scale: 0, y: 0 }}
          animate={{ opacity: 1, scale: 1.2, y: -30 }}
          exit={{ opacity: 0 }}
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 pixel-text text-2xl z-20 text-yellow-300 drop-shadow-lg"
        >
          +{showXPGain} XP!
        </motion.div>
      )}

      <div className="absolute top-0 right-0 w-32 h-32 bg-white opacity-10 rounded-full -mr-16 -mt-16"></div>
      <div className="text-center mb-4 relative z-10">
        <h3 className="pixel-text text-lg mb-2 text-white drop-shadow-lg">{pet.name}</h3>
        <div className="text-6xl mb-2 animate-bounce">{petEmojis[pet.type]}</div>
        <p className="text-sm font-bold bg-white bg-opacity-20 inline-block px-3 py-1 rounded-full text-white">
          Level {pet.level} ⭐
        </p>
      </div>

      {/* Stats */}
      <div className="space-y-3 relative z-10">
        {/* Happiness */}
        <div>
          <div className="flex items-center justify-between mb-1">
            <span className="text-sm font-bold flex items-center gap-1 text-white">
              <Heart className="w-4 h-4 text-pink-300" /> Happy
            </span>
            <span className="text-sm font-bold text-white">{pet.happiness}%</span>
          </div>
          <div className="pixel-progress-bar bg-pink-200">
            <div 
              className="pixel-progress-fill bg-gradient-to-r from-pink-400 to-red-400"
              style={{ width: `${pet.happiness}%` }}
            ></div>
          </div>
        </div>

        {/* Hunger */}
        <div>
          <div className="flex items-center justify-between mb-1">
            <span className="text-sm font-bold flex items-center gap-1 text-white">
              <Apple className="w-4 h-4 text-green-300" /> Hunger
            </span>
            <span className="text-sm font-bold text-white">{pet.hunger}%</span>
          </div>
          <div className="pixel-progress-bar bg-orange-200">
            <div 
              className="pixel-progress-fill bg-gradient-to-r from-yellow-400 to-orange-400"
              style={{ width: `${pet.hunger}%` }}
            ></div>
          </div>
        </div>

        {/* XP */}
        <div>
          <div className="flex items-center justify-between mb-1">
            <span className="text-sm font-bold text-white">⭐ XP to Level {pet.level + 1}</span>
            <span className="text-sm font-bold text-white">{pet.xp}/{pet.level * 100}</span>
          </div>
          <div className="pixel-progress-bar bg-yellow-200">
            <div 
              className="pixel-progress-fill bg-gradient-to-r from-yellow-300 via-yellow-400 to-yellow-500"
              style={{ width: `${xpProgress}%` }}
            ></div>
          </div>
        </div>
      </div>

      {/* XP Guide */}
      <div className="mt-4 p-3 bg-white bg-opacity-20 rounded-lg relative z-10">
        <p className="text-xs font-bold mb-2 text-white">🎮 Earn XP by:</p>
        <div className="space-y-1 text-xs text-white">
          <p>📝 Scrapbook: +20 XP</p>
          <p>🤖 AI Questions: +10 XP</p>
          <p>🗓️ Calendar Events: +5 XP</p>
          <p>🧠 Flashcards: +5 XP each</p>
          <p>💰 MoneyFlow: +3 XP</p>
        </div>
      </div>

      {/* Feed Button */}
      <button
        onClick={feedPet}
        disabled={isFeeding}
        className="pixel-button bg-white text-black w-full py-3 mt-4 hover:bg-opacity-90 relative z-10"
      >
        {isFeeding ? "Feeding... 🍎" : "Feed Pet 🍎"}
      </button>
    </motion.div>
  );
}