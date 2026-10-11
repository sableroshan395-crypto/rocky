import React, { useState } from 'react';
import { BookOpen, Plus, Search, Trash2, Edit2 } from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Input, Select, Textarea } from '@/components/ui/Input';
import { Modal } from '@/components/ui/Modal';
import { StorageAdapter } from '@/services/storageAdapter';
import { useToast } from '@/context/ToastContext';
import type { SubjectModule } from '@/types/studyAndIdeas';

interface SubjectsManagerProps {
  subjects: SubjectModule[];
  onRefresh: () => void;
}

const STATUS_VARIANTS: Record<SubjectModule['status'], { variant: 'default' | 'primary' | 'success' | 'warning' | 'danger'; label: string }> = {
  in_progress: { variant: 'primary', label: 'In Progress' },
  completed: { variant: 'success', label: 'Completed' },
  revision_needed: { variant: 'warning', label: 'Needs Revision' },
};

export const SubjectsManager: React.FC<SubjectsManagerProps> = ({ subjects, onRefresh }) => {
  const { showSuccess, showError } = useToast();
  const [search, setSearch] = useState('');
  const [semesterFilter, setSemesterFilter] = useState('all');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingSubj, setEditingSubj] = useState<SubjectModule | null>(null);

  // Form state
  const [subjectName, setSubjectName] = useState('');
  const [semester, setSemester] = useState('Semester 4');
  const [professor, setProfessor] = useState('');
  const [syllabusPercent, setSyllabusPercent] = useState('40');
  const [topicsStr, setTopicsStr] = useState('');
  const [status, setStatus] = useState<SubjectModule['status']>('in_progress');

  const filtered = subjects.filter((s) => {
    const matchesSearch =
      s.subjectName.toLowerCase().includes(search.toLowerCase()) ||
      (s.professor && s.professor.toLowerCase().includes(search.toLowerCase())) ||
      s.importantTopics.some((t) => t.toLowerCase().includes(search.toLowerCase()));
    const matchesSem = semesterFilter === 'all' || s.semester === semesterFilter;
    return matchesSearch && matchesSem;
  });

  const openAdd = () => {
    setEditingSubj(null);
    setSubjectName('');
    setSemester('Semester 4');
    setProfessor('');
    setSyllabusPercent('0');
    setTopicsStr('');
    setStatus('in_progress');
    setIsModalOpen(true);
  };

  const openEdit = (s: SubjectModule) => {
    setEditingSubj(s);
    setSubjectName(s.subjectName);
    setSemester(s.semester);
    setProfessor(s.professor || '');
    setSyllabusPercent(String(s.syllabusCoveredPercent));
    setTopicsStr(s.importantTopics.join(', '));
    setStatus(s.status);
    setIsModalOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!subjectName.trim()) {
      showError('Subject name is required.');
      return;
    }

    const percent = Math.min(100, Math.max(0, parseInt(syllabusPercent) || 0));
    const topics = topicsStr
      .split(',')
      .map((t) => t.trim())
      .filter(Boolean);

    try {
      StorageAdapter.saveSubject({
        id: editingSubj?.id,
        subjectName: subjectName.trim(),
        semester,
        professor: professor.trim() || undefined,
        syllabusCoveredPercent: percent,
        importantTopics: topics,
        status: percent === 100 ? 'completed' : status,
      });

      showSuccess(editingSubj ? 'Subject Updated' : 'Subject Added', subjectName.trim());
      setIsModalOpen(false);
      onRefresh();
    } catch {
      showError('Failed to save subject.');
    }
  };

  const handleDelete = (id: string, name: string) => {
    if (window.confirm(`Delete subject module "${name}"?`)) {
      StorageAdapter.deleteSubject(id);
      showSuccess('Subject Deleted', name);
      onRefresh();
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div className="flex items-center gap-2 flex-1 max-w-md">
          <Input
            placeholder="Search subjects by name, professor, topic..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            leftIcon={<Search className="w-4 h-4" />}
          />
          <Select
            value={semesterFilter}
            onChange={(e) => setSemesterFilter(e.target.value)}
            options={[
              { value: 'all', label: 'All Semesters' },
              { value: 'Semester 1', label: 'Semester 1' },
              { value: 'Semester 2', label: 'Semester 2' },
              { value: 'Semester 3', label: 'Semester 3' },
              { value: 'Semester 4', label: 'Semester 4' },
              { value: 'Semester 5', label: 'Semester 5' },
              { value: 'Semester 6', label: 'Semester 6' },
            ]}
            className="w-36"
          />
        </div>
        <Button variant="primary" size="sm" onClick={openAdd} leftIcon={<Plus className="w-3.5 h-3.5" />}>
          Add Subject
        </Button>
      </div>

      {filtered.length === 0 ? (
        <Card className="p-8 text-center">
          <BookOpen className="w-8 h-8 mx-auto text-slate-300 dark:text-slate-600 mb-2" />
          <p className="text-xs text-slate-500">
            {subjects.length === 0
              ? 'No B.Com subjects registered. Add your semester subjects (Corporate Law, Financial Accounting, Costing) and syllabus completion goals.'
              : 'No subjects match your filter.'}
          </p>
        </Card>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {filtered.map((s) => (
            <Card key={s.id} className="p-4 space-y-3 flex flex-col justify-between">
              <div className="space-y-2">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <h4 className="text-xs font-semibold text-slate-900 dark:text-slate-100">{s.subjectName}</h4>
                    <p className="text-[11px] text-slate-400">
                      {s.semester} {s.professor && `· Prof. ${s.professor}`}
                    </p>
                  </div>
                  <Badge variant={STATUS_VARIANTS[s.status].variant} size="sm">
                    {STATUS_VARIANTS[s.status].label}
                  </Badge>
                </div>

                {/* Progress bar */}
                <div className="space-y-1">
                  <div className="flex justify-between text-[11px]">
                    <span className="text-slate-500">Syllabus Covered</span>
                    <span className="font-mono font-bold text-indigo-600 dark:text-indigo-400">
                      {s.syllabusCoveredPercent}%
                    </span>
                  </div>
                  <div className="h-1.5 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-indigo-600 rounded-full transition-all"
                      style={{ width: `${s.syllabusCoveredPercent}%` }}
                    />
                  </div>
                </div>

                {s.importantTopics.length > 0 && (
                  <div className="flex items-center gap-1 flex-wrap pt-1">
                    <span className="text-[10px] text-slate-400 block w-full">Key Exam Topics:</span>
                    {s.importantTopics.map((t) => (
                      <span key={t} className="text-[10px] px-1.5 py-0.5 rounded bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                        {t}
                      </span>
                    ))}
                  </div>
                )}
              </div>

              <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex justify-end gap-1">
                <Button size="sm" variant="ghost" onClick={() => openEdit(s)} className="h-7 px-2">
                  <Edit2 className="w-3 h-3" />
                </Button>
                <Button size="sm" variant="ghost" onClick={() => handleDelete(s.id, s.subjectName)} className="h-7 px-2 text-rose-500 hover:text-rose-600">
                  <Trash2 className="w-3 h-3" />
                </Button>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Modal */}
      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={editingSubj ? 'Edit Subject' : 'Add B.Com Subject Module'}>
        <form onSubmit={handleSubmit} className="space-y-3">
          <Input label="Subject Name" required value={subjectName} onChange={(e) => setSubjectName(e.target.value)} placeholder="e.g. Advanced Financial Accounting" />

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Select
              label="Semester"
              value={semester}
              onChange={(e) => setSemester(e.target.value)}
              options={[
                { value: 'Semester 1', label: 'Semester 1' },
                { value: 'Semester 2', label: 'Semester 2' },
                { value: 'Semester 3', label: 'Semester 3' },
                { value: 'Semester 4', label: 'Semester 4' },
                { value: 'Semester 5', label: 'Semester 5' },
                { value: 'Semester 6', label: 'Semester 6' },
              ]}
            />
            <Input label="Professor / Faculty" value={professor} onChange={(e) => setProfessor(e.target.value)} placeholder="Dr. Sharma" />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Input label="Syllabus Completion % (0-100)" type="number" min="0" max="100" value={syllabusPercent} onChange={(e) => setSyllabusPercent(e.target.value)} />
            <Select
              label="Study Status"
              value={status}
              onChange={(e) => setStatus(e.target.value as SubjectModule['status'])}
              options={[
                { value: 'in_progress', label: 'In Progress' },
                { value: 'completed', label: 'Completed' },
                { value: 'revision_needed', label: 'Needs Revision' },
              ]}
            />
          </div>

          <Textarea label="Key Topics & Chapters (comma-separated)" rows={2} value={topicsStr} onChange={(e) => setTopicsStr(e.target.value)} placeholder="Partnership Accounts, Liquidation, Branch Accounting" />

          <div className="flex justify-end gap-2 pt-3">
            <Button variant="secondary" onClick={() => setIsModalOpen(false)}>Cancel</Button>
            <Button variant="primary" type="submit">{editingSubj ? 'Save Changes' : 'Add Subject'}</Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
