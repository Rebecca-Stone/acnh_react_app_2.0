import "../App.css";
import { AnimalPhoto } from "./AnimalPhoto";
import Buttons from "./Buttons";

function Content(props) {
  let {
    name,
    gender,
    photo,
    birthday,
    hobby,
    personality,
    catchphrase,
    saying,
    species,
  } = props;

  return (
    <div className="content">
      <h1>{name} </h1>
      <small>
        {species} - {gender === "Female" ? "She/Her" : "He/Him"}
      </small>
      <AnimalPhoto photo={photo} />
      <small>
        {personality} / {hobby}
      </small>
      <p>Birthday: {birthday}</p>
      <h3>
        {saying} {catchphrase}
      </h3>
      <Buttons />
    </div>
  );
}

export default Content;
