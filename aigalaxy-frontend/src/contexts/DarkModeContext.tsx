'use client'

import { createContext, useContext, useState, useEffect } from "react";

interface DarkModeContextProps {
  isDarkMode: boolean;
  toggleDarkMode: () => void;
}

const DarkModeContext = createContext<DarkModeContextProps>({
  isDarkMode: true, // Default to dark mode
  toggleDarkMode: () => {}
});


export const DarkModeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isDarkMode, setIsDarkMode] = useState<boolean>(true); // Always start with dark mode

  // Load theme preference on mount
  useEffect(() => {
    const loadTheme = async () => {
      try {
        const storageModule = await import('../utils/storage');
        const storedTheme = await storageModule.storage.getItem("theme");
        if (storedTheme) {
          setIsDarkMode(storedTheme === "dark");
        } else {
          // No stored preference - default to dark mode
          setIsDarkMode(true);
        }
      } catch (error) {
        console.error("Error loading theme:", error);
        // Default to dark mode on error
        setIsDarkMode(true);
      }
    };
    
    loadTheme();
  }, []);

  // Apply theme to DOM
  useEffect(() => {
    const applyTheme = async () => {
      const root = document.documentElement;
      const body = document.body;

      if (isDarkMode) {
        root.classList.add("dark");
        body.classList.add("dark");
        const storageModule = await import('../utils/storage')
        await storageModule.storage.setItem("theme", "dark")
      } else {
        root.classList.remove("dark");
        body.classList.remove("dark");
        const storageModule = await import('../utils/storage')
        await storageModule.storage.setItem("theme", "light")
      }
    }
    applyTheme()
  }, [isDarkMode]);

  const toggleDarkMode = () => {
    setIsDarkMode((prev) => !prev);
  };

  return (
    <DarkModeContext.Provider value={{ isDarkMode, toggleDarkMode }}>
      {children}
    </DarkModeContext.Provider>
  );
};

export const useDarkMode = () => useContext(DarkModeContext);




