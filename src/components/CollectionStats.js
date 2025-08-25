import React, { useMemo } from "react";
import { useCollection } from "../contexts/CollectionContext";

const CollectionStats = React.memo(function CollectionStats({ totalVillagers, animalList }) {
  const { haveList, getCollectionStats } = useCollection();
  const stats = getCollectionStats();

  // Memoize expensive percentage calculations
  const percentages = useMemo(() => ({
    have: totalVillagers > 0 ? (stats.haveCount / totalVillagers) * 100 : 0,
    want: totalVillagers > 0 ? (stats.wantCount / totalVillagers) * 100 : 0,
    tracked: totalVillagers > 0 ? (stats.totalTracked / totalVillagers) * 100 : 0,
  }), [totalVillagers, stats.haveCount, stats.wantCount, stats.totalTracked]);

  // Memoize expensive favorite stats calculation
  const favoriteStats = useMemo(() => {
    if (!animalList || animalList.length === 0 || haveList.length === 0) {
      return null;
    }

    console.log(`📊 Calculating collection insights for ${haveList.length} collected villagers`);

    const collectedVillagers = animalList.filter((v) =>
      haveList.includes(v.id)
    );

    // Count species and personalities in collection
    const speciesCount = {};
    const personalityCount = {};

    collectedVillagers.forEach((villager) => {
      const species = villager.species || "Unknown";
      const personality = villager.personality || "Unknown";
      
      speciesCount[species] = (speciesCount[species] || 0) + 1;
      personalityCount[personality] = (personalityCount[personality] || 0) + 1;
    });

    if (Object.keys(speciesCount).length === 0) return null;

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
  }, [animalList, haveList]);

  // Memoize motivational message to avoid recalculation
  const motivationalMessage = useMemo(() => {
    if (stats.haveCount === 0 && stats.wantCount === 0) {
      return "Start building your collection! Click the ❤️ and ⭐ buttons on villager cards.";
    } else if (stats.haveCount === 0) {
      return "You have a wishlist! Time to start collecting your favorite villagers.";
    } else if (stats.haveCount < 5) {
      return "Great start! Keep building your collection.";
    } else if (stats.haveCount < 10) {
      return "You're building an impressive collection!";
    } else if (stats.haveCount >= 50) {
      return "🎉 Master Collector! You have an amazing collection!";
    } else {
      return "Wow! You're a serious collector! 🏆";
    }
  }, [stats.haveCount, stats.wantCount]);

  return (
    <div className="collection-stats">
      <div className="stats-header">
        <h2>
          <i className="fas fa-chart-bar"></i> Collection Stats
        </h2>
        <p className="motivational-message">{motivationalMessage}</p>
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
                style={{ width: `${Math.min(percentages.have, 100)}%` }}
              ></div>
            </div>
            <small>{percentages.have.toFixed(1)}% of available</small>
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
                style={{ width: `${Math.min(percentages.want, 100)}%` }}
              ></div>
            </div>
            <small>{percentages.want.toFixed(1)}% of available</small>
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
                style={{ width: `${Math.min(percentages.tracked, 100)}%` }}
              ></div>
            </div>
            <small>{percentages.tracked.toFixed(1)}% of available</small>
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
          <p>Your collection stats will appear here as you build collection.</p>
        </div>
      )}
    </div>
  );
}, (prevProps, nextProps) => {
  // Optimize re-renders by comparing props
  return (
    prevProps.totalVillagers === nextProps.totalVillagers &&
    prevProps.animalList === nextProps.animalList
  );
});

export default CollectionStats;
