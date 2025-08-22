import React from "react";
import { useCollection } from "../contexts/CollectionContext";

export default function Buttons({ villagerId }) {
  const { isInHaveList, isInWantList, toggleHave, toggleWant } =
    useCollection();

  const inHaveList = isInHaveList(villagerId);
  const inWantList = isInWantList(villagerId);

  const handleHaveClick = () => {
    toggleHave(villagerId);
  };

  const handleWantClick = () => {
    toggleWant(villagerId);
  };

  return (
    <div className="villager-buttons">
      <button
        className={`collection-btn have-btn ${inHaveList ? "active" : ""}`}
        onClick={handleHaveClick}
        title={inHaveList ? "Remove from collection" : "Add to collection"}
      >
        <i className={`fas ${inHaveList ? "fa-heart" : "fa-heart-o"}`}></i>
        {inHaveList ? "Have" : "Have"}
      </button>
      <button
        className={`collection-btn want-btn ${inWantList ? "active" : ""}`}
        onClick={handleWantClick}
        title={inWantList ? "Remove from wishlist" : "Add to wishlist"}
      >
        <i className={`fas ${inWantList ? "fa-star" : "fa-star-o"}`}></i>
        {inWantList ? "Want" : "Want"}
      </button>
    </div>
  );
}
