import { useEffect, useState, useCallback } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { toast } from 'sonner';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { Plus, Edit2, Key, Trash2, Shield, User as UserIcon, UserCog, Loader2 } from 'lucide-react';

import { useAuth } from '@/contexts/AuthContext';
import { listAdmins, createAdmin, updateAdmin, changeAdminPassword, deleteAdmin } from '@/services/admins';
import type { AdminUser, AdminRole } from '@/types/admin';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

// Schemas
const createSchema = z.object({
  name: z.string().min(2, 'Min 2 caracteres'),
  email: z.string().email('Email inválido'),
  password: z.string().min(8, 'Min 8 caracteres'),
  role: z.enum(['admin', 'moderador'] as const),
});
type CreateForm = z.infer<typeof createSchema>;

const editSchema = z.object({
  name: z.string().min(2, 'Min 2 caracteres'),
  role: z.enum(['superadmin', 'admin', 'moderador'] as const),
});
type EditForm = z.infer<typeof editSchema>;

const passwordSchema = z.object({
  password: z.string().min(8, 'Min 8 caracteres'),
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: 'Las contraseñas no coinciden',
  path: ['confirmPassword'],
});
type PasswordForm = z.infer<typeof passwordSchema>;

export default function AdminsPage() {
  const { adminProfile } = useAuth();
  const [admins, setAdmins] = useState<AdminUser[]>([]);
  const [loading, setLoading] = useState(true);

  const [createOpen, setCreateOpen] = useState(false);
  const [editAdmin, setEditAdmin] = useState<AdminUser | null>(null);
  const [passwordAdmin, setPasswordAdmin] = useState<AdminUser | null>(null);
  const [deleteAdminData, setDeleteAdminData] = useState<AdminUser | null>(null);

  const createForm = useForm<CreateForm>({
    resolver: zodResolver(createSchema),
    defaultValues: { name: '', email: '', password: '', role: 'admin' },
  });

  const editForm = useForm<EditForm>({
    resolver: zodResolver(editSchema),
  });

  const passwordForm = useForm<PasswordForm>({
    resolver: zodResolver(passwordSchema),
    defaultValues: { password: '', confirmPassword: '' },
  });

  const [submitting, setSubmitting] = useState(false);

  const fetchAdmins = useCallback(async () => {
    try {
      setLoading(true);
      const data = await listAdmins();
      setAdmins(data);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Error al cargar admins');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void fetchAdmins();
  }, [fetchAdmins]);

  const onCreate = async (data: CreateForm) => {
    try {
      setSubmitting(true);
      await createAdmin(data);
      toast.success('Administrador creado');
      setCreateOpen(false);
      createForm.reset();
      void fetchAdmins();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Error al crear');
    } finally {
      setSubmitting(false);
    }
  };

  const onEdit = async (data: EditForm) => {
    if (!editAdmin) return;
    try {
      setSubmitting(true);
      await updateAdmin(editAdmin.uid, data);
      toast.success('Administrador actualizado');
      setEditAdmin(null);
      void fetchAdmins();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Error al actualizar');
    } finally {
      setSubmitting(false);
    }
  };

  const onChangePassword = async (data: PasswordForm) => {
    if (!passwordAdmin) return;
    try {
      setSubmitting(true);
      await changeAdminPassword(passwordAdmin.uid, data.password);
      toast.success('Contraseña actualizada');
      setPasswordAdmin(null);
      passwordForm.reset();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Error al cambiar contraseña');
    } finally {
      setSubmitting(false);
    }
  };

  const onDelete = async () => {
    if (!deleteAdminData) return;
    try {
      setSubmitting(true);
      await deleteAdmin(deleteAdminData.uid);
      toast.success('Administrador eliminado');
      setDeleteAdminData(null);
      void fetchAdmins();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Error al eliminar');
    } finally {
      setSubmitting(false);
    }
  };

  const openEdit = (admin: AdminUser) => {
    setEditAdmin(admin);
    editForm.reset({ name: admin.name, role: admin.role });
  };

  const openPassword = (admin: AdminUser) => {
    setPasswordAdmin(admin);
    passwordForm.reset({ password: '', confirmPassword: '' });
  };

  const getRoleBadge = (role: AdminRole) => {
    switch (role) {
      case 'superadmin': return <Badge className="bg-primary/20 text-primary border-primary/30 hover:bg-primary/30"><Shield className="w-3 h-3 mr-1" /> CEO</Badge>;
      case 'admin': return <Badge className="bg-indigo-500/20 text-indigo-400 border-indigo-500/30 hover:bg-indigo-500/30"><UserCog className="w-3 h-3 mr-1" /> Admin</Badge>;
      case 'moderador': return <Badge className="bg-zinc-500/20 text-zinc-400 border-zinc-500/30 hover:bg-zinc-500/30"><UserIcon className="w-3 h-3 mr-1" /> Moderador</Badge>;
      default: return <Badge>{role}</Badge>;
    }
  };

  return (
    <div className="p-6 md:p-8 max-w-7xl mx-auto w-full">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold text-white tracking-tight">Administradores</h1>
            {!loading && (
              <Badge variant="outline" className="bg-white/5 border-white/10 text-muted-foreground rounded-full px-2.5">
                {admins.length}
              </Badge>
            )}
          </div>
          <p className="text-muted-foreground text-sm mt-1">Gestiona los accesos y roles del panel.</p>
        </div>
        <Button
          onClick={() => setCreateOpen(true)}
          className="bg-primary hover:bg-primary/90 text-white shadow-[0_0_15px_rgba(139,92,246,0.2)]"
          data-testid="button-new-admin"
        >
          <Plus className="w-4 h-4 mr-2" />
          Nuevo Administrador
        </Button>
      </div>

      <div className="bg-[#17141F] border border-white/5 rounded-xl shadow-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm whitespace-nowrap">
            <thead className="bg-black/20 text-muted-foreground border-b border-white/5 uppercase text-[11px] font-semibold tracking-wider">
              <tr>
                <th className="px-6 py-4">Nombre</th>
                <th className="px-6 py-4">Correo</th>
                <th className="px-6 py-4">Rol</th>
                <th className="px-6 py-4">Creado</th>
                <th className="px-6 py-4 text-right">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {loading ? (
                Array.from({ length: 3 }).map((_, i) => (
                  <tr key={i}>
                    <td className="px-6 py-4"><Skeleton className="h-4 w-32 bg-white/5" /></td>
                    <td className="px-6 py-4"><Skeleton className="h-4 w-40 bg-white/5" /></td>
                    <td className="px-6 py-4"><Skeleton className="h-6 w-24 bg-white/5 rounded-full" /></td>
                    <td className="px-6 py-4"><Skeleton className="h-4 w-24 bg-white/5" /></td>
                    <td className="px-6 py-4"><Skeleton className="h-8 w-24 bg-white/5 ml-auto" /></td>
                  </tr>
                ))
              ) : admins.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-muted-foreground">
                    No hay administradores registrados.
                  </td>
                </tr>
              ) : (
                admins.map((admin) => {
                  const isSelf = admin.uid === adminProfile?.uid;
                  const canDelete = !isSelf && admin.role !== 'superadmin';

                  return (
                    <tr key={admin.uid} className="hover:bg-white/[0.02] transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <span className="font-medium text-white">{admin.name}</span>
                          {isSelf && (
                            <span className="px-1.5 py-0.5 rounded bg-primary/20 text-primary text-[10px] font-bold uppercase tracking-wider">
                              Tú
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 text-muted-foreground">{admin.email}</td>
                      <td className="px-6 py-4">{getRoleBadge(admin.role)}</td>
                      <td className="px-6 py-4 text-muted-foreground">
                        {admin.createdAt ? format(new Date(admin.createdAt), 'd MMM yyyy', { locale: es }) : 'N/A'}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-muted-foreground hover:text-white hover:bg-white/10"
                            onClick={() => openEdit(admin)}
                            data-testid={`btn-edit-${admin.uid}`}
                            title="Editar"
                          >
                            <Edit2 className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-muted-foreground hover:text-white hover:bg-white/10"
                            onClick={() => openPassword(admin)}
                            data-testid={`btn-pwd-${admin.uid}`}
                            title="Cambiar contraseña"
                          >
                            <Key className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-muted-foreground hover:text-red-400 hover:bg-red-400/10"
                            onClick={() => setDeleteAdminData(admin)}
                            disabled={!canDelete}
                            data-testid={`btn-del-${admin.uid}`}
                            title={!canDelete ? 'No puedes eliminar este usuario' : 'Eliminar'}
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* CREATE DIALOG */}
      <Dialog open={createOpen} onOpenChange={setCreateOpen}>
        <DialogContent className="bg-[#17141F] border border-white/10 text-white sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Nuevo Administrador</DialogTitle>
            <DialogDescription className="text-muted-foreground">
              Añade un nuevo miembro al equipo con acceso al panel.
            </DialogDescription>
          </DialogHeader>
          <Form {...createForm}>
            <form onSubmit={createForm.handleSubmit(onCreate)} className="space-y-4 pt-4">
              <FormField control={createForm.control} name="name" render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-muted-foreground">Nombre completo</FormLabel>
                  <FormControl><Input className="bg-black/20 border-white/10 text-white" {...field} /></FormControl>
                  <FormMessage className="text-red-400" />
                </FormItem>
              )} />
              <FormField control={createForm.control} name="email" render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-muted-foreground">Correo electrónico</FormLabel>
                  <FormControl><Input type="email" className="bg-black/20 border-white/10 text-white" {...field} /></FormControl>
                  <FormMessage className="text-red-400" />
                </FormItem>
              )} />
              <FormField control={createForm.control} name="password" render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-muted-foreground">Contraseña</FormLabel>
                  <FormControl><Input type="password" placeholder="••••••••" className="bg-black/20 border-white/10 text-white" {...field} /></FormControl>
                  <FormMessage className="text-red-400" />
                </FormItem>
              )} />
              <FormField control={createForm.control} name="role" render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-muted-foreground">Rol</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger className="bg-black/20 border-white/10 text-white">
                        <SelectValue placeholder="Selecciona un rol" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent className="bg-[#17141F] border-white/10 text-white">
                      <SelectItem value="admin">Administrador</SelectItem>
                      <SelectItem value="moderador">Moderador</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage className="text-red-400" />
                </FormItem>
              )} />
              <div className="flex justify-end gap-3 pt-4 border-t border-white/5">
                <Button type="button" variant="ghost" onClick={() => setCreateOpen(false)} className="hover:bg-white/5 text-muted-foreground">Cancelar</Button>
                <Button type="submit" disabled={submitting} className="bg-primary hover:bg-primary/90 text-white">
                  {submitting && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                  Crear
                </Button>
              </div>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      {/* EDIT DIALOG */}
      <Dialog open={!!editAdmin} onOpenChange={(o) => !o && setEditAdmin(null)}>
        <DialogContent className="bg-[#17141F] border border-white/10 text-white sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Editar Administrador</DialogTitle>
            <DialogDescription className="text-muted-foreground">
              Actualiza los datos de {editAdmin?.name}.
            </DialogDescription>
          </DialogHeader>
          <Form {...editForm}>
            <form onSubmit={editForm.handleSubmit(onEdit)} className="space-y-4 pt-4">
              <FormItem>
                <FormLabel className="text-muted-foreground">Correo electrónico</FormLabel>
                <Input value={editAdmin?.email || ''} readOnly disabled className="bg-black/40 border-transparent text-muted-foreground opacity-70" />
              </FormItem>
              <FormField control={editForm.control} name="name" render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-muted-foreground">Nombre completo</FormLabel>
                  <FormControl><Input className="bg-black/20 border-white/10 text-white" {...field} /></FormControl>
                  <FormMessage className="text-red-400" />
                </FormItem>
              )} />
              <FormField control={editForm.control} name="role" render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-muted-foreground">Rol</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value} disabled={editAdmin?.role === 'superadmin'}>
                    <FormControl>
                      <SelectTrigger className="bg-black/20 border-white/10 text-white disabled:opacity-50">
                        <SelectValue placeholder="Selecciona un rol" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent className="bg-[#17141F] border-white/10 text-white">
                      {editAdmin?.role === 'superadmin' && <SelectItem value="superadmin">CEO</SelectItem>}
                      <SelectItem value="admin">Administrador</SelectItem>
                      <SelectItem value="moderador">Moderador</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage className="text-red-400" />
                </FormItem>
              )} />
              <div className="flex justify-end gap-3 pt-4 border-t border-white/5">
                <Button type="button" variant="ghost" onClick={() => setEditAdmin(null)} className="hover:bg-white/5 text-muted-foreground">Cancelar</Button>
                <Button type="submit" disabled={submitting} className="bg-primary hover:bg-primary/90 text-white">
                  {submitting && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                  Guardar cambios
                </Button>
              </div>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      {/* PASSWORD DIALOG */}
      <Dialog open={!!passwordAdmin} onOpenChange={(o) => !o && setPasswordAdmin(null)}>
        <DialogContent className="bg-[#17141F] border border-white/10 text-white sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Cambiar contraseña</DialogTitle>
            <DialogDescription className="text-muted-foreground">
              Establecer nueva contraseña para {passwordAdmin?.name}.
            </DialogDescription>
          </DialogHeader>
          <Form {...passwordForm}>
            <form onSubmit={passwordForm.handleSubmit(onChangePassword)} className="space-y-4 pt-4">
              <FormField control={passwordForm.control} name="password" render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-muted-foreground">Nueva contraseña</FormLabel>
                  <FormControl><Input type="password" placeholder="••••••••" className="bg-black/20 border-white/10 text-white" {...field} /></FormControl>
                  <FormMessage className="text-red-400" />
                </FormItem>
              )} />
              <FormField control={passwordForm.control} name="confirmPassword" render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-muted-foreground">Confirmar contraseña</FormLabel>
                  <FormControl><Input type="password" placeholder="••••••••" className="bg-black/20 border-white/10 text-white" {...field} /></FormControl>
                  <FormMessage className="text-red-400" />
                </FormItem>
              )} />
              <div className="flex justify-end gap-3 pt-4 border-t border-white/5">
                <Button type="button" variant="ghost" onClick={() => setPasswordAdmin(null)} className="hover:bg-white/5 text-muted-foreground">Cancelar</Button>
                <Button type="submit" disabled={submitting} className="bg-primary hover:bg-primary/90 text-white">
                  {submitting && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                  Actualizar
                </Button>
              </div>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      {/* DELETE ALERT */}
      <AlertDialog open={!!deleteAdminData} onOpenChange={(o) => !o && setDeleteAdminData(null)}>
        <AlertDialogContent className="bg-[#17141F] border border-white/10 text-white">
          <AlertDialogHeader>
            <AlertDialogTitle>¿Estás seguro?</AlertDialogTitle>
            <AlertDialogDescription className="text-muted-foreground">
              Esta acción eliminará el acceso de {deleteAdminData?.name} al panel de administración permanentemente.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="border-t border-white/5 pt-4 mt-4">
            <AlertDialogCancel className="bg-transparent text-muted-foreground hover:bg-white/5 hover:text-white border-transparent">
              Cancelar
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={(e) => { e.preventDefault(); void onDelete(); }}
              disabled={submitting}
              className="bg-red-500/20 text-red-500 hover:bg-red-500 hover:text-white border border-red-500/30 transition-colors"
            >
              {submitting && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              Eliminar administrador
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

