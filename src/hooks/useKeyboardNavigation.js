import { useEffect } from "react";

// Custom hook for keyboard navigation
export const useKeyboardNavigation = (isEnabled = true) => {
  useEffect(() => {
    if (!isEnabled) return;

    const handleKeyDown = (event) => {
      // Handle common keyboard shortcuts
      switch (event.key) {
        case "Escape":
          // Let components handle their own escape logic
          break;
        case "Tab":
          // Ensure tab navigation works properly
          if (!event.shiftKey) {
            // Forward tab
            const focusableElements = document.querySelectorAll(
              'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
            );
            const firstElement = focusableElements[0];
            const lastElement = focusableElements[focusableElements.length - 1];

            if (document.activeElement === lastElement) {
              event.preventDefault();
              firstElement?.focus();
            }
          } else {
            // Backward tab (Shift+Tab)
            const focusableElements = document.querySelectorAll(
              'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
            );
            const firstElement = focusableElements[0];

            if (document.activeElement === firstElement) {
              event.preventDefault();
              focusableElements[focusableElements.length - 1]?.focus();
            }
          }
          break;
        case "Enter":
        case " ":
          // Space and Enter should activate clickable elements
          if (
            event.target.getAttribute("role") === "button" ||
            event.target.classList.contains("clickable-card")
          ) {
            event.preventDefault();
            event.target.click();
          }
          break;
        default:
          break;
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [isEnabled]);
};

// Hook for managing focus trap in modals
export const useFocusTrap = (isActive, containerRef) => {
  useEffect(() => {
    if (!isActive || !containerRef.current) return;

    const container = containerRef.current;
    const focusableElements = container.querySelectorAll(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    );

    const firstElement = focusableElements[0];
    const lastElement = focusableElements[focusableElements.length - 1];

    // Focus the first element when modal opens
    firstElement?.focus();

    const handleKeyDown = (event) => {
      if (event.key === "Tab") {
        if (!event.shiftKey && document.activeElement === lastElement) {
          event.preventDefault();
          firstElement?.focus();
        } else if (event.shiftKey && document.activeElement === firstElement) {
          event.preventDefault();
          lastElement?.focus();
        }
      }
    };

    container.addEventListener("keydown", handleKeyDown);
    return () => container.removeEventListener("keydown", handleKeyDown);
  }, [isActive, containerRef]);
};
