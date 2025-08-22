import "./App.css";
import { useState, useEffect } from "react";
import axios from "axios";
import Nav from "./helpers/Nav";
import AnimalList from "./animalComponents/AnimalList";
import Search from "./helpers/Search";
import Filter from "./helpers/Filter";
import VillagerModal from "./components/VillagerModal";
import CollectionStats from "./components/CollectionStats";
import ThemeToggle from "./components/ThemeToggle";
import { CollectionProvider } from "./contexts/CollectionContext";
import { ThemeProvider } from "./contexts/ThemeContext";
import { useKeyboardNavigation } from "./hooks/useKeyboardNavigation";

// Mock data as fallback when API is down
const mockVillagers = [
  {
    id: 1,
    name: { "name-USen": "Raymond" },
    species: "Cat",
    personality: "Smug",
    gender: "Male",
    "birthday-string": "October 1st",
    saying: "Hmm, indeed",
    "catch-phrase": "crisp",
    hobby: "Reading",
    image_uri: "https://acnhapi.com/v1/images/villagers/400",
    "text-color": "#ffffff",
    "bubble-color": "#4a4a4a",
  },
  {
    id: 2,
    name: { "name-USen": "Isabelle" },
    species: "Dog",
    personality: "Normal",
    gender: "Female",
    "birthday-string": "December 20th",
    saying: "What can I do for you?",
    "catch-phrase": "yes yes!",
    hobby: "Organization",
    image_uri: "https://acnhapi.com/v1/images/villagers/406",
    "text-color": "#ffffff",
    "bubble-color": "#f4d03f",
  },
  {
    id: 3,
    name: { "name-USen": "Tom Nook" },
    species: "Raccoon Dog",
    personality: "Cranky",
    gender: "Male",
    "birthday-string": "May 30th",
    saying: "The customer is always right",
    "catch-phrase": "yes yes",
    hobby: "Business",
    image_uri: "https://acnhapi.com/v1/images/villagers/401",
    "text-color": "#ffffff",
    "bubble-color": "#8b4513",
  },
];

function App() {
  const [showNav, setShowNav] = useState(false);
  const [animalList, setAnimalList] = useState([]);
  const [filteredAnimals, setFilteredAnimals] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedVillager, setSelectedVillager] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Enable keyboard navigation
  useKeyboardNavigation(true);

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

    // Initial check with a slight delay to ensure DOM is ready
    const initialCheck = () => {
      checkBoxes();
      // Run again after a short delay to catch any late-rendering elements
      setTimeout(checkBoxes, 100);
    };

    initialCheck();

    // Cleanup function to remove event listener
    return () => {
      window.removeEventListener("scroll", checkBoxes);
    };
  }, []);

  // Additional effect to check boxes when animal data loads
  useEffect(() => {
    if (animalList.length > 0) {
      const checkBoxes = () => {
        const boxes = document.querySelectorAll(".box");

        boxes.forEach((box) => {
          const boxTop = box.getBoundingClientRect().top;
          // More lenient trigger for initial load
          if (boxTop < window.innerHeight) {
            box.classList.add("show");
          }
        });
      };

      // Small delay to ensure components are rendered
      setTimeout(checkBoxes, 50);
    }
  }, [animalList]);

  useEffect(() => {
    const getAnimals = async () => {
      try {
        setLoading(true);
        setError(null);

        // Try the original API first
        const response = await axios.get("https://acnhapi.com/v1a/villagers/");
        setAnimalList(response.data);
        setFilteredAnimals(response.data);
      } catch (err) {
        console.error("Primary API failed, using fallback data:", err);

        // Try alternative API sources
        try {
          // Note: We'll try mock data for now since the API is down
          console.log("Using mock data as fallback");
          setAnimalList(mockVillagers);
          setFilteredAnimals(mockVillagers);
          setError("Using sample data (API temporarily unavailable)");
        } catch (fallbackErr) {
          setError(
            "Failed to load animal data. Please check your internet connection."
          );
          console.error("All data sources failed:", fallbackErr);
        }
      } finally {
        setLoading(false);
      }
    };
    getAnimals();
  }, []); // Empty dependency array - runs only once on mount

  const toggleNav = () => {
    setShowNav((current) => !current);
  };

  const openVillagerModal = (villager) => {
    setSelectedVillager(villager);
    setIsModalOpen(true);
  };

  const closeVillagerModal = () => {
    setIsModalOpen(false);
    setSelectedVillager(null);
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

  // Only show error page for critical errors, not for fallback data usage
  if (error && !animalList.length) {
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
    <ThemeProvider>
      <CollectionProvider>
        <div className="app-container">
          {/* Skip to main content link for screen readers and keyboard users */}
          <a href="#main-content" className="skip-link">
            Skip to main content
          </a>

          <ThemeToggle />

          <div
            className={showNav ? "show-nav container" : "container"}
            role="main"
            id="main-content"
          >
            {error && animalList.length > 0 && (
              <div
                role="alert"
                aria-live="polite"
                style={{
                  background: "#fff3cd",
                  color: "#856404",
                  padding: "10px",
                  borderRadius: "5px",
                  marginBottom: "20px",
                  border: "1px solid #ffeaa7",
                }}
              >
                ℹ️ {error}
              </div>
            )}

            <header className="app-header">
              <h1 className="sr-only">
                Animal Crossing Villager Collection Manager
              </h1>
            </header>

            <Search onSearchChange={setSearchTerm} />

            <Filter
              animalList={animalList}
              onFilter={setFilteredAnimals}
              searchTerm={searchTerm}
            />

            <CollectionStats
              totalVillagers={animalList.length}
              animalList={animalList}
            />

            <nav className="circle-container" aria-label="Navigation controls">
              <div className="circle">
                <button
                  id="close"
                  onClick={toggleNav}
                  aria-label="Close navigation menu"
                  aria-expanded={showNav}
                >
                  <i className="fas fa-times" aria-hidden="true"></i>
                </button>

                <button
                  id="open"
                  onClick={toggleNav}
                  aria-label="Open navigation menu"
                  aria-expanded={showNav}
                >
                  <i className="fas fa-bars" aria-hidden="true"></i>
                </button>
              </div>
            </nav>

            <main aria-label="Villager gallery">
              <h2 className="sr-only">
                {filteredAnimals.length} villager
                {filteredAnimals.length !== 1 ? "s" : ""} found
                {searchTerm && ` matching "${searchTerm}"`}
              </h2>
              <AnimalList
                animals={filteredAnimals}
                onVillagerClick={openVillagerModal}
              />
            </main>
          </div>
          <Nav />

          <VillagerModal
            villager={selectedVillager}
            isOpen={isModalOpen}
            onClose={closeVillagerModal}
          />
        </div>
      </CollectionProvider>
    </ThemeProvider>
  );
}

export default App;
