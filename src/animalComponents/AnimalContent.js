import "../App.css";
import { AnimalPhoto } from "./AnimalPhoto";

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
  } = props;

  return (
    <div class="content">
      <h1>{name} </h1>
      <small>{gender === "Female" ? "She/Her" : "He/Him"}</small>
      <AnimalPhoto photo={photo} />
      <small>
        {personality} / {hobby}
      </small>
      <p>Birthday: {birthday}</p>
      <h3>
        {saying} {catchphrase}
      </h3>
    </div>
  );
}

export default Content;
