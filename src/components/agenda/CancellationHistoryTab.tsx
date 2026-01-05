import { useState } from "react";
import { format, subDays, startOfMonth, endOfMonth } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Calendar, AlertTriangle, UserX, Phone, DollarSign, Trash2, Filter } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Toggle } from "@/components/ui/toggle";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Skeleton } from "@/components/ui/skeleton";
import { useCancellationHistory } from "@/hooks/useCancellationHistory";

type PeriodFilter = "7d" | "30d" | "month" | "all";

export function CancellationHistoryTab() {
  const [period, setPeriod] = useState<PeriodFilter>("30d");
  const [onlyLate, setOnlyLate] = useState(false);
  const [onlyNoShow, setOnlyNoShow] = useState(false);

  const getDateRange = () => {
    const now = new Date();
    switch (period) {
      case "7d":
        return { startDate: subDays(now, 7), endDate: now };
      case "30d":
        return { startDate: subDays(now, 30), endDate: now };
      case "month":
        return { startDate: startOfMonth(now), endDate: endOfMonth(now) };
      case "all":
        return {};
    }
  };

  const { records, isLoading, summary, deleteCancellationRecord } = useCancellationHistory({
    ...getDateRange(),
    onlyLate: onlyLate && !onlyNoShow ? true : undefined,
    onlyNoShow: onlyNoShow ? true : undefined,
  });

  const getStatusBadge = (record: typeof records[0]) => {
    if (record.is_no_show) {
      return (
        <Badge variant="destructive" className="gap-1">
          <UserX className="h-3 w-3" />
          Faltou
        </Badge>
      );
    }
    if (record.is_late_cancellation) {
      return (
        <Badge variant="destructive" className="gap-1 bg-orange-500 hover:bg-orange-500/80">
          <AlertTriangle className="h-3 w-3" />
          Tardio
        </Badge>
      );
    }
    return (
      <Badge variant="secondary">
        Normal
      </Badge>
    );
  };

  const getSourceLabel = (source: string) => {
    switch (source) {
      case "whatsapp":
        return "WhatsApp";
      case "manual":
        return "Manual";
      case "no_show":
        return "No-show";
      default:
        return source;
    }
  };

  if (isLoading) {
    return (
      <div className="p-6 space-y-4">
        <Skeleton className="h-32 w-full" />
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Total Cancelamentos</CardDescription>
            <CardTitle className="text-2xl">{summary.totalCount}</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription className="flex items-center gap-1">
              <AlertTriangle className="h-3 w-3 text-orange-500" />
              Cancelamentos Tardios
            </CardDescription>
            <CardTitle className="text-2xl text-orange-500">{summary.lateCount}</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription className="flex items-center gap-1">
              <UserX className="h-3 w-3 text-destructive" />
              No-shows (Faltas)
            </CardDescription>
            <CardTitle className="text-2xl text-destructive">{summary.noShowCount}</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription className="flex items-center gap-1">
              <DollarSign className="h-3 w-3" />
              Valor Pendente (Tardios/Faltas)
            </CardDescription>
            <CardTitle className="text-2xl">R$ {summary.lateValue.toFixed(2)}</CardTitle>
          </CardHeader>
        </Card>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="flex items-center gap-2">
          <Filter className="h-4 w-4 text-muted-foreground" />
          <span className="text-sm text-muted-foreground">Filtros:</span>
        </div>
        
        <Select value={period} onValueChange={(v) => setPeriod(v as PeriodFilter)}>
          <SelectTrigger className="w-[150px]">
            <Calendar className="h-4 w-4 mr-2" />
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="7d">Últimos 7 dias</SelectItem>
            <SelectItem value="30d">Últimos 30 dias</SelectItem>
            <SelectItem value="month">Este mês</SelectItem>
            <SelectItem value="all">Todos</SelectItem>
          </SelectContent>
        </Select>

        <Toggle
          pressed={onlyLate}
          onPressedChange={(pressed) => {
            setOnlyLate(pressed);
            if (pressed) setOnlyNoShow(false);
          }}
          className="gap-1.5"
        >
          <AlertTriangle className="h-4 w-4" />
          Apenas Tardios
        </Toggle>

        <Toggle
          pressed={onlyNoShow}
          onPressedChange={(pressed) => {
            setOnlyNoShow(pressed);
            if (pressed) setOnlyLate(false);
          }}
          className="gap-1.5"
        >
          <UserX className="h-4 w-4" />
          Apenas Faltas
        </Toggle>
      </div>

      {/* Table */}
      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Data/Hora Agendada</TableHead>
                <TableHead>Cliente</TableHead>
                <TableHead>Profissional</TableHead>
                <TableHead>Serviço</TableHead>
                <TableHead>Valor</TableHead>
                <TableHead>Cancelado em</TableHead>
                <TableHead>Antecedência</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Origem</TableHead>
                <TableHead></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {records.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={10} className="text-center py-8 text-muted-foreground">
                    Nenhum cancelamento encontrado
                  </TableCell>
                </TableRow>
              ) : (
                records.map((record) => (
                  <TableRow key={record.id}>
                    <TableCell>
                      <div className="flex flex-col">
                        <span className="font-medium">
                          {format(new Date(record.scheduled_time), "dd/MM/yyyy", { locale: ptBR })}
                        </span>
                        <span className="text-sm text-muted-foreground">
                          {format(new Date(record.scheduled_time), "HH:mm")}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-col">
                        <span className="font-medium">{record.client_name}</span>
                        {record.client_phone && (
                          <span className="text-sm text-muted-foreground flex items-center gap-1">
                            <Phone className="h-3 w-3" />
                            {record.client_phone}
                          </span>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>{record.barber_name}</TableCell>
                    <TableCell>{record.service_name}</TableCell>
                    <TableCell className="font-medium">
                      R$ {Number(record.total_price).toFixed(2)}
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-col">
                        <span>
                          {format(new Date(record.cancelled_at), "dd/MM/yyyy", { locale: ptBR })}
                        </span>
                        <span className="text-sm text-muted-foreground">
                          {format(new Date(record.cancelled_at), "HH:mm")}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell>
                      {record.is_no_show ? (
                        <span className="text-destructive font-medium">Não compareceu</span>
                      ) : record.minutes_before < 0 ? (
                        <span className="text-destructive">{Math.abs(record.minutes_before)} min depois</span>
                      ) : (
                        <span>{record.minutes_before} min</span>
                      )}
                    </TableCell>
                    <TableCell>{getStatusBadge(record)}</TableCell>
                    <TableCell>
                      <Badge variant="outline">{getSourceLabel(record.cancellation_source)}</Badge>
                    </TableCell>
                    <TableCell>
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button variant="ghost" size="icon" className="h-8 w-8">
                            <Trash2 className="h-4 w-4 text-muted-foreground" />
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Excluir registro?</AlertDialogTitle>
                            <AlertDialogDescription>
                              Este registro de cancelamento será removido permanentemente.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancelar</AlertDialogCancel>
                            <AlertDialogAction
                              onClick={() => deleteCancellationRecord.mutate(record.id)}
                              className="bg-destructive hover:bg-destructive/90"
                            >
                              Excluir
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
