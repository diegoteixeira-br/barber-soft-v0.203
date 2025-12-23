import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useCurrentUnit } from "@/contexts/UnitContext";

export interface Client {
  id: string;
  company_id: string | null;
  unit_id: string;
  name: string;
  phone: string;
  birth_date: string | null;
  last_visit_at: string | null;
  total_visits: number;
  tags: string[];
  created_at: string;
  updated_at: string;
}

export type ClientFilter = "all" | "birthday_month" | "inactive";

export function useClients(filter: ClientFilter = "all") {
  const { currentUnitId } = useCurrentUnit();

  return useQuery({
    queryKey: ["clients", currentUnitId, filter],
    queryFn: async () => {
      if (!currentUnitId) return [];

      let query = supabase
        .from("clients")
        .select("*")
        .eq("unit_id", currentUnitId)
        .order("name", { ascending: true });

      const { data, error } = await query;

      if (error) throw error;

      let clients = data as Client[];

      // Apply filters
      if (filter === "birthday_month") {
        const currentMonth = new Date().getMonth() + 1;
        clients = clients.filter((client) => {
          if (!client.birth_date) return false;
          const birthMonth = new Date(client.birth_date).getMonth() + 1;
          return birthMonth === currentMonth;
        });
      } else if (filter === "inactive") {
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
        clients = clients.filter((client) => {
          if (!client.last_visit_at) return true;
          return new Date(client.last_visit_at) < thirtyDaysAgo;
        });
      }

      return clients;
    },
    enabled: !!currentUnitId,
  });
}
