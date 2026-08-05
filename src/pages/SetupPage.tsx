import { useState } from 'react';
import { useLocation } from 'wouter';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { auth } from '@/lib/firebase';
import { setupFirstAdmin } from '@/services/admins';
import { toast } from 'sonner';
import { motion } from 'framer-motion';
import { Loader2, AlertTriangle } from 'lucide-react';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

const setupSchema = z.object({
  name: z.string().min(2, { message: 'El nombre debe tener al menos 2 caracteres' }),
  email: z.string().email({ message: 'Correo electrónico inválido' }),
  password: z.string().min(8, { message: 'La contraseña debe tener al menos 8 caracteres' }),
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Las contraseñas no coinciden",
  path: ["confirmPassword"],
});

type SetupForm = z.infer<typeof setupSchema>;

export default function SetupPage() {
  const [, setLocation] = useLocation();
  const [loading, setLoading] = useState(false);

  const form = useForm<SetupForm>({
    resolver: zodResolver(setupSchema),
    defaultValues: { name: '', email: '', password: '', confirmPassword: '' },
  });

  const onSubmit = async (data: SetupForm) => {
    setLoading(true);
    try {
      await setupFirstAdmin({
        name: data.name,
        email: data.email,
        password: data.password,
      });
      toast.success('Super Administrador creado');
      
      // Auto-login
      await signInWithEmailAndPassword(auth, data.email, data.password);
      setLocation('/');
    } catch (err: any) {
      console.error(err);
      toast.error(err.message || 'Error al configurar');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0D0B14] flex items-center justify-center p-4 py-12">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: [0.2, 0.8, 0.2, 1] }}
        className="w-full max-w-xl"
      >
        <div className="bg-[#17141F] border border-primary/15 rounded-xl shadow-2xl overflow-hidden">
          <div className="p-8 pt-10 flex flex-col items-center border-b border-primary/10 bg-black/20">
            <div className="w-14 h-14 rounded-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center shadow-[0_0_25px_rgba(139,92,246,0.3)] mb-4 overflow-hidden">
              <img src="/bs-logo.png" alt="Bianca Studio" className="w-full h-full object-contain mix-blend-screen" />
            </div>
            <h1 className="text-2xl font-bold text-white tracking-tight">Configuración Inicial</h1>
            <p className="text-muted-foreground text-sm font-medium mt-1">Crear el primer Super Administrador</p>
          </div>

          <div className="p-8">
            <div className="mb-6 p-4 rounded-lg bg-amber-500/10 border border-amber-500/20 flex items-start gap-3">
              <AlertTriangle className="w-5 h-5 text-amber-400 flex-shrink-0 mt-0.5" />
              <p className="text-sm text-amber-300/90">
                Esta página solo es accesible una vez. Una vez creado el primer Super Administrador, esta configuración ya no estará disponible.
              </p>
            </div>

            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-muted-foreground">Nombre completo</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="Tu Nombre"
                          className="bg-black/20 border-primary/20 focus-visible:ring-primary text-white"
                          data-testid="input-name"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage className="text-red-400" />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-muted-foreground">Correo electrónico</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="admin@ejemplo.com"
                          type="email"
                          autoComplete="email"
                          className="bg-black/20 border-primary/20 focus-visible:ring-primary text-white"
                          data-testid="input-email"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage className="text-red-400" />
                    </FormItem>
                  )}
                />

                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <FormField
                    control={form.control}
                    name="password"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-muted-foreground">Contraseña</FormLabel>
                        <FormControl>
                          <Input
                            type="password"
                            placeholder="••••••••"
                            autoComplete="new-password"
                            className="bg-black/20 border-primary/20 focus-visible:ring-primary text-white"
                            data-testid="input-password"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage className="text-red-400" />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="confirmPassword"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-muted-foreground">Confirmar contraseña</FormLabel>
                        <FormControl>
                          <Input
                            type="password"
                            placeholder="••••••••"
                            autoComplete="new-password"
                            className="bg-black/20 border-primary/20 focus-visible:ring-primary text-white"
                            data-testid="input-confirm-password"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage className="text-red-400" />
                      </FormItem>
                    )}
                  />
                </div>

                <Button
                  type="submit"
                  disabled={loading}
                  className="w-full mt-2 bg-primary hover:bg-primary/90 text-white transition-all shadow-[0_0_15px_rgba(139,92,246,0.2)] hover:shadow-[0_0_20px_rgba(139,92,246,0.4)]"
                  data-testid="button-submit-setup"
                >
                  {loading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : null}
                  Completar Configuración
                </Button>
              </form>
            </Form>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
