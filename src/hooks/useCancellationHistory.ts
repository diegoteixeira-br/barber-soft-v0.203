import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useCurrentUnit } from "@/contexts/UnitContext";
import { toast } from "@/hooks/use-toast";

export interface CancellationRecord {
  id: string;
  unit_id: string;
  company_id: string | null;
  appointment_id: string | null;
  client_name: string;
  client_phone: string | null;
  barber_name: string;
  service_name: string;
  scheduled_time: string;
  cancelled_at: string;
  minutes_before: number;
  is_late_cancellation: boolean;
  is_no_show: boolean;
  total_price: number;
  cancellation_source: string;
  notes: string | null;
  created_at: string;
}

interface CancellationFilters {
  startDate?: Date;
  endDate?: Date;
  onlyLate?: boolean;
  onlyNoShow?: boolean;
}

export function useCancellationHistory(filters?: CancellationFilters) {
  const { currentUnitId } = useCurrentUnit();
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: ["cancellation-history", currentUnitId, filters?.startDate?.toISOString(), filters?.endDate?.toISOString(), filters?.onlyLate, filters?.onlyNoShow],
    queryFn: async () => {
      if (!currentUnitId) return [];

      let queryBuilder = supabase
        .from("cancellation_history")
        .select("*")
        .eq("unit_id", currentUnitId)
        .order("scheduled_time", { ascending: false });

      if (filters?.startDate) {
        queryBuilder = queryBuilder.gte("scheduled_time", filters.startDate.toISOString());
      }
      if (filters?.endDate) {
        queryBuilder = queryBuilder.lte("scheduled_time", filters.endDate.toISOString());
      }
      if (filters?.onlyLate) {
        queryBuilder = queryBuilder.eq("is_late_cancellation", true);
      }
      if (filters?.onlyNoShow) {
        queryBuilder = queryBuilder.eq("is_no_show", true);
      }

      const { data, error } = await queryBuilder;

      if (error) throw error;
      return data as CancellationRecord[];
    },
    enabled: !!currentUnitId,
  });

  const deleteCancellationRecord = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from("cancellation_history")
        .delete()
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["cancellation-history"] });
      toast({ title: "Registro excluído!" });
    },
    onError: (error) => {
      toast({ title: "Erro ao excluir", description: error.message, variant: "destructive" });
    },
  });

  // Calculate summary statistics
  const summary = {
    totalCount: query.data?.length || 0,
    lateCount: query.data?.filter(r => r.is_late_cancellation).length || 0,
    noShowCount: query.data?.filter(r => r.is_no_show).length || 0,
    totalValue: query.data?.reduce((sum, r) => sum + Number(r.total_price), 0) || 0,
    lateValue: query.data?.filter(r => r.is_late_cancellation || r.is_no_show).reduce((sum, r) => sum + Number(r.total_price), 0) || 0,
  };

  return {
    records: query.data || [],
    isLoading: query.isLoading,
    error: query.error,
    summary,
    deleteCancellationRecord,
  };
}
