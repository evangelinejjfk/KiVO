/**
 * pages.config.js - Page routing configuration
 * 
 * This file is AUTO-GENERATED. Do not add imports or modify PAGES manually.
 * Pages are auto-registered when you create files in the ./pages/ folder.
 * 
 * THE ONLY EDITABLE VALUE: mainPage
 * This controls which page is the landing page (shown when users visit the app).
 * 
 * Example file structure:
 * 
 *   import HomePage from './pages/HomePage';
 *   import Dashboard from './pages/Dashboard';
 *   import Settings from './pages/Settings';
 *   
 *   export const PAGES = {
 *       "HomePage": HomePage,
 *       "Dashboard": Dashboard,
 *       "Settings": Settings,
 *   }
 *   
 *   export const pagesConfig = {
 *       mainPage: "HomePage",
 *       Pages: PAGES,
 *   };
 * 
 * Example with Layout (wraps all pages):
 *
 *   import Home from './pages/Home';
 *   import Settings from './pages/Settings';
 *   import __Layout from './Layout.jsx';
 *
 *   export const PAGES = {
 *       "Home": Home,
 *       "Settings": Settings,
 *   }
 *
 *   export const pagesConfig = {
 *       mainPage: "Home",
 *       Pages: PAGES,
 *       Layout: __Layout,
 *   };
 *
 * To change the main page from HomePage to Dashboard, use find_replace:
 *   Old: mainPage: "HomePage",
 *   New: mainPage: "Dashboard",
 *
 * The mainPage value must match a key in the PAGES object exactly.
 */
import AIChat from './pages/AIChat';
import Analytics from './pages/Analytics';
import CalendarView from './pages/CalendarView';
import ChatHistory from './pages/ChatHistory';
import ClassChat from './pages/ClassChat';
import Dashboard from './pages/Dashboard';
import Flashcards from './pages/Flashcards';
import ProfileSetup from './pages/ProfileSetup';
import QuickReference from './pages/QuickReference';
import ResourceHub from './pages/ResourceHub';
import Search from './pages/Search';
import SharedCalendar from './pages/SharedCalendar';
import ThemeCustomizer from './pages/ThemeCustomizer';
import __Layout from './Layout.jsx';


export const PAGES = {
    "AIChat": AIChat,
    "Analytics": Analytics,
    "CalendarView": CalendarView,
    "ChatHistory": ChatHistory,
    "ClassChat": ClassChat,
    "Dashboard": Dashboard,
    "Flashcards": Flashcards,
    "ProfileSetup": ProfileSetup,
    "QuickReference": QuickReference,
    "ResourceHub": ResourceHub,
    "Search": Search,
    "SharedCalendar": SharedCalendar,
    "ThemeCustomizer": ThemeCustomizer,
}

export const pagesConfig = {
    mainPage: "Dashboard",
    Pages: PAGES,
    Layout: __Layout,
};