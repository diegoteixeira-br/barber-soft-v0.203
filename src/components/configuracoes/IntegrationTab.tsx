import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { MessageCircle, Building2 } from "lucide-react";
import { useNavigate } from "react-router-dom";

export function IntegrationTab() {
  const navigate = useNavigate();

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <MessageCircle className="h-5 w-5 text-muted-foreground" />
            <CardTitle>Integração WhatsApp</CardTitle>
          </div>
          <CardDescription>
            A configuração do WhatsApp agora é feita por unidade. Cada unidade pode ter seu próprio número de WhatsApp conectado.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center gap-4 py-6 text-center">
            <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center">
              <Building2 className="h-8 w-8 text-primary" />
            </div>
            
            <div className="space-y-1">
              <h3 className="text-lg font-medium text-foreground">Configuração por Unidade</h3>
              <p className="text-sm text-muted-foreground max-w-md">
                Para configurar o WhatsApp, acesse a tela de Unidades e edite a unidade desejada. 
                Lá você pode definir o nome da instância e conectar o WhatsApp específico daquela unidade.
              </p>
            </div>

            <Button onClick={() => navigate("/unidades")} className="mt-2">
              <Building2 className="h-4 w-4 mr-2" />
              Ir para Unidades
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
