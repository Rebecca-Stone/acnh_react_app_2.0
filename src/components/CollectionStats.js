import React from "react";
import { useCollection } from "../contexts/CollectionContext";

export default function CollectionStats({ totalVillagers, animalList }) {
  const { haveList, getCollectionStats } = useCollection();
  const stats = getCollectionStats();

  // Calculate percentages
  const havePercentage =
    totalVillagers > 0 ? (stats.haveCount / totalVillagers) * 100 : 0;
  const wantPercentage =
    totalVillagers > 0 ? (stats.wantCount / totalVillagers) * 100 : 0;
  const trackedPercentage =
    totalVillagers > 0 ? (stats.totalTracked / totalVillagers) * 100 : 0;

  // Get favorite stats from collection
  const getFavoriteStats = () => {
    if (!animalList || animalList.length === 0 || haveList.length === 0) {
      return null;
    }

    const collectedVillagers = animalList.filter((v) =>
      haveList.includes(v.id)
    );

    // Count species in collection
    const speciesCount = {};
    const personalityCount = {};

    collectedVillagers.forEach((villager) => {
      speciesCount[villager.species] =
        (speciesCount[villager.species] || 0) + 1;
      personalityCount[villager.personality] =
        (personalityCount[villager.personality] || 0) + 1;
    });

    const favoriteSpecies = Object.keys(speciesCount).reduce(
      (a, b) => (speciesCount[a] > speciesCount[b] ? a : b),
      Object.keys(speciesCount)[0]
    );

    const favoritePersonality = Object.keys(personalityCount).reduce(
      (a, b) => (personalityCount[a] > personalityCount[b] ? a : b),
      Object.keys(personalityCount)[0]
    );

    return {
      favoriteSpecies: favoriteSpecies || "None yet",
      favoritePersonality: favoritePersonality || "None yet",
      speciesCount: speciesCount[favoriteSpecies] || 0,
      personalityCount: personalityCount[favoritePersonality] || 0,
    };
  };

  const favoriteStats = getFavoriteStats();

  const getMotivationalMessage = () => {
    if (stats.haveCount === 0 && stats.wantCount === 0) {
      return "Start building your collection! Click the ❤️ and ⭐ buttons on villager cards.";
    } else if (stats.haveCount === 0) {
      return "You have a wishlist! Time to start collecting your favorite villagers.";
    } else if (stats.haveCount < 5) {
      return "Great start! Keep building your collection.";
    } else if (stats.haveCount < 10) {
      return "You're building an impressive collection!";
    } else {
      return "Wow! You're a serious collector! 🏆";
    }
  };

  return (
    <div className="collection-stats">
      <div className="stats-header">
        <h2>
          <i className="fas fa-chart-bar"></i> Collection Stats
        </h2>
        <p className="motivational-message">{getMotivationalMessage()}</p>
      </div>

      <div className="stats-grid">
        <div className="stat-card have-stat">
          <div className="stat-icon">
            <i className="fas fa-heart"></i>
          </div>
          <div className="stat-content">
            <h3>Collection</h3>
            <div className="stat-number">{stats.haveCount}</div>
            <div className="stat-subtitle">villagers owned</div>
            <div className="progress-bar">
              <div
                className="progress-fill have-progress"
                style={{ width: `${Math.min(havePercentage, 100)}%` }}
              ></div>
            </div>
            <small>{havePercentage.toFixed(1)}% of available</small>
          </div>
        </div>

        <div className="stat-card want-stat">
          <div className="stat-icon">
            <i className="fas fa-star"></i>
          </div>
          <div className="stat-content">
            <h3>Wishlist</h3>
            <div className="stat-number">{stats.wantCount}</div>
            <div className="stat-subtitle">villagers wanted</div>
            <div className="progress-bar">
              <div
                className="progress-fill want-progress"
                style={{ width: `${Math.min(wantPercentage, 100)}%` }}
              ></div>
            </div>
            <small>{wantPercentage.toFixed(1)}% of available</small>
          </div>
        </div>

        <div className="stat-card total-stat">
          <div className="stat-icon">
            <i className="fas fa-list"></i>
          </div>
          <div className="stat-content">
            <h3>Total Tracked</h3>
            <div className="stat-number">{stats.totalTracked}</div>
            <div className="stat-subtitle">villagers tracked</div>
            <div className="progress-bar">
              <div
                className="progress-fill total-progress"
                style={{ width: `${Math.min(trackedPercentage, 100)}%` }}
              ></div>
            </div>
            <small>{trackedPercentage.toFixed(1)}% of available</small>
          </div>
        </div>
      </div>

      {favoriteStats && stats.haveCount > 0 && (
        <div className="favorite-stats">
          <h3>
            <i className="fas fa-trophy"></i> Collection Insights
          </h3>
          <div className="insight-grid">
            <div className="insight-item">
              <span className="insight-label">Favorite Species:</span>
              <span className="insight-value">
                {favoriteStats.favoriteSpecies}
                {favoriteStats.speciesCount > 1 &&
                  ` (${favoriteStats.speciesCount})`}
              </span>
            </div>
            <div className="insight-item">
              <span className="insight-label">Favorite Personality:</span>
              <span className="insight-value">
                {favoriteStats.favoritePersonality}
                {favoriteStats.personalityCount > 1 &&
                  ` (${favoriteStats.personalityCount})`}
              </span>
            </div>
          </div>
        </div>
      )}

      {stats.totalTracked === 0 && (
        <div className="empty-state">
          <i className="fas fa-paw"></i>
          <p>
            Start by clicking the ❤️ (Have) or ⭐ (Want) buttons on villager
            cards!
          </p>
          <p>
            Your collection stats will appear here as you build your island
            community.
          </p>
        </div>
      )}
    </div>
  );
}
