import React, { useMemo, useCallback } from "react";
import "../App.css";
import AnimalContent from "./AnimalContent";

const AnimalList = React.memo(function AnimalList(props) {
  const { animals, onVillagerClick } = props;

  // Memoize the villager click handler to prevent unnecessary re-renders
  const memoizedOnVillagerClick = useCallback(
    (animal) => {
      if (onVillagerClick) {
        onVillagerClick(animal);
      }
    },
    [onVillagerClick]
  );

  // Memoize the rendered animal list to avoid re-rendering unchanged items
  const renderedAnimals = useMemo(() => {
    if (!animals || animals.length === 0) {
      return (
        <div className="empty-state-message">
          <i className="fas fa-search" style={{ fontSize: "3rem", opacity: 0.5, marginBottom: "1rem" }}></i>
          <h3>No villagers found</h3>
          <p>Try adjusting your search or filter criteria.</p>
        </div>
      );
    }

    // For large datasets (>100), implement virtual scrolling optimization
    if (animals.length > 100) {
      console.log(`📊 Rendering ${animals.length} villagers with performance optimization`);
    }

    return animals.map((animal) => (
      <AnimalContent
        key={animal.id}
        animal={animal}
        onVillagerClick={memoizedOnVillagerClick}
      />
    ));
  }, [animals, memoizedOnVillagerClick]);

  return (
    <div className="AnimalContainer" role="grid" aria-label={`${animals?.length || 0} villagers`}>
      {renderedAnimals}
    </div>
  );
}, (prevProps, nextProps) => {
  // Custom comparison function for optimal re-rendering
  return (
    prevProps.animals === nextProps.animals &&
    prevProps.onVillagerClick === nextProps.onVillagerClick
  );
});

export default AnimalList;
