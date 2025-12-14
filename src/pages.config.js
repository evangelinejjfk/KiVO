import Dashboard from './pages/Dashboard';
import CalendarView from './pages/CalendarView';
import ProfileSetup from './pages/ProfileSetup';
import ClassChat from './pages/ClassChat';
import ResourceHub from './pages/ResourceHub';
import Flashcards from './pages/Flashcards';
import AIChat from './pages/AIChat';
import ChatHistory from './pages/ChatHistory';
import SharedCalendar from './pages/SharedCalendar';
import Analytics from './pages/Analytics';
import Search from './pages/Search';
import QuickReference from './pages/QuickReference';
import ThemeCustomizer from './pages/ThemeCustomizer';
import __Layout from './Layout.jsx';


export const PAGES = {
    "Dashboard": Dashboard,
    "CalendarView": CalendarView,
    "ProfileSetup": ProfileSetup,
    "ClassChat": ClassChat,
    "ResourceHub": ResourceHub,
    "Flashcards": Flashcards,
    "AIChat": AIChat,
    "ChatHistory": ChatHistory,
    "SharedCalendar": SharedCalendar,
    "Analytics": Analytics,
    "Search": Search,
    "QuickReference": QuickReference,
    "ThemeCustomizer": ThemeCustomizer,
}

export const pagesConfig = {
    mainPage: "Dashboard",
    Pages: PAGES,
    Layout: __Layout,
};