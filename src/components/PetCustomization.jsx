import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { Sparkles, Check } from "lucide-react";

const ACCESSORIES = [
  { id: "none", name: "None", emoji: "❌", cost: 0 },
  { id: "crown", name: "Crown", emoji: "👑", cost: 50 },
  { id: "glasses", name: "Sunglasses", emoji: "🕶️", cost: 30 },
  { id: "bowtie", name: "Bow Tie", emoji: "🎀", cost: 40 },
  { id: "hat", name: "Top Hat", emoji: "🎩", cost: 60 },
  { id: "star", name: "Star", emoji: "⭐", cost: 35 },
  { id: "heart", name: "Heart", emoji: "💖", cost: 45 },
];

const PET_COLORS = [
  "#FF6B9D", "#9B4D96", "#FFD93D", "#B8E8D4", 
  "#E0BBE4", "#FFB6D9", "#87CEEB", "#98D8C8"
];

export default function PetCustomization({ pet, onUpdate }) {
  const [selectedAccessory, setSelectedAccessory] = useState(pet?.active_accessory || "none");
  const [selectedColor, setSelectedColor] = useState(pet?.color || "#FF6B9D");
  const [userXP, setUserXP] = useState(0);

  useEffect(() => {
    loadUser();
  }, []);

  const loadUser = async () => {
    try {
      const user = await base44.auth.me();
      setUserXP(user.total_xp || 0);
    } catch (error) {
      console.error("Failed to load user:", error);
    }
  };

  const handleUnlockAccessory = async (accessory) => {
    if (userXP < accessory.cost) {
      alert(`You need ${accessory.cost} XP to unlock this accessory!`);
      return;
    }

    try {
      const currentAccessories = pet.accessories || [];
      if (!currentAccessories.includes(accessory.id)) {
        await base44.entities.Pet.update(pet.id, {
          accessories: [...currentAccessories, accessory.id]
        });
        
        const user = await base44.auth.me();
        await base44.auth.updateMe({
          total_xp: user.total_xp - accessory.cost
        });
        
        setUserXP(userXP - accessory.cost);
        onUpdate();
      }
    } catch (error) {
      console.error("Failed to unlock accessory:", error);
    }
  };

  const handleEquipAccessory = async (accessoryId) => {
    try {
      await base44.entities.Pet.update(pet.id, {
        active_accessory: accessoryId
      });
      setSelectedAccessory(accessoryId);
      onUpdate();
    } catch (error) {
      console.error("Failed to equip accessory:", error);
    }
  };

  const handleChangeColor = async (color) => {
    try {
      await base44.entities.Pet.update(pet.id, {
        color: color
      });
      setSelectedColor(color);
      onUpdate();
    } catch (error) {
      console.error("Failed to change color:", error);
    }
  };

  const unlockedAccessories = pet?.accessories || [];

  return (
    <div className="space-y-6">
      {/* Pet Colors */}
      <div>
        <h3 className="pixel-text text-lg mb-3">Pet Color</h3>
        <div className="grid grid-cols-4 gap-3">
          {PET_COLORS.map((color) => (
            <button
              key={color}
              onClick={() => handleChangeColor(color)}
              className={`w-full h-12 pixel-button transition-all ${
                selectedColor === color ? 'border-4 border-black' : 'opacity-70'
              }`}
              style={{ backgroundColor: color }}
              aria-label={`Select color ${color}`}
            />
          ))}
        </div>
      </div>

      {/* Accessories */}
      <div>
        <div className="flex justify-between items-center mb-3">
          <h3 className="pixel-text text-lg">Accessories</h3>
          <div className="pixel-badge bg-[#FFD93D]">
            {userXP} XP
          </div>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
          {ACCESSORIES.map((accessory) => {
            const isUnlocked = accessory.cost === 0 || unlockedAccessories.includes(accessory.id);
            const isActive = selectedAccessory === accessory.id;

            return (
              <motion.button
                key={accessory.id}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => {
                  if (isUnlocked) {
                    handleEquipAccessory(accessory.id);
                  } else {
                    handleUnlockAccessory(accessory);
                  }
                }}
                className={`pixel-card p-4 text-center relative ${
                  isActive ? 'bg-[#B8E8D4]' : 'bg-white'
                } ${!isUnlocked ? 'opacity-60' : ''}`}
              >
                {isActive && (
                  <div className="absolute top-2 right-2">
                    <Check className="w-5 h-5 text-[#9B4D96]" />
                  </div>
                )}
                <div className="text-4xl mb-2">{accessory.emoji}</div>
                <p className="font-bold text-sm">{accessory.name}</p>
                {!isUnlocked && (
                  <div className="flex items-center justify-center gap-1 mt-2">
                    <Sparkles className="w-3 h-3 text-[#FFD93D]" />
                    <span className="text-xs font-bold">{accessory.cost} XP</span>
                  </div>
                )}
              </motion.button>
            );
          })}
        </div>
      </div>
    </div>
  );
}