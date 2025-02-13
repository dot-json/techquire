import { useEffect, useState, useRef } from "react";

type ScrollDirection = "up" | "down" | null;

const useScrollFeed = (elementRef: React.RefObject<HTMLElement>) => {
  const [scrollInitiated, setScrollInitiated] = useState(false);
  const [scrollDirection, setScrollDirection] = useState<ScrollDirection>(null);
  const isScrolling = useRef(false);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const keyTimeoutRef = useRef<NodeJS.Timeout | null>(null); // Separate timeout for key events

  const touchStartY = useRef<number | null>(null); // To track the initial touch position

  useEffect(() => {
    const element = elementRef.current;
    if (!element) return;

    const handleWheel = (event: WheelEvent) => {
      setScrollDirection(event.deltaY > 0 ? "down" : "up");

      if (!isScrolling.current) {
        isScrolling.current = true;
        setScrollInitiated(true);

        if (timeoutRef.current) clearTimeout(timeoutRef.current);
        timeoutRef.current = setTimeout(() => {
          isScrolling.current = false;
          setScrollInitiated(false);
        }, 2000);
      }
    };

    const handleArrowKey = (event: KeyboardEvent) => {
      if (keyTimeoutRef.current) clearTimeout(keyTimeoutRef.current); // Clear any previous key delay

      if (event.key === "ArrowDown") {
        setScrollDirection("down");
      } else if (event.key === "ArrowUp") {
        setScrollDirection("up");
      }

      if (!isScrolling.current) {
        isScrolling.current = true;
        setScrollInitiated(true);

        keyTimeoutRef.current = setTimeout(() => {
          isScrolling.current = false;
          setScrollInitiated(false);
        }, 200); // Separate delay for arrow keys (200ms)
      }
    };

    const handleTouchStart = (event: TouchEvent) => {
      touchStartY.current = event.touches[0].clientY; // Store the initial touch position
    };

    const handleTouchMove = (event: TouchEvent) => {
      if (touchStartY.current === null) return;

      const touchEndY = event.touches[0].clientY;
      const deltaY = touchStartY.current - touchEndY;

      if (deltaY > 0) {
        setScrollDirection("down");
      } else if (deltaY < 0) {
        setScrollDirection("up");
      }

      if (!isScrolling.current) {
        isScrolling.current = true;
        setScrollInitiated(true);

        if (timeoutRef.current) clearTimeout(timeoutRef.current);
        timeoutRef.current = setTimeout(() => {
          isScrolling.current = false;
          setScrollInitiated(false);
        }, 200);
      }

      touchStartY.current = touchEndY; // Update the touch position
    };

    element.addEventListener("wheel", handleWheel, { passive: true });
    window.addEventListener("keydown", handleArrowKey);
    element.addEventListener("touchstart", handleTouchStart, { passive: true });
    element.addEventListener("touchmove", handleTouchMove, { passive: true });

    return () => {
      element.removeEventListener("wheel", handleWheel);
      window.removeEventListener("keydown", handleArrowKey);
      element.removeEventListener("touchstart", handleTouchStart);
      element.removeEventListener("touchmove", handleTouchMove);
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
      if (keyTimeoutRef.current) clearTimeout(keyTimeoutRef.current);
    };
  }, [elementRef]);

  return { scrollInitiated, scrollDirection };
};

export default useScrollFeed;
