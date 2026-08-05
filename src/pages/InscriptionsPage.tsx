import { useEffect, useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { Search, SortDesc, SortAsc, Inbox, Eye } from 'lucide-react';
import { subscribeToInscriptions } from '@/services/inscriptions';
import { Inscription, InscriptionStatus } from '@/types/inscription';
import { StatusBadge } from '@/components/inscriptions/StatusBadge';
import { DetailPanel } from '@/components/inscriptions/DetailPanel';
import { Skeleton } from '@/components/ui/skeleton';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import { useAuth } from '@/contexts/AuthContext';

type FilterType = 'todos' | InscriptionStatus;

export default function InscriptionsPage() {
  const { adminProfile } = useAuth();
  const isSuperadmin = adminProfile?.role === 'superadmin';

  const [inscriptions, setInscriptions] = useState<Inscription[]>([]);
  const [loading, setLoading] = useState(true);

  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState<FilterType>('todos');
  const [sortOldest, setSortOldest] = useState(false);
  const [selectedInscription, setSelectedInscription] = useState<Inscription | null>(null);

  useEffect(() => {
    const unsubscribe = subscribeToInscriptions((data) => {
      setInscriptions(data);
      setLoading(false);
      setSelectedInscription(current => {
        if (!current) return null;
        return data.find(d => d.id === current.id) ?? current;
      });
    });
    return () => unsubscribe();
  }, []);

  const filteredInscriptions = useMemo(() => {
    let result = inscriptions;

    if (filter !== 'todos') {
      result = result.filter(i => i.estado === filter);
    }

    if (search.trim()) {
      const q = search.toLowerCase();
      result = result.filter(i =>
        i.nombreCompleto?.toLowerCase().includes(q) ||
        i.usuarioMinecraft?.toLowerCase().includes(q) ||
        i.usuarioDiscord?.toLowerCase().includes(q) ||
        i.gamertagXbox?.toLowerCase().includes(q) ||
        i.pais?.toLowerCase().includes(q) ||
        i.email?.toLowerCase().includes(q)
      );
    }

    if (sortOldest) result = [...result].reverse();
    return result;
  }, [inscriptions, search, filter, sortOldest]);

  const formatDate = (val: string | undefined) => {
    if (!val) return '-';
    try {
      const d = new Date(val);
      if (isNaN(d.getTime())) return '-';
      return format(d, 'dd/MM/yyyy');
    } catch { return '-'; }
  };

  const filters: { label: string; value: FilterType }[] = [
    { label: 'Todos', value: 'todos' },
    { label: 'Pendientes', value: 'pendiente' },
    { label: 'Aceptados', value: 'aceptado' },
    { label: 'Rechazados', value: 'rechazado' },
  ];

  return (
    <div className="h-full flex flex-col p-6 md:p-8 max-w-7xl mx-auto" data-testid="page-inscriptions">

      <div className="flex flex-col gap-6 mb-6 shrink-0">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold text-white tracking-tight">Inscripciones</h1>
            {!loading && (
              <span className="px-2.5 py-0.5 rounded-full bg-primary/10 text-primary text-xs font-semibold border border-primary/20">
                {inscriptions.length} total
              </span>
            )}
          </div>
        </div>

        <div className="flex flex-col xl:flex-row gap-4 items-start xl:items-center justify-between bg-card p-2 rounded-xl border border-border">
          <div className="flex flex-wrap gap-1 p-1">
            {filters.map(f => (
              <button
                key={f.value}
                onClick={() => setFilter(f.value)}
                className={cn(
                  "px-4 py-1.5 rounded-lg text-sm font-medium transition-colors",
                  filter === f.value
                    ? "bg-primary text-white shadow-sm"
                    : "text-muted-foreground hover:bg-primary/5 hover:text-white"
                )}
                data-testid={`filter-btn-${f.value}`}
              >
                {f.label}
              </button>
            ))}
          </div>

          <div className="flex w-full xl:w-auto items-center gap-3 px-2 xl:px-0">
            <div className="relative flex-1 xl:w-64">
              <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
              <input
                type="text"
                placeholder="Buscar jugador, Minecraft, Discord…"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-9 pr-4 py-2 bg-background border border-border rounded-lg text-sm text-white placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary transition-all"
                data-testid="input-search"
              />
            </div>
            <button
              onClick={() => setSortOldest(!sortOldest)}
              className="flex items-center justify-center w-10 h-10 rounded-lg bg-background border border-border text-muted-foreground hover:text-white hover:border-primary/50 transition-colors"
              title={sortOldest ? 'Más antiguos primero' : 'Más recientes primero'}
              data-testid="btn-sort"
            >
              {sortOldest ? <SortAsc size={18} /> : <SortDesc size={18} />}
            </button>
          </div>
        </div>
      </div>

      <div className="flex-1 min-h-0 bg-card rounded-xl border border-border flex flex-col overflow-hidden relative">
        {loading ? (
          <div className="p-4 space-y-3">
            {[...Array(6)].map((_, i) => (
              <Skeleton key={i} className="h-16 w-full bg-background rounded-lg" />
            ))}
          </div>
        ) : filteredInscriptions.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center text-muted-foreground p-8">
            <div className="w-16 h-16 rounded-full bg-background border border-border/50 flex items-center justify-center mb-4">
              <Inbox size={28} className="opacity-50" />
            </div>
            <p className="font-medium text-white mb-1">No se encontraron resultados</p>
            <p className="text-sm">Intenta ajustar los filtros o la búsqueda.</p>
          </div>
        ) : (
          <div className="flex-1 overflow-auto">
            <table className="w-full text-left text-sm border-collapse">
              <thead className="sticky top-0 bg-card/95 backdrop-blur z-10 supports-[backdrop-filter]:bg-card/80 border-b border-border/50">
                <tr>
                  <th className="font-medium text-muted-foreground px-6 py-4 whitespace-nowrap">Nombre</th>
                  <th className="font-medium text-muted-foreground px-6 py-4 whitespace-nowrap">País</th>
                  <th className="font-medium text-muted-foreground px-6 py-4 whitespace-nowrap">Minecraft</th>
                  <th className="font-medium text-muted-foreground px-6 py-4 whitespace-nowrap">Discord</th>
                  <th className="font-medium text-muted-foreground px-6 py-4 whitespace-nowrap">Fecha</th>
                  <th className="font-medium text-muted-foreground px-6 py-4 whitespace-nowrap">Estado</th>
                  <th className="font-medium text-muted-foreground px-6 py-4 whitespace-nowrap text-right">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/30">
                {filteredInscriptions.map((ins) => (
                  <tr
                    key={ins.id}
                    className="hover:bg-primary/5 transition-colors group"
                    data-testid={`row-inscription-${ins.id}`}
                  >
                    <td className="px-6 py-4 whitespace-nowrap font-medium text-white">
                      {ins.nombreCompleto}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-muted-foreground">
                      {ins.pais}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap font-mono text-xs text-white/80">
                      {ins.usuarioMinecraft}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-xs text-muted-foreground">
                      {ins.usuarioDiscord ?? ins.idDiscord ?? '-'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-muted-foreground text-xs">
                      {formatDate(ins.timestamp)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <StatusBadge status={ins.estado} />
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right">
                      <button
                        onClick={() => setSelectedInscription(ins)}
                        className="inline-flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium border border-primary/30 text-primary hover:bg-primary hover:text-white transition-colors"
                        data-testid={`btn-view-${ins.id}`}
                      >
                        <Eye size={14} />
                        Ver
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <DetailPanel
        inscription={selectedInscription}
        open={!!selectedInscription}
        onClose={() => setSelectedInscription(null)}
        isSuperadmin={isSuperadmin}
        onDeleted={() => setSelectedInscription(null)}
      />
    </div>
  );
}


