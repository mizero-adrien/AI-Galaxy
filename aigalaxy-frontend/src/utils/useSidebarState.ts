import { useState, useEffect } from 'react';
import { storage } from './storage';

export const useSidebarState = () => {
  const [sidebarOpen, setSidebarOpen] = useState<boolean>(false);
  const [sidebarWidth, setSidebarWidth] = useState<number>(192);

  // Load preferences from localStorage
  useEffect(() => {
    const loadPreferences = async () => {
      if (typeof window === 'undefined') return;
      
      const savedWidth = await storage.getItem('sidebar-width');
      const savedOpen = await storage.getItem('sidebar-open');
      
      if (savedWidth) {
        setSidebarWidth(parseInt(savedWidth, 10));
      }
      
      // Only load open state for desktop (md+), mobile always starts closed
      const isDesktop = window.innerWidth >= 768;
      if (isDesktop && savedOpen === 'true') {
        setSidebarOpen(true);
      }
    };
    
    loadPreferences();
  }, []);

  // Save width preference
  const handleWidthChange = async (width: number) => {
    setSidebarWidth(width);
    await storage.setItem('sidebar-width', width.toString());
  };

  // Save open state preference (only for desktop)
  const handleToggle = async () => {
    const newState = !sidebarOpen;
    setSidebarOpen(newState);
    
    if (typeof window !== 'undefined') {
      const isDesktop = window.innerWidth >= 768;
      if (isDesktop) {
        await storage.setItem('sidebar-open', newState.toString());
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



