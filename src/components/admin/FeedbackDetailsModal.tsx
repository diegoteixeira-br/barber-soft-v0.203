import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { AdminFeedback, useAdminFeedbacks } from "@/hooks/useAdminFeedbacks";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { MessageSquare, Bug, Lightbulb, Save } from "lucide-react";

interface FeedbackDetailsModalProps {
  feedback: AdminFeedback | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const typeIcons: Record<string, React.ReactNode> = {
  feedback: <MessageSquare className="h-5 w-5" />,
  bug: <Bug className="h-5 w-5" />,
  suggestion: <Lightbulb className="h-5 w-5" />,
};

export function FeedbackDetailsModal({ feedback, open, onOpenChange }: FeedbackDetailsModalProps) {
  const { updateFeedback } = useAdminFeedbacks();
  const [adminNotes, setAdminNotes] = useState(feedback?.admin_notes || "");

  if (!feedback) return null;

  const handleSaveNotes = () => {
    updateFeedback({ feedbackId: feedback.id, adminNotes });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-slate-800 border-slate-700 text-white max-w-lg">
        <DialogHeader>
          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-blue-600/20 text-blue-400">
              {typeIcons[feedback.type]}
            </div>
            <div>
              <DialogTitle className="text-lg font-bold capitalize">
                {feedback.type}
              </DialogTitle>
              <p className="text-sm text-slate-400">
                {feedback.company_name || "Usuário não identificado"}
              </p>
            </div>
          </div>
        </DialogHeader>
        
        <div className="space-y-6 mt-4">
          <div className="flex gap-2">
            <Badge variant="outline" className={
              feedback.status === 'resolved' 
                ? "bg-green-500/20 text-green-400 border-green-500/30"
                : feedback.status === 'in_progress'
                ? "bg-blue-500/20 text-blue-400 border-blue-500/30"
                : "bg-yellow-500/20 text-yellow-400 border-yellow-500/30"
            }>
              {feedback.status === 'pending' && 'Pendente'}
              {feedback.status === 'in_progress' && 'Em Análise'}
              {feedback.status === 'resolved' && 'Resolvido'}
            </Badge>
            <Badge variant="outline" className={
              feedback.priority === 'high'
                ? "bg-red-500/20 text-red-400 border-red-500/30"
                : feedback.priority === 'low'
                ? "bg-slate-500/20 text-slate-400 border-slate-500/30"
                : "bg-yellow-500/20 text-yellow-400 border-yellow-500/30"
            }>
              Prioridade: {feedback.priority === 'high' ? 'Alta' : feedback.priority === 'low' ? 'Baixa' : 'Média'}
            </Badge>
          </div>

          <div>
            <p className="text-sm text-slate-400 mb-2">Mensagem</p>
            <div className="p-4 rounded-lg bg-slate-900 border border-slate-700">
              <p className="text-white whitespace-pre-wrap">{feedback.message}</p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <p className="text-slate-400">Enviado em</p>
              <p className="text-white">
                {format(new Date(feedback.created_at), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })}
              </p>
            </div>
            {feedback.resolved_at && (
              <div>
                <p className="text-slate-400">Resolvido em</p>
                <p className="text-white">
                  {format(new Date(feedback.resolved_at), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })}
                </p>
              </div>
            )}
          </div>

          <div>
            <p className="text-sm text-slate-400 mb-2">Notas do Admin</p>
            <Textarea
              value={adminNotes}
              onChange={(e) => setAdminNotes(e.target.value)}
              placeholder="Adicione suas notas aqui..."
              className="bg-slate-900 border-slate-700 text-white placeholder:text-slate-500 min-h-[100px]"
            />
            <Button 
              onClick={handleSaveNotes}
              className="mt-2 bg-blue-600 hover:bg-blue-700"
            >
              <Save className="mr-2 h-4 w-4" />
              Salvar Notas
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
