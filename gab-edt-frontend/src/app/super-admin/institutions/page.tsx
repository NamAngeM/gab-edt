"use client";

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';

// Mock data
const initialMockInstitutions = [
  { id: 1, name: 'Université Omar Bongo', code: 'UOB', type: 'UNIVERSITY', city: 'Libreville', users: 1240, status: 'active', joined: '2025-01-15' },
  { id: 2, name: 'Lycée National Léon Mba', code: 'LNLM', type: 'LYCEE', city: 'Libreville', users: 850, status: 'active', joined: '2025-02-10' },
  { id: 3, name: 'Institut Supérieur de Technologie', code: 'IST', type: 'GRANDE_ECOLE', city: 'Owendo', users: 430, status: 'warning', joined: '2025-03-22' },
  { id: 4, name: 'Collège Bessieux', code: 'CB', type: 'COLLEGE', city: 'Libreville', users: 620, status: 'suspended', joined: '2024-11-05' },
];

const PREMIUM_FEATURES = [
  { id: 'sms_alerts', name: 'Alertes SMS Parents', desc: 'Envoi automatique de SMS aux parents en cas d\'absence.' },
  { id: 'ai_scheduler', name: 'Générateur IA', desc: 'Création optimisée des emplois du temps par intelligence artificielle.' },
  { id: 'api_access', name: 'Accès API & Webhooks', desc: 'Intégration avec des logiciels de comptabilité externes.' },
  { id: 'digital_workspace', name: 'Espace Numérique Étudiant', desc: 'Portail web et mobile complet pour les élèves et étudiants.' },
];

export default function InstitutionsPage() {
  const router = useRouter();
  
  const [searchTerm, setSearchTerm] = useState('');
  const [institutions, setInstitutions] = useState(initialMockInstitutions);
  
  // Modals state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isFeatureModalOpen, setIsFeatureModalOpen] = useState(false);
  const [selectedInst, setSelectedInst] = useState<any>(null);
  
  // Feature Toggles State (Simulated per institution)
  const [featureFlags, setFeatureFlags] = useState<Record<string, boolean>>({
    sms_alerts: true,
    ai_scheduler: false,
    api_access: false,
    digital_workspace: true,
  });

  // Form state
  const [formData, setFormData] = useState({
    name: '',
    code: '',
    type: 'LYCEE',
    city: ''
  });

  const handleAddInstitution = (e: React.FormEvent) => {
    e.preventDefault();
    const newInstitution = {
      id: institutions.length + 1,
      name: formData.name,
      code: formData.code,
      type: formData.type,
      city: formData.city,
      users: 0,
      status: 'active',
      joined: new Date().toISOString().split('T')[0]
    };
    setInstitutions([newInstitution, ...institutions]);
    setIsModalOpen(false);
    setFormData({ name: '', code: '', type: 'LYCEE', city: '' });
  };

  const handleMagicLogin = (inst: any) => {
    // 1. We mock the login process by overriding the user_data in localStorage
    // 2. The admin layout will pick this up and display the school name!
    const mockUser = {
      firstName: inst.name,
      lastName: '(Admin)',
      role: 'SCHOOL_ADMIN',
      tenantId: inst.id,
      tenantType: inst.type
    };
    localStorage.setItem('user_data', JSON.stringify(mockUser));
    
    // Redirect to the school admin dashboard
    router.push('/admin');
  };

  const openFeatures = (inst: any) => {
    setSelectedInst(inst);
    // In a real app, we would fetch the flags for this specific tenant from the DB
    setIsFeatureModalOpen(true);
  };

  const toggleFeature = (featureId: string) => {
    setFeatureFlags(prev => ({
      ...prev,
      [featureId]: !prev[featureId]
    }));
  };

  return (
    <div className="animate-fade-in" style={{ paddingBottom: 'var(--space-3xl)' }}>
      <header style={{ marginBottom: 'var(--space-xl)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: 'var(--space-xs)' }}>
            Gestion des Établissements
          </h1>
          <p style={{ color: 'var(--text-secondary)' }}>
            Ajoutez, configurez et suspendez les établissements clients de la plateforme.
          </p>
        </div>
        <button 
          className="btn btn-primary" 
          style={{ display: 'flex', alignItems: 'center', gap: '8px' }}
          onClick={() => setIsModalOpen(true)}
        >
          <span className="material-symbols-outlined">add</span>
          Nouvel Établissement
        </button>
      </header>

      <div className="card">
        <div style={{ padding: 'var(--space-lg)', borderBottom: '1px solid var(--border)', display: 'flex', gap: 'var(--space-md)' }}>
          <div className="topbar-search" style={{ margin: 0, flex: 1, background: 'var(--background)' }}>
            <span className="material-symbols-outlined topbar-search-icon">search</span>
            <input 
              type="text" 
              placeholder="Rechercher par nom ou code..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <select className="form-input" style={{ width: '200px' }}>
            <option>Tous les types</option>
            <option>Université</option>
            <option>Lycée</option>
            <option>Collège</option>
          </select>
          <select className="form-input" style={{ width: '150px' }}>
            <option>Tous statuts</option>
            <option>Actif</option>
            <option>Suspendu</option>
          </select>
        </div>

        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
            <thead>
              <tr style={{ background: 'var(--surface-container-lowest)', color: 'var(--text-muted)', fontSize: '0.875rem' }}>
                <th style={{ padding: 'var(--space-md) var(--space-lg)', fontWeight: 500 }}>Établissement</th>
                <th style={{ padding: 'var(--space-md) var(--space-lg)', fontWeight: 500 }}>Type</th>
                <th style={{ padding: 'var(--space-md) var(--space-lg)', fontWeight: 500 }}>Utilisateurs</th>
                <th style={{ padding: 'var(--space-md) var(--space-lg)', fontWeight: 500 }}>Statut</th>
                <th style={{ padding: 'var(--space-md) var(--space-lg)', fontWeight: 500, textAlign: 'right' }}>Actions Avancées</th>
              </tr>
            </thead>
            <tbody>
              {institutions.filter(i => i.name.toLowerCase().includes(searchTerm.toLowerCase())).map((inst) => (
                <tr key={inst.id} style={{ borderBottom: '1px solid var(--border)' }} className="hover:bg-slate-50 transition-colors">
                  <td style={{ padding: 'var(--space-md) var(--space-lg)' }}>
                    <div style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{inst.name}</div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Code: {inst.code} • Ville: {inst.city}</div>
                  </td>
                  <td style={{ padding: 'var(--space-md) var(--space-lg)' }}>
                    <span style={{ 
                      background: inst.type === 'UNIVERSITY' ? '#F3E8FF' : inst.type === 'LYCEE' ? '#E0F2FE' : '#FEF3C7', 
                      color: inst.type === 'UNIVERSITY' ? '#7E22CE' : inst.type === 'LYCEE' ? '#0369A1' : '#B45309', 
                      padding: '4px 10px', 
                      borderRadius: 'var(--radius-full)', 
                      fontSize: '0.75rem', 
                      fontWeight: 600 
                    }}>
                      {inst.type}
                    </span>
                  </td>
                  <td style={{ padding: 'var(--space-md) var(--space-lg)', color: 'var(--text-secondary)', fontWeight: 500 }}>
                    {inst.users.toLocaleString()}
                  </td>
                  <td style={{ padding: 'var(--space-md) var(--space-lg)' }}>
                    {inst.status === 'active' && <span style={{ color: 'var(--success)', display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.875rem' }}><span className="material-symbols-outlined" style={{ fontSize: '1rem' }}>check_circle</span> Actif</span>}
                    {inst.status === 'warning' && <span style={{ color: 'var(--warning)', display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.875rem' }}><span className="material-symbols-outlined" style={{ fontSize: '1rem' }}>warning</span> Limite atteinte</span>}
                    {inst.status === 'suspended' && <span style={{ color: 'var(--danger)', display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.875rem' }}><span className="material-symbols-outlined" style={{ fontSize: '1rem' }}>block</span> Suspendu</span>}
                  </td>
                  <td style={{ padding: 'var(--space-md) var(--space-lg)', textAlign: 'right', display: 'flex', justifyContent: 'flex-end', gap: '8px' }}>
                    <button 
                      className="btn btn-outline" 
                      style={{ padding: '6px', color: 'var(--info)' }} 
                      title="Gérer les modules (Feature Flagging)"
                      onClick={() => openFeatures(inst)}
                    >
                      <span className="material-symbols-outlined" style={{ fontSize: '1.125rem' }}>extension</span>
                    </button>
                    <button 
                      className="btn btn-outline" 
                      style={{ padding: '6px', color: '#7E22CE', borderColor: '#E9D5FF', background: '#FAF5FF' }} 
                      title="Se connecter en tant que... (Magic Login)"
                      onClick={() => handleMagicLogin(inst)}
                    >
                      <span className="material-symbols-outlined" style={{ fontSize: '1.125rem' }}>login</span>
                    </button>
                    <button className="btn btn-outline" style={{ padding: '6px', color: 'var(--danger)', borderColor: 'var(--danger-bg)' }} title="Suspendre l'établissement">
                      <span className="material-symbols-outlined" style={{ fontSize: '1.125rem' }}>lock</span>
                    </button>
                  </td>
                </tr>
              ))}
              {institutions.filter(i => i.name.toLowerCase().includes(searchTerm.toLowerCase())).length === 0 && (
                <tr>
                  <td colSpan={5} style={{ padding: 'var(--space-xl)', textAlign: 'center', color: 'var(--text-muted)' }}>
                    Aucun établissement trouvé.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* MODAL FEATURE FLAGGING */}
      {isFeatureModalOpen && selectedInst && (
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
          background: 'rgba(15, 23, 42, 0.4)', backdropFilter: 'blur(4px)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999
        }}>
          <div className="card animate-fade-in" style={{ width: '100%', maxWidth: '500px', padding: '0' }}>
            <div style={{ padding: 'var(--space-lg)', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <h2 style={{ fontSize: '1.25rem', fontWeight: 600, color: 'var(--text-primary)' }}>Modules & Options</h2>
                <div style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>{selectedInst.name}</div>
              </div>
              <button onClick={() => setIsFeatureModalOpen(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}>
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>
            
            <div style={{ padding: 'var(--space-lg)' }}>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', marginBottom: 'var(--space-lg)' }}>
                Activez ou désactivez les fonctionnalités premium pour ce client. Les modifications sont appliquées instantanément.
              </p>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-md)' }}>
                {PREMIUM_FEATURES.map(feature => (
                  <div key={feature.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: 'var(--space-md)', border: '1px solid var(--border)', borderRadius: 'var(--radius)' }}>
                    <div>
                      <div style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{feature.name}</div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{feature.desc}</div>
                    </div>
                    {/* UI Toggle Switch */}
                    <div 
                      onClick={() => toggleFeature(feature.id)}
                      style={{ 
                        width: '40px', height: '22px', 
                        borderRadius: '11px', 
                        background: featureFlags[feature.id] ? 'var(--primary)' : 'var(--border-strong)',
                        position: 'relative',
                        cursor: 'pointer',
                        transition: 'background 0.3s'
                      }}
                    >
                      <div style={{
                        width: '18px', height: '18px',
                        borderRadius: '50%', background: 'white',
                        position: 'absolute', top: '2px',
                        left: featureFlags[feature.id] ? '20px' : '2px',
                        transition: 'left 0.3s',
                        boxShadow: '0 1px 3px rgba(0,0,0,0.2)'
                      }} />
                    </div>
                  </div>
                ))}
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 'var(--space-sm)', marginTop: 'var(--space-xl)' }}>
                <button type="button" className="btn btn-primary" onClick={() => setIsFeatureModalOpen(false)}>Enregistrer les modules</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* MODAL AJOUT ETABLISSEMENT */}
      {isModalOpen && (
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
          background: 'rgba(15, 23, 42, 0.4)', backdropFilter: 'blur(4px)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999
        }}>
          <div className="card animate-fade-in" style={{ width: '100%', maxWidth: '500px', padding: '0' }}>
            <div style={{ padding: 'var(--space-lg)', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h2 style={{ fontSize: '1.25rem', fontWeight: 600, color: 'var(--text-primary)' }}>Nouvel Établissement</h2>
              <button onClick={() => setIsModalOpen(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}>
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>
            
            <form onSubmit={handleAddInstitution} style={{ padding: 'var(--space-lg)' }}>
              <div className="form-group" style={{ marginBottom: 'var(--space-md)' }}>
                <label className="form-label">Nom de l'établissement</label>
                <input type="text" className="form-input" required value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})} />
              </div>

              <div style={{ display: 'flex', gap: 'var(--space-md)', marginBottom: 'var(--space-md)' }}>
                <div className="form-group" style={{ flex: 1 }}>
                  <label className="form-label">Code (Court)</label>
                  <input type="text" className="form-input" required value={formData.code} onChange={(e) => setFormData({...formData, code: e.target.value})} />
                </div>
                <div className="form-group" style={{ flex: 1 }}>
                  <label className="form-label">Ville</label>
                  <input type="text" className="form-input" required value={formData.city} onChange={(e) => setFormData({...formData, city: e.target.value})} />
                </div>
              </div>

              <div className="form-group" style={{ marginBottom: 'var(--space-xl)' }}>
                <label className="form-label">Type d'établissement</label>
                <select className="form-input" required value={formData.type} onChange={(e) => setFormData({...formData, type: e.target.value})}>
                  <option value="LYCEE">Lycée</option>
                  <option value="COLLEGE">Collège</option>
                  <option value="UNIVERSITY">Université</option>
                  <option value="GRANDE_ECOLE">Grande École</option>
                </select>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 'var(--space-sm)' }}>
                <button type="button" className="btn btn-outline" onClick={() => setIsModalOpen(false)}>Annuler</button>
                <button type="submit" className="btn btn-primary">Créer le locataire</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
