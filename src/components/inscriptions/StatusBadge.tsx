
import { InscriptionStatus } from '@/types/inscription';
import { cn } from '@/lib/utils';

export const StatusBadge: React.FC<{ status: InscriptionStatus; className?: string }> = ({ status, className }) => {
  const styles = {
    pendiente: "bg-amber-500/10 text-amber-500 border-amber-500/20",
    aceptado: "bg-emerald-500/10 text-emerald-500 border-emerald-500/20",
    rechazado: "bg-red-500/10 text-red-500 border-red-500/20"
  };

  const labels = {
    pendiente: "Pendiente",
    aceptado: "Aceptado",
    rechazado: "Rechazado"
  };

  const dotColors = {
    pendiente: "bg-amber-500",
    aceptado: "bg-emerald-500",
    rechazado: "bg-red-500"
  };

  return (
    <div className={cn("inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full border text-xs font-medium w-fit", styles[status], className)} data-testid={`badge-status-${status}`}>
      <span className={cn("w-1.5 h-1.5 rounded-full", dotColors[status])} />
      {labels[status]}
    </div>
  );
};

