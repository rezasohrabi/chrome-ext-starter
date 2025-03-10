import { useEffect, useState } from 'react';

type Theme = 'light' | 'dark';

/**
 * Custom hook for managing theme state across the extension
 * Handles loading saved theme preference, system theme detection, and theme toggling
 * @returns {Object} Theme state and toggle function
 */
const useTheme = (): {
  theme: Theme;
  toggleTheme: () => void;
} => {
  const [theme, setTheme] = useState<Theme>('light');

  // Load theme from storage or use system preference
  useEffect(() => {
    const loadTheme = async (): Promise<void> => {
      try {
        const { theme: savedTheme } = await chrome.storage.local.get('theme');

        // If no saved theme, check system preference
        if (!savedTheme) {
          const prefersDark = window.matchMedia(
            '(prefers-color-scheme: dark)'
          ).matches;
          const systemTheme = prefersDark ? 'dark' : 'light';
          setTheme(systemTheme);
          document.documentElement.setAttribute('data-theme', systemTheme);
        } else {
          setTheme(savedTheme);
          document.documentElement.setAttribute('data-theme', savedTheme);
        }
      } catch (error) {
        // Use light theme as fallback
        setTheme('light');
        document.documentElement.setAttribute('data-theme', 'light');
      }
    };

    loadTheme();

    // Listen for system theme changes
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handleChange = async (e: MediaQueryListEvent): Promise<void> => {
      try {
        // Check if user has explicitly set a preference
        const { theme: savedTheme } = await chrome.storage.local.get('theme');
        // Only update if user hasn't explicitly set a preference
        if (!savedTheme) {
          const newTheme = e.matches ? 'dark' : 'light';
          setTheme(newTheme);
          document.documentElement.setAttribute('data-theme', newTheme);
        }
      } catch (error) {
        // Ignore errors
      }
    };

    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, []);

  // Toggle theme function
  const toggleTheme = (): void => {
    const newTheme = theme === 'light' ? 'dark' : 'light';
    setTheme(newTheme);
    document.documentElement.setAttribute('data-theme', newTheme);
    // Save theme preference
    chrome.storage.local.set({ theme: newTheme });
  };

  return { theme, toggleTheme };
};

export default useTheme;
