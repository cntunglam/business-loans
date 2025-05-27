import { useEffect, useMemo, useRef } from "react";

const aliases = new Map([
  ["Win", "Meta"],
  ["Scroll", "ScrollLock"],
  ["Spacebar", " "],
  ["Down", "ArrowDown"],
  ["Left", "ArrowLeft"],
  ["Right", "ArrowRight"],
  ["Up", "ArrowUp"],
  ["Del", "Delete"],
  ["Crsel", "CrSel"],
  ["Exsel", "ExSel"],
  ["Apps", "ContextMenu"],
  ["Esc", "Escape"],
  ["Decimal", "."],
  ["Multiply", "*"],
  ["Add", "+"],
  ["Subtract", "-"],
  ["Divide", "/"],
]);

const shimKeyboardEvent = (event: KeyboardEvent) => {
  if (aliases.has(event.key)) {
    const key = aliases.get(event.key);
    Object.defineProperty(event, "key", {
      configurable: true,
      enumerable: true,
      get() {
        return key;
      },
    });
  }
};

export const useKeypress = (keys: string | string[], handler: (event: KeyboardEvent) => void) => {
  const pressedKeys = useRef<Set<string>>(new Set());
  const keysArray = useMemo(() => (Array.isArray(keys) ? keys : [keys]), [keys]);

  useEffect(() => {
    const keyDown = (event: KeyboardEvent) => {
      shimKeyboardEvent(event);
      pressedKeys.current.add(event.key);

      if (keysArray.every((key) => pressedKeys.current.has(key)) && pressedKeys.current.size === keysArray.length) {
        handler?.(event);
      }
    };

    const keyUp = (event: KeyboardEvent) => {
      shimKeyboardEvent(event);
      pressedKeys.current.delete(event.key);
    };

    window.addEventListener("keydown", keyDown);
    window.addEventListener("keyup", keyUp);

    return () => {
      window.removeEventListener("keydown", keyDown);
      window.removeEventListener("keyup", keyUp);
    };
  }, [keys, handler, keysArray]);
};

export default shimKeyboardEvent;
