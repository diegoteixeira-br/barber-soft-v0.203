import { useState, useEffect } from "react";
import { Cake, UserX, Save, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { useMarketingSettings } from "@/hooks/useMarketingSettings";
import { Skeleton } from "@/components/ui/skeleton";

export function AutomationsTab() {
  const { settings, isLoading, updateSettings } = useMarketingSettings();
  
  const [birthdayEnabled, setBirthdayEnabled] = useState(false);
  const [birthdayMessage, setBirthdayMessage] = useState("");
  const [rescueEnabled, setRescueEnabled] = useState(false);
  const [rescueDays, setRescueDays] = useState(30);
  const [rescueMessage, setRescueMessage] = useState("");

  useEffect(() => {
    if (settings) {
      setBirthdayEnabled(settings.birthday_automation_enabled ?? false);
      setBirthdayMessage(settings.birthday_message_template ?? "");
      setRescueEnabled(settings.rescue_automation_enabled ?? false);
      setRescueDays(settings.rescue_days_threshold ?? 30);
      setRescueMessage(settings.rescue_message_template ?? "");
    }
  }, [settings]);

  const handleSave = () => {
    updateSettings.mutate({
      birthday_automation_enabled: birthdayEnabled,
      birthday_message_template: birthdayMessage,
      rescue_automation_enabled: rescueEnabled,
      rescue_days_threshold: rescueDays,
      rescue_message_template: rescueMessage,
    });
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-[250px] w-full" />
        <Skeleton className="h-[300px] w-full" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Birthday Automation */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                <Cake className="h-5 w-5 text-primary" />
              </div>
              <div>
                <CardTitle className="text-lg">Aniversário</CardTitle>
                <CardDescription>
                  Envio automático de mensagem no dia do aniversário do cliente
                </CardDescription>
              </div>
            </div>
            <Switch
              checked={birthdayEnabled}
              onCheckedChange={setBirthdayEnabled}
            />
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="birthday-message">Mensagem de Parabéns</Label>
            <Textarea
              id="birthday-message"
              placeholder="Olá {{nome}}! Feliz aniversário! 🎂"
              value={birthdayMessage}
              onChange={(e) => setBirthdayMessage(e.target.value)}
              className="mt-2 min-h-[100px]"
              disabled={!birthdayEnabled}
            />
            <p className="mt-1 text-xs text-muted-foreground">
              Use <code className="rounded bg-muted px-1">{"{{nome}}"}</code> para inserir o nome do cliente
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Rescue/Reactivation Automation */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-orange-500/10">
                <UserX className="h-5 w-5 text-orange-500" />
              </div>
              <div>
                <CardTitle className="text-lg">Resgate de Clientes</CardTitle>
                <CardDescription>
                  Envio automático para clientes inativos após X dias
                </CardDescription>
              </div>
            </div>
            <Switch
              checked={rescueEnabled}
              onCheckedChange={setRescueEnabled}
            />
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center gap-4">
            <Label htmlFor="rescue-days" className="whitespace-nowrap">
              Enviar após
            </Label>
            <Input
              id="rescue-days"
              type="number"
              min={7}
              max={90}
              value={rescueDays}
              onChange={(e) => setRescueDays(Number(e.target.value))}
              className="w-20"
              disabled={!rescueEnabled}
            />
            <span className="text-sm text-muted-foreground">dias sem vir</span>
          </div>

          <div>
            <Label htmlFor="rescue-message">Mensagem de Resgate</Label>
            <Textarea
              id="rescue-message"
              placeholder="Olá {{nome}}! Sentimos sua falta..."
              value={rescueMessage}
              onChange={(e) => setRescueMessage(e.target.value)}
              className="mt-2 min-h-[100px]"
              disabled={!rescueEnabled}
            />
            <p className="mt-1 text-xs text-muted-foreground">
              Use <code className="rounded bg-muted px-1">{"{{nome}}"}</code> para inserir o nome do cliente
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Save Button */}
      <div className="flex justify-end">
        <Button onClick={handleSave} disabled={updateSettings.isPending} size="lg">
          {updateSettings.isPending ? (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          ) : (
            <Save className="mr-2 h-4 w-4" />
          )}
          Salvar Configurações
        </Button>
      </div>
    </div>
  );
}
