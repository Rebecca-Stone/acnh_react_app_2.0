import "./App.css";
import { useState, useEffect } from "react";
import axios from "axios";
import Nav from "./helpers/Nav";
import AnimalList from "./animalComponents/AnimalList";
import Search from "./helpers/Search";

function App() {
  const [showNav, setShowNav] = useState(false);
  const [animalList, setAnimalList] = useState([]);
  const [filteredAnimals, setFilteredAnimals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Proper scroll handling with React
  useEffect(() => {
    const checkBoxes = () => {
      const triggerBottom = (window.innerHeight / 5) * 4;
      const boxes = document.querySelectorAll(".box");

      boxes.forEach((box) => {
        const boxTop = box.getBoundingClientRect().top;

        if (boxTop < triggerBottom) {
          box.classList.add("show");
        } else {
          box.classList.remove("show");
        }
      });
    };

    // Add event listener
    window.addEventListener("scroll", checkBoxes);

    // Initial check
    checkBoxes();

    // Cleanup function to remove event listener
    return () => {
      window.removeEventListener("scroll", checkBoxes);
    };
  }, []);

  useEffect(() => {
    const getAnimals = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await axios.get("https://acnhapi.com/v1a/villagers/");
        setAnimalList(response.data);
        setFilteredAnimals(response.data); // Initialize filtered list
      } catch (err) {
        setError("Failed to load animal data. Please try again later.");
        console.error("Error fetching animals:", err);
      } finally {
        setLoading(false);
      }
    };
    getAnimals();
  }, []); // Empty dependency array - runs only once on mount

  const toggleNav = () => {
    setShowNav((current) => !current);
  };

  if (loading) {
    return (
      <section>
        <div className="container">
          <div style={{ textAlign: "center", padding: "2rem" }}>
            <h2>Loading Animal Crossing villagers...</h2>
            <p>Please wait while we fetch the data.</p>
          </div>
        </div>
      </section>
    );
  }

  if (error) {
    return (
      <section>
        <div className="container">
          <div style={{ textAlign: "center", padding: "2rem" }}>
            <h2>Oops! Something went wrong</h2>
            <p>{error}</p>
            <button onClick={() => window.location.reload()}>Try Again</button>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section>
      <div className={showNav ? "show-nav container" : "container"}>
        <Search animalList={animalList} onFilter={setFilteredAnimals} />

        <div className="circle-container">
          <div className="circle">
            <button id="close" onClick={toggleNav}>
              <i className="fas fa-times"></i>
            </button>

            <button id="open" onClick={toggleNav}>
              <i className="fas fa-bars"></i>
            </button>
          </div>
        </div>
        <AnimalList animals={filteredAnimals} />
      </div>
      <Nav />
    </section>
  );
}

export default App;
