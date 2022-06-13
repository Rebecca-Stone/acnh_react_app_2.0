import React from "react";
import { useState } from "react";

export default function Search() {
  const [isActive, setIsActive] = useState(false);
  return (
    <div className={isActive ? "active search" : "search"}>
      <input type="text" class="input" placeholder="Search..." />
      <button
        className="search-btn"
        onClick={() => {
          setIsActive(!isActive);
        }}
      >
        <i class="fas fa-search"></i>
      </button>
    </div>
  );
}
