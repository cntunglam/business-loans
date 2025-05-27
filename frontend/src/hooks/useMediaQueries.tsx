import { useTheme } from "@mui/joy";
import { useEffect, useState } from "react";

type Breakpoint = "xs" | "sm" | "md" | "lg" | "xl";

function useMediaQueries(breakpointKeys: Breakpoint[]) {
  const theme = useTheme();
  const [matches, setMatches] = useState<{ [key in Breakpoint]?: boolean }>({});

  useEffect(() => {
    const mediaQueryLists: { [key in Breakpoint]?: MediaQueryList } = {};

    const handleChange = () => {
      const updatedMatches = breakpointKeys.reduce(
        (acc, key) => {
          acc[key] = mediaQueryLists[key]?.matches || false;
          return acc;
        },
        {} as { [key in Breakpoint]?: boolean }
      );
      setMatches(updatedMatches);
    };

    breakpointKeys.forEach((key) => {
      const mediaQuery = window.matchMedia(theme.breakpoints.up(key).replace("@media ", ""));
      mediaQueryLists[key] = mediaQuery;
      mediaQuery.addEventListener("change", handleChange);
    });

    handleChange(); // Initial check

    return () => {
      breakpointKeys.forEach((key) => {
        mediaQueryLists[key]?.removeEventListener("change", handleChange);
      });
    };
  }, [theme.breakpoints]);

  return matches;
}

export default useMediaQueries;
