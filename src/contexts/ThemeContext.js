import React, { createContext, useContext, useState, useEffect } from "react";

const ThemeContext = createContext();

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error("useTheme must be used within a ThemeProvider");
  }
  return context;
};

export const ThemeProvider = ({ children }) => {
  const [theme, setTheme] = useState("light");

  // Load theme from localStorage on mount
  useEffect(() => {
    try {
      const savedTheme = localStorage.getItem("acnh-theme");
      if (savedTheme && (savedTheme === "light" || savedTheme === "dark")) {
        setTheme(savedTheme);
      } else {
        // Check system preference
        const prefersDark = window.matchMedia(
          "(prefers-color-scheme: dark)"
        ).matches;
        setTheme(prefersDark ? "dark" : "light");
      }
    } catch (error) {
      console.error("Error loading theme from localStorage:", error);
    }
  }, []);

  // Save theme to localStorage and apply to document
  useEffect(() => {
    try {
      localStorage.setItem("acnh-theme", theme);

      // Apply theme to document root for CSS custom properties
      document.documentElement.setAttribute("data-theme", theme);

      // Update meta theme-color for mobile browsers
      const metaThemeColor = document.querySelector('meta[name="theme-color"]');
      if (metaThemeColor) {
        metaThemeColor.content = theme === "dark" ? "#1a1a1a" : "#fafafa";
      } else {
        // Create meta tag if it doesn't exist
        const meta = document.createElement("meta");
        meta.name = "theme-color";
        meta.content = theme === "dark" ? "#1a1a1a" : "#fafafa";
        document.head.appendChild(meta);
      }
    } catch (error) {
      console.error("Error saving theme to localStorage:", error);
    }
  }, [theme]);

  const toggleTheme = () => {
    setTheme((prev) => (prev === "light" ? "dark" : "light"));
  };

  const setLightTheme = () => setTheme("light");
  const setDarkTheme = () => setTheme("dark");

  const isLight = theme === "light";
  const isDark = theme === "dark";

  const value = {
    theme,
    toggleTheme,
    setLightTheme,
    setDarkTheme,
    isLight,
    isDark,
  };

  return (
    <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
  );
};
