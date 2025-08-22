import React from "react";
import "../App.css";
import { AnimalPhoto } from "./AnimalPhoto";
import Buttons from "./Buttons";

const Content = React.memo(
  function Content(props) {
    let { gender, image_uri, hobby, personality, saying, species } =
      props.animal;

    const handleCardClick = (e) => {
      // Don't trigger modal if clicking on buttons
      if (e.target.closest(".villager-buttons")) {
        return;
      }
      if (props.onVillagerClick) {
        props.onVillagerClick(props.animal);
      }
    };

    const handleKeyDown = (e) => {
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        handleCardClick(e);
      }
    };

    const villagerName = props.animal.name["name-USen"];
    const cardId = `villager-card-${props.animal.id}`;

    return (
      <article
        id={cardId}
        className="animal-details content box clickable-card"
        style={{
          color: props.animal["text-color"],
          backgroundColor: props.animal["bubble-color"],
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
            {species} - {gender === "Female" ? "She/Her" : "He/Him"}
          </p>
        </header>

        <div className="villager-photo-container">
          <AnimalPhoto photo={image_uri} name={villagerName} />
        </div>

        <div id={`${cardId}-description`} className="villager-details-text">
          <p className="villager-personality-hobby">
            <span className="sr-only">Personality:</span> {personality}
            <span aria-hidden="true"> / </span>
            <span className="sr-only">Hobby:</span> {hobby}
          </p>
          <p className="villager-birthday">
            <span className="sr-only">Birthday:</span>
            <span aria-label={`Birthday is ${props.animal["birthday-string"]}`}>
              Birthday: {props.animal["birthday-string"]}
            </span>
          </p>
          <blockquote className="villager-saying">
            <span className="sr-only">Famous quote:</span>"{saying}"
            <span
              className="catchphrase"
              aria-label={`Catchphrase: ${props.animal["catch-phrase"]}`}
            >
              {props.animal["catch-phrase"]}
            </span>
          </blockquote>
        </div>

        <footer className="villager-actions">
          <Buttons villagerId={props.animal.id} />
        </footer>
      </article>
    );
  },
  (prevProps, nextProps) => {
    // Custom comparison: only re-render if animal data or click handler changes
    return (
      prevProps.animal.id === nextProps.animal.id &&
      prevProps.animal.name["name-USen"] ===
        nextProps.animal.name["name-USen"] &&
      prevProps.onVillagerClick === nextProps.onVillagerClick
    );
  }
);

export default Content;
