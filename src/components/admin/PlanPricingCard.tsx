import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useSaasSettings } from "@/hooks/useSaasSettings";
import { DollarSign } from "lucide-react";

export function PlanPricingCard() {
  const { settings, updateSettings, isUpdating } = useSaasSettings();
  
  const [trialDays, setTrialDays] = useState<number>(14);
  const [professionalPrice, setProfessionalPrice] = useState<number>(149.90);
  const [elitePrice, setElitePrice] = useState<number>(249.90);
  const [empirePrice, setEmpirePrice] = useState<number>(449.90);

  useEffect(() => {
    if (settings) {
      setTrialDays(settings.default_trial_days || 14);
      setProfessionalPrice(Number(settings.professional_plan_price) || 149.90);
      setElitePrice(Number(settings.elite_plan_price) || 249.90);
      setEmpirePrice(Number(settings.empire_plan_price) || 449.90);
    }
  }, [settings]);

  const handleSave = () => {
    updateSettings({
      default_trial_days: trialDays,
      professional_plan_price: professionalPrice,
      elite_plan_price: elitePrice,
      empire_plan_price: empirePrice,
    });
  };

  return (
    <Card className="bg-slate-800 border-slate-700">
      <CardHeader>
        <div className="flex items-center gap-3">
          <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-green-600/20 text-green-400">
            <DollarSign className="h-5 w-5" />
          </div>
          <div>
            <CardTitle className="text-white">Preços dos Planos</CardTitle>
            <CardDescription className="text-slate-400">
              Configure os preços e período de trial
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        <div>
          <Label className="text-slate-300">Trial Padrão (dias)</Label>
          <Input
            type="number"
            value={trialDays}
            onChange={(e) => setTrialDays(Number(e.target.value))}
            min={1}
            max={60}
            className="bg-slate-900 border-slate-700 text-white mt-2 max-w-[200px]"
          />
        </div>

        <div className="grid gap-4">
          <div>
            <Label className="text-slate-300">Plano Profissional</Label>
            <div className="relative mt-2 max-w-[200px]">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">R$</span>
              <Input
                type="number"
                value={professionalPrice}
                onChange={(e) => setProfessionalPrice(Number(e.target.value))}
                step="0.01"
                min={0}
                className="bg-slate-900 border-slate-700 text-white pl-10"
              />
              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400">/mês</span>
            </div>
          </div>

          <div>
            <Label className="text-slate-300">Plano Elite</Label>
            <div className="relative mt-2 max-w-[200px]">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">R$</span>
              <Input
                type="number"
                value={elitePrice}
                onChange={(e) => setElitePrice(Number(e.target.value))}
                step="0.01"
                min={0}
                className="bg-slate-900 border-slate-700 text-white pl-10"
              />
              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400">/mês</span>
            </div>
          </div>

          <div>
            <Label className="text-slate-300">Plano Empire</Label>
            <div className="relative mt-2 max-w-[200px]">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">R$</span>
              <Input
                type="number"
                value={empirePrice}
                onChange={(e) => setEmpirePrice(Number(e.target.value))}
                step="0.01"
                min={0}
                className="bg-slate-900 border-slate-700 text-white pl-10"
              />
              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400">/mês</span>
            </div>
          </div>
        </div>

        <Button 
          onClick={handleSave}
          disabled={isUpdating}
          className="bg-blue-600 hover:bg-blue-700"
        >
          {isUpdating ? "Salvando..." : "Salvar Preços"}
        </Button>
      </CardContent>
    </Card>
  );
}
