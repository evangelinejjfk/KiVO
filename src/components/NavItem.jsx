import React, { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown } from "lucide-react";

export default function NavItem({ item, isSidebarCollapsed }) {
  const location = useLocation();
  const hasSubItems = item.subItems && item.subItems.length > 0;
  const [isOpen, setIsOpen] = useState(
    hasSubItems && item.subItems.some(sub => location.pathname === sub.href)
  );

  const isActive = hasSubItems 
    ? isOpen 
    : location.pathname === item.href;

  const neoBrutalistButtonStyle = `flex items-center justify-between w-full gap-2 py-3 px-4 border-2 border-black rounded-lg transition-all duration-150 font-semibold text-sm ${isSidebarCollapsed ? 'justify-center' : 'justify-start'}`;

  const buttonStyle = { 
    backgroundColor: isActive ? 'var(--accent-green)' : 'var(--bg-card)',
    borderColor: 'var(--border-color)',
    color: 'var(--text-primary)',
    boxShadow: isActive ? '2px 2px 0px var(--border-color)' : '4px 4px 0px var(--border-color)',
  };
  
  const hoverStyle = {
    boxShadow: '2px 2px 0px var(--border-color)',
  };

  const activeStyle = {
    boxShadow: '0px 0px 0px var(--border-color)',
    transform: 'translate(2px, 2px)',
  };

  if (hasSubItems) {
    return (
      <div>
        <button
          onClick={() => setIsOpen(!isOpen)}
          className={neoBrutalistButtonStyle}
          style={buttonStyle}
        >
          <div className="flex items-center gap-2">
            <item.icon className="w-5 h-5 flex-shrink-0" />
            {!isSidebarCollapsed && <span>{item.name}</span>}
          </div>
          {!isSidebarCollapsed && (
            <ChevronDown className={`w-4 h-4 transition-transform ${isOpen ? "rotate-180" : ""}`} />
          )}
        </button>
        <AnimatePresence>
          {isOpen && !isSidebarCollapsed && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="pl-4 mt-2 space-y-2 border-l-2 border-dashed"
              style={{ borderColor: 'var(--border-color)'}}
            >
              {item.subItems.map((subItem) => (
                <Link key={subItem.name} to={subItem.href}>
                  <div
                    className={`flex items-center gap-2 py-2 px-3 rounded-md font-medium text-sm transition-colors ${
                      location.pathname === subItem.href
                        ? 'bg-[var(--accent-green)]'
                        : 'hover:bg-[var(--bg-card)]'
                    }`}
                  >
                    <subItem.icon className="w-4 h-4" />
                    <span>{subItem.name}</span>
                  </div>
                </Link>
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    );
  }

  return (
    <Link to={item.href}>
      <button
        className={neoBrutalistButtonStyle}
        style={buttonStyle}
        title={isSidebarCollapsed ? item.name : ''}
      >
        <div className="flex items-center gap-2">
          <item.icon className="w-5 h-5 flex-shrink-0" />
          {!isSidebarCollapsed && <span>{item.name}</span>}
        </div>
      </button>
    </Link>
  );
}