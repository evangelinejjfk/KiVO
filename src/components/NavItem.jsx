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
          className={`flex items-center justify-between w-full py-2.5 px-3 pixel-button bg-white hover:bg-[#FFF4C9] text-gray-800 ${
            isSidebarCollapsed ? 'justify-center px-2' : ''
          }`}
        >
          <div className="flex items-center gap-3">
            <item.icon className="w-5 h-5" />
            {!isSidebarCollapsed && <span className="font-bold">{item.name}</span>}
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
                  className={`flex items-center gap-3 py-2 px-3 pixel-item transition-all text-sm ${
                    isActive(subItem.href)
                      ? 'bg-[#B8E8D4] text-gray-800 font-bold'
                      : 'bg-white hover:bg-[#FFF4C9] text-gray-700 font-bold'
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
      className={`flex items-center gap-3 py-2.5 px-3 pixel-button transition-all ${
        isActive(item.href) 
          ? 'bg-[#B8E8D4] text-gray-800 font-bold' 
          : 'bg-white hover:bg-[#FFF4C9] text-gray-800'
      } ${isSidebarCollapsed ? 'justify-center px-2' : ''}`}
      title={isSidebarCollapsed ? item.name : ''}
    >
      <item.icon className="w-5 h-5" />
      {!isSidebarCollapsed && <span className="font-bold">{item.name}</span>}
    </Link>
  );
}