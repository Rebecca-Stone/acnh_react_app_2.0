import React, { useEffect } from "react";
import { useCollection } from "../contexts/CollectionContext";

export default function VillagerModal({ villager, isOpen, onClose }) {
  const { isInHaveList, isInWantList, toggleHave, toggleWant } =
    useCollection();

  // Close modal on ESC key
  useEffect(() => {
    const handleEscape = (event) => {
      if (event.key === "Escape") {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener("keydown", handleEscape);
      // Prevent body scroll when modal is open
      document.body.style.overflow = "hidden";
    }

    return () => {
      document.removeEventListener("keydown", handleEscape);
      document.body.style.overflow = "unset";
    };
  }, [isOpen, onClose]);

  if (!isOpen || !villager) return null;

  const inHaveList = isInHaveList(villager.id);
  const inWantList = isInWantList(villager.id);

  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  const formatBirthday = (birthdayString) => {
    // For now, just return the birthday string as-is
    // Future enhancement: could add zodiac sign calculation
    return birthdayString;
  };

  const getPersonalityDescription = (personality) => {
    const descriptions = {
      Normal: "Sweet and friendly, loves to chat about daily life and cooking.",
      Peppy:
        "Energetic and enthusiastic, always excited about fashion and pop culture.",
      Snooty:
        "Sophisticated and elegant, enjoys luxury and high-class activities.",
      Uchi: "Big sister type, caring but tough, often gives life advice.",
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

  return (
    <div className="modal-backdrop" onClick={handleBackdropClick}>
      <div className="modal-content">
        <button className="modal-close" onClick={onClose} title="Close (ESC)">
          <i className="fas fa-times"></i>
        </button>

        <div
          className="modal-header"
          style={{
            backgroundColor: villager["bubble-color"],
            color: villager["text-color"],
          }}
        >
          <div className="modal-villager-image">
            <img
              src={villager.image_uri}
              alt={villager.name["name-USen"]}
              onError={(e) => {
                e.target.src = "/api/placeholder/200/200";
              }}
            />
          </div>
          <div className="modal-villager-basic">
            <h1>{villager.name["name-USen"]}</h1>
            <p className="modal-species-gender">
              {villager.species} •{" "}
              {villager.gender === "Female" ? "She/Her" : "He/Him"}
            </p>
            <div className="modal-collection-buttons">
              <button
                className={`collection-btn have-btn ${
                  inHaveList ? "active" : ""
                }`}
                onClick={() => toggleHave(villager.id)}
                title={
                  inHaveList ? "Remove from collection" : "Add to collection"
                }
              >
                <i
                  className={`fas ${inHaveList ? "fa-heart" : "fa-heart-o"}`}
                ></i>
                {inHaveList ? "In Collection" : "Add to Collection"}
              </button>
              <button
                className={`collection-btn want-btn ${
                  inWantList ? "active" : ""
                }`}
                onClick={() => toggleWant(villager.id)}
                title={inWantList ? "Remove from wishlist" : "Add to wishlist"}
              >
                <i
                  className={`fas ${inWantList ? "fa-star" : "fa-star-o"}`}
                ></i>
                {inWantList ? "On Wishlist" : "Add to Wishlist"}
              </button>
            </div>
          </div>
        </div>

        <div className="modal-body">
          <div className="modal-info-grid">
            <div className="info-card">
              <h3>
                <i className="fas fa-theater-masks"></i> Personality
              </h3>
              <p className="info-value">{villager.personality}</p>
              <p className="info-description">
                {getPersonalityDescription(villager.personality)}
              </p>
            </div>

            <div className="info-card">
              <h3>
                <i className="fas fa-heart"></i> Hobby
              </h3>
              <p className="info-value">{villager.hobby}</p>
              <p className="info-description">
                Loves activities related to {villager.hobby.toLowerCase()}.
              </p>
            </div>

            <div className="info-card">
              <h3>
                <i className="fas fa-birthday-cake"></i> Birthday
              </h3>
              <p className="info-value">
                {formatBirthday(villager["birthday-string"])}
              </p>
              <p className="info-description">
                Don't forget to wish them happy birthday!
              </p>
            </div>

            <div className="info-card">
              <h3>
                <i className="fas fa-quote-left"></i> Catchphrase
              </h3>
              <p className="info-value">"{villager["catch-phrase"]}"</p>
              <p className="info-description">
                Their signature saying that makes them unique.
              </p>
            </div>
          </div>

          <div className="modal-quote-section">
            <h3>
              <i className="fas fa-comment"></i> What they say:
            </h3>
            <blockquote>"{villager.saying}"</blockquote>
          </div>

          <div className="modal-tips">
            <h3>
              <i className="fas fa-lightbulb"></i> Tips
            </h3>
            <ul>
              <li>
                Give them gifts related to their hobby:{" "}
                <strong>{villager.hobby}</strong>
              </li>
              <li>
                Their personality type is{" "}
                <strong>{villager.personality}</strong> - they get along well
                with certain other personality types
              </li>
              <li>
                Remember their birthday on{" "}
                <strong>{villager["birthday-string"]}</strong> for friendship
                points!
              </li>
              <li>
                Use their catchphrase "{villager["catch-phrase"]}" when talking
                to them
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
