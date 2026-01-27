import { ReactNode } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface KPICardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: ReactNode;
  trend?: "up" | "down" | "neutral";
  trendValue?: string;
  className?: string;
}

export function KPICard({ 
  title, 
  value, 
  subtitle, 
  icon, 
  trend, 
  trendValue,
  className 
}: KPICardProps) {
  return (
    <Card className={cn("bg-slate-800 border-slate-700", className)}>
      <CardContent className="p-6">
        <div className="flex items-start justify-between">
          <div className="space-y-2">
            <p className="text-sm font-medium text-slate-400">{title}</p>
            <p className="text-3xl font-bold text-white">{value}</p>
            {subtitle && (
              <p className="text-sm text-slate-400">{subtitle}</p>
            )}
            {trendValue && trend && (
              <p className={cn(
                "text-sm font-medium",
                trend === "up" && "text-green-500",
                trend === "down" && "text-red-500",
                trend === "neutral" && "text-slate-400"
              )}>
                {trend === "up" && "↑ "}
                {trend === "down" && "↓ "}
                {trendValue}
              </p>
            )}
          </div>
          <div className="flex items-center justify-center w-12 h-12 rounded-lg bg-blue-600/20 text-blue-400">
            {icon}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
