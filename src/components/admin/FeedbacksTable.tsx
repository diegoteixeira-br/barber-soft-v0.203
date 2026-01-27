import { useState } from "react";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { AdminFeedback, useAdminFeedbacks } from "@/hooks/useAdminFeedbacks";
import { MoreHorizontal, MessageSquare, Bug, Lightbulb, Eye } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { ptBR } from "date-fns/locale";
import { FeedbackDetailsModal } from "./FeedbackDetailsModal";

const statusColors: Record<string, string> = {
  pending: "bg-yellow-500/20 text-yellow-400 border-yellow-500/30",
  in_progress: "bg-blue-500/20 text-blue-400 border-blue-500/30",
  resolved: "bg-green-500/20 text-green-400 border-green-500/30",
};

const priorityColors: Record<string, string> = {
  low: "bg-slate-500/20 text-slate-400 border-slate-500/30",
  medium: "bg-yellow-500/20 text-yellow-400 border-yellow-500/30",
  high: "bg-red-500/20 text-red-400 border-red-500/30",
};

const typeIcons: Record<string, React.ReactNode> = {
  feedback: <MessageSquare className="h-4 w-4" />,
  bug: <Bug className="h-4 w-4" />,
  suggestion: <Lightbulb className="h-4 w-4" />,
};

export function FeedbacksTable() {
  const { feedbacks, isLoading, updateFeedback } = useAdminFeedbacks();
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [typeFilter, setTypeFilter] = useState<string>("all");
  const [selectedFeedback, setSelectedFeedback] = useState<AdminFeedback | null>(null);

  const filteredFeedbacks = feedbacks.filter(feedback => {
    if (statusFilter !== "all" && feedback.status !== statusFilter) return false;
    if (typeFilter !== "all" && feedback.type !== typeFilter) return false;
    return true;
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-4">
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-[180px] bg-slate-800 border-slate-700 text-white">
            <SelectValue placeholder="Filtrar por status" />
          </SelectTrigger>
          <SelectContent className="bg-slate-800 border-slate-700">
            <SelectItem value="all" className="text-white">Todos os status</SelectItem>
            <SelectItem value="pending" className="text-white">Pendente</SelectItem>
            <SelectItem value="in_progress" className="text-white">Em Análise</SelectItem>
            <SelectItem value="resolved" className="text-white">Resolvido</SelectItem>
          </SelectContent>
        </Select>
        
        <Select value={typeFilter} onValueChange={setTypeFilter}>
          <SelectTrigger className="w-[180px] bg-slate-800 border-slate-700 text-white">
            <SelectValue placeholder="Filtrar por tipo" />
          </SelectTrigger>
          <SelectContent className="bg-slate-800 border-slate-700">
            <SelectItem value="all" className="text-white">Todos os tipos</SelectItem>
            <SelectItem value="feedback" className="text-white">Feedback</SelectItem>
            <SelectItem value="bug" className="text-white">Bug</SelectItem>
            <SelectItem value="suggestion" className="text-white">Sugestão</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="rounded-lg border border-slate-700 overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="border-slate-700 hover:bg-slate-800/50">
              <TableHead className="text-slate-300">Tipo</TableHead>
              <TableHead className="text-slate-300">Barbearia</TableHead>
              <TableHead className="text-slate-300 max-w-xs">Mensagem</TableHead>
              <TableHead className="text-slate-300">Status</TableHead>
              <TableHead className="text-slate-300">Prioridade</TableHead>
              <TableHead className="text-slate-300">Data</TableHead>
              <TableHead className="text-slate-300 w-[70px]">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredFeedbacks.map((feedback) => (
              <TableRow key={feedback.id} className="border-slate-700 hover:bg-slate-800/50">
                <TableCell>
                  <div className="flex items-center gap-2 text-slate-400">
                    {typeIcons[feedback.type]}
                    <span className="capitalize">{feedback.type}</span>
                  </div>
                </TableCell>
                <TableCell className="text-white">
                  {feedback.company_name || "Não identificado"}
                </TableCell>
                <TableCell className="text-slate-400 max-w-xs truncate">
                  {feedback.message}
                </TableCell>
                <TableCell>
                  <Badge variant="outline" className={statusColors[feedback.status]}>
                    {feedback.status === 'pending' && 'Pendente'}
                    {feedback.status === 'in_progress' && 'Em Análise'}
                    {feedback.status === 'resolved' && 'Resolvido'}
                  </Badge>
                </TableCell>
                <TableCell>
                  <Badge variant="outline" className={priorityColors[feedback.priority || 'medium']}>
                    {feedback.priority === 'low' && 'Baixa'}
                    {feedback.priority === 'medium' && 'Média'}
                    {feedback.priority === 'high' && 'Alta'}
                  </Badge>
                </TableCell>
                <TableCell className="text-slate-400">
                  {formatDistanceToNow(new Date(feedback.created_at), { 
                    addSuffix: true, 
                    locale: ptBR 
                  })}
                </TableCell>
                <TableCell>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon" className="text-slate-400 hover:text-white">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="bg-slate-800 border-slate-700">
                      <DropdownMenuItem 
                        className="text-slate-300 focus:text-white focus:bg-slate-700"
                        onClick={() => setSelectedFeedback(feedback)}
                      >
                        <Eye className="mr-2 h-4 w-4" />
                        Ver Detalhes
                      </DropdownMenuItem>
                      <DropdownMenuSeparator className="bg-slate-700" />
                      <DropdownMenuItem 
                        className="text-slate-300 focus:text-white focus:bg-slate-700"
                        onClick={() => updateFeedback({ feedbackId: feedback.id, status: 'in_progress' })}
                      >
                        Marcar como "Em Análise"
                      </DropdownMenuItem>
                      <DropdownMenuItem 
                        className="text-green-400 focus:text-green-300 focus:bg-slate-700"
                        onClick={() => updateFeedback({ feedbackId: feedback.id, status: 'resolved' })}
                      >
                        Marcar como "Resolvido"
                      </DropdownMenuItem>
                      <DropdownMenuSeparator className="bg-slate-700" />
                      <DropdownMenuItem 
                        className="text-slate-300 focus:text-white focus:bg-slate-700"
                        onClick={() => updateFeedback({ feedbackId: feedback.id, priority: 'high' })}
                      >
                        Prioridade Alta
                      </DropdownMenuItem>
                      <DropdownMenuItem 
                        className="text-slate-300 focus:text-white focus:bg-slate-700"
                        onClick={() => updateFeedback({ feedbackId: feedback.id, priority: 'low' })}
                      >
                        Prioridade Baixa
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))}
            {filteredFeedbacks.length === 0 && (
              <TableRow>
                <TableCell colSpan={7} className="text-center text-slate-400 py-8">
                  Nenhum feedback encontrado
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      <FeedbackDetailsModal 
        feedback={selectedFeedback} 
        open={!!selectedFeedback} 
        onOpenChange={(open) => !open && setSelectedFeedback(null)} 
      />
    </div>
  );
}
