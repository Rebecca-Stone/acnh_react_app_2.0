// Performance optimization utilities for large datasets

/**
 * Debounce function to limit the rate of function calls
 * @param {Function} func - Function to debounce
 * @param {number} delay - Delay in milliseconds
 * @returns {Function} Debounced function
 */
export const debounce = (func, delay) => {
  let timeoutId;
  return (...args) => {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => func.apply(null, args), delay);
  };
};

/**
 * Throttle function to limit function execution frequency
 * @param {Function} func - Function to throttle
 * @param {number} delay - Minimum delay between calls
 * @returns {Function} Throttled function
 */
export const throttle = (func, delay) => {
  let inThrottle;
  return (...args) => {
    if (!inThrottle) {
      func.apply(null, args);
      inThrottle = true;
      setTimeout(() => inThrottle = false, delay);
    }
  };
};

/**
 * Memoize function results to avoid expensive recalculations
 * @param {Function} fn - Function to memoize
 * @param {Function} getKey - Function to generate cache key
 * @returns {Function} Memoized function
 */
export const memoize = (fn, getKey = (...args) => JSON.stringify(args)) => {
  const cache = new Map();
  
  return (...args) => {
    const key = getKey(...args);
    
    if (cache.has(key)) {
      return cache.get(key);
    }
    
    const result = fn(...args);
    cache.set(key, result);
    
    // Limit cache size to prevent memory leaks
    if (cache.size > 1000) {
      const firstKey = cache.keys().next().value;
      cache.delete(firstKey);
    }
    
    return result;
  };
};

/**
 * Create a batched update function to reduce DOM updates
 * @param {Function} updateFn - Function to batch
 * @returns {Function} Batched function
 */
export const batchUpdates = (updateFn) => {
  let pendingUpdates = [];
  let isScheduled = false;

  const flush = () => {
    const updates = [...pendingUpdates];
    pendingUpdates = [];
    isScheduled = false;
    updateFn(updates);
  };

  return (update) => {
    pendingUpdates.push(update);
    
    if (!isScheduled) {
      isScheduled = true;
      requestAnimationFrame(flush);
    }
  };
};

/**
 * Simple virtual scrolling implementation for large lists
 * @param {Array} items - All items to render
 * @param {number} containerHeight - Container height in pixels
 * @param {number} itemHeight - Height of each item in pixels
 * @param {number} scrollTop - Current scroll position
 * @param {number} buffer - Number of extra items to render (default: 5)
 * @returns {Object} Visible items and offset
 */
export const getVirtualScrollItems = (items, containerHeight, itemHeight, scrollTop, buffer = 5) => {
  const startIndex = Math.max(0, Math.floor(scrollTop / itemHeight) - buffer);
  const endIndex = Math.min(
    items.length - 1,
    Math.ceil((scrollTop + containerHeight) / itemHeight) + buffer
  );
  
  const visibleItems = items.slice(startIndex, endIndex + 1);
  const offsetY = startIndex * itemHeight;
  
  return {
    visibleItems,
    startIndex,
    endIndex,
    offsetY,
    totalHeight: items.length * itemHeight
  };
};

/**
 * Measure component performance
 * @param {string} name - Performance mark name
 * @param {Function} fn - Function to measure
 * @returns {*} Function result
 */
export const measurePerformance = (name, fn) => {
  const startMark = `${name}-start`;
  const endMark = `${name}-end`;
  const measureName = `${name}-measure`;

  performance.mark(startMark);
  const result = fn();
  performance.mark(endMark);
  
  try {
    performance.measure(measureName, startMark, endMark);
    const measure = performance.getEntriesByName(measureName)[0];
    console.log(`⚡ ${name}: ${measure.duration.toFixed(2)}ms`);
  } catch (error) {
    console.warn(`Performance measurement failed for ${name}:`, error);
  }
  
  return result;
};

/**
 * Check if the device has limited resources
 * @returns {boolean} True if device appears to have limited resources
 */
export const isLowEndDevice = () => {
  // Check various indicators of device performance
  const checks = {
    // Low CPU core count
    lowCores: navigator.hardwareConcurrency && navigator.hardwareConcurrency <= 2,
    
    // Low memory (if available)
    lowMemory: navigator.deviceMemory && navigator.deviceMemory <= 2,
    
    // Slow network connection
    slowConnection: navigator.connection && 
      (navigator.connection.effectiveType === 'slow-2g' || 
       navigator.connection.effectiveType === '2g'),
    
    // Battery saver mode (if available)
    batterySaver: navigator.getBattery && 
      navigator.getBattery().then(battery => battery.level < 0.2),
  };

  // Return true if any performance indicators suggest a low-end device
  return Object.values(checks).some(check => check === true);
};

/**
 * Create performance-optimized filtering function
 * @param {Array} items - Items to filter
 * @param {Function} filterFn - Filter function
 * @param {number} chunkSize - Size of each processing chunk
 * @returns {Promise<Array>} Filtered items
 */
export const performantFilter = async (items, filterFn, chunkSize = 100) => {
  return new Promise((resolve) => {
    const results = [];
    let index = 0;

    const processChunk = () => {
      const end = Math.min(index + chunkSize, items.length);
      
      for (let i = index; i < end; i++) {
        if (filterFn(items[i])) {
          results.push(items[i]);
        }
      }
      
      index = end;
      
      if (index < items.length) {
        // Use setTimeout to avoid blocking the main thread
        setTimeout(processChunk, 0);
      } else {
        resolve(results);
      }
    };

    processChunk();
  });
};

/**
 * Memory-efficient array chunking for large datasets
 * @param {Array} array - Array to chunk
 * @param {number} size - Chunk size
 * @returns {Array} Array of chunks
 */
export const chunkArray = (array, size) => {
  const chunks = [];
  for (let i = 0; i < array.length; i += size) {
    chunks.push(array.slice(i, i + size));
  }
  return chunks;
};

/**
 * Optimize images by checking if they should be lazy loaded
 * @param {HTMLElement} element - Element to check
 * @param {number} rootMargin - Margin for intersection observer
 * @returns {boolean} Whether element is in viewport or close to it
 */
export const shouldLazyLoad = (element, rootMargin = 100) => {
  const rect = element.getBoundingClientRect();
  const windowHeight = window.innerHeight;
  
  return rect.top < windowHeight + rootMargin && rect.bottom > -rootMargin;
};
