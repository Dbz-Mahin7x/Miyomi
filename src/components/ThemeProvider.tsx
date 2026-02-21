import { createContext, useContext, useEffect, useState, type PropsWithChildren } from 'react';
import { isSeasonalActive, SEASONAL_CONFIG } from '../config/seasonal';

type Theme = 'light' | 'dark';

interface ThemeContextType {
  theme: Theme;
  toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children }: PropsWithChildren<Record<string, never>>) {
  const [theme, setTheme] = useState<Theme>('light');
  const [mounted, setMounted] = useState(false);

  const applyTheme = (nextTheme: Theme) => {
    const root = document.documentElement;
    root.classList.remove('light', 'dark');
    root.classList.add(nextTheme);

    // Add plugin logic
    if (isSeasonalActive()) {
      root.classList.add(SEASONAL_CONFIG.themeName);
    } else {
      root.classList.remove(SEASONAL_CONFIG.themeName);
    }
  };

  useEffect(() => {
    // Get initial theme from localStorage or system preference
    const storedTheme = localStorage.getItem('theme') as Theme;
    const systemTheme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
    const initialTheme = storedTheme || systemTheme;

    setTheme(initialTheme);
    applyTheme(initialTheme);
    setMounted(true);
  }, []);

  const toggleTheme = () => {
    const newTheme = theme === 'light' ? 'dark' : 'light';
    setTheme(newTheme);
    localStorage.setItem('theme', newTheme);
    applyTheme(newTheme);
  };

  // Prevent flash of wrong theme
  if (!mounted) {
    return null;
  }

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within ThemeProvider');
  }
  return context;
}
