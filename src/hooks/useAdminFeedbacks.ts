import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export interface AdminFeedback {
  id: string;
  company_id: string | null;
  user_id: string;
  type: string;
  message: string;
  status: string;
  priority: string | null;
  admin_notes: string | null;
  created_at: string;
  resolved_at: string | null;
  company_name?: string;
}

export function useAdminFeedbacks() {
  const queryClient = useQueryClient();

  const feedbacksQuery = useQuery({
    queryKey: ["admin-feedbacks"],
    queryFn: async (): Promise<AdminFeedback[]> => {
      const { data: feedbacks, error } = await supabase
        .from("feedbacks")
        .select("*")
        .order("created_at", { ascending: false });
      
      if (error) throw error;

      // Get company names for each feedback
      const companyIds = [...new Set(feedbacks?.map(f => f.company_id).filter(Boolean))];
      
      if (companyIds.length > 0) {
        const { data: companies } = await supabase
          .from("companies")
          .select("id, name")
          .in("id", companyIds);
        
        const companyMap = new Map(companies?.map(c => [c.id, c.name]));
        
        return feedbacks?.map(f => ({
          ...f,
          company_name: f.company_id ? companyMap.get(f.company_id) || "Desconhecido" : undefined
        })) || [];
      }

      return feedbacks || [];
    }
  });

  const updateFeedbackMutation = useMutation({
    mutationFn: async ({ 
      feedbackId, 
      status, 
      priority, 
      adminNotes 
    }: { 
      feedbackId: string;
      status?: string;
      priority?: string;
      adminNotes?: string;
    }) => {
      const updates: Record<string, unknown> = {};
      if (status) {
        updates.status = status;
        if (status === 'resolved') {
          updates.resolved_at = new Date().toISOString();
        }
      }
      if (priority) updates.priority = priority;
      if (adminNotes !== undefined) updates.admin_notes = adminNotes;
      
      const { error } = await supabase
        .from("feedbacks")
        .update(updates)
        .eq("id", feedbackId);
      
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Feedback atualizado");
      queryClient.invalidateQueries({ queryKey: ["admin-feedbacks"] });
    },
    onError: (error) => {
      toast.error("Erro ao atualizar feedback: " + error.message);
    }
  });

  return {
    feedbacks: feedbacksQuery.data || [],
    isLoading: feedbacksQuery.isLoading,
    error: feedbacksQuery.error,
    updateFeedback: updateFeedbackMutation.mutate
  };
}
