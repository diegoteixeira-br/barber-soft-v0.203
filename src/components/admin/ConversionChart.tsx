import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

interface ConversionChartProps {
  data: { date: string; visits: number; signups: number }[];
}

export function ConversionChart({ data }: ConversionChartProps) {
  const formattedData = data.map(item => ({
    ...item,
    dateLabel: format(new Date(item.date), "dd/MM", { locale: ptBR })
  }));

  const totalVisits = data.reduce((sum, d) => sum + d.visits, 0);
  const totalSignups = data.reduce((sum, d) => sum + d.signups, 0);
  const conversionRate = totalVisits > 0 
    ? ((totalSignups / totalVisits) * 100).toFixed(2) 
    : "0.00";

  return (
    <Card className="bg-slate-800 border-slate-700">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg font-semibold text-white">
            Visitantes vs Cadastros (30 dias)
          </CardTitle>
          <div className="text-right">
            <p className="text-sm text-slate-400">Taxa de Conversão</p>
            <p className="text-2xl font-bold text-blue-400">{conversionRate}%</p>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={formattedData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
              <XAxis 
                dataKey="dateLabel" 
                stroke="#94a3b8" 
                tick={{ fill: '#94a3b8', fontSize: 12 }}
              />
              <YAxis 
                stroke="#94a3b8"
                tick={{ fill: '#94a3b8', fontSize: 12 }}
              />
              <Tooltip
                contentStyle={{ 
                  backgroundColor: '#1e293b', 
                  border: '1px solid #334155',
                  borderRadius: '8px'
                }}
                labelStyle={{ color: '#f8fafc' }}
                itemStyle={{ color: '#f8fafc' }}
              />
              <Legend 
                wrapperStyle={{ paddingTop: '20px' }}
              />
              <Line 
                type="monotone" 
                dataKey="visits" 
                stroke="#3b82f6" 
                strokeWidth={2}
                name="Visitantes"
                dot={false}
              />
              <Line 
                type="monotone" 
                dataKey="signups" 
                stroke="#22c55e" 
                strokeWidth={2}
                name="Cadastros"
                dot={false}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}
