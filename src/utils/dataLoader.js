// Enhanced Data Loading System with Real Scraped Data Priority
import realVillagersData from "../data/realVillagers.json";
import sampleVillagersNewFormat from "../data/sampleVillagers";
import { normalizeVillagerData, getCompatibleVillagerData } from "./dataAdapter";

/**
 * Comprehensive data loading system with smart fallbacks
 * Priority: Real scraped data -> ACNH API -> Sample data
 */
export const loadVillagerData = async () => {
  const result = {
    data: [],
    source: "unknown",
    format: "unknown",
    error: null,
    stats: {
      totalVillagers: 0,
      withPosterImages: 0,
      withGiftPreferences: 0,
      withHobbies: 0,
    }
  };

  try {
    // Priority 1: Real scraped comprehensive data
    try {
      console.log("🔄 Loading comprehensive ACNH villager database...");
      
      if (!realVillagersData || !Array.isArray(realVillagersData)) {
        throw new Error("Real data is not properly formatted");
      }

      // Validate data structure
      const sampleVillager = realVillagersData[0];
      if (!sampleVillager.name || !sampleVillager.species) {
        throw new Error("Real data missing required fields");
      }

      // Process real data
      const normalizedData = normalizeVillagerData(realVillagersData);
      const compatibleData = normalizedData.map(villager => 
        getCompatibleVillagerData(villager)
      );

      // Calculate statistics
      const stats = {
        totalVillagers: compatibleData.length,
        withPosterImages: realVillagersData.filter(v => v.poster_image_url).length,
        withGiftPreferences: realVillagersData.filter(v => 
          v.favorite_gifts && 
          (v.favorite_gifts.favorite_styles?.length > 0 || 
           v.favorite_gifts.favorite_colors?.length > 0)
        ).length,
        withHobbies: realVillagersData.filter(v => v.hobby).length,
      };

      result.data = compatibleData;
      result.source = "real";
      result.format = "new";
      result.stats = stats;
      result.error = null;

      console.log(`✅ Successfully loaded ${compatibleData.length} villagers from comprehensive database`);
      console.log(`📊 Data quality: ${stats.withPosterImages} posters, ${stats.withGiftPreferences} gift prefs, ${stats.withHobbies} hobbies`);
      
      return result;

    } catch (realDataError) {
      console.log("❌ Real data unavailable:", realDataError.message);
    }

    // Priority 2: Original ACNH API
    try {
      console.log("🔄 Attempting to load from ACNH API...");
      
      const response = await fetch("https://acnhapi.com/v1a/villagers/", {
        timeout: 10000, // 10 second timeout
      });
      
      if (!response.ok) {
        throw new Error(`API responded with ${response.status}`);
      }

      const rawData = await response.json();
      const normalizedData = normalizeVillagerData(
        Array.isArray(rawData) ? rawData : Object.values(rawData)
      );
      const compatibleData = normalizedData.map(villager => 
        getCompatibleVillagerData(villager)
      );

      result.data = compatibleData;
      result.source = "api";
      result.format = "old";
      result.stats.totalVillagers = compatibleData.length;
      result.error = "✨ Using basic API data. Enhanced features may be limited.";

      console.log(`✅ Successfully loaded ${compatibleData.length} villagers from ACNH API`);
      
      return result;

    } catch (apiError) {
      console.log("❌ ACNH API unavailable:", apiError.message);
    }

    // Priority 3: Enhanced sample data
    console.log("🔄 Loading enhanced sample data...");
    
    const normalizedData = normalizeVillagerData(sampleVillagersNewFormat);
    const compatibleData = normalizedData.map(villager => 
      getCompatibleVillagerData(villager)
    );

    result.data = compatibleData;
    result.source = "sample";
    result.format = "new";
    result.stats.totalVillagers = compatibleData.length;
    result.error = "Using enhanced sample data (APIs temporarily unavailable)";

    console.log(`✅ Loaded ${compatibleData.length} villagers from sample data`);
    
    return result;

  } catch (criticalError) {
    console.error("💥 Critical error in data loading:", criticalError);
    
    result.data = [];
    result.source = "error";
    result.format = "error";
    result.error = "Failed to load villager data. Please refresh the page.";
    
    return result;
  }
};

/**
 * Get data source information for display
 */
export const getDataSourceInfo = (source, stats) => {
  switch (source) {
    case "real":
      return {
        icon: "🎉",
        title: "Complete Database",
        description: `Using comprehensive ACNH database with all ${stats.totalVillagers} villagers`,
        features: [
          `${stats.withPosterImages} poster images`,
          `${stats.withGiftPreferences} gift preferences`, 
          `${stats.withHobbies} hobby data`,
          "Enhanced search capabilities",
          "Rich modal details"
        ],
        quality: "premium"
      };
    
    case "api":
      return {
        icon: "✨",
        title: "Basic API Data",
        description: `Using official ACNH API with ${stats.totalVillagers} villagers`,
        features: [
          "Basic villager information",
          "Standard search functionality",
          "Limited enhanced features"
        ],
        quality: "standard"
      };
    
    case "sample":
      return {
        icon: "ℹ️",
        title: "Sample Data",
        description: `Using sample data with ${stats.totalVillagers} villagers for demonstration`,
        features: [
          "Basic functionality",
          "Limited villager set",
          "Offline capability"
        ],
        quality: "demo"
      };
    
    default:
      return {
        icon: "⚠️",
        title: "No Data",
        description: "Unable to load villager data",
        features: [],
        quality: "error"
      };
  }
};

/**
 * Validate data integrity and structure
 */
export const validateDataIntegrity = (data, source) => {
  const issues = [];
  
  if (!Array.isArray(data)) {
    issues.push("Data is not an array");
    return { isValid: false, issues };
  }
  
  if (data.length === 0) {
    issues.push("No villager data found");
    return { isValid: false, issues };
  }
  
  // Check required fields
  const requiredFields = ["name", "species", "personality"];
  const sampleVillager = data[0];
  
  for (const field of requiredFields) {
    if (!sampleVillager[field]) {
      issues.push(`Missing required field: ${field}`);
    }
  }
  
  // Check data consistency
  const villagersWithMissingNames = data.filter(v => 
    !v.name || 
    (typeof v.name === "object" && !v.name["name-USen"]) ||
    (typeof v.name === "string" && !v.name.trim())
  ).length;
  
  if (villagersWithMissingNames > 0) {
    issues.push(`${villagersWithMissingNames} villagers have missing or invalid names`);
  }
  
  // Source-specific validations
  if (source === "real") {
    const villagersWithEnhancedData = data.filter(v => v.poster_image_url || v.hobby).length;
    if (villagersWithEnhancedData === 0) {
      issues.push("Real data source lacks enhanced features");
    }
  }
  
  const warningThreshold = data.length * 0.1; // 10% warning threshold
  const hasWarnings = villagersWithMissingNames > warningThreshold;
  
  return {
    isValid: issues.length === 0,
    issues,
    hasWarnings,
    stats: {
      total: data.length,
      withMissingNames: villagersWithMissingNames,
      validPercentage: ((data.length - villagersWithMissingNames) / data.length * 100).toFixed(1)
    }
  };
};
