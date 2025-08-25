import React from "react";
import "../App.css";
import { AnimalPhoto } from "./AnimalPhoto";
import Buttons from "./Buttons";
import { getVillagerField } from "../utils/villagerDataAccessor";
import {
  getCardColorsFromFavorites,
  getContrastingTextColor,
} from "../utils/colorMapper";

const Content = React.memo(
  function Content(props) {
    const { animal, onVillagerClick } = props;

    // Use data accessor for consistent data access
    const villagerName = getVillagerField(animal, "name");
    const species = getVillagerField(animal, "species");
    // const gender = getVillagerField(animal, "gender"); // unused variable
    const displayGender = getVillagerField(animal, "displayGender");
    const personality = getVillagerField(animal, "personality");
    const hobby = getVillagerField(animal, "hobby");
    const birthday = getVillagerField(animal, "birthday");
    const saying = getVillagerField(animal, "saying");
    const catchphrase = getVillagerField(animal, "catchphrase");
    const imageUrl = getVillagerField(animal, "imageUrl");
    const cardId = `villager-card-${getVillagerField(animal, "id")}`;

    const handleCardClick = (e) => {
      // Don't trigger modal if clicking on buttons
      if (e.target.closest(".villager-buttons")) {
        return;
      }
      if (onVillagerClick) {
        onVillagerClick(animal);
      }
    };

    const handleKeyDown = (e) => {
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        handleCardClick(e);
      }
    };

    // Get colors from favorite_colors with fallback to current system
    const cardColors = getCardColorsFromFavorites(animal);
    const finalTextColor = getContrastingTextColor(
      cardColors.backgroundColor,
      cardColors.textColor
    );

    return (
      <article
        id={cardId}
        className="animal-details content box clickable-card"
        style={{
          color: finalTextColor,
          backgroundColor: cardColors.backgroundColor,
        }}
        onClick={handleCardClick}
        onKeyDown={handleKeyDown}
        tabIndex="0"
        role="button"
        aria-label={`${villagerName}, ${species} villager with ${personality} personality. Click to view detailed information.`}
        aria-describedby={`${cardId}-description`}
      >
        <header>
          <h2>{villagerName}</h2>
          <p className="villager-basic-info">
            {species} - {displayGender}
          </p>
        </header>

        <div className="villager-photo-container">
          <AnimalPhoto photo={imageUrl} name={villagerName} />
        </div>

        <div id={`${cardId}-description`} className="villager-details-text">
          <p className="villager-personality-hobby">
            <span className="sr-only">Personality:</span> {personality}
            <span aria-hidden="true"> / </span>
            <span className="sr-only">Hobby:</span> {hobby}
          </p>
          <p className="villager-birthday">
            <span className="sr-only">Birthday:</span>
            <span aria-label={`Birthday is ${birthday}`}>
              Birthday: {birthday || "Unknown"}
            </span>
          </p>
          <blockquote className="villager-saying">
            <span className="sr-only">Famous quote:</span>"{saying}"
            <span
              className="catchphrase"
              aria-label={`Catchphrase: ${catchphrase}`}
            >
              {catchphrase || ""}
            </span>
          </blockquote>
        </div>

        <footer className="villager-actions">
          <Buttons villagerId={getVillagerField(animal, "id")} />
        </footer>
      </article>
    );
  },
  (prevProps, nextProps) => {
    // Custom comparison: only re-render if animal data or click handler changes
    return (
      getVillagerField(prevProps.animal, "id") ===
        getVillagerField(nextProps.animal, "id") &&
      getVillagerField(prevProps.animal, "name") ===
        getVillagerField(nextProps.animal, "name") &&
      prevProps.onVillagerClick === nextProps.onVillagerClick
    );
  }
);

export default Content;
