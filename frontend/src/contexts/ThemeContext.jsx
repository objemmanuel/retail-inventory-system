import React, { createContext, useContext, useState, useEffect } from 'react';

const ThemeContext = createContext();

export function useTheme() {
  return useContext(ThemeContext);
}

export function ThemeProvider({ children }) {
  const [theme, setTheme] = useState('light');
  const [preferences, setPreferences] = useState({
    compactMode: false,
    showCharts: true,
    showPredictions: true,
    autoRefresh: false,
    refreshInterval: 30000
  });

  // Load theme from localStorage on mount
  useEffect(() => {
    const savedTheme = localStorage.getItem('theme') || 'light';
    const savedPrefs = localStorage.getItem('preferences');
    
    setTheme(savedTheme);
    if (savedTheme === 'dark') {
      document.documentElement.classList.add('dark');
    }
    
    if (savedPrefs) {
      setPreferences(JSON.parse(savedPrefs));
    }
  }, []);

  const toggleTheme = () => {
    const newTheme = theme === 'light' ? 'dark' : 'light';
    setTheme(newTheme);
    localStorage.setItem('theme', newTheme);
    
    if (newTheme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  };

  const updatePreferences = (newPrefs) => {
    const updated = { ...preferences, ...newPrefs };
    setPreferences(updated);
    localStorage.setItem('preferences', JSON.stringify(updated));
  };

  return (
    <ThemeContext.Provider value={{ 
      theme, 
      toggleTheme, 
      preferences, 
      updatePreferences 
    }}>
      {children}
    </ThemeContext.Provider>
  );
}