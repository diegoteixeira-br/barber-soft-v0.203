import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

export function useSuperAdmin() {
  const [isSuperAdmin, setIsSuperAdmin] = useState<boolean | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const checkSuperAdmin = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        
        if (!user) {
          setIsSuperAdmin(false);
          setIsLoading(false);
          return;
        }

        const { data, error } = await supabase
          .from("user_roles")
          .select("role")
          .eq("user_id", user.id)
          .eq("role", "super_admin")
          .maybeSingle();

        if (error) {
          console.error("Error checking super admin status:", error);
          setIsSuperAdmin(false);
        } else {
          setIsSuperAdmin(!!data);
        }
      } catch (error) {
        console.error("Error checking super admin status:", error);
        setIsSuperAdmin(false);
      } finally {
        setIsLoading(false);
      }
    };

    checkSuperAdmin();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(() => {
      checkSuperAdmin();
    });

    return () => subscription.unsubscribe();
  }, []);

  return { isSuperAdmin, isLoading };
}
