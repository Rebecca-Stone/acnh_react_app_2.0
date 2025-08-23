import { useMemo, useCallback, useRef, useEffect } from "react";
import {
  debounce,
  throttle,
  memoize,
  getVirtualScrollItems,
  isLowEndDevice,
  batchUpdates,
} from "../utils/performanceUtils";

/**
 * Hook for performance optimization with configurable strategies
 * @param {Array} data - Data to optimize
 * @param {Object} options - Optimization options
 * @returns {Object} Optimized data and utility functions
 */
export const usePerformanceOptimization = (data, options = {}) => {
  const {
    enableDebounce = false,
    debounceMs = 300,
    enableThrottle = false,
    throttleMs = 100,
    enableVirtualization = false,
    virtualizationConfig = {},
    enableMemoization = true,
    enableBatching = false,
    lowEndOptimizations = null, // null = auto-detect, true = force, false = disable
  } = options;

  // Auto-detect or use provided low-end device setting
  const isLowEnd = useMemo(() => {
    if (lowEndOptimizations !== null) return lowEndOptimizations;
    return isLowEndDevice();
  }, [lowEndOptimizations]);

  // Memoized data processing
  const processedData = useMemo(() => {
    if (!data || !Array.isArray(data)) return data;

    // Apply low-end optimizations if needed
    if (isLowEnd && data.length > 50) {
      console.log("📱 Applying low-end device optimizations");
      return data.slice(0, 50); // Limit data for low-end devices
    }

    return data;
  }, [data, isLowEnd]);

  // Virtual scrolling utilities
  const virtualizationUtils = useMemo(() => {
    if (!enableVirtualization) return null;

    const {
      containerHeight = 400,
      itemHeight = 100,
      buffer = 5,
    } = virtualizationConfig;

    return {
      getVisibleItems: (scrollTop) =>
        getVirtualScrollItems(
          processedData,
          containerHeight,
          itemHeight,
          scrollTop,
          buffer
        ),
    };
  }, [enableVirtualization, processedData, virtualizationConfig]);

  // Memoization utilities
  const memoizedFunctions = useMemo(() => {
    if (!enableMemoization) return {};

    return {
      memoizedFilter: memoize((items, filterFn) => items.filter(filterFn)),
      memoizedSort: memoize((items, sortFn) => [...items].sort(sortFn)),
      memoizedMap: memoize((items, mapFn) => items.map(mapFn)),
      memoizedReduce: memoize((items, reduceFn, initial) =>
        items.reduce(reduceFn, initial)
      ),
    };
  }, [enableMemoization]);

  // Performance-optimized update functions
  const createOptimizedFunction = useCallback(
    (fn, strategy = "debounce") => {
      if (!fn) return fn;

      switch (strategy) {
        case "debounce":
          return enableDebounce ? debounce(fn, debounceMs) : fn;
        case "throttle":
          return enableThrottle ? throttle(fn, throttleMs) : fn;
        case "batch":
          return enableBatching ? batchUpdates(fn) : fn;
        default:
          return fn;
      }
    },
    [enableDebounce, debounceMs, enableThrottle, throttleMs, enableBatching]
  );

  // Performance monitoring
  const performanceRef = useRef({
    renderCount: 0,
    lastRenderTime: Date.now(),
    avgRenderTime: 0,
  });

  useEffect(() => {
    const now = Date.now();
    const timeSinceLastRender = now - performanceRef.current.lastRenderTime;

    performanceRef.current.renderCount++;
    performanceRef.current.avgRenderTime =
      (performanceRef.current.avgRenderTime + timeSinceLastRender) / 2;
    performanceRef.current.lastRenderTime = now;

    // Log performance warnings for frequent re-renders
    if (
      performanceRef.current.renderCount > 10 &&
      performanceRef.current.avgRenderTime < 16
    ) {
      // Less than 60fps
      console.warn(
        "⚠️ High frequency re-renders detected. Consider optimization."
      );
    }
  });

  // Chunked data processing for large datasets
  const createChunkedProcessor = useCallback((chunkSize = 100) => {
    return async (items, processor) => {
      if (!Array.isArray(items) || items.length <= chunkSize) {
        return processor(items);
      }

      const results = [];
      for (let i = 0; i < items.length; i += chunkSize) {
        const chunk = items.slice(i, i + chunkSize);
        const chunkResult = await new Promise((resolve) => {
          setTimeout(() => resolve(processor(chunk)), 0);
        });
        results.push(...chunkResult);
      }
      return results;
    };
  }, []);

  // Memory usage optimization
  const memoryOptimization = useMemo(() => {
    return {
      // Cleanup function for unused references
      cleanup: () => {
        if (memoizedFunctions.memoizedFilter?.cache) {
          memoizedFunctions.memoizedFilter.cache.clear();
        }
        if (memoizedFunctions.memoizedSort?.cache) {
          memoizedFunctions.memoizedSort.cache.clear();
        }
        if (memoizedFunctions.memoizedMap?.cache) {
          memoizedFunctions.memoizedMap.cache.clear();
        }
      },

      // Get memory usage stats (if available)
      getMemoryStats: () => {
        if (performance.memory) {
          return {
            usedJSHeapSize: performance.memory.usedJSHeapSize,
            totalJSHeapSize: performance.memory.totalJSHeapSize,
            jsHeapSizeLimit: performance.memory.jsHeapSizeLimit,
            usagePercentage: (
              (performance.memory.usedJSHeapSize /
                performance.memory.jsHeapSizeLimit) *
              100
            ).toFixed(2),
          };
        }
        return null;
      },
    };
  }, [memoizedFunctions]);

  // Adaptive performance strategies
  const adaptiveStrategies = useMemo(() => {
    const dataSize = processedData?.length || 0;

    return {
      shouldUseVirtualization: dataSize > 100 || isLowEnd,
      shouldUseMemoization: dataSize > 20,
      shouldUseDebounce: dataSize > 50,
      shouldUseBatching: dataSize > 200,
      recommendedChunkSize: Math.max(10, Math.floor(dataSize / 10)),

      // Get recommended settings based on data size and device
      getRecommendedSettings: () => ({
        virtualScroll: dataSize > 100,
        debounceMs: isLowEnd ? 500 : 300,
        throttleMs: isLowEnd ? 200 : 100,
        memoization: dataSize > 20,
        batching: dataSize > 200,
      }),
    };
  }, [processedData, isLowEnd]);

  // Performance metrics
  const performanceMetrics = useMemo(() => {
    return {
      dataSize: processedData?.length || 0,
      isLowEndDevice: isLowEnd,
      renderCount: performanceRef.current.renderCount,
      avgRenderTime: performanceRef.current.avgRenderTime,
      optimizationsActive: {
        debounce: enableDebounce,
        throttle: enableThrottle,
        virtualization: enableVirtualization,
        memoization: enableMemoization,
        batching: enableBatching,
      },
    };
  }, [
    processedData,
    isLowEnd,
    enableDebounce,
    enableThrottle,
    enableVirtualization,
    enableMemoization,
    enableBatching,
  ]);

  return {
    // Optimized data
    data: processedData,

    // Utilities
    virtualization: virtualizationUtils,
    memoized: memoizedFunctions,
    createOptimizedFunction,
    createChunkedProcessor,

    // Performance info
    isLowEndDevice: isLowEnd,
    metrics: performanceMetrics,
    adaptiveStrategies,
    memoryOptimization,

    // Quick access functions
    optimizeFunction: createOptimizedFunction,
    processInChunks: createChunkedProcessor(),

    // Recommended usage patterns
    ...adaptiveStrategies.getRecommendedSettings(),
  };
};

/**
 * Hook for optimizing search and filter operations
 * @param {Array} data - Data to search/filter
 * @param {Object} options - Search optimization options
 * @returns {Object} Optimized search functions and utilities
 */
export const useOptimizedSearch = (data, options = {}) => {
  const {
    debounceMs = 300,
    enableIndexing = false,
    caseSensitive = false,
    enableFuzzySearch = false,
  } = options;

  // Build search index for better performance
  const searchIndex = useMemo(() => {
    if (!enableIndexing || !data) return null;

    const index = new Map();
    data.forEach((item, idx) => {
      if (item && typeof item === "object") {
        Object.entries(item).forEach(([key, value]) => {
          if (typeof value === "string") {
            const searchValue = caseSensitive ? value : value.toLowerCase();
            if (!index.has(key)) index.set(key, new Map());
            if (!index.get(key).has(searchValue)) {
              index.get(key).set(searchValue, []);
            }
            index.get(key).get(searchValue).push(idx);
          }
        });
      }
    });

    return index;
  }, [data, enableIndexing, caseSensitive]);

  // Optimized search function
  const searchFunction = useMemo(() => {
    const search = (query, fields = []) => {
      if (!query || !data) return data;

      const searchQuery = caseSensitive ? query : query.toLowerCase();

      if (enableIndexing && searchIndex) {
        // Use indexed search
        const matchingIndices = new Set();

        fields.forEach((field) => {
          const fieldIndex = searchIndex.get(field);
          if (fieldIndex) {
            fieldIndex.forEach((indices, value) => {
              if (value.includes(searchQuery)) {
                indices.forEach((idx) => matchingIndices.add(idx));
              }
            });
          }
        });

        return Array.from(matchingIndices).map((idx) => data[idx]);
      } else {
        // Standard search
        return data.filter((item) => {
          if (fields.length === 0) {
            // Search all string fields
            return Object.values(item).some(
              (value) =>
                typeof value === "string" &&
                (caseSensitive ? value : value.toLowerCase()).includes(
                  searchQuery
                )
            );
          } else {
            // Search specific fields
            return fields.some((field) => {
              const value = item[field];
              return (
                typeof value === "string" &&
                (caseSensitive ? value : value.toLowerCase()).includes(
                  searchQuery
                )
              );
            });
          }
        });
      }
    };

    return debounceMs > 0 ? debounce(search, debounceMs) : search;
  }, [data, searchIndex, enableIndexing, caseSensitive, debounceMs]);

  return {
    search: searchFunction,
    hasIndex: !!searchIndex,
    indexSize: searchIndex?.size || 0,
    isOptimized: enableIndexing || debounceMs > 0,
  };
};

/**
 * Hook for intersection observer-based optimizations
 * @param {Object} options - Observer options
 * @returns {Object} Observer utilities
 */
export const useIntersectionOptimization = (options = {}) => {
  const {
    rootMargin = "100px",
    threshold = 0.1,
    unobserveOnIntersect = false,
  } = options;

  const observerRef = useRef();
  const observedElements = useRef(new Map());

  useEffect(() => {
    observerRef.current = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          const callback = observedElements.current.get(entry.target);
          if (callback) {
            callback(entry.isIntersecting, entry);

            if (unobserveOnIntersect && entry.isIntersecting) {
              observerRef.current?.unobserve(entry.target);
              observedElements.current.delete(entry.target);
            }
          }
        });
      },
      { rootMargin, threshold }
    );

    return () => {
      observerRef.current?.disconnect();
    };
  }, [rootMargin, threshold, unobserveOnIntersect]);

  const observe = useCallback((element, callback) => {
    if (!element || !observerRef.current) return;

    observedElements.current.set(element, callback);
    observerRef.current.observe(element);
  }, []);

  const unobserve = useCallback((element) => {
    if (!element || !observerRef.current) return;

    observerRef.current.unobserve(element);
    observedElements.current.delete(element);
  }, []);

  return {
    observe,
    unobserve,
    disconnect: () => {
      observerRef.current?.disconnect();
      observedElements.current.clear();
    },
  };
};
