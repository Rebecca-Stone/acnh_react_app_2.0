import React from "react";
import "../App.css";

export function AnimalPhoto(props) {
  let { photo, name } = props;

  return <img className="AnimalPhoto" src={photo} alt={name} />;
}
