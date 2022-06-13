import React from "react";
import Content from "./AnimalContent";
import "../App.css";

export default function AnimalDetails(props) {
  const { gender, hobby, personality, saying, image_uri, species } =
    props.animal;

  return (
    <div
      className="animal-details"
      style={{
        color: props.animal["text-color"],
        backgroundColor: props.animal["bubble-color"],
      }}
    >
      <Content
        name={props.animal.name["name-USen"]}
        gender={gender}
        birthday={props.animal["birthday-string"]}
        hobby={hobby}
        personality={personality}
        catchphrase={props.animal["catch-phrase"]}
        saying={saying}
        photo={image_uri}
        species={species}
      />
    </div>
  );
}
