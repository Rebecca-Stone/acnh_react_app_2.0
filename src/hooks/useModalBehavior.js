import { useEffect, useRef } from "react";
import { getVillagerField } from "../utils/villagerDataAccessor";

/**
 * Custom hook for shared modal behavior
 * Extracts common modal logic used in both VillagerModal and EnhancedVillagerModal
 */
export const useModalBehavior = (isOpen, onClose, villager) => {
  const modalRef = useRef();
  const previousActiveElement = useRef();

  // Enhanced modal management with accessibility
  useEffect(() => {
    const handleEscape = (event) => {
      if (event.key === "Escape") {
        onClose();
      }
    };

    if (isOpen) {
      // Store the previously focused element
      previousActiveElement.current = document.activeElement;

      // Add event listeners
      document.addEventListener("keydown", handleEscape);

      // Prevent body scroll when modal is open
      document.body.style.overflow = "hidden";

      // Announce modal opening to screen readers
      const announcement = document.createElement("div");
      announcement.setAttribute("aria-live", "polite");
      announcement.setAttribute("aria-atomic", "true");
      announcement.className = "sr-only";

      const villagerName = getVillagerField(villager, "name");
      announcement.textContent = `Modal opened: ${villagerName} details`;
      document.body.appendChild(announcement);

      // Remove announcement after screen reader has time to read it
      setTimeout(() => {
        if (document.body.contains(announcement)) {
          document.body.removeChild(announcement);
        }
      }, 1000);
    } else {
      // Return focus to previously focused element when modal closes
      if (
        previousActiveElement.current &&
        document.body.contains(previousActiveElement.current)
      ) {
        previousActiveElement.current.focus();
      }
      // Restore body scroll when modal closes
      document.body.style.overflow = "unset";
    }

    return () => {
      document.removeEventListener("keydown", handleEscape);
      // Only restore scroll if we're unmounting, not just changing state
      if (!isOpen) {
        document.body.style.overflow = "unset";
      }
    };
  }, [isOpen, onClose, villager]);

  // Backdrop click handler
  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  return {
    modalRef,
    handleBackdropClick,
  };
};

/**
 * Hook for modal personality descriptions
 */
export const usePersonalityDescription = () => {
  const getPersonalityDescription = (personality) => {
    const descriptions = {
      Normal: "Sweet and friendly, loves to chat about daily life and cooking.",
      Peppy:
        "Energetic and enthusiastic, always excited about fashion and pop culture.",
      Snooty:
        "Sophisticated and elegant, enjoys luxury and high-class activities.",
      "Big sister":
        "Big sister type, caring but tough, often gives life advice.",
      Lazy: "Laid-back and food-loving, enjoys simple pleasures and napping.",
      Jock: "Athletic and energetic, passionate about sports and fitness.",
      Cranky: "Grumpy but caring, often talks about the 'good old days'.",
      Smug: "Charming and confident, considers himself sophisticated and cultured.",
    };

    return (
      descriptions[personality] ||
      "A unique personality that makes them special."
    );
  };

  return { getPersonalityDescription };
};

/**
 * Hook for birthday formatting
 */
export const useBirthdayFormatter = () => {
  const formatBirthday = (birthdayString) => {
    // For now, just return the birthday string as-is
    // Future enhancement: could add zodiac sign calculation
    return birthdayString;
  };

  return { formatBirthday };
};
