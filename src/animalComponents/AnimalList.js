import React from "react";
import "../App.css";
import AnimalDetails from "./AnimalDetails";

export default function AnimalList(props) {
  return (
    <div className="AnimalContainer">
      {props.animals.map((animal) => (
        <AnimalDetails key={animal.id} animal={animal} />
      ))}
    </div>
  );
}
