import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { useSaasSettings } from "@/hooks/useSaasSettings";
import { AlertTriangle } from "lucide-react";

export function MaintenanceCard() {
  const { settings, updateSettings, isUpdating } = useSaasSettings();
  
  const [maintenanceMode, setMaintenanceMode] = useState(false);
  const [maintenanceMessage, setMaintenanceMessage] = useState("");

  useEffect(() => {
    if (settings) {
      setMaintenanceMode(settings.maintenance_mode || false);
      setMaintenanceMessage(settings.maintenance_message || "");
    }
  }, [settings]);

  const handleSave = () => {
    updateSettings({
      maintenance_mode: maintenanceMode,
      maintenance_message: maintenanceMessage,
    });
  };

  return (
    <Card className="bg-slate-800 border-slate-700">
      <CardHeader>
        <div className="flex items-center gap-3">
          <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-amber-600/20 text-amber-400">
            <AlertTriangle className="h-5 w-5" />
          </div>
          <div>
            <CardTitle className="text-white">Modo Manutenção</CardTitle>
            <CardDescription className="text-slate-400">
              Ative para exibir mensagem de manutenção aos usuários
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <Label className="text-white">Ativar Modo Manutenção</Label>
            <p className="text-sm text-slate-400">
              Os usuários verão a mensagem ao tentar acessar
            </p>
          </div>
          <Switch
            checked={maintenanceMode}
            onCheckedChange={setMaintenanceMode}
          />
        </div>

        <div>
          <Label className="text-slate-300">Mensagem de Manutenção</Label>
          <Textarea
            value={maintenanceMessage}
            onChange={(e) => setMaintenanceMessage(e.target.value)}
            placeholder="Estamos em manutenção. Voltamos em breve!"
            className="bg-slate-900 border-slate-700 text-white placeholder:text-slate-500 mt-2 min-h-[100px]"
          />
        </div>

        <Button 
          onClick={handleSave}
          disabled={isUpdating}
          className="bg-blue-600 hover:bg-blue-700"
        >
          {isUpdating ? "Salvando..." : "Salvar"}
        </Button>
      </CardContent>
    </Card>
  );
}
