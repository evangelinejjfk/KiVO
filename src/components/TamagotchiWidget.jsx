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
    const newXp = pet.xp + 10;
    const newLevel = Math.floor(newXp / 100) + 1;

    await base44.entities.Pet.update(pet.id, {
      hunger: newHunger,
      happiness: newHappiness,
      xp: newXp,
      level: newLevel,
      last_fed: new Date().toISOString()
    });

    setPet({
      ...pet,
      hunger: newHunger,
      happiness: newHappiness,
      xp: newXp,
      level: newLevel,
      last_fed: new Date().toISOString()
    });

    setTimeout(() => setIsFeeding(false), 1000);
  };

  if (!pet && !showCreateForm) {
    return (
      <motion.div 
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="pixel-card bg-gradient-to-br from-[#FFE5E5] to-[#FFF0F5] p-8 text-center"
      >
        <div className="text-6xl mb-4">🥚</div>
        <p className="pixel-text text-lg mb-4">Adopt Your Study Buddy!</p>
        <button
          onClick={() => setShowCreateForm(true)}
          className="pixel-button bg-[#FF6B9D] text-white px-6 py-3 flex items-center gap-2 mx-auto"
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
          <button type="submit" className="pixel-button bg-[#FF6B9D] text-white w-full py-3">
            <Sparkles className="w-5 h-5 inline mr-2" />
            Hatch Pet!
          </button>
        </form>
      </motion.div>
    );
  }

  const xpProgress = (pet.xp % 100) / 100 * 100;

  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      className="pixel-card bg-gradient-to-br from-[#FFE5E5] to-[#FFF0F5] p-6 relative overflow-hidden"
    >
      {isFeeding && (
        <motion.div
          initial={{ opacity: 0, scale: 0 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0 }}
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-6xl z-20"
        >
          💖
        </motion.div>
      )}

      <div className="flex items-start justify-between mb-4">
        <div>
          <h3 className="pixel-text text-2xl">{pet.name}</h3>
          <p className="text-sm font-bold text-[#FF6B9D]">Level {pet.level}</p>
        </div>
        <div className="pixel-badge bg-[#FFD93D]">
          <Sparkles className="w-4 h-4" />
        </div>
      </div>

      <motion.div 
        className="text-center my-8"
        animate={{ y: isFeeding ? -10 : 0 }}
        transition={{ type: "spring", stiffness: 300 }}
      >
        <div className="text-8xl mb-2 filter drop-shadow-lg">
          {petEmojis[pet.type]}
        </div>
      </motion.div>

      <div className="space-y-3">
        <div>
          <div className="flex items-center justify-between mb-1">
            <span className="text-xs font-bold flex items-center gap-1">
              <Heart className="w-4 h-4 text-red-500" />
              Happiness
            </span>
            <span className="text-xs font-bold">{pet.happiness}%</span>
          </div>
          <div className="pixel-progress-bar">
            <motion.div 
              className="pixel-progress-fill bg-[#FF6B9D]"
              initial={{ width: 0 }}
              animate={{ width: `${pet.happiness}%` }}
            />
          </div>
        </div>

        <div>
          <div className="flex items-center justify-between mb-1">
            <span className="text-xs font-bold flex items-center gap-1">
              <Apple className="w-4 h-4 text-green-500" />
              Hunger
            </span>
            <span className="text-xs font-bold">{100 - pet.hunger}%</span>
          </div>
          <div className="pixel-progress-bar">
            <motion.div 
              className="pixel-progress-fill bg-[#A8E6CF]"
              initial={{ width: 0 }}
              animate={{ width: `${100 - pet.hunger}%` }}
            />
          </div>
        </div>

        <div>
          <div className="flex items-center justify-between mb-1">
            <span className="text-xs font-bold flex items-center gap-1">
              <Sparkles className="w-4 h-4 text-yellow-500" />
              XP
            </span>
            <span className="text-xs font-bold">{pet.xp % 100}/100</span>
          </div>
          <div className="pixel-progress-bar">
            <motion.div 
              className="pixel-progress-fill bg-[#FFD93D]"
              initial={{ width: 0 }}
              animate={{ width: `${xpProgress}%` }}
            />
          </div>
        </div>
      </div>

      <button
        onClick={feedPet}
        disabled={isFeeding || pet.hunger < 20}
        className="pixel-button bg-[#A8E6CF] text-gray-800 w-full py-3 mt-4 disabled:opacity-50"
      >
        <Apple className="w-5 h-5 inline mr-2" />
        Feed Pet
      </button>

      <p className="text-xs text-center mt-3 text-gray-600">
        🎯 Complete assignments to earn XP and level up!
      </p>
    </motion.div>
  );
}