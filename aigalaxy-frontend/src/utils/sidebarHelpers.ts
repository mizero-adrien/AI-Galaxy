import { useState, useEffect } from 'react';
import { storage } from './storage';

/**
 * Hook for managing responsive sidebar state across all pages
 */
export const useSidebarState = () => {
  const [sidebarOpen, setSidebarOpen] = useState<boolean>(false);
  const [sidebarWidth, setSidebarWidth] = useState<number>(192);

  // Load sidebar preferences
  useEffect(() => {
    const loadPreferences = async () => {
      if (typeof window === 'undefined') return;
      try {
        const savedWidth = await storage.getItem('sidebar-width');
        const savedOpen = await storage.getItem('sidebar-open');
        
        if (savedWidth) {
          setSidebarWidth(parseInt(savedWidth, 10));
        }
        
        if (savedOpen === 'true') {
          setSidebarOpen(true);
        }
      } catch (error) {
        console.error('Error loading sidebar preferences:', error);
      }
    };
    
    loadPreferences();
  }, []);

  // Save width preference
  const handleWidthChange = async (width: number) => {
    setSidebarWidth(width);
    if (typeof window !== 'undefined') {
      try {
        await storage.setItem('sidebar-width', width.toString());
      } catch (error) {
        console.error('Error saving sidebar width:', error);
      }
    }
  };

  // Save open state preference
  const handleToggle = async () => {
    const newState = !sidebarOpen;
    setSidebarOpen(newState);
    if (typeof window !== 'undefined') {
      try {
        await storage.setItem('sidebar-open', newState.toString());
      } catch (error) {
        console.error('Error saving sidebar state:', error);
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



