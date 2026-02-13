import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { createPageUrl } from "@/utils";
import { Upload, Sparkles, User as UserIcon } from "lucide-react";
import { motion } from "framer-motion";

export default function ProfileSetup() {
  const [username, setUsername] = useState("");
  const [profilePicture, setProfilePicture] = useState(null);
  const [profilePictureUrl, setProfilePictureUrl] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isUploading, setIsUploading] = useState(false);

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setIsUploading(true);
    try {
      const { file_url } = await base44.integrations.Core.UploadFile({ file });
      setProfilePictureUrl(file_url);
      setProfilePicture(file);
    } catch (error) {
      console.error("Failed to upload image:", error);
      alert("Failed to upload image. Please try again.");
    }
    setIsUploading(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!username.trim()) {
      alert("Please enter a username!");
      return;
    }

    setIsSubmitting(true);
    try {
      await base44.auth.updateMe({
        username: username.trim(),
        profile_picture: profilePictureUrl || null,
        profile_completed: true,
        level: 1,
        xp: 0
      });
      window.location.href = createPageUrl("Dashboard");
    } catch (error) {
      console.error("Failed to update profile:", error);
      alert("Failed to save profile. Please try again.");
    }
    setIsSubmitting(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#FF6B9D] via-[#C147E9] to-[#8B5CF6] flex items-center justify-center p-4 relative overflow-hidden">
      {/* Pixel background effects */}
      <div className="absolute inset-0 opacity-10">
        <div className="pixel-grid"></div>
      </div>

      <motion.div 
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-md relative z-10"
      >
        {/* Header */}
        <div className="text-center mb-8">
          <motion.div
            initial={{ y: -20 }}
            animate={{ y: 0 }}
            transition={{ type: "spring", stiffness: 300, damping: 24 }}
            className="inline-block mb-4"
          >
            <div className="pixel-icon bg-[#FFD93D] w-24 h-24 mx-auto">
              <Sparkles className="w-12 h-12 text-[#FF6B9D]" />
            </div>
          </motion.div>
          <h1 className="pixel-text text-4xl mb-3 text-white drop-shadow-lg">Welcome to Kivo!</h1>
          <p className="text-xl text-white opacity-90">Let's create your player profile! 🎮</p>
        </div>

        {/* Form Card */}
        <div className="pixel-card bg-white p-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Profile Picture Upload */}
            <div className="text-center">
              <label className="block mb-3 font-bold text-lg">Choose Your Avatar</label>
              <div className="flex justify-center mb-4">
                {profilePictureUrl ? (
                  <div className="relative">
                    <img 
                      src={profilePictureUrl} 
                      alt="Profile" 
                      className="w-32 h-32 pixel-border-white object-cover" 
                    />
                    <button
                      type="button"
                      onClick={() => {
                        setProfilePictureUrl("");
                        setProfilePicture(null);
                      }}
                      className="absolute -top-2 -right-2 pixel-button bg-[#FF6B6B] text-white px-2 py-1 text-xs"
                    >
                      ✕
                    </button>
                  </div>
                ) : (
                  <label className="cursor-pointer">
                    <div className="pixel-icon bg-[#A8E6CF] w-32 h-32 hover:bg-[#8FD4B8] transition-colors">
                      {isUploading ? (
                        <div className="pixel-spinner w-8 h-8"></div>
                      ) : (
                        <Upload className="w-12 h-12 text-black" />
                      )}
                    </div>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageUpload}
                      className="hidden"
                    />
                  </label>
                )}
              </div>
              <p className="text-sm text-gray-600">(Optional - you can skip this!)</p>
            </div>

            {/* Username Input */}
            <div>
              <label className="block mb-3 font-bold text-lg">Choose Your Username</label>
              <div className="relative">
                <UserIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="Enter a cool username..."
                  className="w-full p-4 pl-12 pixel-input text-lg font-bold"
                  required
                  maxLength={20}
                />
              </div>
            </div>

            {/* Submit Button */}
            <motion.button
              type="submit"
              disabled={isSubmitting || isUploading}
              className="pixel-button bg-gradient-to-r from-[#FF6B9D] to-[#C147E9] text-white w-full py-4 text-lg"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              {isSubmitting ? (
                <span className="flex items-center justify-center gap-2">
                  <div className="w-5 h-5 border-3 border-white border-t-transparent rounded-full animate-spin"></div>
                  Setting up...
                </span>
              ) : (
                <span className="flex items-center justify-center gap-2">
                  <Sparkles className="w-5 h-5" />
                  Start My Journey!
                </span>
              )}
            </motion.button>
          </form>
        </div>

        {/* Fun Footer */}
        <motion.p 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="text-center mt-6 text-white text-sm opacity-80"
        >
          Get ready to level up your learning! 🚀
        </motion.p>
      </motion.div>
    </div>
  );
}