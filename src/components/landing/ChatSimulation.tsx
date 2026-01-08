import { useEffect, useState } from "react";
import { Check, CheckCheck } from "lucide-react";
interface Message {
  id: number;
  text: string;
  isBot: boolean;
  time: string;
}
const messages: Message[] = [{
  id: 1,
  text: "Oi, quero agendar um corte",
  isBot: false,
  time: "14:32"
}, {
  id: 2,
  text: "Olá! 👋 Sou o Jackson, assistente virtual da Barbearia Premium. Qual horário você prefere?",
  isBot: true,
  time: "14:32"
}, {
  id: 3,
  text: "Amanhã às 15h",
  isBot: false,
  time: "14:33"
}, {
  id: 4,
  text: "Perfeito! ✅ Agendei seu corte para amanhã às 15h com o Bruno. Te envio um lembrete 1h antes!",
  isBot: true,
  time: "14:33"
}];
export function ChatSimulation() {
  const [visibleMessages, setVisibleMessages] = useState<number[]>([]);
  useEffect(() => {
    const timers: NodeJS.Timeout[] = [];
    messages.forEach((msg, index) => {
      const timer = setTimeout(() => {
        setVisibleMessages(prev => [...prev, msg.id]);
      }, (index + 1) * 1200);
      timers.push(timer);
    });

    // Reset and repeat
    const resetTimer = setTimeout(() => {
      setVisibleMessages([]);
    }, messages.length * 1200 + 3000);
    timers.push(resetTimer);
    return () => timers.forEach(clearTimeout);
  }, [visibleMessages.length === 0]);
  return <div className="bg-[#0b141a] rounded-2xl overflow-hidden shadow-2xl border border-border/30 max-w-sm mx-auto">
      {/* WhatsApp Header */}
      

      {/* Chat Messages */}
      
    </div>;
}