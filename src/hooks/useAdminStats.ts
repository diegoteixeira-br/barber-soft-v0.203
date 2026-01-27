import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { subDays, startOfDay, format } from "date-fns";

interface AdminStats {
  totalActiveCompanies: number;
  mrr: number;
  newSignups30Days: number;
  companiesUpToDate: number;
  companiesOverdue: number;
  visitsByDay: { date: string; visits: number; signups: number }[];
}

export function useAdminStats() {
  return useQuery({
    queryKey: ["admin-stats"],
    queryFn: async (): Promise<AdminStats> => {
      const thirtyDaysAgo = subDays(new Date(), 30);
      
      // Get all companies
      const { data: companies, error: companiesError } = await supabase
        .from("companies")
        .select("*");
      
      if (companiesError) throw companiesError;

      // Get page visits for last 30 days
      const { data: visits, error: visitsError } = await supabase
        .from("page_visits")
        .select("*")
        .gte("visited_at", thirtyDaysAgo.toISOString());
      
      if (visitsError) throw visitsError;

      // Calculate stats
      const activeCompanies = companies?.filter(c => 
        c.plan_status === 'active' || c.plan_status === 'trial'
      ) || [];
      
      const mrr = companies?.reduce((sum, c) => 
        c.plan_status === 'active' ? sum + (Number(c.monthly_price) || 0) : sum, 0
      ) || 0;
      
      const newSignups = companies?.filter(c => 
        new Date(c.created_at!) >= thirtyDaysAgo
      ).length || 0;
      
      const overdueCompanies = companies?.filter(c => 
        c.plan_status === 'overdue'
      ).length || 0;
      
      const upToDateCompanies = companies?.filter(c => 
        c.plan_status === 'active'
      ).length || 0;

      // Group visits and signups by day
      const visitsByDay: { [key: string]: { visits: number; signups: number } } = {};
      
      for (let i = 29; i >= 0; i--) {
        const date = format(subDays(new Date(), i), 'yyyy-MM-dd');
        visitsByDay[date] = { visits: 0, signups: 0 };
      }
      
      visits?.forEach(v => {
        const date = format(new Date(v.visited_at!), 'yyyy-MM-dd');
        if (visitsByDay[date]) {
          visitsByDay[date].visits++;
        }
      });
      
      companies?.forEach(c => {
        if (c.created_at) {
          const date = format(new Date(c.created_at), 'yyyy-MM-dd');
          if (visitsByDay[date]) {
            visitsByDay[date].signups++;
          }
        }
      });

      const visitsByDayArray = Object.entries(visitsByDay).map(([date, data]) => ({
        date,
        visits: data.visits,
        signups: data.signups
      }));

      return {
        totalActiveCompanies: activeCompanies.length,
        mrr,
        newSignups30Days: newSignups,
        companiesUpToDate: upToDateCompanies,
        companiesOverdue: overdueCompanies,
        visitsByDay: visitsByDayArray
      };
    }
  });
}
