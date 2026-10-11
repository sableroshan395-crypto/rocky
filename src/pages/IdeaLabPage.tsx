import React, { useState, useEffect } from 'react';
import {
  Lightbulb,
  Plus,
  Rocket,
  Search,
  Trash2,
  Edit2,
} from 'lucide-react';
import { StorageAdapter } from '@/services/storageAdapter';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Input, Select, Textarea } from '@/components/ui/Input';
import { Modal } from '@/components/ui/Modal';
import { formatPaiseToINR, parseINRToPaise } from '@/utils/formatters';
import { useToast } from '@/context/ToastContext';
import type { VentureIdea, IdeaStage } from '@/types/studyAndIdeas';

const STAGE_CONFIG: Record<IdeaStage, { variant: 'default' | 'primary' | 'success' | 'warning' | 'danger'; label: string }> = {
  inbox: { variant: 'default', label: 'Inbox / Idea' },
  researching: { variant: 'warning', label: 'Researching' },
  validating: { variant: 'primary', label: 'Validating Market' },
  building: { variant: 'warning', label: 'Building MVP' },
  launched: { variant: 'success', label: 'Launched Venture' },
  archived: { variant: 'danger', label: 'Archived / Passed' },
};

export const IdeaLabPage: React.FC = () => {
  const { showSuccess, showError } = useToast();
  const [ideas, setIdeas] = useState<VentureIdea[]>([]);
  const [search, setSearch] = useState('');
  const [stageFilter, setStageFilter] = useState('all');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingIdea, setEditingIdea] = useState<VentureIdea | null>(null);

  // Form state
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState<VentureIdea['category']>('saas');
  const [stage, setStage] = useState<IdeaStage>('inbox');
  const [problem, setProblem] = useState('');
  const [solution, setSolution] = useState('');
  const [investStr, setInvestStr] = useState('0');
  const [revenueStr, setRevenueStr] = useState('0');
  const [priorityScore, setPriorityScore] = useState('7');
  const [tagsStr, setTagsStr] = useState('');
  const [notes, setNotes] = useState('');

  const loadData = () => {
    setIdeas(StorageAdapter.getIdeas());
  };

  useEffect(() => {
    loadData();
  }, []);

  const filtered = ideas.filter((i) => {
    const matchesSearch =
      i.title.toLowerCase().includes(search.toLowerCase()) ||
      (i.problemStatement && i.problemStatement.toLowerCase().includes(search.toLowerCase())) ||
      i.tags.some((t) => t.toLowerCase().includes(search.toLowerCase()));
    const matchesStage = stageFilter === 'all' || i.stage === stageFilter;
    return matchesSearch && matchesStage;
  });

  const openAdd = () => {
    setEditingIdea(null);
    setTitle('');
    setCategory('saas');
    setStage('inbox');
    setProblem('');
    setSolution('');
    setInvestStr('5000');
    setRevenueStr('50000');
    setPriorityScore('7');
    setTagsStr('');
    setNotes('');
    setIsModalOpen(true);
  };

  const openEdit = (i: VentureIdea) => {
    setEditingIdea(i);
    setTitle(i.title);
    setCategory(i.category);
    setStage(i.stage);
    setProblem(i.problemStatement || '');
    setSolution(i.proposedSolution || '');
    setInvestStr((i.estimatedInvestmentPaise / 100).toFixed(2));
    setRevenueStr((i.estimatedRevenuePotentialPaise / 100).toFixed(2));
    setPriorityScore(String(i.priorityScore));
    setTagsStr(i.tags.join(', '));
    setNotes(i.notes || '');
    setIsModalOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      showError('Idea title is required.');
      return;
    }

    const investPaise = parseINRToPaise(investStr) || 0;
    const revPaise = parseINRToPaise(revenueStr) || 0;
    const score = Math.min(10, Math.max(1, parseInt(priorityScore) || 5));
    const tags = tagsStr
      .split(',')
      .map((t) => t.trim())
      .filter(Boolean);

    try {
      StorageAdapter.saveIdea({
        id: editingIdea?.id,
        title: title.trim(),
        category,
        stage,
        problemStatement: problem.trim() || undefined,
        proposedSolution: solution.trim() || undefined,
        estimatedInvestmentPaise: investPaise,
        estimatedRevenuePotentialPaise: revPaise,
        priorityScore: score,
        tags,
        notes: notes.trim() || undefined,
      });

      showSuccess(editingIdea ? 'Idea Updated' : 'Idea Captured', title.trim());
      setIsModalOpen(false);
      loadData();
    } catch {
      showError('Failed to save venture idea.');
    }
  };

  const handleStageTransition = (id: string, nextStage: IdeaStage) => {
    StorageAdapter.updateIdeaStage(id, nextStage);
    showSuccess('Stage Updated', `Moved to ${STAGE_CONFIG[nextStage].label}.`);
    loadData();
  };

  const handleConvertToProject = (idea: VentureIdea) => {
    try {
      const now = new Date().toISOString();
      const newProj = StorageAdapter.saveProject({
        id: `proj_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
        name: idea.title,
        platform: 'Netlify',
        status: 'in_progress',
        type: 'business',
        description: `${idea.problemStatement || ''} - ${idea.proposedSolution || ''}`.trim(),
        createdAt: now,
        updatedAt: now,
      });

      // Also create an initial setup task
      StorageAdapter.saveTask({
        id: `task_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
        title: `Kickoff: ${idea.title}`,
        category: 'business',
        priority: 'high',
        completed: false,
        createdAt: now,
        updatedAt: now,
      });

      StorageAdapter.updateIdeaStage(idea.id, 'building');

      showSuccess('Converted to Workspace Project & Task! 🚀', `Project created: "${newProj.name}"`);
      loadData();
    } catch {
      showError('Failed to convert idea.');
    }
  };

  const handleDelete = (id: string, name: string) => {
    if (window.confirm(`Delete idea "${name}"?`)) {
      StorageAdapter.deleteIdea(id);
      showSuccess('Idea Deleted', name);
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
              Idea Lab
            </h1>
            <Badge variant="primary">Venture Incubator</Badge>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Rapid idea capture, market validation pipeline, and 1-click conversion to workspace projects and tasks.
          </p>
        </div>
      </div>

      {/* Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div className="flex items-center gap-2 flex-1 max-w-md">
          <Input
            placeholder="Search concepts by title, problem, tag..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            leftIcon={<Search className="w-4 h-4" />}
          />
          <Select
            value={stageFilter}
            onChange={(e) => setStageFilter(e.target.value)}
            options={[
              { value: 'all', label: 'All Pipeline Stages' },
              { value: 'inbox', label: 'Inbox' },
              { value: 'researching', label: 'Researching' },
              { value: 'validating', label: 'Validating' },
              { value: 'building', label: 'Building MVP' },
              { value: 'launched', label: 'Launched' },
              { value: 'archived', label: 'Archived' },
            ]}
            className="w-40"
          />
        </div>
        <Button variant="primary" size="sm" onClick={openAdd} leftIcon={<Plus className="w-3.5 h-3.5" />}>
          Capture Idea
        </Button>
      </div>

      {/* Pipeline Grid */}
      {filtered.length === 0 ? (
        <Card className="p-8 text-center">
          <Lightbulb className="w-8 h-8 mx-auto text-slate-300 dark:text-slate-600 mb-2" />
          <p className="text-xs text-slate-500">
            {ideas.length === 0
              ? 'No ideas captured in the pipeline yet. Log micro-SaaS concepts, automation tools, or business opportunities.'
              : 'No ideas match your filter.'}
          </p>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {filtered.map((i) => (
            <Card key={i.id} className="p-4 space-y-3 flex flex-col justify-between">
              <div className="space-y-2">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <h4 className="text-xs font-semibold text-slate-900 dark:text-slate-100">{i.title}</h4>
                    <span className="text-[10px] text-slate-400 capitalize">{i.category}</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="text-[10px] font-bold text-amber-600 dark:text-amber-400 font-mono">
                      ★ {i.priorityScore}/10
                    </span>
                    <Badge variant={STAGE_CONFIG[i.stage].variant} size="sm">
                      {STAGE_CONFIG[i.stage].label}
                    </Badge>
                  </div>
                </div>

                {i.problemStatement && (
                  <p className="text-xs text-slate-600 dark:text-slate-300 line-clamp-2">
                    <span className="font-semibold text-slate-700 dark:text-slate-200">Problem: </span>
                    {i.problemStatement}
                  </p>
                )}

                {i.proposedSolution && (
                  <p className="text-xs text-slate-600 dark:text-slate-300 line-clamp-2">
                    <span className="font-semibold text-slate-700 dark:text-slate-200">Solution: </span>
                    {i.proposedSolution}
                  </p>
                )}

                {/* Economics */}
                <div className="grid grid-cols-2 gap-2 text-[11px] p-2 bg-slate-50 dark:bg-slate-800 rounded font-mono">
                  <div>
                    <span className="text-[9px] text-slate-400 block uppercase">Est. Investment</span>
                    <span className="text-rose-600 font-semibold">{formatPaiseToINR(i.estimatedInvestmentPaise)}</span>
                  </div>
                  <div>
                    <span className="text-[9px] text-slate-400 block uppercase">Revenue Potential</span>
                    <span className="text-emerald-600 font-semibold">+{formatPaiseToINR(i.estimatedRevenuePotentialPaise)}</span>
                  </div>
                </div>

                {i.tags.length > 0 && (
                  <div className="flex items-center gap-1 flex-wrap pt-1">
                    {i.tags.map((t) => (
                      <span key={t} className="text-[10px] text-slate-400">
                        #{t}
                      </span>
                    ))}
                  </div>
                )}
              </div>

              {/* Bottom Actions */}
              <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs flex-wrap gap-2">
                <div className="flex items-center gap-1">
                  <span className="text-[10px] text-slate-400">Move:</span>
                  {(['inbox', 'researching', 'validating', 'building', 'launched'] as IdeaStage[]).map((st) => (
                    <button
                      key={st}
                      disabled={i.stage === st}
                      onClick={() => handleStageTransition(i.id, st)}
                      className={`px-1.5 py-0.5 rounded text-[10px] ${
                        i.stage === st ? 'font-bold underline' : 'text-slate-400 hover:text-slate-700'
                      }`}
                    >
                      {st}
                    </button>
                  ))}
                </div>

                <div className="flex items-center gap-1">
                  {i.stage !== 'building' && i.stage !== 'launched' && (
                    <Button
                      size="sm"
                      variant="secondary"
                      onClick={() => handleConvertToProject(i)}
                      leftIcon={<Rocket className="w-3.5 h-3.5 text-emerald-600" />}
                      className="h-7 text-xs"
                      title="Convert to Workspace Project & Task"
                    >
                      Launch Project
                    </Button>
                  )}
                  <Button size="sm" variant="ghost" onClick={() => openEdit(i)} className="h-7 px-2">
                    <Edit2 className="w-3 h-3" />
                  </Button>
                  <Button size="sm" variant="ghost" onClick={() => handleDelete(i.id, i.title)} className="h-7 px-2 text-rose-500 hover:text-rose-600">
                    <Trash2 className="w-3 h-3" />
                  </Button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Modal */}
      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={editingIdea ? 'Edit Venture Concept' : 'Capture Venture Concept'} maxWidth="lg">
        <form onSubmit={handleSubmit} className="space-y-3">
          <Input label="Concept Title" required value={title} onChange={(e) => setTitle(e.target.value)} placeholder="e.g. WhatsApp Automation for Local Event Decorators" />

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <Select
              label="Category"
              value={category}
              onChange={(e) => setCategory(e.target.value as VentureIdea['category'])}
              options={[
                { value: 'saas', label: 'Micro-SaaS' },
                { value: 'business', label: 'Physical Business' },
                { value: 'automation', label: 'AI Automation' },
                { value: 'content', label: 'Content & Media' },
                { value: 'ecommerce', label: 'E-commerce' },
                { value: 'other', label: 'Other' },
              ]}
            />
            <Select
              label="Stage"
              value={stage}
              onChange={(e) => setStage(e.target.value as IdeaStage)}
              options={Object.entries(STAGE_CONFIG).map(([k, v]) => ({ value: k, label: v.label }))}
            />
            <Input label="Priority Score (1-10)" type="number" min="1" max="10" value={priorityScore} onChange={(e) => setPriorityScore(e.target.value)} />
          </div>

          <Textarea label="Problem Statement" rows={2} value={problem} onChange={(e) => setProblem(e.target.value)} placeholder="What pain point does this solve?" />
          <Textarea label="Proposed Solution / Product" rows={2} value={solution} onChange={(e) => setSolution(e.target.value)} placeholder="How does the product address this pain point?" />

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Input label="Estimated Initial Capital ₹" type="number" step="0.01" value={investStr} onChange={(e) => setInvestStr(e.target.value)} placeholder="5000" />
            <Input label="Estimated Monthly Revenue ₹" type="number" step="0.01" value={revenueStr} onChange={(e) => setRevenueStr(e.target.value)} placeholder="50000" />
          </div>

          <Input label="Tags (comma-separated)" value={tagsStr} onChange={(e) => setTagsStr(e.target.value)} placeholder="whatsapp, api, sai-decoration" />
          <Textarea label="Execution Roadmap & Notes" rows={2} value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Next steps to test demand with 5 clients..." />

          <div className="flex justify-end gap-2 pt-3">
            <Button variant="secondary" onClick={() => setIsModalOpen(false)}>Cancel</Button>
            <Button variant="primary" type="submit">{editingIdea ? 'Save Changes' : 'Capture Concept'}</Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
