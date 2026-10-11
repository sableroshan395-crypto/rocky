import React, { useState } from 'react';
import { Calendar, Plus, Search, Trash2, Edit2 } from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Input, Select, Textarea } from '@/components/ui/Input';
import { Modal } from '@/components/ui/Modal';
import { StorageAdapter } from '@/services/storageAdapter';
import { useToast } from '@/context/ToastContext';
import type { AcademicExam } from '@/types/studyAndIdeas';

interface ExamsManagerProps {
  exams: AcademicExam[];
  onRefresh: () => void;
}

const PREPARATION_VARIANTS: Record<AcademicExam['preparationStatus'], { variant: 'default' | 'primary' | 'success' | 'warning' | 'danger'; label: string }> = {
  not_started: { variant: 'danger', label: 'Not Started' },
  studying: { variant: 'warning', label: 'Studying' },
  revision: { variant: 'primary', label: 'In Revision' },
  ready: { variant: 'success', label: 'Exam Ready' },
};

export const ExamsManager: React.FC<ExamsManagerProps> = ({ exams, onRefresh }) => {
  const { showSuccess, showError } = useToast();
  const [search, setSearch] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingExam, setEditingExam] = useState<AcademicExam | null>(null);

  // Form state
  const [subjectName, setSubjectName] = useState('');
  const [examDate, setExamDate] = useState('');
  const [examTime, setExamTime] = useState('10:00 AM');
  const [venue, setVenue] = useState('Exam Hall B');
  const [totalMarks, setTotalMarks] = useState('100');
  const [passingMarks, setPassingMarks] = useState('40');
  const [preparationStatus, setPreparationStatus] = useState<AcademicExam['preparationStatus']>('studying');
  const [notes, setNotes] = useState('');

  const filtered = exams
    .filter((e) => e.subjectName.toLowerCase().includes(search.toLowerCase()))
    .sort((a, b) => a.examDate.localeCompare(b.examDate));

  const getDaysUntil = (dateStr: string) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const exam = new Date(dateStr);
    exam.setHours(0, 0, 0, 0);
    const diffTime = exam.getTime() - today.getTime();
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  };

  const openAdd = () => {
    setEditingExam(null);
    setSubjectName('');
    setExamDate(new Date(Date.now() + 14 * 86400000).toISOString().slice(0, 10));
    setExamTime('10:00 AM - 01:00 PM');
    setVenue('Main Campus Hall');
    setTotalMarks('100');
    setPassingMarks('40');
    setPreparationStatus('studying');
    setNotes('');
    setIsModalOpen(true);
  };

  const openEdit = (e: AcademicExam) => {
    setEditingExam(e);
    setSubjectName(e.subjectName);
    setExamDate(e.examDate);
    setExamTime(e.examTime || '');
    setVenue(e.venue || '');
    setTotalMarks(e.totalMarks ? String(e.totalMarks) : '100');
    setPassingMarks(e.passingMarks ? String(e.passingMarks) : '40');
    setPreparationStatus(e.preparationStatus);
    setNotes(e.notes || '');
    setIsModalOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!subjectName.trim() || !examDate) {
      showError('Subject name and exam date are required.');
      return;
    }

    try {
      StorageAdapter.saveExam({
        id: editingExam?.id,
        subjectName: subjectName.trim(),
        examDate,
        examTime: examTime.trim() || undefined,
        venue: venue.trim() || undefined,
        totalMarks: parseInt(totalMarks) || 100,
        passingMarks: parseInt(passingMarks) || 40,
        preparationStatus,
        notes: notes.trim() || undefined,
      });

      showSuccess(editingExam ? 'Exam Updated' : 'Exam Scheduled', subjectName.trim());
      setIsModalOpen(false);
      onRefresh();
    } catch {
      showError('Failed to save exam schedule.');
    }
  };

  const handleDelete = (id: string, name: string) => {
    if (window.confirm(`Delete exam "${name}"?`)) {
      StorageAdapter.deleteExam(id);
      showSuccess('Exam Removed', name);
      onRefresh();
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div className="relative flex-1 max-w-sm">
          <Input
            placeholder="Search exam schedule by subject..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            leftIcon={<Search className="w-4 h-4" />}
          />
        </div>
        <Button variant="primary" size="sm" onClick={openAdd} leftIcon={<Plus className="w-3.5 h-3.5" />}>
          Schedule Exam
        </Button>
      </div>

      {filtered.length === 0 ? (
        <Card className="p-8 text-center">
          <Calendar className="w-8 h-8 mx-auto text-slate-300 dark:text-slate-600 mb-2" />
          <p className="text-xs text-slate-500">
            {exams.length === 0
              ? 'No upcoming exams scheduled. Add exam dates to get live countdown timers and preparation status tracking.'
              : 'No exams match your search.'}
          </p>
        </Card>
      ) : (
        <div className="space-y-2.5">
          {filtered.map((e) => {
            const daysLeft = getDaysUntil(e.examDate);
            return (
              <Card key={e.id} className="p-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <h4 className="text-xs font-semibold text-slate-900 dark:text-slate-100">{e.subjectName}</h4>
                      <Badge variant={PREPARATION_VARIANTS[e.preparationStatus].variant} size="sm">
                        {PREPARATION_VARIANTS[e.preparationStatus].label}
                      </Badge>
                    </div>

                    <div className="flex items-center gap-3 text-[11px] text-slate-500 font-mono">
                      <span>📅 {e.examDate}</span>
                      {e.examTime && <span>⏰ {e.examTime}</span>}
                      {e.venue && <span>📍 {e.venue}</span>}
                    </div>

                    {e.notes && (
                      <p className="text-[10px] text-slate-400 italic">
                        {e.notes}
                      </p>
                    )}
                  </div>

                  <div className="flex sm:flex-col items-end justify-between sm:justify-center border-t sm:border-t-0 pt-2 sm:pt-0">
                    <div className="text-right">
                      <span className={`text-sm font-bold font-mono ${
                        daysLeft < 0 ? 'text-slate-400' : daysLeft <= 3 ? 'text-rose-600' : daysLeft <= 7 ? 'text-amber-600' : 'text-indigo-600'
                      }`}>
                        {daysLeft < 0 ? 'Exam Completed' : daysLeft === 0 ? 'TODAY!' : `${daysLeft} days left`}
                      </span>
                      <span className="text-[10px] text-slate-400 block font-mono">
                        Target: {e.passingMarks}/{e.totalMarks} marks
                      </span>
                    </div>
                  </div>
                </div>

                <div className="mt-2 pt-2 border-t border-slate-100 dark:border-slate-800 flex justify-end gap-1">
                  <Button size="sm" variant="ghost" onClick={() => openEdit(e)} className="h-7 px-2">
                    <Edit2 className="w-3 h-3" />
                  </Button>
                  <Button size="sm" variant="ghost" onClick={() => handleDelete(e.id, e.subjectName)} className="h-7 px-2 text-rose-500 hover:text-rose-600">
                    <Trash2 className="w-3 h-3" />
                  </Button>
                </div>
              </Card>
            );
          })}
        </div>
      )}

      {/* Modal */}
      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={editingExam ? 'Edit Exam' : 'Schedule Academic Exam'}>
        <form onSubmit={handleSubmit} className="space-y-3">
          <Input label="Subject Name" required value={subjectName} onChange={(e) => setSubjectName(e.target.value)} placeholder="e.g. Business Economics & Banking" />

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Input label="Exam Date" type="date" required value={examDate} onChange={(e) => setExamDate(e.target.value)} />
            <Input label="Time Slot" value={examTime} onChange={(e) => setExamTime(e.target.value)} placeholder="10:00 AM - 01:00 PM" />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <Input label="Exam Hall / Venue" value={venue} onChange={(e) => setVenue(e.target.value)} placeholder="Main Building #204" />
            <Input label="Total Marks" type="number" value={totalMarks} onChange={(e) => setTotalMarks(e.target.value)} />
            <Input label="Passing Marks" type="number" value={passingMarks} onChange={(e) => setPassingMarks(e.target.value)} />
          </div>

          <Select
            label="Preparation Status"
            value={preparationStatus}
            onChange={(e) => setPreparationStatus(e.target.value as AcademicExam['preparationStatus'])}
            options={[
              { value: 'not_started', label: 'Not Started' },
              { value: 'studying', label: 'Studying Syllabus' },
              { value: 'revision', label: 'Revision in Progress' },
              { value: 'ready', label: 'Ready for Exam' },
            ]}
          />

          <Textarea label="Allowed Materials & Instructions" rows={2} value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Calculator allowed, Hall ticket copy required..." />

          <div className="flex justify-end gap-2 pt-3">
            <Button variant="secondary" onClick={() => setIsModalOpen(false)}>Cancel</Button>
            <Button variant="primary" type="submit">{editingExam ? 'Save Changes' : 'Schedule Exam'}</Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
