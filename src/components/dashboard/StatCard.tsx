
import { motion } from 'framer-motion';
import { LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

interface StatCardProps {
  title: string;
  value: number | string;
  icon: LucideIcon;
  variant: 'default' | 'pending' | 'accepted';
}

export const StatCard: React.FC<StatCardProps> = ({ title, value, icon: Icon, variant }) => {
  const variantStyles = {
    default: {
      iconBg: "bg-primary/20",
      iconColor: "text-primary",
      pillBg: "bg-primary/10",
      pillText: "text-primary",
      pillBorder: "border-primary/20",
      glow: "shadow-[0_0_20px_rgba(139,92,246,0.05)]",
      border: "border-primary/15"
    },
    pending: {
      iconBg: "bg-amber-500/20",
      iconColor: "text-amber-500",
      pillBg: "bg-amber-500/10",
      pillText: "text-amber-500",
      pillBorder: "border-amber-500/20",
      glow: "shadow-[0_0_20px_rgba(245,158,11,0.05)]",
      border: "border-amber-500/15"
    },
    accepted: {
      iconBg: "bg-emerald-500/20",
      iconColor: "text-emerald-500",
      pillBg: "bg-emerald-500/10",
      pillText: "text-emerald-500",
      pillBorder: "border-emerald-500/20",
      glow: "shadow-[0_0_20px_rgba(16,185,129,0.05)]",
      border: "border-emerald-500/15"
    }
  };

  const styles = variantStyles[variant];

  return (
    <motion.div 
      variants={{
        hidden: { opacity: 0, y: 20 },
        show: { opacity: 1, y: 0 }
      }}
      className={cn(
        "bg-card rounded-xl p-5 border relative overflow-hidden transition-all duration-300 hover:shadow-lg",
        styles.border,
        styles.glow
      )}
      data-testid={`stat-card-${title.toLowerCase().replace(/\s+/g, '-')}`}
    >
      <div className="flex items-start justify-between relative z-10">
        <div className="space-y-4">
          <div className={cn("w-10 h-10 rounded-lg flex items-center justify-center", styles.iconBg)}>
            <Icon size={20} className={styles.iconColor} />
          </div>
          <div>
            <h3 className="text-3xl font-bold text-white tracking-tight">{value}</h3>
            <div className="flex items-center mt-1 gap-2">
              <span className="text-sm text-muted-foreground font-medium">{title}</span>
            </div>
          </div>
        </div>
        <div className={cn("px-2.5 py-1 rounded-full text-xs font-semibold border flex items-center gap-1.5", styles.pillBg, styles.pillText, styles.pillBorder)}>
          <div className={cn("w-1.5 h-1.5 rounded-full bg-current opacity-75")} />
          {variant === 'default' ? 'Total' : variant === 'pending' ? 'Pendientes' : 'Aceptadas'}
        </div>
      </div>
      
      {/* Decorative background gradient */}
      <div className={cn(
        "absolute -bottom-10 -right-10 w-32 h-32 rounded-full blur-2xl opacity-20 pointer-events-none",
        variant === 'default' ? "bg-primary" : variant === 'pending' ? "bg-amber-500" : "bg-emerald-500"
      )} />
    </motion.div>
  );
};

