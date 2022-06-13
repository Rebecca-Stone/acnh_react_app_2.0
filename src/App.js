import "./App.css";
import { useState, useEffect } from "react";
import axios from "axios";
import Nav from "./Nav";
import AnimalList from "./animalComponents/AnimalList";

function App() {
  const [ShowNav, setShowNav] = useState(false);
  const [animalList, setAnimalList] = useState([]);

  useEffect(() => {
    const getAnimals = () => {
      axios
        .get("https://acnhapi.com/v1a/villagers/")
        .then((res) => {
          setAnimalList(res.data);
        })
        .catch((err) => {
          console.error(err);
        });
    };
    getAnimals();
    console.log(animalList);
  }, []);

  const addClass = (event) => {
    setShowNav((current) => !current);
  };

  return (
    <section>
      <div className={ShowNav ? "show-nav container" : "container"}>
        {/* this is where I'll put a search bar to find characters by name */}
        <search>search</search>
        {/* I'll also put some filters for: gender, species, hobby, birthday, etc. */}
        <div className="circle-container">
          <div className="circle">
            <button id="close" onClick={addClass}>
              <i className="fas fa-times"></i>
            </button>

            <button id="open" onClick={addClass}>
              <i className="fas fa-bars"></i>
            </button>
          </div>
        </div>
        <AnimalList animals={animalList} />
      </div>
      <Nav />
    </section>
  );
}

export default App;
