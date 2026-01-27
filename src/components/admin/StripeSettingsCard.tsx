import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Badge } from "@/components/ui/badge";
import { useSaasSettings } from "@/hooks/useSaasSettings";
import { CreditCard, Eye, EyeOff, CheckCircle, XCircle } from "lucide-react";
import { toast } from "sonner";

export function StripeSettingsCard() {
  const { settings, updateSettings, isUpdating } = useSaasSettings();
  
  const [stripeMode, setStripeMode] = useState<string>("test");
  const [testPublishableKey, setTestPublishableKey] = useState("");
  const [testSecretKey, setTestSecretKey] = useState("");
  const [livePublishableKey, setLivePublishableKey] = useState("");
  const [liveSecretKey, setLiveSecretKey] = useState("");
  const [webhookSecret, setWebhookSecret] = useState("");
  
  const [showTestSecret, setShowTestSecret] = useState(false);
  const [showLiveSecret, setShowLiveSecret] = useState(false);
  const [showWebhookSecret, setShowWebhookSecret] = useState(false);

  useEffect(() => {
    if (settings) {
      setStripeMode(settings.stripe_mode || "test");
      setTestPublishableKey(settings.stripe_test_publishable_key || "");
      setTestSecretKey(settings.stripe_test_secret_key || "");
      setLivePublishableKey(settings.stripe_live_publishable_key || "");
      setLiveSecretKey(settings.stripe_live_secret_key || "");
      setWebhookSecret(settings.stripe_webhook_secret || "");
    }
  }, [settings]);

  const handleSave = () => {
    updateSettings({
      stripe_mode: stripeMode,
      stripe_test_publishable_key: testPublishableKey,
      stripe_test_secret_key: testSecretKey,
      stripe_live_publishable_key: livePublishableKey,
      stripe_live_secret_key: liveSecretKey,
      stripe_webhook_secret: webhookSecret,
    });
  };

  const testConnection = async () => {
    const keyToTest = stripeMode === "test" ? testSecretKey : liveSecretKey;
    
    if (!keyToTest) {
      toast.error("Configure a chave secreta primeiro");
      return;
    }

    // In a real implementation, this would call an edge function to test the Stripe connection
    toast.info("Funcionalidade de teste será implementada via Edge Function");
  };

  const isConfigured = stripeMode === "test" 
    ? !!(testPublishableKey && testSecretKey)
    : !!(livePublishableKey && liveSecretKey);

  return (
    <Card className="bg-slate-800 border-slate-700">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-purple-600/20 text-purple-400">
              <CreditCard className="h-5 w-5" />
            </div>
            <div>
              <CardTitle className="text-white">Gateway de Pagamento - Stripe</CardTitle>
              <CardDescription className="text-slate-400">
                Configure as chaves de API do Stripe
              </CardDescription>
            </div>
          </div>
          <Badge variant="outline" className={isConfigured 
            ? "bg-green-500/20 text-green-400 border-green-500/30" 
            : "bg-red-500/20 text-red-400 border-red-500/30"
          }>
            {isConfigured ? (
              <><CheckCircle className="w-3 h-3 mr-1" /> Configurado</>
            ) : (
              <><XCircle className="w-3 h-3 mr-1" /> Não Configurado</>
            )}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        <div>
          <Label className="text-slate-300 mb-3 block">Modo</Label>
          <RadioGroup value={stripeMode} onValueChange={setStripeMode} className="flex gap-4">
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="test" id="test" className="border-slate-600 text-blue-500" />
              <Label htmlFor="test" className="text-white cursor-pointer">Teste</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="live" id="live" className="border-slate-600 text-blue-500" />
              <Label htmlFor="live" className="text-white cursor-pointer">Produção</Label>
            </div>
          </RadioGroup>
        </div>

        <div className="space-y-4">
          <p className="text-sm font-medium text-slate-300">Chaves de Teste</p>
          <div className="grid gap-4">
            <div>
              <Label className="text-slate-400 text-xs">Publishable Key</Label>
              <Input
                value={testPublishableKey}
                onChange={(e) => setTestPublishableKey(e.target.value)}
                placeholder="pk_test_..."
                className="bg-slate-900 border-slate-700 text-white placeholder:text-slate-500"
              />
            </div>
            <div>
              <Label className="text-slate-400 text-xs">Secret Key</Label>
              <div className="relative">
                <Input
                  type={showTestSecret ? "text" : "password"}
                  value={testSecretKey}
                  onChange={(e) => setTestSecretKey(e.target.value)}
                  placeholder="sk_test_..."
                  className="bg-slate-900 border-slate-700 text-white placeholder:text-slate-500 pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowTestSecret(!showTestSecret)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white"
                >
                  {showTestSecret ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <p className="text-sm font-medium text-slate-300">Chaves de Produção</p>
          <div className="grid gap-4">
            <div>
              <Label className="text-slate-400 text-xs">Publishable Key</Label>
              <Input
                value={livePublishableKey}
                onChange={(e) => setLivePublishableKey(e.target.value)}
                placeholder="pk_live_..."
                className="bg-slate-900 border-slate-700 text-white placeholder:text-slate-500"
              />
            </div>
            <div>
              <Label className="text-slate-400 text-xs">Secret Key</Label>
              <div className="relative">
                <Input
                  type={showLiveSecret ? "text" : "password"}
                  value={liveSecretKey}
                  onChange={(e) => setLiveSecretKey(e.target.value)}
                  placeholder="sk_live_..."
                  className="bg-slate-900 border-slate-700 text-white placeholder:text-slate-500 pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowLiveSecret(!showLiveSecret)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white"
                >
                  {showLiveSecret ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>
          </div>
        </div>

        <div>
          <Label className="text-slate-400 text-xs">Webhook Secret</Label>
          <div className="relative">
            <Input
              type={showWebhookSecret ? "text" : "password"}
              value={webhookSecret}
              onChange={(e) => setWebhookSecret(e.target.value)}
              placeholder="whsec_..."
              className="bg-slate-900 border-slate-700 text-white placeholder:text-slate-500 pr-10"
            />
            <button
              type="button"
              onClick={() => setShowWebhookSecret(!showWebhookSecret)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white"
            >
              {showWebhookSecret ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          </div>
        </div>

        <div className="flex gap-3 pt-4">
          <Button 
            onClick={testConnection}
            variant="outline" 
            className="border-slate-600 text-slate-300 hover:bg-slate-700 hover:text-white"
          >
            Testar Conexão
          </Button>
          <Button 
            onClick={handleSave}
            disabled={isUpdating}
            className="bg-blue-600 hover:bg-blue-700"
          >
            {isUpdating ? "Salvando..." : "Salvar"}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
