import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Users, Timer, CheckCircle2, ChevronRight, User } from 'lucide-react';
import { Link } from 'wouter';
import { subscribeToInscriptions } from '@/services/inscriptions';
import { Inscription } from '@/types/inscription';
import { StatCard } from '@/components/dashboard/StatCard';
import { StatusBadge } from '@/components/inscriptions/StatusBadge';
import { Skeleton } from '@/components/ui/skeleton';

export default function DashboardPage() {
  const [inscriptions, setInscriptions] = useState<Inscription[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = subscribeToInscriptions((data) => {
      setInscriptions(data);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const total = inscriptions.length;
  const pendientes = inscriptions.filter(i => i.estado === 'pendiente').length;
  const aceptadas = inscriptions.filter(i => i.estado === 'aceptado').length;

  const recent = inscriptions.slice(0, 5);

  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.1 }
    }
  };

  return (
    <div className="p-6 md:p-8 max-w-6xl mx-auto space-y-8" data-testid="page-dashboard">
      <div>
        <h1 className="text-2xl font-bold text-white tracking-tight">Panel de Control</h1>
        <p className="text-muted-foreground mt-1 text-sm">Resumen en tiempo real de las inscripciones a MagicLand IV.</p>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[1, 2, 3].map(i => (
            <Skeleton key={i} className="h-32 rounded-xl bg-card border border-border" />
          ))}
        </div>
      ) : (
        <motion.div 
          className="grid grid-cols-1 md:grid-cols-3 gap-6"
          variants={containerVariants}
          initial="hidden"
          animate="show"
        >
          <StatCard title="Inscripciones Totales" value={total} icon={Users} variant="default" />
          <StatCard title="Aplicaciones Pendientes" value={pendientes} icon={Timer} variant="pending" />
          <StatCard title="Jugadores Aceptados" value={aceptadas} icon={CheckCircle2} variant="accepted" />
        </motion.div>
      )}

      <div className="pt-4">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-white">Últimas Inscripciones</h2>
          <Link href="/inscripciones">
            <span className="text-sm text-primary hover:text-primary/80 font-medium flex items-center transition-colors cursor-pointer" data-testid="link-view-all">
              Ver todas <ChevronRight size={16} className="ml-0.5" />
            </span>
          </Link>
        </div>

        <div className="bg-card rounded-xl border border-border overflow-hidden">
          {loading ? (
            <div className="p-4 space-y-3">
              {[1, 2, 3].map(i => <Skeleton key={i} className="h-14 w-full bg-background rounded-lg" />)}
            </div>
          ) : recent.length === 0 ? (
            <div className="p-12 text-center text-muted-foreground flex flex-col items-center">
              <User size={32} className="mb-3 opacity-20" />
              <p>Aún no hay inscripciones.</p>
            </div>
          ) : (
            <div className="divide-y divide-border/50">
              {recent.map((ins, i) => (
                <Link key={ins.id} href="/inscripciones">
                  <motion.div 
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 + (i * 0.05) }}
                    className="flex items-center justify-between p-4 hover:bg-primary/5 transition-colors cursor-pointer group"
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-full bg-background flex items-center justify-center text-muted-foreground border border-border/50 group-hover:border-primary/30 group-hover:text-primary transition-colors">
                        <User size={18} />
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-white">{ins.nombre}</p>
                        <p className="text-xs text-muted-foreground flex items-center gap-1.5 mt-0.5">
                          {ins.pais} • <span className="opacity-70 font-mono">{ins.minecraft}</span>
                        </p>
                      </div>
                    </div>
                    <StatusBadge status={ins.estado} />
                  </motion.div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

