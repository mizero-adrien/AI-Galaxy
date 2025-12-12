import { useState, useEffect } from 'react';
import { storage } from '../utils/storage';

const SIDEBAR_WIDTH_KEY = 'sidebar-width';
const SIDEBAR_OPEN_KEY = 'sidebar-open';

export const useSidebar = () => {
  const [sidebarOpen, setSidebarOpen] = useState<boolean>(false);
  const [sidebarWidth, setSidebarWidth] = useState<number>(192);

  // Load preferences from localStorage
  useEffect(() => {
    const loadPreferences = async () => {
      const savedWidth = await storage.getItem(SIDEBAR_WIDTH_KEY);
      const savedOpen = await storage.getItem(SIDEBAR_OPEN_KEY);
      
      if (savedWidth) {
        setSidebarWidth(parseInt(savedWidth, 10));
      }
      
      // Only load open state for desktop (md+), mobile always starts closed
      if (typeof window !== 'undefined') {
        const isDesktop = window.innerWidth >= 768; // md breakpoint
        if (isDesktop && savedOpen) {
          setSidebarOpen(savedOpen === 'true');
        }
      }
    };
    
    loadPreferences();
  }, []);

  // Save width preference
  const handleWidthChange = async (width: number) => {
    setSidebarWidth(width);
    await storage.setItem(SIDEBAR_WIDTH_KEY, width.toString());
  };

  // Save open state preference (only for desktop)
  const handleToggle = async () => {
    const newState = !sidebarOpen;
    setSidebarOpen(newState);
    
    if (typeof window !== 'undefined') {
      const isDesktop = window.innerWidth >= 768;
      if (isDesktop) {
        await storage.setItem(SIDEBAR_OPEN_KEY, newState.toString());
      }
    }
  };

  return {
    sidebarOpen,
    sidebarWidth,
    setSidebarOpen: handleToggle,
    setSidebarWidth: handleWidthChange,
  };
};



