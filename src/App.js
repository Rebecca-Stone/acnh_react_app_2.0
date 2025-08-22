import "./App.css";
import "./styles/EnhancedModal.css";
import "./styles/ModalToggle.css";
import "./styles/SchemaValidator.css";
import "./styles/HamburgerMenu.css";
import "./styles/EnhancedBackground.css";
import { useState, useEffect } from "react";
import axios from "axios";

import AnimalList from "./animalComponents/AnimalList";
import Search from "./helpers/Search";
import Filter from "./helpers/Filter";
import VillagerModal from "./components/VillagerModal";
import EnhancedVillagerModal from "./components/EnhancedVillagerModal";
import CollectionStats from "./components/CollectionStats";
import ThemeToggle from "./components/ThemeToggle";
import SchemaValidator from "./components/SchemaValidator";
import HamburgerMenu from "./components/HamburgerMenu";
import { CollectionProvider } from "./contexts/CollectionContext";
import { ThemeProvider } from "./contexts/ThemeContext";
import { useKeyboardNavigation } from "./hooks/useKeyboardNavigation";
import {
  normalizeVillagerData,
  getCompatibleVillagerData,
} from "./utils/dataAdapter";
import sampleVillagersNewFormat from "./data/sampleVillagers";

// Convert new format sample data to compatible format for existing components
const getCompatibleSampleData = () => {
  return sampleVillagersNewFormat.map((villager) =>
    getCompatibleVillagerData(villager)
  );
};

function App() {
  const [showNav, setShowNav] = useState(false);
  const [animalList, setAnimalList] = useState([]);
  const [filteredAnimals, setFilteredAnimals] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedVillager, setSelectedVillager] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [useEnhancedModal, setUseEnhancedModal] = useState(true); // Toggle between modal types
  const [showValidator, setShowValidator] = useState(false); // Toggle schema validator
  const [dataFormat, setDataFormat] = useState("mixed"); // Track data format: 'old', 'new', or 'mixed'

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

        // Try to load data from multiple sources
        let rawData = null;
        let sourceFormat = "unknown";

        try {
          // Try the original ACNH API first
          console.log("Attempting to load from ACNH API...");
          const response = await axios.get(
            "https://acnhapi.com/v1a/villagers/"
          );
          rawData = response.data;
          sourceFormat = "old";
          console.log("Successfully loaded from ACNH API (old format)");
        } catch (apiErr) {
          console.log("ACNH API unavailable, trying alternative sources...");

          // Try loading from a new format API (placeholder for future)
          try {
            // Future: const newFormatResponse = await axios.get("https://api.newformat.com/villagers");
            // rawData = newFormatResponse.data;
            // sourceFormat = "new";
            throw new Error("New format API not yet available");
          } catch (newApiErr) {
            console.log("No external APIs available, using sample data");
            rawData = sampleVillagersNewFormat;
            sourceFormat = "new";
            setError(
              "Using enhanced sample data (APIs temporarily unavailable)"
            );
          }
        }

        // Normalize data regardless of source format
        let normalizedData = [];

        if (sourceFormat === "old") {
          // Convert old API data to compatible format
          normalizedData = Object.values(rawData).map((villager) =>
            getCompatibleVillagerData(normalizeVillagerData([villager])[0])
          );
          setDataFormat("old");
        } else if (sourceFormat === "new") {
          // Convert new format data to compatible format for existing components
          normalizedData = rawData.map((villager) =>
            getCompatibleVillagerData(villager)
          );
          setDataFormat("new");
        }

        // Filter out any invalid entries
        const validData = normalizedData.filter(
          (villager) =>
            villager &&
            villager.name &&
            typeof villager.name === "object" &&
            villager.name["name-USen"]
        );

        console.log(
          `Loaded ${validData.length} villagers in ${sourceFormat} format`
        );
        setAnimalList(validData);
        setFilteredAnimals(validData);
      } catch (err) {
        console.error("All data loading methods failed:", err);

        // Last resort: use compatible sample data
        const fallbackData = getCompatibleSampleData();
        setAnimalList(fallbackData);
        setFilteredAnimals(fallbackData);
        setDataFormat("fallback");
        setError("Using offline sample data (connection issues detected)");
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

          {/* Enhanced App Header Section */}
          <div className="app-header-section">
            <div className="header-controls">
              {/* Modal Type Toggle */}
              <div className="modal-toggle-section">
                <label className="modal-toggle-label">
                  <input
                    type="checkbox"
                    checked={useEnhancedModal}
                    onChange={(e) => setUseEnhancedModal(e.target.checked)}
                    className="modal-toggle-checkbox"
                  />
                  <span className="modal-toggle-text">
                    {useEnhancedModal ? "🎨 Enhanced" : "📝 Basic"} Modal
                  </span>
                </label>
              </div>

              {/* Schema Validator Toggle */}
              <div className="modal-toggle-section">
                <label className="modal-toggle-label">
                  <input
                    type="checkbox"
                    checked={showValidator}
                    onChange={(e) => setShowValidator(e.target.checked)}
                    className="modal-toggle-checkbox"
                  />
                  <span className="modal-toggle-text">
                    {showValidator ? "🔍 Hide" : "🔍 Show"} Schema Validator
                  </span>
                </label>
              </div>
            </div>
          </div>

          {/* Enhanced Theme Toggle - Fixed Position */}
          <ThemeToggle />

          {/* Enhanced Hamburger Menu */}
          <HamburgerMenu isOpen={showNav} onToggle={toggleNav} />

          {/* Enhanced Navigation Overlay */}
          <div
            className={`nav-container ${
              showNav ? "nav-container--active" : ""
            }`}
          >
            <nav role="navigation" aria-label="Main navigation">
              <ul className="nav-list">
                <li className="nav-item">
                  <a href="#home" className="nav-link">
                    <i className="fas fa-home nav-icon" aria-hidden="true"></i>
                    <span>Home</span>
                  </a>
                </li>
                <li className="nav-item">
                  <a href="#about" className="nav-link">
                    <i
                      className="fas fa-user-alt nav-icon"
                      aria-hidden="true"
                    ></i>
                    <span>About</span>
                  </a>
                </li>
                <li className="nav-item">
                  <a href="#contact" className="nav-link">
                    <i
                      className="fas fa-envelope nav-icon"
                      aria-hidden="true"
                    ></i>
                    <span>Contact</span>
                  </a>
                </li>
              </ul>
            </nav>
          </div>

          <div
            className={`main-content ${
              showNav ? "main-content--nav-open" : ""
            }`}
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

            {/* Schema Validator */}
            {showValidator && (
              <SchemaValidator
                onValidatedData={(validatedData) => {
                  console.log("Validated data received:", validatedData);
                  // Could implement functionality to load validated data into the app
                }}
              />
            )}

            {/* Debug info for data format */}
            <div className="sr-only" aria-live="polite">
              Data loaded in {dataFormat} format with{" "}
              {useEnhancedModal ? "enhanced" : "basic"} modal
            </div>

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

          {/* Villager Detail Modal */}
          {useEnhancedModal ? (
            <EnhancedVillagerModal
              villager={selectedVillager}
              isOpen={isModalOpen}
              onClose={closeVillagerModal}
            />
          ) : (
            <VillagerModal
              villager={selectedVillager}
              isOpen={isModalOpen}
              onClose={closeVillagerModal}
            />
          )}
        </div>
      </CollectionProvider>
    </ThemeProvider>
  );
}

export default App;
