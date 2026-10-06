"use client";

import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { fetchWithAuth } from '@/lib/api';
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { AlertCircle, Plus, Mail, Shield, ShieldCheck, Pencil, KeySquare, MapPin } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";

const aclSchema = z.object({
  managedOrgUnitIds: z.array(z.string()),
});
type AclFormValues = z.infer<typeof aclSchema>;

const userSchema = z.object({
  id: z.string().optional(),
  firstName: z.string().min(1, "Prénom requis"),
  lastName: z.string().min(1, "Nom requis"),
  email: z.string().email("Email invalide").or(z.literal('')).optional(),
  password: z.string().optional(),
  phone: z.string().optional(),
  role: z.string().min(1, "Rôle requis"),
  active: z.boolean().optional(),
});
type UserFormValues = z.infer<typeof userSchema>;

export default function UsersAdminPage() {
  const [users, setUsers] = useState<any[]>([]);
  const [orgUnits, setOrgUnits] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  // ACL Modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<any>(null);
  const [modalError, setModalError] = useState('');

  const aclForm = useForm<AclFormValues>({
    mode: "onTouched",
    resolver: zodResolver(aclSchema),
    defaultValues: { managedOrgUnitIds: [] }
  });

  // User Create/Edit state
  const [isUserModalOpen, setIsUserModalOpen] = useState(false);
  const [userModalError, setUserModalError] = useState('');

  const userForm = useForm<UserFormValues>({
    mode: "onTouched",
    resolver: zodResolver(userSchema),
    defaultValues: {
      id: '', email: '', password: '', firstName: '', lastName: '', phone: '', role: 'TEACHER', active: true
    }
  });

  const loadData = async () => {
    setLoading(true);
    try {
      const [usersRes, orgUnitsRes] = await Promise.all([
        fetchWithAuth('/users'),
        fetchWithAuth('/org-units')
      ]);
      const usersData = Array.isArray(usersRes.data) ? usersRes.data : usersRes.data?.content || [];
      const orgData = Array.isArray(orgUnitsRes) ? orgUnitsRes : orgUnitsRes.data?.content || [];
      
      setUsers(usersData);
      setOrgUnits(orgData);
    } catch (err: any) {
      setError('Erreur lors du chargement des données. Vous devez être administrateur global.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleOpenEdit = (user: any) => {
    setSelectedUser(user);
    aclForm.reset({
      managedOrgUnitIds: user.managedOrgUnitIds || []
    });
    setModalError('');
    setIsModalOpen(true);
  };

  const handleAclSubmit = async (data: AclFormValues) => {
    if (!selectedUser) return;
    setModalError('');
    try {
      await fetchWithAuth(`/users/${selectedUser.id}/managed-units`, {
        method: 'PUT',
        body: JSON.stringify(data.managedOrgUnitIds)
      });
      setIsModalOpen(false);
      loadData();
    } catch (err) {
      setModalError('Erreur lors de la modification des droits.');
    }
  };

  const handleOpenUserModal = (user?: any) => {
    setUserModalError('');
    if (user) {
      userForm.reset({
        id: user.id, email: user.email, password: '', firstName: user.firstName, lastName: user.lastName,
        phone: user.phone || '', role: user.role, active: user.active
      });
    } else {
      userForm.reset({
        id: '', email: '', password: '', firstName: '', lastName: '', phone: '', role: 'TEACHER', active: true
      });
    }
    setIsUserModalOpen(true);
  };

  const handleUserSubmit = async (data: UserFormValues) => {
    setUserModalError('');
    try {
      const isCreate = !data.id;
      const url = isCreate ? '/users' : `/users/${data.id}`;
      const method = isCreate ? 'POST' : 'PUT';
      
      const payload = isCreate ? {
        email: data.email, password: data.password, firstName: data.firstName,
        lastName: data.lastName, phone: data.phone, role: data.role, active: data.active
      } : {
        firstName: data.firstName, lastName: data.lastName, phone: data.phone,
        role: data.role, active: data.active
      };

      await fetchWithAuth(url, {
        method,
        body: JSON.stringify(payload)
      });
      
      setIsUserModalOpen(false);
      loadData();
    } catch (err) {
      setUserModalError('Erreur lors de la sauvegarde de l\'utilisateur.');
    }
  };

  const getRoleBadge = (role: string) => {
    switch (role) {
      case 'SUPER_ADMIN':
        return <span className="px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400 border border-red-200 dark:border-red-800">Super Admin</span>;
      case 'SCHOOL_ADMIN':
        return <span className="px-2.5 py-0.5 rounded-full text-xs font-medium bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400 border border-amber-200 dark:border-amber-800">Administrateur</span>;
      case 'PEDAGOGICAL_MANAGER':
        return <span className="px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400 border border-blue-200 dark:border-blue-800">Resp. Pédagogique</span>;
      case 'TEACHER':
        return <span className="px-2.5 py-0.5 rounded-full text-xs font-medium bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800">Enseignant</span>;
      default:
        return <span className="px-2.5 py-0.5 rounded-full text-xs font-medium bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300 border border-slate-200 dark:border-slate-700">{role}</span>;
    }
  };

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white">Gestion des Rôles & Accès</h1>
          <p className="text-slate-500 dark:text-slate-400 mt-2">
            Gérez les comptes utilisateurs de la plateforme, attribuez les droits (ACL) et les rôles.
          </p>
        </div>
        <Button onClick={() => handleOpenUserModal()} className="bg-brand-600 hover:bg-brand-700 shadow-sm">
          <Plus className="w-4 h-4 mr-2" />
          Ajouter un utilisateur
        </Button>
      </div>

      {error && (
        <div className="bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 p-4 rounded-xl text-sm border border-red-100 dark:border-red-900/30 flex items-start gap-3">
          <AlertCircle className="w-5 h-5 mt-0.5 flex-shrink-0" />
          <div>
            <p className="font-semibold">Accès refusé</p>
            <p>{error}</p>
          </div>
        </div>
      )}

      {loading ? (
        <div className="flex flex-col items-center justify-center p-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand-600 mb-4"></div>
          <p className="text-slate-500">Chargement des utilisateurs...</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          <AnimatePresence>
            {users.map((user, idx) => (
              <motion.div
                key={user.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.05 }}
              >
                <Card className="h-full flex flex-col hover:border-brand-300 dark:hover:border-brand-700 transition-colors shadow-sm relative group overflow-hidden">
                  <div className={`absolute top-0 inset-x-0 h-1 ${!user.active ? 'bg-red-500' : 'bg-transparent group-hover:bg-brand-500 transition-colors'}`}></div>
                  <CardHeader className="pb-4">
                    <div className="flex items-center gap-3">
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-lg ${!user.active ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400' : 'bg-brand-100 dark:bg-brand-900/30 text-brand-700 dark:text-brand-300'}`}>
                        {user.firstName.charAt(0)}{user.lastName.charAt(0)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <CardTitle className="text-base truncate" title={`${user.firstName} ${user.lastName}`}>
                          {user.firstName} {user.lastName} {!user.active && <span className="text-xs text-red-500 font-normal">(Inactif)</span>}
                        </CardTitle>
                        <CardDescription className="mt-1">{getRoleBadge(user.role)}</CardDescription>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="flex-1 space-y-4">
                    <div className="space-y-2 text-sm text-slate-600 dark:text-slate-400">
                      <div className="flex items-center gap-2">
                        <Mail className="w-4 h-4 text-slate-400 shrink-0" />
                        <span className="truncate">{user.email}</span>
                      </div>
                    </div>

                    {(user.role === 'PEDAGOGICAL_MANAGER' || user.role === 'SCHOOL_ADMIN') && (
                      <div className="pt-4 border-t border-slate-100 dark:border-slate-800">
                        <div className="flex items-center gap-2 mb-2">
                          <ShieldCheck className="w-4 h-4 text-emerald-500" />
                          <span className="text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider">Unités gérées</span>
                        </div>
                        {user.managedOrgUnitIds && user.managedOrgUnitIds.length > 0 ? (
                          <div className="flex flex-wrap gap-1.5">
                            {user.managedOrgUnitIds.slice(0, 3).map((id: string) => {
                              const u = orgUnits.find(ou => ou.id === id);
                              return (
                                <span key={id} className="text-[10px] uppercase font-bold tracking-wider bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 px-2 py-1 rounded-md border border-slate-200 dark:border-slate-700">
                                  {u ? u.name : id}
                                </span>
                              );
                            })}
                            {user.managedOrgUnitIds.length > 3 && (
                              <span className="text-[10px] uppercase font-bold tracking-wider bg-slate-100 dark:bg-slate-800 text-slate-500 px-2 py-1 rounded-md border border-slate-200 dark:border-slate-700">
                                +{user.managedOrgUnitIds.length - 3}
                              </span>
                            )}
                          </div>
                        ) : (
                          <p className="text-xs text-slate-400 italic">Aucun droit spécifique</p>
                        )}
                      </div>
                    )}
                  </CardContent>
                  <CardFooter className="pt-4 border-t bg-slate-50/50 dark:bg-slate-900/20 flex gap-2">
                    <Button variant="outline" size="sm" className="flex-1" onClick={() => handleOpenUserModal(user)}>
                      <Pencil className="w-3.5 h-3.5 mr-2" />
                      Modifier
                    </Button>
                    {(user.role === 'PEDAGOGICAL_MANAGER' || user.role === 'SCHOOL_ADMIN') && (
                      <Button variant="secondary" size="sm" className="flex-1 text-brand-700 hover:text-brand-800" onClick={() => handleOpenEdit(user)}>
                        <Shield className="w-3.5 h-3.5 mr-2" />
                        Droits
                      </Button>
                    )}
                  </CardFooter>
                </Card>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}

      {/* Modal ACL */}
      <Dialog open={isModalOpen} onOpenChange={(open) => !open && setIsModalOpen(false)}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Droits de {selectedUser?.firstName}</DialogTitle>
            <DialogDescription>
              Sélectionnez les unités organisationnelles que cet utilisateur peut administrer. Les droits s'appliquent en cascade aux sous-unités.
            </DialogDescription>
          </DialogHeader>

          {modalError && (
            <div className="bg-red-50 text-red-600 p-3 rounded-lg text-sm border border-red-100 flex items-start gap-2">
               <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
               <span>{modalError}</span>
            </div>
          )}

          <Form {...aclForm}>
            <form onSubmit={aclForm.handleSubmit(handleAclSubmit)} className="space-y-4 pt-2">
              <FormField
                control={aclForm.control}
                name="managedOrgUnitIds"
                render={() => (
                  <FormItem>
                    <div className="max-h-[50vh] overflow-y-auto p-1 space-y-1 pr-2 custom-scrollbar">
                      {orgUnits.map((unit) => (
                        <FormField
                          key={unit.id}
                          control={aclForm.control}
                          name="managedOrgUnitIds"
                          render={({ field }) => {
                            const isChecked = field.value?.includes(unit.id);
                            return (
                              <FormItem key={unit.id} className={`flex flex-row items-center space-x-3 space-y-0 p-3 rounded-lg border transition-colors cursor-pointer ${isChecked ? 'bg-brand-50 border-brand-200 dark:bg-brand-900/20 dark:border-brand-800' : 'hover:bg-slate-50 dark:hover:bg-slate-800/50 border-transparent'}`}>
                                <FormControl>
                                  <Checkbox
                                    checked={isChecked}
                                    onCheckedChange={(checked) => {
                                      return checked
                                        ? field.onChange([...field.value, unit.id])
                                        : field.onChange(field.value?.filter((value) => value !== unit.id))
                                    }}
                                  />
                                </FormControl>
                                <FormLabel className="font-medium cursor-pointer w-full flex justify-between">
                                  <span>{unit.name}</span>
                                  <span className="text-slate-400 font-normal text-xs">{unit.type}</span>
                                </FormLabel>
                              </FormItem>
                            )
                          }}
                        />
                      ))}
                    </div>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="flex justify-end gap-3 pt-4 border-t">
                <Button type="button" variant="outline" onClick={() => setIsModalOpen(false)}>
                  Annuler
                </Button>
                <Button type="submit" disabled={aclForm.formState.isSubmitting} className="bg-brand-600 hover:bg-brand-700 shadow-sm">
                  {aclForm.formState.isSubmitting ? 'Enregistrement...' : 'Enregistrer les droits'}
                </Button>
              </div>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      {/* Modal Créer / Modifier Utilisateur */}
      <Dialog open={isUserModalOpen} onOpenChange={(open) => !open && setIsUserModalOpen(false)}>
        <DialogContent className="sm:max-w-[550px]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <KeySquare className="w-5 h-5 text-brand-600" />
              {userForm.getValues().id ? 'Modifier l\'utilisateur' : 'Créer un utilisateur'}
            </DialogTitle>
            <DialogDescription>
              Remplissez les informations du compte utilisateur.
            </DialogDescription>
          </DialogHeader>

          {userModalError && (
            <div className="bg-red-50 text-red-600 p-3 rounded-lg text-sm border border-red-100 flex items-start gap-2">
              <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
              <span>{userModalError}</span>
            </div>
          )}

          <Form {...userForm}>
            <form onSubmit={userForm.handleSubmit(handleUserSubmit)} className="space-y-4 pt-4">
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={userForm.control}
                  name="firstName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Prénom *</FormLabel>
                      <FormControl>
                        <Input placeholder="Jean" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={userForm.control}
                  name="lastName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Nom *</FormLabel>
                      <FormControl>
                        <Input placeholder="Dupont" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              {!userForm.getValues().id && (
                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={userForm.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Email *</FormLabel>
                        <FormControl>
                          <Input type="email" placeholder="jean.dupont@ecole.fr" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={userForm.control}
                    name="password"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Mot de passe provisoire *</FormLabel>
                        <FormControl>
                          <Input type="password" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              )}

              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={userForm.control}
                  name="phone"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Téléphone</FormLabel>
                      <FormControl>
                        <Input placeholder="+33 6..." {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={userForm.control}
                  name="role"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Rôle attribué *</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Sélectionner un rôle" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="STUDENT">Étudiant</SelectItem>
                          <SelectItem value="TEACHER">Enseignant</SelectItem>
                          <SelectItem value="PEDAGOGICAL_MANAGER">Responsable Pédagogique</SelectItem>
                          <SelectItem value="SCHOOL_ADMIN">Administrateur</SelectItem>
                          <SelectItem value="SUPER_ADMIN">Super Administrateur</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="bg-slate-50 dark:bg-slate-900/50 p-4 rounded-lg border mt-2">
                <FormField
                  control={userForm.control}
                  name="active"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-center space-x-3 space-y-0">
                      <FormControl>
                        <Switch
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                      <div className="space-y-1 leading-none">
                        <FormLabel className="font-medium cursor-pointer">
                          Activer le compte
                        </FormLabel>
                        <p className="text-xs text-slate-500 mt-1">
                          Un compte désactivé ne peut pas se connecter au portail.
                        </p>
                      </div>
                    </FormItem>
                  )}
                />
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t mt-6">
                <Button type="button" variant="ghost" onClick={() => setIsUserModalOpen(false)}>
                  Annuler
                </Button>
                <Button type="submit" disabled={userForm.formState.isSubmitting} className="bg-brand-600 hover:bg-brand-700 shadow-sm">
                  {userForm.formState.isSubmitting ? 'Enregistrement...' : 'Enregistrer le compte'}
                </Button>
              </div>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
