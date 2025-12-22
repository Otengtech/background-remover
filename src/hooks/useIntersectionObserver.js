import { useEffect, useRef, useCallback } from "react";

export function useScrollReveal(options = {}) {
  const elementRef = useRef(null);

  useEffect(() => {
    const el = elementRef.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          el.classList.add("visible");
          
          // Set will-change during animation
          el.style.willChange = "transform, opacity";
          
          // Reset will-change after animation
          const handleTransitionEnd = () => {
            el.style.willChange = "auto";
            el.removeEventListener("transitionend", handleTransitionEnd);
          };
          
          el.addEventListener("transitionend", handleTransitionEnd);
        } else {
          // Remove visible class to allow re-animation
          el.classList.remove("visible");
          el.style.willChange = "auto";
        }
      },
       {
        threshold: 0.15,
        rootMargin: "0px 0px -30% 0px",  // Changed from -10% to -30%
        ...options,
      }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, [options]);

  return elementRef;
}

// Special hook for .map() elements
export function useScrollRevealMap(itemsLength, options = {}) {
  const elementsRef = useRef([]);
  const observerRef = useRef(null);

  useEffect(() => {
    const defaultOptions = {
      threshold: 0.1,
      rootMargin: "0px 0px -5% 0px",
    };

    observerRef.current = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("visible");
            
            // Set will-change
            entry.target.style.willChange = "transform, opacity";
            
            const handleTransitionEnd = () => {
              entry.target.style.willChange = "auto";
              entry.target.removeEventListener("transitionend", handleTransitionEnd);
            };
            
            entry.target.addEventListener("transitionend", handleTransitionEnd);
          } else {
            entry.target.classList.remove("visible");
            entry.target.style.willChange = "auto";
          }
        });
      },
      { ...defaultOptions, ...options }
    );

    // Observe all current elements
    elementsRef.current.forEach((el) => {
      if (el) observerRef.current.observe(el);
    });

    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect();
      }
    };
  }, [itemsLength, options]);

  // Function to assign refs for .map() items
  const getRefCallback = (index) => (el) => {
    elementsRef.current[index] = el;
  };

  return getRefCallback;
}