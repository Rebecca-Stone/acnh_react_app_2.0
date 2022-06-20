import "../App.css";
import { AnimalPhoto } from "./AnimalPhoto";
// import Buttons from "./Buttons";

function Content(props) {
  let { gender, image_uri, hobby, personality, saying, species } = props.animal;

  return (
    <div
      className="animal-details content box"
      style={{
        color: props.animal["text-color"],
        backgroundColor: props.animal["bubble-color"],
      }}
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
      {/* <Buttons /> */}
    </div>
  );
}

export default Content;
