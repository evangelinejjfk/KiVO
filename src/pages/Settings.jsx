import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Settings as SettingsIcon, Trash2, Plus, Check, AlertTriangle } from "lucide-react";
import { motion } from "framer-motion";

const petEmojis = {
  cat: "🐱",
  dog: "🐶",
  dragon: "🐲",
  bunny: "🐰",
  fox: "🦊"
};

export default function Settings() {
  const [pets, setPets] = useState([]);
  const [activePetId, setActivePetId] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [showResetConfirm, setShowResetConfirm] = useState(false);
  const [showBuyPet, setShowBuyPet] = useState(false);
  const [newPetName, setNewPetName] = useState("");
  const [newPetType, setNewPetType] = useState("cat");

  useEffect(() => {
    loadPets();
  }, []);

  const loadPets = async () => {
    setIsLoading(true);
    const allPets = await base44.entities.Pet.list();
    setPets(allPets);
    if (allPets.length > 0) {
      setActivePetId(allPets[0].id);
    }
    setIsLoading(false);
  };

  const buyPet = async (e) => {
    e.preventDefault();
    await base44.entities.Pet.create({
      name: newPetName,
      type: newPetType,
      level: 1,
      xp: 0,
      happiness: 80,
      hunger: 20,
      last_fed: new Date().toISOString(),
      color: "#FF6B9D"
    });
    setNewPetName("");
    setNewPetType("cat");
    setShowBuyPet(false);
    await loadPets();
  };

  const switchPet = async (petId) => {
    // Reorder pets so the selected one is first
    const selectedPet = pets.find(p => p.id === petId);
    await base44.entities.Pet.update(petId, { ...selectedPet });
    setActivePetId(petId);
    window.location.reload();
  };

  const resetProgress = async () => {
    // Delete all user data
    const user = await base44.auth.me();
    
    // Delete all entities created by user
    const homeworks = await base44.entities.Homework.filter({ created_by: user.email });
    const events = await base44.entities.Event.filter({ created_by: user.email });
    const flashcards = await base44.entities.Flashcard.filter({ created_by: user.email });
    const expenses = await base44.entities.Expense.filter({ created_by: user.email });
    const budgets = await base44.entities.Budget.filter({ created_by: user.email });
    const memories = await base44.entities.Memory.filter({ created_by: user.email });
    const yearbooks = await base44.entities.Yearbook.filter({ created_by: user.email });
    const moods = await base44.entities.Mood.filter({ created_by: user.email });
    const aiChats = await base44.entities.AIChat.filter({ created_by: user.email });
    const quickRefs = await base44.entities.QuickReference.filter({ created_by: user.email });
    const userActivities = await base44.entities.UserActivity.filter({ created_by: user.email });
    const achievements = await base44.entities.Achievement.filter({ created_by: user.email });
    const allPets = await base44.entities.Pet.filter({ created_by: user.email });

    // Delete all
    for (const hw of homeworks) await base44.entities.Homework.delete(hw.id);
    for (const ev of events) await base44.entities.Event.delete(ev.id);
    for (const fc of flashcards) await base44.entities.Flashcard.delete(fc.id);
    for (const exp of expenses) await base44.entities.Expense.delete(exp.id);
    for (const bud of budgets) await base44.entities.Budget.delete(bud.id);
    for (const mem of memories) await base44.entities.Memory.delete(mem.id);
    for (const yb of yearbooks) await base44.entities.Yearbook.delete(yb.id);
    for (const mood of moods) await base44.entities.Mood.delete(mood.id);
    for (const chat of aiChats) await base44.entities.AIChat.delete(chat.id);
    for (const qr of quickRefs) await base44.entities.QuickReference.delete(qr.id);
    for (const ua of userActivities) await base44.entities.UserActivity.delete(ua.id);
    for (const ach of achievements) await base44.entities.Achievement.delete(ach.id);
    for (const pet of allPets) await base44.entities.Pet.delete(pet.id);

    // Reset user data
    await base44.auth.updateMe({ 
      level: 1, 
      xp: 0,
      profile_completed: false
    });

    // Redirect to profile setup
    window.location.href = "/ProfileSetup";
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="pixel-spinner"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="pixel-card bg-[#E0BBE4] text-gray-800 p-8"
      >
        <h1 className="pixel-text text-4xl flex items-center gap-3">
          <SettingsIcon className="w-10 h-10" />
          Settings
        </h1>
      </motion.div>

      {/* Pet Management */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0, transition: { delay: 0.1 } }}
        className="pixel-card bg-white p-6"
      >
        <h2 className="pixel-text text-2xl mb-4">🐾 My Pets</h2>
        
        {pets.length > 0 ? (
          <div className="space-y-3 mb-4">
            {pets.map((pet) => (
              <div 
                key={pet.id}
                className={`pixel-item p-4 flex items-center justify-between ${activePetId === pet.id ? 'bg-[#FFE5F4]' : 'bg-gray-50'}`}
              >
                <div className="flex items-center gap-4">
                  <div className="text-4xl">{petEmojis[pet.type]}</div>
                  <div>
                    <p className="font-bold">{pet.name}</p>
                    <p className="text-sm text-gray-600">Level {pet.level} • {pet.type}</p>
                  </div>
                </div>
                {activePetId !== pet.id && (
                  <button
                    onClick={() => switchPet(pet.id)}
                    className="pixel-button bg-[#FFB6D9] text-white px-4 py-2 text-xs"
                  >
                    Switch
                  </button>
                )}
                {activePetId === pet.id && (
                  <div className="flex items-center gap-2 text-green-600">
                    <Check className="w-5 h-5" />
                    <span className="font-bold text-sm">Active</span>
                  </div>
                )}
              </div>
            ))}
          </div>
        ) : (
          <p className="text-gray-600 mb-4">No pets yet. Buy your first pet!</p>
        )}

        {!showBuyPet ? (
          <button
            onClick={() => setShowBuyPet(true)}
            className="pixel-button bg-[#B8E8D4] text-black w-full py-3"
          >
            <Plus className="w-5 h-5 inline mr-2" />
            Buy New Pet
          </button>
        ) : (
          <form onSubmit={buyPet} className="space-y-4 pixel-card bg-[#FFF4C9] p-4">
            <div>
              <label className="block font-bold mb-2">Pet Name:</label>
              <input
                type="text"
                value={newPetName}
                onChange={(e) => setNewPetName(e.target.value)}
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
                    onClick={() => setNewPetType(type)}
                    className={`pixel-button p-4 text-3xl ${newPetType === type ? 'bg-[#FFD93D]' : 'bg-gray-100'}`}
                  >
                    {emoji}
                  </button>
                ))}
              </div>
            </div>
            <div className="flex gap-2">
              <button type="submit" className="pixel-button bg-[#FFB6D9] text-white flex-1 py-3">
                Buy Pet
              </button>
              <button 
                type="button"
                onClick={() => setShowBuyPet(false)}
                className="pixel-button bg-gray-200 text-black flex-1 py-3"
              >
                Cancel
              </button>
            </div>
          </form>
        )}
      </motion.div>

      {/* Reset Progress */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0, transition: { delay: 0.2 } }}
        className="pixel-card bg-red-50 border-red-500 p-6"
      >
        <h2 className="pixel-text text-2xl mb-4 text-red-700 flex items-center gap-2">
          <AlertTriangle className="w-6 h-6" />
          Danger Zone
        </h2>
        <p className="text-sm mb-4 text-gray-700">
          Reset all your progress including pets, memories, flashcards, expenses, and more. This action cannot be undone!
        </p>
        
        {!showResetConfirm ? (
          <button
            onClick={() => setShowResetConfirm(true)}
            className="pixel-button bg-red-500 text-white px-6 py-3"
          >
            <Trash2 className="w-5 h-5 inline mr-2" />
            Reset All Progress
          </button>
        ) : (
          <div className="space-y-3">
            <p className="font-bold text-red-700">Are you absolutely sure? This will delete everything!</p>
            <div className="flex gap-2">
              <button
                onClick={resetProgress}
                className="pixel-button bg-red-600 text-white flex-1 py-3"
              >
                Yes, Reset Everything
              </button>
              <button
                onClick={() => setShowResetConfirm(false)}
                className="pixel-button bg-gray-200 text-black flex-1 py-3"
              >
                Cancel
              </button>
            </div>
          </div>
        )}
      </motion.div>
    </div>
  );
}