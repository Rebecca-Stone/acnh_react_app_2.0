import React, { useEffect, useRef } from "react";
import { useCollection } from "../contexts/CollectionContext";
import LazyImage from "./LazyImage";
import { useFocusTrap } from "../hooks/useKeyboardNavigation";

export default function EnhancedVillagerModal({ villager, isOpen, onClose }) {
  const { isInHaveList, isInWantList, toggleHave, toggleWant } = useCollection();
  const modalRef = useRef();
  const previousActiveElement = useRef();

  // Manage focus trap in modal
  useFocusTrap(isOpen, modalRef);

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
      document.addEventListener("keydown", handleEscape);
      document.body.style.overflow = "hidden";

      // Announce modal opening to screen readers
      const announcement = document.createElement("div");
      announcement.setAttribute("aria-live", "polite");
      announcement.setAttribute("aria-atomic", "true");
      announcement.className = "sr-only";
      
      // Use new schema name format or fallback
      const villagerName = villager._newFormatData?.name || villager.name?.["name-USen"] || "Unknown";
      announcement.textContent = `Enhanced modal opened: ${villagerName} details`;
      document.body.appendChild(announcement);

      setTimeout(() => {
        if (document.body.contains(announcement)) {
          document.body.removeChild(announcement);
        }
      }, 1000);
    } else {
      if (previousActiveElement.current) {
        previousActiveElement.current.focus();
      }
    }

    return () => {
      document.removeEventListener("keydown", handleEscape);
      document.body.style.overflow = "unset";
    };
  }, [isOpen, onClose, villager]);

  if (!isOpen || !villager) return null;

  // Access both old and new format data
  const newFormatData = villager._newFormatData;
  const oldFormatData = villager;

  // Extract villager information with fallbacks
  const villagerName = newFormatData?.name || oldFormatData.name?.["name-USen"] || "Unknown";
  const villagerID = oldFormatData.id || Math.random() * 10000;
  
  const inHaveList = isInHaveList(villagerID);
  const inWantList = isInWantList(villagerID);

  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  const getPersonalityDescription = (personality) => {
    const descriptions = {
      Normal: "Sweet and friendly, loves to chat about daily life and cooking.",
      Peppy: "Energetic and enthusiastic, always excited about fashion and pop culture.",
      Snooty: "Sophisticated and elegant, enjoys luxury and high-class activities.",
      "Big sister": "Big sister type, caring but tough, often gives life advice.",
      Lazy: "Laid-back and food-loving, enjoys simple pleasures and napping.",
      Jock: "Athletic and energetic, passionate about sports and fitness.",
      Cranky: "Grumpy but caring, often talks about the 'good old days'.",
      Smug: "Charming and confident, considers himself sophisticated and cultured.",
    };
    return descriptions[personality] || "A unique personality that makes them special.";
  };

  const renderFavoriteGifts = () => {
    if (!newFormatData?.favorite_gifts) return null;

    const { favorite_styles, favorite_colors, ideal_clothing_examples } = newFormatData.favorite_gifts;

    return (
      <div className="enhanced-gift-section">
        <h3>🎁 Gift Preferences</h3>
        
        {favorite_styles && favorite_styles.length > 0 && (
          <div className="gift-category">
            <h4>Favorite Styles:</h4>
            <div className="gift-tags">
              {favorite_styles.map((style, index) => (
                <span key={index} className="gift-tag style-tag">{style}</span>
              ))}
            </div>
          </div>
        )}

        {favorite_colors && favorite_colors.length > 0 && (
          <div className="gift-category">
            <h4>Favorite Colors:</h4>
            <div className="gift-tags">
              {favorite_colors.map((color, index) => (
                <span key={index} className="gift-tag color-tag">{color}</span>
              ))}
            </div>
          </div>
        )}

        {ideal_clothing_examples && ideal_clothing_examples.length > 0 && (
          <div className="gift-category">
            <h4>Ideal Clothing:</h4>
            <div className="gift-tags">
              {ideal_clothing_examples.map((item, index) => (
                <span key={index} className="gift-tag clothing-tag">{item}</span>
              ))}
            </div>
          </div>
        )}
      </div>
    );
  };

  const renderGameAppearances = () => {
    if (!newFormatData?.appearances || newFormatData.appearances.length === 0) return null;

    return (
      <div className="enhanced-appearances-section">
        <h3>🎮 Game Appearances</h3>
        <div className="appearances-list">
          {newFormatData.appearances.map((game, index) => (
            <span key={index} className="appearance-badge">{game}</span>
          ))}
        </div>
      </div>
    );
  };

  const renderMusicInfo = () => {
    if (!newFormatData?.house_song) return null;

    return (
      <div className="enhanced-music-section">
        <h3>🎵 House Music</h3>
        <p className="house-song">
          <strong>{newFormatData.house_song}</strong> plays in {villagerName}'s home
        </p>
      </div>
    );
  };

  const renderExternalLink = () => {
    if (!newFormatData?.page_url) return null;

    return (
      <div className="enhanced-links-section">
        <a 
          href={newFormatData.page_url} 
          target="_blank" 
          rel="noopener noreferrer"
          className="nookipedia-link"
          aria-label={`View ${villagerName} on Nookipedia (opens in new tab)`}
        >
          📖 View on Nookipedia
        </a>
      </div>
    );
  };

  const modalId = `enhanced-villager-modal-${villagerID}`;
  const species = newFormatData?.species || oldFormatData.species;
  const personality = newFormatData?.personality || oldFormatData.personality;
  const gender = newFormatData?.gender || oldFormatData.gender;
  const birthday = newFormatData?.birthday || oldFormatData["birthday-string"];
  const catchphrase = newFormatData?.catchphrase || oldFormatData["catch-phrase"];
  const hobby = newFormatData?.hobby || oldFormatData.hobby;
  const imageUrl = newFormatData?.poster_image_url || oldFormatData.image_uri;

  return (
    <div
      className="modal-backdrop enhanced-modal-backdrop"
      onClick={handleBackdropClick}
      role="dialog"
      aria-modal="true"
      aria-labelledby={`${modalId}-title`}
      aria-describedby={`${modalId}-content`}
    >
      <div
        ref={modalRef}
        className="modal-content enhanced-modal-content"
        role="document"
      >
        <header className="enhanced-modal-header">
          <button
            onClick={onClose}
            className="modal-close-button"
            aria-label="Close modal"
            type="button"
          >
            <span aria-hidden="true">&times;</span>
          </button>
          
          <div className="enhanced-villager-title">
            <h1 id={`${modalId}-title`} className="enhanced-villager-name">
              {villagerName}
            </h1>
            <p className="enhanced-villager-subtitle">
              {species} • {gender} • {personality}
            </p>
          </div>
        </header>

        <div id={`${modalId}-content`} className="enhanced-modal-body">
          <div className="enhanced-villager-image-section">
            <LazyImage
              src={imageUrl}
              alt={`${villagerName} - ${species} villager`}
              className="enhanced-villager-image"
            />
          </div>

          <div className="enhanced-villager-info">
            <div className="enhanced-basic-info">
              <div className="info-row">
                <span className="info-label">Birthday:</span>
                <span className="info-value">{birthday}</span>
              </div>
              <div className="info-row">
                <span className="info-label">Hobby:</span>
                <span className="info-value">{hobby}</span>
              </div>
              <div className="info-row">
                <span className="info-label">Catchphrase:</span>
                <span className="info-value">"{catchphrase}"</span>
              </div>
            </div>

            <div className="enhanced-personality-section">
              <h3>✨ Personality</h3>
              <p className="personality-description">
                {getPersonalityDescription(personality)}
              </p>
            </div>

            {/* Enhanced features using new schema fields */}
            {renderFavoriteGifts()}
            {renderGameAppearances()}
            {renderMusicInfo()}
            {renderExternalLink()}
          </div>
        </div>

        <footer className="enhanced-modal-footer">
          <div className="enhanced-collection-actions">
            <button
              onClick={() => toggleHave(villagerID)}
              className={`collection-button have-button ${inHaveList ? "active" : ""}`}
              aria-pressed={inHaveList}
              aria-label={`${inHaveList ? "Remove from" : "Add to"} have list`}
            >
              {inHaveList ? "✓ Have" : "+ Have"}
            </button>
            
            <button
              onClick={() => toggleWant(villagerID)}
              className={`collection-button want-button ${inWantList ? "active" : ""}`}
              aria-pressed={inWantList}
              aria-label={`${inWantList ? "Remove from" : "Add to"} want list`}
            >
              {inWantList ? "★ Want" : "+ Want"}
            </button>
          </div>
        </footer>
      </div>
    </div>
  );
}
