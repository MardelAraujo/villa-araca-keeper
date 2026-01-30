import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

export interface ThemeColors {
  sidebarBackground: string;
  sidebarForeground: string;
  accentColor: string;
}

interface ThemeContextType {
  themeColors: ThemeColors;
  setThemeColors: (colors: ThemeColors) => void;
  resetToDefaults: () => void;
}

const defaultTheme: ThemeColors = {
  sidebarBackground: '152 30% 25%', // Dark green
  sidebarForeground: '40 30% 95%', // Light cream
  accentColor: '353 44% 81%', // Salmon/pink
};

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

interface ThemeProviderProps {
  children: ReactNode;
}

export function ThemeProvider({ children }: ThemeProviderProps) {
  const [themeColors, setThemeColors] = useState<ThemeColors>(() => {
    const saved = localStorage.getItem('villa-araca-theme');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {
        return defaultTheme;
      }
    }
    return defaultTheme;
  });

  useEffect(() => {
    localStorage.setItem('villa-araca-theme', JSON.stringify(themeColors));
    
    // Apply CSS variables to document root
    const root = document.documentElement;
    root.style.setProperty('--sidebar-background', themeColors.sidebarBackground);
    root.style.setProperty('--sidebar-foreground', themeColors.sidebarForeground);
    root.style.setProperty('--sidebar', themeColors.sidebarBackground);
    root.style.setProperty('--sidebar-primary', themeColors.accentColor);
    root.style.setProperty('--primary', themeColors.accentColor);
    root.style.setProperty('--ring', themeColors.accentColor);
    root.style.setProperty('--sidebar-ring', themeColors.accentColor);
  }, [themeColors]);

  const resetToDefaults = () => {
    setThemeColors(defaultTheme);
  };

  return (
    <ThemeContext.Provider value={{ themeColors, setThemeColors, resetToDefaults }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
}

export { defaultTheme };
