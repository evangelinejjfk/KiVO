import React, { useState } from "react";
import { User } from "@/entities/User";
import { createPageUrl } from "@/utils";
import { UserCheck, GraduationCap } from "lucide-react";

const classes = [
  "6A", "6B", "6C",
  "7A", "7B", "7C", 
  "8A", "8B", "8C",
  "9A", "9B", "9C",
  "10A", "10B", "10C",
  "11A", "11B", "11C",
  "12A", "12B", "12C"
];

export default function ProfileSetup() {
  const [selectedClass, setSelectedClass] = useState("");

  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedClass) {
      alert("Please select your class.");
      return;
    }
    
    setIsSubmitting(true);
    try {
      await User.updateMyUserData({
        class_name: selectedClass,
        account_type: "student",
        profile_completed: true
      });
      window.location.href = createPageUrl("Dashboard");
    } catch (error) {
      console.error("Failed to update profile:", error);
      alert("Failed to save profile. Please try again.");
    }
    setIsSubmitting(false);
  };

  const inputStyle = "w-full p-4 bg-white border-2 border-black rounded-lg focus:outline-none focus:ring-2 focus:ring-[#87CEEB] focus:border-transparent neo-shadow-small text-lg";
  const buttonStyle = "w-full py-4 px-6 bg-[#98FB98] border-2 border-black rounded-lg neo-shadow hover:neo-shadow-small active:shadow-none transform active:translate-x-[2px] active:translate-y-[2px] transition-all duration-150 font-bold text-lg disabled:opacity-50";



  return (
    <div className="min-h-screen bg-[#FDFD96] flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <GraduationCap className="mx-auto h-16 w-16 mb-4" />
          <h1 className="text-4xl font-bold mb-2">Welcome to Kivo!</h1>
          <p className="text-lg text-gray-700">Let's set up your profile</p>
        </div>

        <div className="p-6 bg-white border-4 border-black rounded-xl neo-shadow">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="font-bold block mb-3 text-lg">
                My class:
              </label>
              <select
                value={selectedClass}
                onChange={(e) => setSelectedClass(e.target.value)}
                className={inputStyle}
                required
              >
                <option value="">Select a class</option>
                {classes.map((className) => (
                  <option key={className} value={className}>
                    Class {className}
                  </option>
                ))}
              </select>
            </div>

            <button type="submit" className={buttonStyle} disabled={isSubmitting}>
              <UserCheck className="w-6 h-6 inline mr-2" />
              {isSubmitting ? "Setting up..." : "Complete Setup"}
            </button>
          </form>
        </div>

      </div>
    </div>
  );
}