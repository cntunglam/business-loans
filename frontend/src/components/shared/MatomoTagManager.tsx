import { useEffect, useRef, useState } from "react";
import { useLocation } from "react-router-dom";
import { useUserContext } from "../../context/userContext";

const EXCLUDED_PATHNAMES = ["/admin", "/lender"];
const HIDDEN_PARAMS = ["referrer", "visitorId", "amount", "term"];

const getLocation = () => {
  //Remove search params based on HIDDEN_PARAMS
  const searchParams = new URLSearchParams(location.search);
  HIDDEN_PARAMS.forEach((param) => searchParams.delete(param));
  const newLocation = location.pathname + "?" + searchParams.toString() + location.hash;
  return newLocation;
};

const MatomoTagManager = () => {
  const location = useLocation();

  const scriptRef = useRef<HTMLScriptElement | null>(null);
  const blobUrlRef = useRef<string | null>(null);

  useEffect(() => {
    // Initialize Matomo arrays
    window._mtm = window._mtm || [];
    window._paq = window._paq || [];

    // Push initial configuration
    window._mtm.push({ "mtm.startTime": new Date().getTime(), event: "mtm.Start" });
    window._paq.push(["setRequestMethod", "POST"]);
    window._paq.push(["setCustomUrl", getLocation()]);
    // Async script loading
    (async () => {
      try {
        const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/mato-script`);
        const scriptContent = await response.text();
        const modifiedScript = scriptContent.replace(/matomo\.php/g, "mato.php");

        // Create Blob and script element
        const blob = new Blob([modifiedScript], { type: "application/javascript" });
        const blobUrl = URL.createObjectURL(blob);
        blobUrlRef.current = blobUrl;

        const script = document.createElement("script");
        scriptRef.current = script;
        script.src = blobUrl;
        script.async = true;

        // Insert script at original position
        const firstScript = document.getElementsByTagName("script")[0];
        firstScript.parentNode?.insertBefore(script, firstScript);
      } catch (error) {
        console.error("Error loading modified script:", error);
      }
    })();

    // Cleanup function
    return () => {
      // Remove the script element if it exists
      if (scriptRef.current) {
        scriptRef.current.remove();
        scriptRef.current = null;
      }

      // Revoke blob URL if it still exists
      if (blobUrlRef.current) {
        URL.revokeObjectURL(blobUrlRef.current);
        blobUrlRef.current = null;
      }
    };
  }, []);

  const prevLocation = useRef<string | null>(getLocation());

  const { user } = useUserContext();
  const [userIdSent, setUserIdSent] = useState(false);

  useEffect(() => {
    if (EXCLUDED_PATHNAMES.some((exc) => location.pathname.startsWith(exc))) return;

    const newLocation = getLocation();
    if (newLocation === prevLocation.current) return;

    prevLocation.current = newLocation;
    window._paq.push(["setCustomUrl", newLocation]);
    window._paq.push(["trackPageView"]);
  }, [location.hash, location.pathname, location.search]); // Trigger on path changes

  useEffect(() => {
    if (user?.id && !userIdSent) {
      if (window._paq?.push) {
        window._paq?.push(["setUserId", user.id]);
        setUserIdSent(true);
      }
    }
  }, [user, userIdSent]);

  return null;
};

export default MatomoTagManager;
