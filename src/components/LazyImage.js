import React, { useState, useRef, useEffect } from "react";

export default function LazyImage({
  src,
  alt,
  className = "",
  placeholder = null,
  onLoad = () => {},
  onError = () => {},
  ...props
}) {
  const [isLoaded, setIsLoaded] = useState(false);
  const [isInView, setIsInView] = useState(false);
  const [hasError, setHasError] = useState(false);
  const imgRef = useRef();

  // Intersection Observer for lazy loading
  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsInView(true);
          observer.disconnect();
        }
      },
      {
        threshold: 0.1,
        rootMargin: "50px", // Start loading 50px before the image enters viewport
      }
    );

    if (imgRef.current) {
      observer.observe(imgRef.current);
    }

    return () => observer.disconnect();
  }, []);

  const handleLoad = () => {
    setIsLoaded(true);
    onLoad();
  };

  const handleError = () => {
    setHasError(true);
    onError();
  };

  // Default placeholder component
  const DefaultPlaceholder = () => (
    <div
      className={`lazy-image-placeholder ${className}`}
      style={{
        backgroundColor: "var(--bg-tertiary)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        minHeight: "100px",
        color: "var(--text-muted)",
        fontSize: "2em",
      }}
      {...props}
    >
      <i className="fas fa-image" aria-hidden="true"></i>
    </div>
  );

  // Error fallback component
  const ErrorFallback = () => (
    <div
      className={`lazy-image-error ${className}`}
      style={{
        backgroundColor: "var(--bg-tertiary)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        minHeight: "100px",
        color: "var(--text-muted)",
        fontSize: "1.5em",
        flexDirection: "column",
        gap: "8px",
      }}
      {...props}
    >
      <i className="fas fa-exclamation-triangle" aria-hidden="true"></i>
      <small style={{ fontSize: "0.7em" }}>Image unavailable</small>
    </div>
  );

  return (
    <div ref={imgRef} className="lazy-image-container">
      {!isInView ? (
        // Show placeholder while not in view
        placeholder || <DefaultPlaceholder />
      ) : hasError ? (
        // Show error fallback if image failed to load
        <ErrorFallback />
      ) : (
        // Show actual image with loading transition
        <div className="lazy-image-wrapper" style={{ position: "relative" }}>
          {!isLoaded && (placeholder || <DefaultPlaceholder />)}
          <img
            src={src}
            alt={alt}
            className={`lazy-image ${className} ${
              isLoaded ? "loaded" : "loading"
            }`}
            onLoad={handleLoad}
            onError={handleError}
            style={{
              opacity: isLoaded ? 1 : 0,
              transition: "opacity 0.3s ease",
              position: isLoaded ? "static" : "absolute",
              top: 0,
              left: 0,
              width: "100%",
              height: "100%",
              objectFit: "cover",
            }}
            loading="lazy" // Native lazy loading as backup
            {...props}
          />
        </div>
      )}
    </div>
  );
}
