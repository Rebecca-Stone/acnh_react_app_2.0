import React from "react";
import { useState } from "react";

export default function Search({ animalList, onFilter }) {
  const [isActive, setIsActive] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  const handleSearch = (event) => {
    const term = event.target.value.toLowerCase();
    setSearchTerm(term);

    if (onFilter && animalList) {
      const filtered = animalList.filter(
        (animal) =>
          animal.name["name-USen"].toLowerCase().includes(term) ||
          animal.species.toLowerCase().includes(term) ||
          animal.personality.toLowerCase().includes(term)
      );
      onFilter(filtered);
    }
  };

  const toggleSearch = () => {
    setIsActive(!isActive);
    if (isActive && searchTerm) {
      // Clear search when closing
      setSearchTerm("");
      if (onFilter) {
        onFilter(animalList); // Reset to all animals
      }
    }
  };

  return (
    <div className={isActive ? "active search" : "search"}>
      <input
        type="text"
        className="input"
        placeholder="Search villagers by name, species, or personality..."
        value={searchTerm}
        onChange={handleSearch}
      />
      <button className="search-btn" onClick={toggleSearch}>
        <i className="fas fa-search"></i>
      </button>
    </div>
  );
}
