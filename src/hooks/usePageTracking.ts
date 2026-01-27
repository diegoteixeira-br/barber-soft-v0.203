import { useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

function generateSessionId(): string {
  const stored = sessionStorage.getItem("tracking_session_id");
  if (stored) return stored;
  
  const newId = `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  sessionStorage.setItem("tracking_session_id", newId);
  return newId;
}

export function usePageTracking(pagePath: string = "/") {
  useEffect(() => {
    const trackVisit = async () => {
      try {
        const sessionId = generateSessionId();
        
        await supabase
          .from("page_visits")
          .insert({
            page_path: pagePath,
            referrer: document.referrer || null,
            user_agent: navigator.userAgent || null,
            session_id: sessionId
          });
      } catch (error) {
        // Silently fail - tracking should not break the app
        console.error("Page tracking error:", error);
      }
    };

    trackVisit();
  }, [pagePath]);
}
