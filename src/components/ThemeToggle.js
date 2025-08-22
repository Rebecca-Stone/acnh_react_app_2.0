import React from "react";
import { useTheme } from "../contexts/ThemeContext";

export default function ThemeToggle() {
  const { theme, toggleTheme, isLight, isDark } = useTheme();

  return (
    <button
      className="theme-toggle"
      onClick={toggleTheme}
      title={`Switch to ${isLight ? "dark" : "light"} mode`}
      aria-label={`Currently ${theme} mode. Click to switch to ${
        isLight ? "dark" : "light"
      } mode.`}
    >
      <div className="theme-toggle-track">
        <div className={`theme-toggle-thumb ${isDark ? "dark" : "light"}`}>
          {isLight ? (
            <i className="fas fa-sun"></i>
          ) : (
            <i className="fas fa-moon"></i>
          )}
        </div>
      </div>
      <span className="theme-toggle-label">{isLight ? "Light" : "Dark"}</span>
    </button>
  );
}
