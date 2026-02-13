import React, { useState, useEffect, useCallback } from "react";
import { useLocation } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { Calendar, MessageCircle, LogOut, Upload, Brain, Bot, History, Users, TrendingUp, Search as SearchIcon, FileText, ChevronsLeft, ChevronsRight, LayoutDashboard, Book, Camera } from "lucide-react";
import { base44 } from "@/api/base44Client";
import NavItem from './components/NavItem.js';
import FloatingAddButton from "./components/FloatingAddButton";

const navItems = [
  { name: "Dashboard", href: createPageUrl("Dashboard"), icon: LayoutDashboard },
  { 
    name: "Calendar", 
    icon: Calendar,
    subItems: [
      { name: "Shared Calendar", href: createPageUrl("SharedCalendar"), icon: Users },
      { name: "Personal Calendar", href: createPageUrl("CalendarView"), icon: Calendar }
    ]
  },
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
    name: "Communication", 
    icon: MessageCircle,
    subItems: [
      { name: "Class Chat", href: createPageUrl("ClassChat"), icon: MessageCircle },
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
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap');
        
        * {
          font-family: 'Inter', sans-serif;
        }
      `}</style>
      <div className="min-h-screen flex flex-col md:flex-row bg-slate-50">
        <aside 
          className={`bg-white border-r border-slate-200 flex flex-col transition-all duration-300 ${isSidebarCollapsed ? 'md:w-20' : 'md:w-72'} w-full shadow-sm`}
        >
          <header className={`p-6 border-b border-slate-200 transition-all ${isSidebarCollapsed ? 'p-4' : ''}`}>
            <div className="flex items-center justify-between mb-3">
              {!isSidebarCollapsed && (
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-blue-700 rounded-xl flex items-center justify-center shadow-md">
                    <span className="text-white font-bold text-xl">K</span>
                  </div>
                  <div>
                    <h1 className="text-xl font-bold text-slate-800">Kivo</h1>
                    <p className="text-xs text-slate-500">Student Hub</p>
                  </div>
                </div>
              )}
              <button
                onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
                className="p-2 rounded-lg hover:bg-slate-100 transition-colors hidden md:block text-slate-600"
              >
                {isSidebarCollapsed ? <ChevronsRight className="w-5 h-5" /> : <ChevronsLeft className="w-5 h-5" />}
              </button>
            </div>
            
            {user && !isSidebarCollapsed && (
              <div className="flex items-center gap-3 p-3 bg-gradient-to-r from-blue-50 to-amber-50 rounded-xl border border-slate-200">
                {user.profile_picture ? (
                  <img src={user.profile_picture} alt="Profile" className="w-10 h-10 rounded-full object-cover border-2 border-blue-600" />
                ) : (
                  <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-blue-700 rounded-full flex items-center justify-center text-white font-bold">
                    {user.username?.[0]?.toUpperCase() || user.full_name?.[0]?.toUpperCase() || 'U'}
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-sm text-slate-800 truncate">{user.username || user.full_name}</p>
                  <p className="text-xs text-slate-600">Class {user.class_name}</p>
                </div>
              </div>
            )}
          </header>

          <nav className="flex-grow p-4 space-y-1 overflow-y-auto">
            {navItems.map((item) => (
              <NavItem key={item.name} item={item} isSidebarCollapsed={isSidebarCollapsed} />
            ))}
          </nav>
          
          <div className={`p-4 border-t border-slate-200 ${isSidebarCollapsed ? 'flex flex-col items-center' : ''}`}>
            <button 
              onClick={handleLogout} 
              className="flex items-center justify-center gap-3 py-3 px-4 rounded-xl w-full bg-red-50 hover:bg-red-100 text-red-600 font-semibold transition-colors"
              title={isSidebarCollapsed ? "Log Out" : ''}
            >
              <LogOut className="w-5 h-5" />
              {!isSidebarCollapsed && <span>Log Out</span>}
            </button>
          </div>
        </aside>

        <main className="flex-1 p-4 md:p-8 overflow-auto bg-slate-50">
          {children}
        </main>
        
        <FloatingAddButton />
      </div>
    </>
  );
}