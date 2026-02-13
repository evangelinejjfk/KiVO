import React, { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { ChevronDown, ChevronRight } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function NavItem({ item, isSidebarCollapsed }) {
  const [isOpen, setIsOpen] = useState(false);
  const location = useLocation();

  const isActive = (href) => {
    return location.pathname === new URL(href, window.location.origin).pathname;
  };

  if (item.subItems) {
    return (
      <div>
        <button
          onClick={() => setIsOpen(!isOpen)}
          className={`flex items-center justify-between w-full py-2.5 px-3 rounded-lg hover:bg-slate-100 transition-colors text-slate-700 ${
            isSidebarCollapsed ? 'justify-center px-2' : ''
          }`}
        >
          <div className="flex items-center gap-3">
            <item.icon className="w-5 h-5" />
            {!isSidebarCollapsed && <span className="font-medium">{item.name}</span>}
          </div>
          {!isSidebarCollapsed && (
            isOpen ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />
          )}
        </button>

        <AnimatePresence>
          {isOpen && !isSidebarCollapsed && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="overflow-hidden ml-4 mt-1 space-y-1"
            >
              {item.subItems.map((subItem) => (
                <Link
                  key={subItem.name}
                  to={subItem.href}
                  className={`flex items-center gap-3 py-2 px-3 rounded-lg transition-all text-sm ${
                    isActive(subItem.href)
                      ? 'bg-blue-50 text-blue-700 font-semibold'
                      : 'text-slate-600 hover:bg-slate-100'
                  }`}
                >
                  <subItem.icon className="w-4 h-4" />
                  <span>{subItem.name}</span>
                </Link>
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    );
  }

  return (
    <Link
      to={item.href}
      className={`flex items-center gap-3 py-2.5 px-3 rounded-lg transition-all ${
        isActive(item.href) 
          ? 'bg-gradient-to-r from-blue-600 to-blue-700 text-white font-semibold shadow-md' 
          : 'text-slate-700 hover:bg-slate-100'
      } ${isSidebarCollapsed ? 'justify-center px-2' : ''}`}
      title={isSidebarCollapsed ? item.name : ''}
    >
      <item.icon className="w-5 h-5" />
      {!isSidebarCollapsed && <span className="font-medium">{item.name}</span>}
    </Link>
  );
}