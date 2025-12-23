import { Megaphone, Zap } from "lucide-react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CampaignsTab } from "@/components/marketing/CampaignsTab";
import { AutomationsTab } from "@/components/marketing/AutomationsTab";

export default function Marketing() {
  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Marketing</h1>
          <p className="text-muted-foreground">
            Gerencie campanhas e automações para engajar seus clientes
          </p>
        </div>

        <Tabs defaultValue="campaigns" className="w-full">
          <TabsList className="grid w-full max-w-md grid-cols-2">
            <TabsTrigger value="campaigns" className="flex items-center gap-2">
              <Megaphone className="h-4 w-4" />
              Campanhas
            </TabsTrigger>
            <TabsTrigger value="automations" className="flex items-center gap-2">
              <Zap className="h-4 w-4" />
              Automações
            </TabsTrigger>
          </TabsList>

          <TabsContent value="campaigns" className="mt-6">
            <CampaignsTab />
          </TabsContent>

          <TabsContent value="automations" className="mt-6">
            <AutomationsTab />
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
}
