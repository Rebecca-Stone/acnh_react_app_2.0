import React from 'react';
import { useTheme } from '../contexts/ThemeContext';

export default function HamburgerMenu({ isOpen, onToggle, className = '' }) {
  const { theme } = useTheme();

  return (
    <button
      className={`hamburger-menu ${isOpen ? 'hamburger-menu--active' : ''} ${className}`}
      onClick={onToggle}
      aria-label={isOpen ? 'Close navigation menu' : 'Open navigation menu'}
      aria-expanded={isOpen}
      type="button"
    >
      {/* Hamburger lines container */}
      <div className="hamburger-menu__container">
        <span className="hamburger-menu__line hamburger-menu__line--1"></span>
        <span className="hamburger-menu__line hamburger-menu__line--2"></span>
        <span className="hamburger-menu__line hamburger-menu__line--3"></span>
      </div>
      
      {/* Accessibility label */}
      <span className="hamburger-menu__label">
        {isOpen ? 'Close Menu' : 'Menu'}
      </span>
    </button>
  );
}
