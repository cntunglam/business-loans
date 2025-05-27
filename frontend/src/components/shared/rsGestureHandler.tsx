import React, { useCallback, useState } from "react";

const SWIPE_THRESHOLD = 50; // minimum distance for swipe
const SWIPE_TIMEOUT = 300; // maximum time for swipe in ms

export type GestureType = "swipeLeft" | "swipeRight" | "swipeUp" | "swipeDown" | "tap" | "doubleTap" | "longPress";

interface GestureDetectorProps {
  onGesture: (gesture: GestureType) => void;
  children: React.ReactNode;
  className?: string;
  longPressDelay?: number;
  doubleTapDelay?: number;
}

const RSGestureDetector: React.FC<GestureDetectorProps> = ({
  onGesture,
  children,
  className = "",
  longPressDelay = 500,
  doubleTapDelay = 300,
}) => {
  const [touchStart, setTouchStart] = useState({ x: 0, y: 0, time: 0 });
  const [lastTap, setLastTap] = useState(0);
  const [longPressTimer, setLongPressTimer] = useState<NodeJS.Timeout | null>(null);

  const handleTouchStart = useCallback(
    (e: React.TouchEvent) => {
      const touch = e.touches[0];
      const now = Date.now();

      setTouchStart({
        x: touch.clientX,
        y: touch.clientY,
        time: now,
      });

      // Set up long press timer
      const timer = setTimeout(() => {
        onGesture("longPress");
      }, longPressDelay);

      setLongPressTimer(timer);
    },
    [longPressDelay, onGesture]
  );

  const handleTouchEnd = useCallback(
    (e: React.TouchEvent) => {
      if (longPressTimer) {
        clearTimeout(longPressTimer);
      }

      const touch = e.changedTouches[0];
      const deltaX = touch.clientX - touchStart.x;
      const deltaY = touch.clientY - touchStart.y;
      const deltaTime = Date.now() - touchStart.time;

      // Check for double tap
      const now = Date.now();
      const timeSinceLastTap = now - lastTap;

      if (timeSinceLastTap < doubleTapDelay && Math.abs(deltaX) < 10 && Math.abs(deltaY) < 10) {
        onGesture("doubleTap");
        setLastTap(0); // Reset last tap
        return;
      }

      // Handle swipes
      if (deltaTime < SWIPE_TIMEOUT) {
        if (Math.abs(deltaX) > SWIPE_THRESHOLD) {
          onGesture(deltaX > 0 ? "swipeRight" : "swipeLeft");
        } else if (Math.abs(deltaY) > SWIPE_THRESHOLD) {
          onGesture(deltaY > 0 ? "swipeDown" : "swipeUp");
        } else if (Math.abs(deltaX) < 10 && Math.abs(deltaY) < 10) {
          // Single tap
          onGesture("tap");
          setLastTap(now);
        }
      }
    },
    [touchStart, lastTap, longPressTimer, doubleTapDelay, onGesture]
  );

  const handleTouchMove = useCallback(() => {
    if (longPressTimer) {
      clearTimeout(longPressTimer);
      setLongPressTimer(null);
    }
  }, [longPressTimer]);

  return (
    <div
      className={`gesture-detector ${className}`}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
      onTouchMove={handleTouchMove}
    >
      {children}
    </div>
  );
};

export default RSGestureDetector;
