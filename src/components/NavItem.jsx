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

  const hasActiveSubItem = item.subItems?.some(subItem => isActive(subItem.href));

  if (item.subItems) {
    return (
      <div>
        <button
          onClick={() => setIsOpen(!isOpen)}
          className={`flex items-center justify-between w-full py-2.5 px-3 pixel-button transition-all ${
            item.color || 'bg-white'
          } ${
            hasActiveSubItem ? 'text-[#9B4D96] font-bold' : 'text-gray-800 hover:bg-opacity-80'
          } ${isSidebarCollapsed ? 'justify-center px-2' : ''}`}
          aria-expanded={isOpen}
          aria-label={`${item.name} menu`}
        >
          <div className="flex items-center gap-3">
            <item.icon className="w-5 h-5" />
            {!isSidebarCollapsed && <span className="font-bold">{item.name}</span>}
          </div>
          {!isSidebarCollapsed && (
            <motion.div
              animate={{ rotate: isOpen ? 180 : 0 }}
              transition={{ duration: 0.2 }}
            >
              <ChevronDown className="w-4 h-4" />
            </motion.div>
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
                  className={`flex items-center gap-3 py-2 px-3 pixel-item transition-all text-sm ${
                    isActive(subItem.href)
                      ? 'bg-white text-[#9B4D96] font-bold'
                      : 'bg-white bg-opacity-50 hover:bg-opacity-80 text-gray-700 font-bold'
                  }`}
                  aria-current={isActive(subItem.href) ? "page" : undefined}
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
      className={`flex items-center gap-3 py-2.5 px-3 pixel-button transition-all ${
        item.color || 'bg-white'
      } ${
        isActive(item.href) 
          ? 'text-[#9B4D96] font-bold' 
          : 'text-gray-800 hover:bg-opacity-80'
      } ${isSidebarCollapsed ? 'justify-center px-2' : ''}`}
      title={isSidebarCollapsed ? item.name : ''}
      aria-current={isActive(item.href) ? "page" : undefined}
    >
      <item.icon className="w-5 h-5" />
      {!isSidebarCollapsed && <span className="font-bold">{item.name}</span>}
    </Link>
  );
}