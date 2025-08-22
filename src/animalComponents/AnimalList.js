import React from "react";
import "../App.css";
import AnimalContent from "./AnimalContent";

export default function AnimalList(props) {
  let { animals, onVillagerClick } = props;
  return (
    <div className="AnimalContainer">
      {animals.map((animal) => (
        <AnimalContent
          key={animal.id}
          animal={animal}
          onVillagerClick={onVillagerClick}
        />
      ))}
    </div>
  );
}
