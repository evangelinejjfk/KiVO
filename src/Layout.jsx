import React, { useState, useEffect, useCallback } from "react";
import { useLocation } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { Calendar, LogOut, Upload, Brain, Bot, History, TrendingUp, Search as SearchIcon, FileText, ChevronsLeft, ChevronsRight, LayoutDashboard, Book, Camera, DollarSign } from "lucide-react";
import { base44 } from "@/api/base44Client";
import NavItem from './components/NavItem';
import FloatingAddButton from "./components/FloatingAddButton";

const navItems = [
  { name: "Dashboard", href: createPageUrl("Dashboard"), icon: LayoutDashboard },
  { name: "Calendar", href: createPageUrl("CalendarView"), icon: Calendar },
  { name: "MoneyFlow", href: createPageUrl("MoneyFlow"), icon: DollarSign },
  { 
    name: "Study Tools", 
    icon: Book,
    subItems: [
      { name: "Flashcards", href: createPageUrl("Flashcards"), icon: Brain },
      { name: "Quick Reference", href: createPageUrl("QuickReference"), icon: FileText },
      { name: "Resource Hub", href: createPageUrl("ResourceHub"), icon: Upload },
    ]
  },
  { 
    name: "AI Helper", 
    icon: Bot,
    subItems: [
      { name: "AI Study Buddy", href: createPageUrl("AIChat"), icon: Bot },
      { name: "Chat History", href: createPageUrl("ChatHistory"), icon: History },
    ]
  },
  { name: "Search", href: createPageUrl("Search"), icon: SearchIcon },
  { name: "Analytics", href: createPageUrl("Analytics"), icon: TrendingUp },
  { name: "Scrapbook", href: createPageUrl("Scrapbook"), icon: Camera },
];

export default function Layout({ children, currentPageName }) {
  const location = useLocation();
  const [user, setUser] = useState(null);
  const [isCheckingProfile, setIsCheckingProfile] = useState(true);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);

  const checkUserProfile = useCallback(async () => {
    try {
      const currentUser = await base44.auth.me();
      setUser(currentUser);
      
      if (!currentUser.profile_completed && !location.pathname.includes('ProfileSetup')) {
        window.location.href = createPageUrl("ProfileSetup");
        return;
      }
    } catch (error) {
       if (!location.pathname.includes('ProfileSetup')) {
          window.location.href = createPageUrl("ProfileSetup");
       }
    }
    setIsCheckingProfile(false);
  }, [location.pathname]);

  useEffect(() => {
    checkUserProfile();
  }, [checkUserProfile]);

  const handleLogout = async () => {
    await base44.auth.logout();
    window.location.reload();
  };

  if (isCheckingProfile) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-600 border-t-transparent"></div>
      </div>
    );
  }

  return (
    <>
      <div className="min-h-screen flex flex-col md:flex-row bg-pixel-bg">
        <aside 
          className={`pixel-card border-r-4 border-black bg-white flex flex-col transition-all duration-300 ${isSidebarCollapsed ? 'md:w-20' : 'md:w-72'} w-full`}
        >
          <header className={`p-6 border-b-4 border-black transition-all ${isSidebarCollapsed ? 'p-4' : ''}`}>
            <div className="flex items-center justify-between mb-3">
              {!isSidebarCollapsed && (
                <div className="flex items-center gap-3">
                  <div className="pixel-icon-sm bg-[#FF6B9D] w-10 h-10">
                    <span className="text-white font-bold text-xl">K</span>
                  </div>
                  <div>
                    <h1 className="text-xl font-bold text-black pixel-text">Kivo</h1>
                    <p className="text-xs text-gray-600">Student Hub</p>
                  </div>
                </div>
              )}
              <button
                onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
                className="p-2 pixel-button hidden md:block bg-gray-100 hover:bg-gray-200"
              >
                {isSidebarCollapsed ? <ChevronsRight className="w-5 h-5 text-black" /> : <ChevronsLeft className="w-5 h-5 text-black" />}
              </button>
            </div>
            
            {user && !isSidebarCollapsed && (
              <div className="flex items-center gap-3 p-3 pixel-card bg-[#FFD93D]">
                {user.profile_picture ? (
                  <img src={user.profile_picture} alt="Profile" className="w-10 h-10 pixel-border-white object-cover" />
                ) : (
                  <div className="w-10 h-10 pixel-icon-sm bg-[#FF6B9D] text-white">
                    {user.username?.[0]?.toUpperCase() || user.full_name?.[0]?.toUpperCase() || 'U'}
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <p className="font-bold text-sm text-black truncate">{user.username || user.full_name}</p>
                  <p className="text-xs text-gray-800">Level {user.level || 1} 🎮</p>
                </div>
              </div>
            )}
          </header>

          <nav className="flex-grow p-4 space-y-1 overflow-y-auto">
            {navItems.map((item) => (
              <NavItem key={item.name} item={item} isSidebarCollapsed={isSidebarCollapsed} />
            ))}
          </nav>
          
          <div className={`p-4 border-t-4 border-black ${isSidebarCollapsed ? 'flex flex-col items-center' : ''}`}>
            <button 
              onClick={handleLogout} 
              className="pixel-button bg-[#FF6B6B] text-white w-full py-3 px-4 flex items-center justify-center gap-3"
              title={isSidebarCollapsed ? "Log Out" : ''}
            >
              <LogOut className="w-5 h-5" />
              {!isSidebarCollapsed && <span>Log Out</span>}
            </button>
          </div>
        </aside>

        <main className="flex-1 p-4 md:p-8 overflow-auto bg-pixel-bg">
          {children}
        </main>
        
        <FloatingAddButton />
      </div>
    </>
  );
}