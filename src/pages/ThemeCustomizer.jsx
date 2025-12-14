import React, { useState, useEffect } from "react";
import { User } from "@/entities/User";
import { Palette, Eye, RotateCcw } from "lucide-react";
import { motion } from "framer-motion";

export default function ThemeCustomizer() {
  const [user, setUser] = useState(null);
  const [previewMode, setPreviewMode] = useState(false);
  const [tempSettings, setTempSettings] = useState({
    theme_preference: "fun",
    accent_color: "#98FB98",
    background_color: "#FDFD96",
    font_family: "space-grotesk",
    dark_mode: false
  });

  const themes = [
    { id: "minimal", name: "Minimal", bg: "#F8F9FA", accent: "#6C757D" },
    { id: "academic", name: "Academic", bg: "#FFFFFF", accent: "#0D6EFD" },
    { id: "fun", name: "Fun", bg: "#FDFD96", accent: "#98FB98" },
    { id: "chill", name: "Chill", bg: "#E6F3FF", accent: "#87CEEB" }
  ];

  const accentColors = [
    "#98FB98", "#87CEEB", "#DDA0DD", "#FFB6C1", 
    "#F0E68C", "#FFA07A", "#98D8E8", "#F5DEB3"
  ];

  const backgroundColors = [
    "#FDFD96", "#F0F8FF", "#FFF8DC", "#E6F3FF",
    "#F5F5DC", "#FFEFD5", "#E0FFFF", "#F0FFF0"
  ];

  const fonts = [
    { id: "space-grotesk", name: "Space Grotesk", family: "'Space Grotesk', sans-serif" },
    { id: "inter", name: "Inter", family: "'Inter', sans-serif" },
    { id: "poppins", name: "Poppins", family: "'Poppins', sans-serif" },
    { id: "roboto", name: "Roboto", family: "'Roboto', sans-serif" }
  ];

  useEffect(() => {
    loadUser();
  }, []);

  const loadUser = async () => {
    try {
      const currentUser = await User.me();
      setUser(currentUser);
      setTempSettings({
        theme_preference: currentUser.theme_preference || "fun",
        accent_color: currentUser.accent_color || "#98FB98",
        background_color: currentUser.background_color || "#FDFD96",
        font_family: currentUser.font_family || "space-grotesk",
        dark_mode: currentUser.dark_mode || false
      });
    } catch (error) {
      console.error("Failed to load user:", error);
    }
  };

  const handleThemeSelect = (theme) => {
    setTempSettings({
      ...tempSettings,
      theme_preference: theme.id,
      background_color: theme.bg,
      accent_color: theme.accent
    });
  };

  const handleSaveSettings = async () => {
    try {
      await User.updateMyUserData(tempSettings);
      alert("Theme saved successfully! Refresh the page to see changes.");
    } catch (error) {
      console.error("Failed to save theme:", error);
      alert("Failed to save theme. Please try again.");
    }
  };

  const handleReset = () => {
    setTempSettings({
      theme_preference: "fun",
      accent_color: "#98FB98",
      background_color: "#FDFD96",
      font_family: "space-grotesk",
      dark_mode: false
    });
  };

  const inputStyle = "w-full p-3 bg-white border-2 border-black rounded-lg focus:outline-none focus:ring-2 focus:ring-[#87CEEB] focus:border-transparent neo-shadow-small";
  const buttonStyle = "py-3 px-6 border-2 border-black rounded-lg neo-shadow hover:neo-shadow-small active:shadow-none transform active:translate-x-[2px] active:translate-y-[2px] transition-all duration-150 font-bold";

  return (
    <div className="space-y-8">
      <div className="text-center">
        <Palette className="mx-auto h-16 w-16 mb-4" />
        <h1 className="text-4xl font-bold">Customize Your Theme</h1>
        <p className="text-lg text-gray-700 mt-2">
          Make StudyBuddy truly yours with custom colors, fonts, and styles
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Theme Settings */}
        <div className="space-y-6">
          <div className="p-6 bg-white border-4 border-black rounded-xl neo-shadow">
            <h3 className="text-2xl font-bold mb-4">Theme Styles</h3>
            <div className="grid grid-cols-2 gap-4">
              {themes.map((theme) => (
                <button
                  key={theme.id}
                  onClick={() => handleThemeSelect(theme)}
                  className={`p-4 border-2 rounded-lg transition-all ${
                    tempSettings.theme_preference === theme.id
                      ? 'border-black neo-shadow'
                      : 'border-gray-300 hover:border-black'
                  }`}
                  style={{ backgroundColor: theme.bg }}
                >
                  <div className="text-center">
                    <div
                      className="w-8 h-8 rounded-full mx-auto mb-2 border-2 border-black"
                      style={{ backgroundColor: theme.accent }}
                    />
                    <span className="font-bold">{theme.name}</span>
                  </div>
                </button>
              ))}
            </div>
          </div>

          <div className="p-6 bg-white border-4 border-black rounded-xl neo-shadow">
            <h3 className="text-2xl font-bold mb-4">Colors</h3>
            
            <div className="space-y-4">
              <div>
                <label className="font-bold block mb-2">Accent Color</label>
                <div className="flex gap-2 flex-wrap">
                  {accentColors.map(color => (
                    <button
                      key={color}
                      onClick={() => setTempSettings({ ...tempSettings, accent_color: color })}
                      className={`w-10 h-10 rounded-full border-2 ${
                        tempSettings.accent_color === color ? 'border-black' : 'border-gray-300'
                      }`}
                      style={{ backgroundColor: color }}
                    />
                  ))}
                </div>
              </div>

              <div>
                <label className="font-bold block mb-2">Background Color</label>
                <div className="flex gap-2 flex-wrap">
                  {backgroundColors.map(color => (
                    <button
                      key={color}
                      onClick={() => setTempSettings({ ...tempSettings, background_color: color })}
                      className={`w-10 h-10 rounded-full border-2 ${
                        tempSettings.background_color === color ? 'border-black' : 'border-gray-300'
                      }`}
                      style={{ backgroundColor: color }}
                    />
                  ))}
                </div>
              </div>
            </div>
          </div>

          <div className="p-6 bg-white border-4 border-black rounded-xl neo-shadow">
            <h3 className="text-2xl font-bold mb-4">Typography</h3>
            <select
              value={tempSettings.font_family}
              onChange={(e) => setTempSettings({ ...tempSettings, font_family: e.target.value })}
              className={inputStyle}
            >
              {fonts.map(font => (
                <option key={font.id} value={font.id} style={{ fontFamily: font.family }}>
                  {font.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Preview */}
        <div className="space-y-6">
          <div className="p-6 bg-white border-4 border-black rounded-xl neo-shadow">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-2xl font-bold">Preview</h3>
              <button
                onClick={() => setPreviewMode(!previewMode)}
                className={`${buttonStyle} bg-blue-200 flex items-center gap-2`}
              >
                <Eye className="w-4 h-4" />
                {previewMode ? "Exit Preview" : "Live Preview"}
              </button>
            </div>

            <motion.div
              className="p-4 border-2 border-black rounded-lg min-h-48"
              style={{
                backgroundColor: tempSettings.background_color,
                fontFamily: fonts.find(f => f.id === tempSettings.font_family)?.family
              }}
            >
              <div className="space-y-4">
                <h4 className="text-xl font-bold">Sample Page Content</h4>
                <button
                  className="py-2 px-4 border-2 border-black rounded-lg neo-shadow-small"
                  style={{ backgroundColor: tempSettings.accent_color }}
                >
                  Sample Button
                </button>
                <div className="p-3 bg-white border-2 border-black rounded-lg">
                  <p className="font-semibold">Card Example</p>
                  <p className="text-sm text-gray-600">This is how cards will look with your theme.</p>
                </div>
                <p className="text-sm">
                  Font: {fonts.find(f => f.id === tempSettings.font_family)?.name}
                </p>
              </div>
            </motion.div>
          </div>

          <div className="flex gap-4">
            <button
              onClick={handleReset}
              className={`${buttonStyle} bg-gray-300 flex items-center gap-2`}
            >
              <RotateCcw className="w-4 h-4" />
              Reset to Default
            </button>
            <button
              onClick={handleSaveSettings}
              className={`${buttonStyle} bg-green-300 flex-1`}
            >
              Save Theme
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}