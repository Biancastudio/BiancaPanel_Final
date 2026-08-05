import { useEffect, useState } from "react";
import { useLocation } from "wouter";
import { AlertCircle } from "lucide-react";

export default function NotFound() {
  const [location] = useLocation();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  return (
    <div className="flex w-full flex-col items-center justify-center min-h-[50vh] p-8 text-center" data-testid="page-not-found">
      <AlertCircle className="h-16 w-16 text-muted-foreground mb-6 opacity-50" />
      <h1 className="text-4xl font-bold text-white mb-2">404</h1>
      <h2 className="text-xl font-medium text-muted-foreground mb-6">Página no encontrada</h2>
      <p className="text-sm text-muted-foreground/70 mb-8 max-w-md mx-auto">
        La ruta <code className="bg-muted px-1.5 py-0.5 rounded text-white font-mono">{location}</code> no existe en el panel de control.
      </p>
    </div>
  );
}
