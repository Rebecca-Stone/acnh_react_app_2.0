import "../App.css";
import { AnimalPhoto } from "./AnimalPhoto";
import Buttons from "./Buttons";

function Content(props) {
  let { gender, image_uri, hobby, personality, saying, species } = props.animal;

  const handleCardClick = (e) => {
    // Don't trigger modal if clicking on buttons
    if (e.target.closest(".villager-buttons")) {
      return;
    }
    if (props.onVillagerClick) {
      props.onVillagerClick(props.animal);
    }
  };

  return (
    <div
      className="animal-details content box clickable-card"
      style={{
        color: props.animal["text-color"],
        backgroundColor: props.animal["bubble-color"],
      }}
      onClick={handleCardClick}
      title="Click to view details"
    >
      <h1>{props.animal.name["name-USen"]} </h1>
      <small>
        {species} - {gender === "Female" ? "She/Her" : "He/Him"}
      </small>
      <AnimalPhoto photo={image_uri} />
      <small>
        {personality} / {hobby}
      </small>
      <p>Birthday: {props.animal["birthday-string"]}</p>
      <h3>
        {saying} {props.animal["catch-phrase"]}
      </h3>
      <Buttons villagerId={props.animal.id} />
    </div>
  );
}

export default Content;
