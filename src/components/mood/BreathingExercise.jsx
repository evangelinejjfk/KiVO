import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { ArrowLeft, Sparkles } from "lucide-react";

export default function BreathingExercise({ onClose, onBack }) {
  const [phase, setPhase] = useState("ready"); // ready, inhale, hold, exhale, complete
  const [count, setCount] = useState(0);
  const [cycles, setCycles] = useState(0);

  useEffect(() => {
    if (phase === "ready") return;

    let timer;
    if (phase === "inhale" && count < 4) {
      timer = setTimeout(() => setCount(count + 1), 1000);
    } else if (phase === "inhale" && count === 4) {
      setPhase("hold");
      setCount(0);
    } else if (phase === "hold" && count < 4) {
      timer = setTimeout(() => setCount(count + 1), 1000);
    } else if (phase === "hold" && count === 4) {
      setPhase("exhale");
      setCount(0);
    } else if (phase === "exhale" && count < 4) {
      timer = setTimeout(() => setCount(count + 1), 1000);
    } else if (phase === "exhale" && count === 4) {
      const newCycles = cycles + 1;
      setCycles(newCycles);
      if (newCycles >= 3) {
        setPhase("complete");
        if (window.awardPetXP) {
          window.awardPetXP(10);
        }
      } else {
        setPhase("inhale");
        setCount(0);
      }
    }

    return () => clearTimeout(timer);
  }, [phase, count, cycles]);

  const startExercise = () => {
    setPhase("inhale");
    setCount(0);
    setCycles(0);
  };

  const getPhaseText = () => {
    if (phase === "ready") return "Ready to begin?";
    if (phase === "inhale") return "Breathe In...";
    if (phase === "hold") return "Hold...";
    if (phase === "exhale") return "Breathe Out...";
    if (phase === "complete") return "Well done! 🌟";
    return "";
  };

  const getCircleScale = () => {
    if (phase === "inhale") return 1 + (count * 0.2);
    if (phase === "exhale") return 1.8 - (count * 0.2);
    return 1;
  };

  if (phase === "complete") {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="pixel-card bg-[#B8E8D4] p-8 max-w-lg mx-auto text-center"
      >
        <div className="text-6xl mb-4">✨</div>
        <h2 className="pixel-text text-2xl mb-3">You did it!</h2>
        <p className="text-lg mb-4">Your Pixel Pal is proud of you! +10 XP earned 🎮</p>
        <p className="text-sm text-gray-700 mb-6">
          Taking time to breathe helps calm your mind and body.
        </p>
        <div className="flex gap-3 justify-center">
          <button onClick={startExercise} className="pixel-button bg-white px-6 py-2">
            Do Another Round
          </button>
          <button onClick={onClose} className="pixel-button bg-[#FFB6D9] text-white px-6 py-2">
            Done
          </button>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="pixel-card bg-gradient-to-br from-blue-50 to-purple-50 p-8 max-w-lg mx-auto"
    >
      <button onClick={onBack} className="pixel-button bg-white p-2 mb-4">
        <ArrowLeft className="w-5 h-5" />
      </button>

      <div className="text-center">
        <h2 className="pixel-text text-xl mb-6">4-4-4 Breathing 🌬️</h2>

        <div className="relative w-64 h-64 mx-auto mb-8">
          <motion.div
            animate={{ scale: getCircleScale() }}
            transition={{ duration: 1, ease: "linear" }}
            className="absolute inset-0 rounded-full bg-gradient-to-br from-blue-300 to-purple-300 flex items-center justify-center pixel-border-white"
          >
            <div className="text-center">
              <p className="pixel-text text-2xl mb-2">{getPhaseText()}</p>
              {phase !== "ready" && <p className="text-4xl font-bold">{count}</p>}
            </div>
          </motion.div>
        </div>

        {phase === "ready" ? (
          <div>
            <p className="text-sm mb-4 text-gray-700">
              We'll do 3 cycles of breathing. Breathe in for 4 seconds, hold for 4, exhale for 4.
            </p>
            <button onClick={startExercise} className="pixel-button bg-[#FFB6D9] text-white px-8 py-3">
              Start Breathing
            </button>
          </div>
        ) : (
          <div className="space-y-2">
            <p className="text-sm text-gray-700">Cycle {cycles + 1} of 3</p>
            <div className="flex gap-2 justify-center">
              {[1, 2, 3].map((i) => (
                <div
                  key={i}
                  className={`w-3 h-3 ${i <= cycles + 1 ? 'bg-green-500' : 'bg-gray-300'} border-2 border-black`}
                />
              ))}
            </div>
          </div>
        )}
      </div>
    </motion.div>
  );
}