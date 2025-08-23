import React from "react";
import { getVillagerField } from "../../utils/villagerDataAccessor";
import LazyImage from "../LazyImage";
import {
  getCardColorsFromFavorites,
  getContrastingTextColor,
} from "../../utils/colorMapper";

/**
 * Shared Modal Header Component
 */
export const ModalHeader = ({
  villager,
  onClose,
  variant = "basic",
  modalId,
}) => {
  const villagerName = getVillagerField(villager, "name");
  const species = getVillagerField(villager, "species");
  const personality = getVillagerField(villager, "personality");
  const gender = getVillagerField(villager, "displayGender");
  const imageUrl = getVillagerField(villager, "imageUrl");

  // Get colors for styling
  const modalColors = getCardColorsFromFavorites(villager);
  const finalTextColor = getContrastingTextColor(
    modalColors.backgroundColor,
    modalColors.textColor
  );

  if (variant === "enhanced") {
    return (
      <header
        className="enhanced-modal-header"
        style={{
          "--primary-color": modalColors.backgroundColor,
          "--secondary-color": modalColors.textColor,
          color: finalTextColor,
        }}
      >
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
    );
  }

  // Basic modal header
  return (
    <header
      className="modal-header"
      style={{
        backgroundColor: modalColors.backgroundColor,
        color: finalTextColor,
      }}
    >
      <div
        className="modal-villager-image"
        role="img"
        aria-label={`Portrait of ${villagerName}`}
      >
        <LazyImage
          src={imageUrl}
          alt={`${villagerName}, a ${species} villager with ${personality} personality`}
          className="modal-villager-img"
          onError={() =>
            console.log(`Failed to load modal image for ${villagerName}`)
          }
        />
      </div>
      <div className="modal-villager-basic">
        <h1 id={`${modalId}-title`}>{villagerName}</h1>
        <p
          className="modal-species-gender"
          aria-label={`Species: ${species}, Gender: ${gender}`}
        >
          {species} • {gender}
        </p>
      </div>
    </header>
  );
};

/**
 * Shared Collection Buttons Component
 */
export const CollectionButtons = ({
  villager,
  variant = "basic",
  isInHaveList,
  isInWantList,
  toggleHave,
  toggleWant,
}) => {
  const villagerId = getVillagerField(villager, "id");
  const inHaveList = isInHaveList(villagerId);
  const inWantList = isInWantList(villagerId);

  if (variant === "enhanced") {
    return (
      <div className="enhanced-collection-actions">
        <button
          onClick={() => toggleHave(villagerId)}
          className={`collection-button have-button ${
            inHaveList ? "active" : ""
          }`}
          aria-pressed={inHaveList}
          aria-label={`${inHaveList ? "Remove from" : "Add to"} have list`}
        >
          {inHaveList ? "✓ Have" : "+ Have"}
        </button>

        <button
          onClick={() => toggleWant(villagerId)}
          className={`collection-button want-button ${
            inWantList ? "active" : ""
          }`}
          aria-pressed={inWantList}
          aria-label={`${inWantList ? "Remove from" : "Add to"} want list`}
        >
          {inWantList ? "★ Want" : "+ Want"}
        </button>
      </div>
    );
  }

  // Basic collection buttons
  return (
    <div className="modal-collection-buttons">
      <button
        className={`collection-btn have-btn ${inHaveList ? "active" : ""}`}
        onClick={() => toggleHave(villagerId)}
        title={inHaveList ? "Remove from collection" : "Add to collection"}
      >
        <i className={`fas ${inHaveList ? "fa-heart" : "fa-heart-o"}`}></i>
        {inHaveList ? "In Collection" : "Add to Collection"}
      </button>
      <button
        className={`collection-btn want-btn ${inWantList ? "active" : ""}`}
        onClick={() => toggleWant(villagerId)}
        title={inWantList ? "Remove from wishlist" : "Add to wishlist"}
      >
        <i className={`fas ${inWantList ? "fa-star" : "fa-star-o"}`}></i>
        {inWantList ? "On Wishlist" : "Add to Wishlist"}
      </button>
    </div>
  );
};

/**
 * Shared Basic Information Component
 */
export const BasicInfoSection = ({
  villager,
  variant = "basic",
  getPersonalityDescription,
  formatBirthday,
}) => {
  const personality = getVillagerField(villager, "personality");
  const hobby = getVillagerField(villager, "hobby");
  const birthday = getVillagerField(villager, "birthday");
  const catchphrase = getVillagerField(villager, "catchphrase");

  if (variant === "enhanced") {
    return (
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

        <div className="enhanced-personality-section">
          <h3>✨ Personality</h3>
          <p className="personality-description">
            {getPersonalityDescription(personality)}
          </p>
        </div>
      </div>
    );
  }

  // Basic info layout
  return (
    <section className="modal-info-grid" aria-label="Basic Information">
      <div className="info-card">
        <h3>
          <i className="fas fa-theater-masks"></i> Personality
        </h3>
        <p className="info-value">{personality}</p>
        <p className="info-description">
          {getPersonalityDescription(personality)}
        </p>
      </div>

      <div className="info-card">
        <h3>
          <i className="fas fa-heart"></i> Hobby
        </h3>
        <p className="info-value">{hobby}</p>
        <p className="info-description">
          Loves activities related to{" "}
          {hobby ? hobby.toLowerCase() : "various things"}.
        </p>
      </div>

      <div className="info-card">
        <h3>
          <i className="fas fa-birthday-cake"></i> Birthday
        </h3>
        <p className="info-value">{formatBirthday(birthday)}</p>
        <p className="info-description">
          Don't forget to wish them happy birthday!
        </p>
      </div>

      <div className="info-card">
        <h3>
          <i className="fas fa-quote-left"></i> Catchphrase
        </h3>
        <p className="info-value">"{catchphrase}"</p>
        <p className="info-description">
          Their signature saying that makes them unique.
        </p>
      </div>
    </section>
  );
};

/**
 * Enhanced Features Section (only for enhanced variant)
 */
export const EnhancedFeaturesSection = ({ villager }) => {
  const favoriteGifts = getVillagerField(villager, "favoriteGifts");
  const appearances = getVillagerField(villager, "appearances");
  const houseSong = getVillagerField(villager, "houseSong");
  const pageUrl = getVillagerField(villager, "pageUrl");
  const villagerName = getVillagerField(villager, "name");

  const renderFavoriteGifts = () => {
    if (
      !favoriteGifts ||
      (!favoriteGifts.favorite_styles?.length &&
        !favoriteGifts.favorite_colors?.length &&
        !favoriteGifts.ideal_clothing_examples?.length)
    ) {
      return null;
    }

    return (
      <div className="enhanced-gift-section">
        <h3>🎁 Gift Preferences</h3>

        {favoriteGifts.favorite_styles?.length > 0 && (
          <div className="gift-category">
            <h4>Favorite Styles:</h4>
            <div className="gift-tags">
              {favoriteGifts.favorite_styles.map((style, index) => (
                <span key={index} className="gift-tag style-tag">
                  {style}
                </span>
              ))}
            </div>
          </div>
        )}

        {favoriteGifts.favorite_colors?.length > 0 && (
          <div className="gift-category">
            <h4>Favorite Colors:</h4>
            <div className="gift-tags">
              {favoriteGifts.favorite_colors.map((color, index) => (
                <span key={index} className="gift-tag color-tag">
                  {color}
                </span>
              ))}
            </div>
          </div>
        )}

        {favoriteGifts.ideal_clothing_examples?.length > 0 && (
          <div className="gift-category">
            <h4>Ideal Clothing:</h4>
            <div className="gift-tags">
              {favoriteGifts.ideal_clothing_examples.map((item, index) => (
                <span key={index} className="gift-tag clothing-tag">
                  {item}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>
    );
  };

  const renderGameAppearances = () => {
    if (!appearances || appearances.length === 0) return null;

    return (
      <div className="enhanced-appearances-section">
        <h3>🎮 Game Appearances</h3>
        <div className="appearances-list">
          {appearances.map((game, index) => (
            <span key={index} className="appearance-badge">
              {game}
            </span>
          ))}
        </div>
      </div>
    );
  };

  const renderMusicInfo = () => {
    if (!houseSong) return null;

    return (
      <div className="enhanced-music-section">
        <h3>🎵 House Music</h3>
        <p className="house-song">
          <strong>{houseSong}</strong> plays in {villagerName}'s home
        </p>
      </div>
    );
  };

  const renderExternalLink = () => {
    if (!pageUrl) return null;

    return (
      <div className="enhanced-links-section">
        <a
          href={pageUrl}
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

  return (
    <>
      {renderFavoriteGifts()}
      {renderGameAppearances()}
      {renderMusicInfo()}
      {renderExternalLink()}
    </>
  );
};

/**
 * Modal Tips Section (basic variant only)
 */
export const ModalTipsSection = ({ villager }) => {
  const hobby = getVillagerField(villager, "hobby");
  const personality = getVillagerField(villager, "personality");
  const birthday = getVillagerField(villager, "birthday");
  const catchphrase = getVillagerField(villager, "catchphrase");

  return (
    <div className="modal-tips">
      <h3>
        <i className="fas fa-lightbulb"></i> Tips
      </h3>
      <ul>
        <li>
          Give them gifts related to their hobby: <strong>{hobby}</strong>
        </li>
        <li>
          Their personality type is <strong>{personality}</strong> - they get
          along well with certain other personality types
        </li>
        <li>
          Remember their birthday on <strong>{birthday}</strong> for friendship
          points!
        </li>
        <li>Use their catchphrase "{catchphrase}" when talking to them</li>
      </ul>
    </div>
  );
};

/**
 * Modal Quote Section (basic variant only)
 */
export const ModalQuoteSection = ({ villager }) => {
  const saying = getVillagerField(villager, "saying");

  return (
    <div className="modal-quote-section">
      <h3>
        <i className="fas fa-comment"></i> What they say:
      </h3>
      <blockquote>"{saying}"</blockquote>
    </div>
  );
};
