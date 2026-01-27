import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export interface SaasSettings {
  id: string;
  stripe_mode: string | null;
  stripe_test_publishable_key: string | null;
  stripe_test_secret_key: string | null;
  stripe_live_publishable_key: string | null;
  stripe_live_secret_key: string | null;
  stripe_webhook_secret: string | null;
  default_trial_days: number | null;
  professional_plan_price: number | null;
  elite_plan_price: number | null;
  empire_plan_price: number | null;
  maintenance_mode: boolean | null;
  maintenance_message: string | null;
  updated_at: string | null;
  updated_by: string | null;
}

export function useSaasSettings() {
  const queryClient = useQueryClient();

  const settingsQuery = useQuery({
    queryKey: ["saas-settings"],
    queryFn: async (): Promise<SaasSettings | null> => {
      const { data, error } = await supabase
        .from("saas_settings")
        .select("*")
        .limit(1)
        .maybeSingle();
      
      if (error) throw error;
      return data;
    }
  });

  const updateSettingsMutation = useMutation({
    mutationFn: async (updates: Partial<SaasSettings>) => {
      const { data: { user } } = await supabase.auth.getUser();
      
      const { error } = await supabase
        .from("saas_settings")
        .update({
          ...updates,
          updated_at: new Date().toISOString(),
          updated_by: user?.id
        })
        .eq("id", settingsQuery.data?.id);
      
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Configurações salvas");
      queryClient.invalidateQueries({ queryKey: ["saas-settings"] });
    },
    onError: (error) => {
      toast.error("Erro ao salvar configurações: " + error.message);
    }
  });

  return {
    settings: settingsQuery.data,
    isLoading: settingsQuery.isLoading,
    error: settingsQuery.error,
    updateSettings: updateSettingsMutation.mutate,
    isUpdating: updateSettingsMutation.isPending
  };
}
