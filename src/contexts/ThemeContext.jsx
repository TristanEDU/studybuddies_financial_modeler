import React, { createContext, useContext, useEffect, useState } from 'react';

const ThemeContext = createContext();

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};

export const ThemeProvider = ({ children }) => {
  const [theme, setTheme] = useState('system');
  const [resolvedTheme, setResolvedTheme] = useState('dark');

  // Get system theme preference
  const getSystemTheme = () => {
    if (typeof window !== 'undefined') {
      return window.matchMedia('(prefers-color-scheme: dark)')?.matches ? 'dark' : 'light';
    }
    return 'dark';
  };

  // Apply theme to document with enhanced error handling
  const applyTheme = (themeToApply) => {
    try {
      const root = document.documentElement;
      
      if (themeToApply === 'dark') {
        root.classList?.add('dark');
        root.classList?.remove('light');
      } else {
        root.classList?.add('light');
        root.classList?.remove('dark');
      }
      
      setResolvedTheme(themeToApply);
      
      // Dispatch custom event for components that need to react to theme changes
      window.dispatchEvent(new CustomEvent('themeChange', { 
        detail: { theme: themeToApply } 
      }));
    } catch (error) {
      console.warn('Failed to apply theme:', error);
    }
  };

  // Load saved theme preference with better error handling
  useEffect(() => {
    try {
      const savedTheme = localStorage.getItem('theme');
      if (savedTheme && ['light', 'dark', 'system']?.includes(savedTheme)) {
        setTheme(savedTheme);
      } else {
        // Initialize with system theme if no valid preference found
        const systemTheme = getSystemTheme();
        setTheme('system');
        applyTheme(systemTheme);
      }
    } catch (error) {
      console.warn('Failed to load theme preference:', error);
      // Fallback to system theme
      setTheme('system');
      applyTheme(getSystemTheme());
    }
  }, []);

  // Apply theme when theme or system preference changes
  useEffect(() => {
    let effectiveTheme = theme;
    
    if (theme === 'system') {
      effectiveTheme = getSystemTheme();
    }
    
    applyTheme(effectiveTheme);
  }, [theme]);

  // Listen for system theme changes with better cleanup
  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    
    const handleChange = () => {
      if (theme === 'system') {
        const systemTheme = getSystemTheme();
        applyTheme(systemTheme);
      }
    };

    // Add listener with error handling
    try {
      mediaQuery?.addEventListener('change', handleChange);
    } catch (error) {
      // Fallback for older browsers
      mediaQuery?.addListener?.(handleChange);
    }

    return () => {
      try {
        mediaQuery?.removeEventListener('change', handleChange);
      } catch (error) {
        // Fallback for older browsers
        mediaQuery?.removeListener?.(handleChange);
      }
    };
  }, [theme]);

  const setThemeMode = (newTheme) => {
    try {
      setTheme(newTheme);
      localStorage.setItem('theme', newTheme);
    } catch (error) {
      console.warn('Failed to save theme preference:', error);
      // Still set the theme even if localStorage fails
      setTheme(newTheme);
    }
  };

  const toggleTheme = () => {
    if (resolvedTheme === 'dark') {
      setThemeMode('light');
    } else {
      setThemeMode('dark');
    }
  };

  const value = {
    theme,
    resolvedTheme,
    setTheme: setThemeMode,
    toggleTheme,
    themes: [
      { value: 'light', label: 'Light', icon: 'Sun' },
      { value: 'dark', label: 'Dark', icon: 'Moon' },
      { value: 'system', label: 'System', icon: 'Monitor' }
    ]
  };

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
};