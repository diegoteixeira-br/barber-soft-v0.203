import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { useFeedback } from "@/hooks/useFeedback";
import { MessageSquare, Bug, Lightbulb } from "lucide-react";

interface FeedbackFormModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function FeedbackFormModal({ open, onOpenChange }: FeedbackFormModalProps) {
  const [type, setType] = useState<'feedback' | 'bug' | 'suggestion'>('feedback');
  const [message, setMessage] = useState("");
  const { submitFeedback, isSubmitting } = useFeedback();

  const handleSubmit = () => {
    if (!message.trim()) return;
    
    submitFeedback(
      { type, message },
      {
        onSuccess: () => {
          setMessage("");
          setType('feedback');
          onOpenChange(false);
        }
      }
    );
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Enviar Feedback</DialogTitle>
          <DialogDescription>
            Sua opinião é muito importante para nós. Compartilhe sua experiência ou reporte um problema.
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-6 mt-4">
          <div>
            <Label className="text-sm font-medium mb-3 block">Tipo</Label>
            <RadioGroup 
              value={type} 
              onValueChange={(value) => setType(value as typeof type)}
              className="grid grid-cols-3 gap-3"
            >
              <div>
                <RadioGroupItem value="feedback" id="feedback" className="peer sr-only" />
                <Label
                  htmlFor="feedback"
                  className="flex flex-col items-center justify-center rounded-lg border-2 border-muted bg-transparent p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary cursor-pointer"
                >
                  <MessageSquare className="mb-2 h-5 w-5" />
                  <span className="text-xs">Feedback</span>
                </Label>
              </div>
              <div>
                <RadioGroupItem value="bug" id="bug" className="peer sr-only" />
                <Label
                  htmlFor="bug"
                  className="flex flex-col items-center justify-center rounded-lg border-2 border-muted bg-transparent p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary cursor-pointer"
                >
                  <Bug className="mb-2 h-5 w-5" />
                  <span className="text-xs">Bug</span>
                </Label>
              </div>
              <div>
                <RadioGroupItem value="suggestion" id="suggestion" className="peer sr-only" />
                <Label
                  htmlFor="suggestion"
                  className="flex flex-col items-center justify-center rounded-lg border-2 border-muted bg-transparent p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary cursor-pointer"
                >
                  <Lightbulb className="mb-2 h-5 w-5" />
                  <span className="text-xs">Sugestão</span>
                </Label>
              </div>
            </RadioGroup>
          </div>

          <div>
            <Label htmlFor="message" className="text-sm font-medium mb-2 block">
              Mensagem
            </Label>
            <Textarea
              id="message"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder={
                type === 'bug' 
                  ? "Descreva o problema encontrado com o máximo de detalhes..."
                  : type === 'suggestion'
                  ? "Compartilhe sua ideia de melhoria..."
                  : "Conte-nos sua experiência..."
              }
              className="min-h-[120px]"
            />
          </div>

          <div className="flex justify-end gap-3">
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              Cancelar
            </Button>
            <Button 
              onClick={handleSubmit}
              disabled={!message.trim() || isSubmitting}
            >
              {isSubmitting ? "Enviando..." : "Enviar"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
