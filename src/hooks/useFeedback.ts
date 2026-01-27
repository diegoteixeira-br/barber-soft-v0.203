import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export function useFeedback() {
  const queryClient = useQueryClient();

  const submitFeedbackMutation = useMutation({
    mutationFn: async ({ 
      type, 
      message 
    }: { 
      type: 'feedback' | 'bug' | 'suggestion';
      message: string;
    }) => {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        throw new Error("Você precisa estar logado para enviar feedback");
      }

      // Get user's company
      const { data: company } = await supabase
        .from("companies")
        .select("id")
        .eq("owner_user_id", user.id)
        .maybeSingle();

      const { error } = await supabase
        .from("feedbacks")
        .insert({
          user_id: user.id,
          company_id: company?.id || null,
          type,
          message,
          status: 'pending',
          priority: 'medium'
        });
      
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Feedback enviado com sucesso! Obrigado pela sua contribuição.");
      queryClient.invalidateQueries({ queryKey: ["user-feedbacks"] });
    },
    onError: (error) => {
      toast.error("Erro ao enviar feedback: " + error.message);
    }
  });

  return {
    submitFeedback: submitFeedbackMutation.mutate,
    isSubmitting: submitFeedbackMutation.isPending
  };
}
