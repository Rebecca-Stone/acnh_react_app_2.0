import "./App.css";
import "./styles/utilities.css";
import "./styles/EnhancedModal.css";

import "./styles/HamburgerMenu.css";
import "./styles/EnhancedBackground.css";
import "./styles/EnhancedSearch.css";
import { useState, useEffect, useCallback } from "react";
// axios removed - no longer needed

import AnimalList from "./animalComponents/AnimalList";
import UnifiedSearch from "./components/UnifiedSearch";
import Filter from "./helpers/Filter";
import EnhancedVillagerModal from "./components/EnhancedVillagerModal";
import CollectionStats from "./components/CollectionStats";
import ThemeToggle from "./components/ThemeToggle";
import HamburgerMenu from "./components/HamburgerMenu";
import { CollectionProvider } from "./contexts/CollectionContext";
import { ThemeProvider } from "./contexts/ThemeContext";
import { useKeyboardNavigation } from "./hooks/useKeyboardNavigation";
// import {
//   getCompatibleVillagerData,
// } from "./utils/dataAdapter";
import {
  loadVillagerData,
  getDataSourceInfo,
  validateDataIntegrity,
} from "./utils/dataLoader";
import {
  measurePerformance,
  isLowEndDevice as checkIsLowEndDevice,
} from "./utils/performanceUtils";
// import sampleVillagersNewFormat from "./data/sampleVillagers";

// Convert new format sample data to compatible format for existing components
// const getCompatibleSampleData = () => {
//   return sampleVillagersNewFormat.map((villager) =>
//     getCompatibleVillagerData(villager)
//   );
// };

function App() {
  const [showNav, setShowNav] = useState(false);
  const [animalList, setAnimalList] = useState([]);
  const [filteredAnimals, setFilteredAnimals] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedVillager, setSelectedVillager] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const [dataFormat, setDataFormat] = useState("mixed"); // Track data format: 'old', 'new', or 'mixed'
  const [dataSource, setDataSource] = useState("unknown"); // Track data source: 'real', 'api', 'sample'
  const [dataStats, setDataStats] = useState({}); // Statistics about loaded data
  const [isLowEndDevice, setIsLowEndDevice] = useState(false); // Track device performance

  // Enable keyboard navigation
  useKeyboardNavigation(true);

  // Add keyboard event handling for navigation
  useEffect(() => {
    const handleKeyDown = (event) => {
      if (event.key === "Escape" && showNav) {
        closeNav();
      }
    };

    if (showNav) {
      document.addEventListener("keydown", handleKeyDown);
    }

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [showNav]);

  // Ensure navigation is closed on component mount (cleanup any stuck state)
  useEffect(() => {
    closeNav();

    // Force cleanup any stuck CSS classes or transforms that might be left over
    const cleanupStuckStates = () => {
      try {
        console.log("🧹 Starting cleanup of stuck states...");

        // Remove any old nav classes from all elements
        document.querySelectorAll(".show-nav").forEach((el) => {
          el.classList.remove("show-nav");
        });

        // Reset transforms on body and html
        document.body.style.transform = "";
        document.documentElement.style.transform = "";

        // CRITICAL: Reset body overflow that might be stuck from modal
        document.body.style.overflow = "";
        document.body.style.overflowX = "";
        document.body.style.overflowY = "";

        // Reset any stuck container transforms
        document.querySelectorAll(".container").forEach((el) => {
          el.style.transform = "";
          el.classList.remove("show-nav");
        });

        // Reset app container
        document.querySelectorAll(".app-container").forEach((el) => {
          el.style.transform = "";
        });

        // Clean up any orphaned modal elements or screen reader announcements
        document.querySelectorAll('[aria-live="polite"]').forEach((el) => {
          if (
            el.className === "sr-only" &&
            el.textContent.includes("Modal opened:")
          ) {
            el.remove();
          }
        });

        console.log("✅ Successfully cleaned up all stuck states");
      } catch (error) {
        console.error("❌ Error during cleanup:", error);
      }
    };

    cleanupStuckStates();
  }, []);

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

        // Check device performance capabilities
        const devicePerf = checkIsLowEndDevice();
        setIsLowEndDevice(devicePerf);
        if (devicePerf) {
          console.log(
            "📱 Low-end device detected, enabling performance optimizations"
          );
        }

        // Use the comprehensive data loader with performance measurement
        const result = await measurePerformance("data-loading", () =>
          loadVillagerData()
        );

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

  const closeNav = () => {
    setShowNav(false);
  };

  // Close navigation when modal opens to prevent conflicts
  const openVillagerModal = useCallback((villager) => {
    setSelectedVillager(villager);
    setIsModalOpen(true);
    closeNav(); // Close navigation to prevent UI conflicts
  }, []);

  const closeVillagerModal = useCallback(() => {
    setIsModalOpen(false);
    setSelectedVillager(null);
  }, []);

  // Memoized search change handler to prevent unnecessary re-renders
  const handleSearchChange = useCallback((term) => {
    setSearchTerm(term);
  }, []);

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

          {/* Enhanced App Header Section - provides spacing and visual structure */}
          <div className="app-header-section">
            <div className="header-spacer"></div>
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
            onClick={(e) => {
              // Close navigation when clicking the backdrop (but not nav content)
              if (e.target === e.currentTarget) {
                closeNav();
              }
            }}
          >
            <nav role="navigation" aria-label="Main navigation">
              <ul className="nav-list">
                <li className="nav-item">
                  <a href="#home" className="nav-link" onClick={closeNav}>
                    <i className="fas fa-home nav-icon" aria-hidden="true"></i>
                    <span>Home</span>
                  </a>
                </li>
                <li className="nav-item">
                  <a href="#about" className="nav-link" onClick={closeNav}>
                    <i
                      className="fas fa-user-alt nav-icon"
                      aria-hidden="true"
                    ></i>
                    <span>About</span>
                  </a>
                </li>
                <li className="nav-item">
                  <a href="#contact" className="nav-link" onClick={closeNav}>
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
                  background:
                    dataSource === "real"
                      ? "#d4edda"
                      : dataSource === "api"
                      ? "#fff3cd"
                      : "#fff3cd",
                  color:
                    dataSource === "real"
                      ? "#155724"
                      : dataSource === "api"
                      ? "#856404"
                      : "#856404",
                  padding: "12px 16px",
                  borderRadius: "8px",
                  marginBottom: "20px",
                  border: `1px solid ${
                    dataSource === "real"
                      ? "#c3e6cb"
                      : dataSource === "api"
                      ? "#ffeaa7"
                      : "#ffeaa7"
                  }`,
                  display: "flex",
                  alignItems: "center",
                  gap: "8px",
                  fontSize: "14px",
                  fontWeight: "500",
                }}
              >
                <span>
                  {dataSource === "real"
                    ? "🎉"
                    : dataSource === "api"
                    ? "✨"
                    : "ℹ️"}
                </span>
                <div>
                  {dataSource === "real" ? (
                    <div>
                      <strong>Complete ACNH Database Loaded!</strong>
                      <div
                        style={{
                          fontSize: "12px",
                          opacity: 0.9,
                          marginTop: "4px",
                        }}
                      >
                        {dataStats.totalVillagers} villagers •{" "}
                        {dataStats.withPosterImages} posters •{" "}
                        {dataStats.withGiftPreferences} gift preferences •{" "}
                        {dataStats.withHobbies} hobbies
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

            <UnifiedSearch
              onSearchChange={handleSearchChange}
              animalList={animalList}
              variant={isLowEndDevice ? "optimized" : "enhanced"}
              isLowEndDevice={isLowEndDevice}
            />

            <Filter
              animalList={animalList}
              onFilter={setFilteredAnimals}
              searchTerm={searchTerm}
            />

            <CollectionStats
              totalVillagers={animalList.length}
              animalList={animalList}
            />

            {/* Debug info for data format */}
            <div className="sr-only" aria-live="polite">
              Data loaded in {dataFormat} format with enhanced modal
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
          <EnhancedVillagerModal
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
