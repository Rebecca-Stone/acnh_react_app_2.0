import React from "react";
import { useState } from "react";

export default function Search({ onSearchChange }) {
  const [isActive, setIsActive] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  const handleSearch = (event) => {
    const term = event.target.value;
    setSearchTerm(term);
    onSearchChange(term); // Pass search term to parent
  };

  const toggleSearch = () => {
    setIsActive(!isActive);
    if (isActive && searchTerm) {
      // Clear search when closing
      setSearchTerm("");
      onSearchChange(""); // Clear search in parent
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
