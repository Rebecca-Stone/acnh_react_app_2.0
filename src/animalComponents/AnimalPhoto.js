import React from "react";
import "../App.css";
import LazyImage from "../components/LazyImage";

export const AnimalPhoto = React.memo(
  function AnimalPhoto(props) {
    let { photo, name } = props;

    return (
      <LazyImage
        className="AnimalPhoto"
        src={photo}
        alt={name || "Villager photo"}
        onError={() => console.log(`Failed to load image for ${name}`)}
      />
    );
  },
  (prevProps, nextProps) => {
    // Only re-render if photo or name changes
    return (
      prevProps.photo === nextProps.photo && prevProps.name === nextProps.name
    );
  }
);
