import React, { useState, useEffect } from 'react';
import {
  ExternalLink,
  Globe,
  Sparkles,
  Share2,
  DollarSign,
  Plus,
  Trash2,
  Edit2,
} from 'lucide-react';
import { StorageAdapter } from '@/services/storageAdapter';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Input, Select, Textarea } from '@/components/ui/Input';
import { Modal } from '@/components/ui/Modal';
import { useToast } from '@/context/ToastContext';
import { PromptLibrary } from './digital/PromptLibrary';
import { SmmManager } from './digital/SmmManager';
import { GigsManager } from './digital/GigsManager';
import type { Project } from '@/types/workspace';
import type { PromptTemplate, SmmOrder, OnlineGig } from '@/types/digitalLibrary';

type DigitalTab = 'projects' | 'prompts' | 'smm' | 'gigs';

export const DigitalLabPage: React.FC = () => {
  const { showSuccess, showError } = useToast();
  const [activeTab, setActiveTab] = useState<DigitalTab>('projects');

  // Data
  const [projects, setProjects] = useState<Project[]>([]);
  const [prompts, setPrompts] = useState<PromptTemplate[]>([]);
  const [smmOrders, setSmmOrders] = useState<SmmOrder[]>([]);
  const [gigs, setGigs] = useState<OnlineGig[]>([]);

  // Project Modal
  const [isProjectModalOpen, setIsProjectModalOpen] = useState(false);
  const [editingProject, setEditingProject] = useState<Project | null>(null);
  const [projName, setProjName] = useState('');
  const [projUrl, setProjUrl] = useState('');
  const [projRepo, setProjRepo] = useState('');
  const [projPlatform, setProjPlatform] = useState<Project['platform']>('Netlify');
  const [projStatus, setProjStatus] = useState<Project['status']>('active');
  const [projType, setProjType] = useState<Project['type']>('business');
  const [projDesc, setProjDesc] = useState('');

  const loadData = () => {
    setProjects(StorageAdapter.getProjects());
    setPrompts(StorageAdapter.getPrompts());
    setSmmOrders(StorageAdapter.getSmmOrders());
    setGigs(StorageAdapter.getOnlineGigs());
  };

  useEffect(() => {
    loadData();
  }, []);

  const openAddProject = () => {
    setEditingProject(null);
    setProjName('');
    setProjUrl('');
    setProjRepo('');
    setProjPlatform('Netlify');
    setProjStatus('active');
    setProjType('business');
    setProjDesc('');
    setIsProjectModalOpen(true);
  };

  const openEditProject = (p: Project) => {
    setEditingProject(p);
    setProjName(p.name);
    setProjUrl(p.url || '');
    setProjRepo(p.repoUrl || '');
    setProjPlatform(p.platform);
    setProjStatus(p.status);
    setProjType(p.type);
    setProjDesc(p.description || '');
    setIsProjectModalOpen(true);
  };

  const handleSaveProject = (e: React.FormEvent) => {
    e.preventDefault();
    if (!projName.trim()) {
      showError('Project name is required.');
      return;
    }

    try {
      const now = new Date().toISOString();
      StorageAdapter.saveProject({
        id: editingProject?.id || `proj_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
        name: projName.trim(),
        url: projUrl.trim() || undefined,
        repoUrl: projRepo.trim() || undefined,
        platform: projPlatform,
        status: projStatus,
        type: projType,
        description: projDesc.trim() || undefined,
        createdAt: editingProject?.createdAt || now,
        updatedAt: now,
      });

      showSuccess(editingProject ? 'Project Updated' : 'Project Added', projName.trim());
      setIsProjectModalOpen(false);
      loadData();
    } catch {
      showError('Failed to save project.');
    }
  };

  const handleDeleteProject = (id: string, name: string) => {
    if (window.confirm(`Delete project "${name}"?`)) {
      StorageAdapter.deleteProject(id);
      showSuccess('Project Removed', name);
      loadData();
    }
  };

  return (
    <div className="space-y-6 max-w-5xl">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-slate-100 tracking-tight">
              Digital Lab
            </h1>
            <Badge variant="primary">Innovation & Digital Operations</Badge>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Website deployments, prompt engineering vault, SMM reseller tracking, and gig revenue.
          </p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-1.5 border-b border-slate-200 dark:border-slate-800 pb-2 overflow-x-auto">
        {[
          { id: 'projects', label: `Web Portfolio (${projects.length})`, icon: <Globe className="w-3.5 h-3.5" /> },
          { id: 'prompts', label: `Prompt Library (${prompts.length})`, icon: <Sparkles className="w-3.5 h-3.5" /> },
          { id: 'smm', label: `SMM Reseller Hub (${smmOrders.length})`, icon: <Share2 className="w-3.5 h-3.5" /> },
          { id: 'gigs', label: `Online Gigs (${gigs.length})`, icon: <DollarSign className="w-3.5 h-3.5" /> },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as DigitalTab)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors whitespace-nowrap ${
              activeTab === tab.id
                ? 'bg-indigo-600 text-white shadow-xs font-semibold'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            {tab.icon}
            <span>{tab.label}</span>
          </button>
        ))}
      </div>

      {/* Tab 1: Projects */}
      {activeTab === 'projects' && (
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <p className="text-xs text-slate-500">
              Active live deployments, staging environments, and client portfolio sites.
            </p>
            <Button variant="primary" size="sm" onClick={openAddProject} leftIcon={<Plus className="w-3.5 h-3.5" />}>
              Add Deployment
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {projects.map((proj) => (
              <Card key={proj.id} className="p-4 space-y-3 flex flex-col justify-between">
                <div className="space-y-2">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <h4 className="text-xs font-semibold text-slate-900 dark:text-slate-100">{proj.name}</h4>
                      <div className="flex items-center gap-2 mt-0.5">
                        <Badge size="sm" variant="neutral">{proj.platform}</Badge>
                        <Badge size="sm" variant={proj.status === 'active' ? 'success' : 'default'}>{proj.status}</Badge>
                      </div>
                    </div>
                  </div>

                  {proj.description && (
                    <p className="text-[11px] text-slate-500">{proj.description}</p>
                  )}

                  {proj.url && (
                    <a
                      href={proj.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs text-indigo-600 dark:text-indigo-400 hover:underline inline-flex items-center gap-1 font-mono break-all"
                    >
                      {proj.url} <ExternalLink className="w-3 h-3 text-slate-400 shrink-0" />
                    </a>
                  )}
                </div>

                <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex justify-end gap-1">
                  <Button size="sm" variant="ghost" onClick={() => openEditProject(proj)} className="h-7 px-2">
                    <Edit2 className="w-3 h-3" />
                  </Button>
                  <Button size="sm" variant="ghost" onClick={() => handleDeleteProject(proj.id, proj.name)} className="h-7 px-2 text-rose-500 hover:text-rose-600">
                    <Trash2 className="w-3 h-3" />
                  </Button>
                </div>
              </Card>
            ))}
          </div>

          {/* Project Modal */}
          <Modal isOpen={isProjectModalOpen} onClose={() => setIsProjectModalOpen(false)} title={editingProject ? 'Edit Project' : 'Add Web Project'}>
            <form onSubmit={handleSaveProject} className="space-y-3">
              <Input label="Project Name" required value={projName} onChange={(e) => setProjName(e.target.value)} placeholder="e.g. Portfolio Website" />
              <Input label="Live URL" type="url" value={projUrl} onChange={(e) => setProjUrl(e.target.value)} placeholder="https://..." />
              <Input label="Git Repository URL (Optional)" type="url" value={projRepo} onChange={(e) => setProjRepo(e.target.value)} placeholder="https://github.com/..." />

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <Select
                  label="Host Platform"
                  value={projPlatform}
                  onChange={(e) => setProjPlatform(e.target.value as Project['platform'])}
                  options={[
                    { value: 'Netlify', label: 'Netlify' },
                    { value: 'Vercel', label: 'Vercel' },
                    { value: 'Firebase', label: 'Firebase' },
                    { value: 'GitHub', label: 'GitHub Pages' },
                    { value: 'Custom', label: 'Custom VPS' },
                  ]}
                />
                <Select
                  label="Status"
                  value={projStatus}
                  onChange={(e) => setProjStatus(e.target.value as Project['status'])}
                  options={[
                    { value: 'active', label: 'Active' },
                    { value: 'in_progress', label: 'In Progress' },
                    { value: 'planned', label: 'Planned' },
                    { value: 'archived', label: 'Archived' },
                  ]}
                />
                <Select
                  label="Category"
                  value={projType}
                  onChange={(e) => setProjType(e.target.value as Project['type'])}
                  options={[
                    { value: 'business', label: 'Business' },
                    { value: 'billing', label: 'Billing' },
                    { value: 'personal', label: 'Personal' },
                    { value: 'tool', label: 'Tool' },
                  ]}
                />
              </div>

              <Textarea label="Description & Stack" rows={2} value={projDesc} onChange={(e) => setProjDesc(e.target.value)} placeholder="React, Vite, Tailwind, deployed on Netlify..." />

              <div className="flex justify-end gap-2 pt-3">
                <Button variant="secondary" onClick={() => setIsProjectModalOpen(false)}>Cancel</Button>
                <Button variant="primary" type="submit">{editingProject ? 'Save Changes' : 'Add Project'}</Button>
              </div>
            </form>
          </Modal>
        </div>
      )}

      {/* Tab 2: Prompts */}
      {activeTab === 'prompts' && (
        <PromptLibrary prompts={prompts} onRefresh={loadData} />
      )}

      {/* Tab 3: SMM */}
      {activeTab === 'smm' && (
        <SmmManager orders={smmOrders} onRefresh={loadData} />
      )}

      {/* Tab 4: Gigs */}
      {activeTab === 'gigs' && (
        <GigsManager gigs={gigs} onRefresh={loadData} />
      )}
    </div>
  );
};
