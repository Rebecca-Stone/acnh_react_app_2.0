import "./App.css";
import "./styles/EnhancedModal.css";
import "./styles/ModalToggle.css";
import "./styles/SchemaValidator.css";
import "./styles/HamburgerMenu.css";
import "./styles/EnhancedBackground.css";
import "./styles/EnhancedSearch.css";
import { useState, useEffect } from "react";
import axios from "axios";

import AnimalList from "./animalComponents/AnimalList";
import Search from "./helpers/Search";
import EnhancedSearch from "./components/EnhancedSearch";
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
import { loadVillagerData, getDataSourceInfo, validateDataIntegrity } from "./utils/dataLoader";
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
  const [useEnhancedSearch, setUseEnhancedSearch] = useState(true); // Toggle between search types
  const [dataFormat, setDataFormat] = useState("mixed"); // Track data format: 'old', 'new', or 'mixed'
  const [dataSource, setDataSource] = useState("unknown"); // Track data source: 'real', 'api', 'sample'
  const [dataStats, setDataStats] = useState({}); // Statistics about loaded data

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

        console.log("🚀 Initializing ACNH villager data loading system...");
        
        // Use the comprehensive data loader
        const result = await loadVillagerData();
        
        // Validate data integrity
        const validation = validateDataIntegrity(result.data, result.source);
        if (!validation.isValid) {
          console.warn("⚠️ Data validation issues:", validation.issues);
        }

        // Update state with loaded data
        setAnimalList(result.data);
        setDataFormat(result.format);
        setDataSource(result.source);
        setDataStats(result.stats);
        
        // Set appropriate error/info messages
        if (result.error) {
          setError(result.error);
        } else {
          setError(null);
        }

        // Log success details
        const sourceInfo = getDataSourceInfo(result.source, result.stats);
        console.log(`🎉 ${sourceInfo.title}: ${sourceInfo.description}`);
        if (sourceInfo.features.length > 0) {
          console.log("✨ Available features:", sourceInfo.features.join(", "));
        }

      } catch (err) {
        console.error("💥 Critical error in data loading system:", err);
        setError("Failed to load villager data. Please refresh the page.");
        setAnimalList([]);
        setDataFormat("error");
        setDataSource("error");
        setDataStats({});
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

              {/* Search Type Toggle */}
              <div className="modal-toggle-section">
                <label className="modal-toggle-label">
                  <input
                    type="checkbox"
                    checked={useEnhancedSearch}
                    onChange={(e) => setUseEnhancedSearch(e.target.checked)}
                    className="modal-toggle-checkbox"
                  />
                  <span className="modal-toggle-text">
                    {useEnhancedSearch ? "✨ Enhanced" : "📝 Basic"} Search
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
            {(error || dataSource === "real") && animalList.length > 0 && (
              <div
                role="alert"
                aria-live="polite"
                className="data-status-alert"
                style={{
                  background: dataSource === "real" ? "#d4edda" : dataSource === "api" ? "#fff3cd" : "#fff3cd",
                  color: dataSource === "real" ? "#155724" : dataSource === "api" ? "#856404" : "#856404",
                  padding: "12px 16px",
                  borderRadius: "8px",
                  marginBottom: "20px",
                  border: `1px solid ${dataSource === "real" ? "#c3e6cb" : dataSource === "api" ? "#ffeaa7" : "#ffeaa7"}`,
                  display: "flex",
                  alignItems: "center",
                  gap: "8px",
                  fontSize: "14px",
                  fontWeight: "500",
                }}
              >
                <span>
                  {dataSource === "real" ? "🎉" : dataSource === "api" ? "✨" : "ℹ️"}
                </span>
                <div>
                  {dataSource === "real" ? (
                    <div>
                      <strong>Complete ACNH Database Loaded!</strong>
                      <div style={{ fontSize: "12px", opacity: 0.9, marginTop: "4px" }}>
                        {dataStats.totalVillagers} villagers • {dataStats.withPosterImages} posters • {dataStats.withGiftPreferences} gift preferences • {dataStats.withHobbies} hobbies
                      </div>
                    </div>
                  ) : (
                    error
                  )}
                </div>
              </div>
            )}

            <header className="app-header">
              <h1 className="sr-only">
                Animal Crossing Villager Collection Manager
              </h1>
            </header>

            {useEnhancedSearch ? (
              <EnhancedSearch
                onSearchChange={setSearchTerm}
                animalList={animalList}
              />
            ) : (
              <Search onSearchChange={setSearchTerm} />
            )}

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
