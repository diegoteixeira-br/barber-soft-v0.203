import { useState } from "react";
import { Button } from "@/components/ui/button";
import { MessageCircle } from "lucide-react";
import { FeedbackFormModal } from "./FeedbackFormModal";

export function FeedbackButton() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <Button
        onClick={() => setIsOpen(true)}
        size="icon"
        className="fixed bottom-6 right-20 z-50 h-12 w-12 rounded-full bg-blue-600 hover:bg-blue-700 shadow-lg"
      >
        <MessageCircle className="h-5 w-5" />
      </Button>
      <FeedbackFormModal open={isOpen} onOpenChange={setIsOpen} />
    </>
  );
}
