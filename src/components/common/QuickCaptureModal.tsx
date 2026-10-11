import React, { useState } from 'react';
import { CheckSquare, FileText, Bookmark as BookmarkIcon, FolderKanban } from 'lucide-react';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import { Input, Select, Textarea } from '@/components/ui/Input';
import { StorageAdapter } from '@/services/storageAdapter';
import { useToast } from '@/context/ToastContext';
import type { Task, Note, Bookmark, Project } from '@/types/workspace';

interface QuickCaptureModalProps {
  isOpen: boolean;
  onClose: () => void;
  onItemCreated?: () => void;
}

type TabType = 'task' | 'note' | 'bookmark' | 'project';

export const QuickCaptureModal: React.FC<QuickCaptureModalProps> = ({
  isOpen,
  onClose,
  onItemCreated,
}) => {
  const { showSuccess, showError } = useToast();
  const [activeTab, setActiveTab] = useState<TabType>('task');

  // Task form state
  const [taskTitle, setTaskTitle] = useState('');
  const [taskPriority, setTaskPriority] = useState<Task['priority']>('medium');
  const [taskDueDate, setTaskDueDate] = useState('');
  const [taskCategory, setTaskCategory] = useState<Task['category']>('general');

  // Note form state
  const [noteTitle, setNoteTitle] = useState('');
  const [noteContent, setNoteContent] = useState('');
  const [noteCategory, setNoteCategory] = useState<Note['category']>('general');

  // Bookmark form state
  const [bmTitle, setBmTitle] = useState('');
  const [bmUrl, setBmUrl] = useState('');
  const [bmCategory, setBmCategory] = useState<Bookmark['category']>('tools');

  // Project form state
  const [projName, setProjName] = useState('');
  const [projUrl, setProjUrl] = useState('');
  const [projPlatform, setProjPlatform] = useState<Project['platform']>('Netlify');
  const [projType, setProjType] = useState<Project['type']>('personal');

  const handleCreateTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!taskTitle.trim()) {
      showError('Task title is required.');
      return;
    }

    const newTask: Task = {
      id: 'task_' + Date.now(),
      title: taskTitle.trim(),
      priority: taskPriority,
      completed: false,
      dueDate: taskDueDate || undefined,
      category: taskCategory,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    StorageAdapter.saveTask(newTask);
    showSuccess('Task added', `"${newTask.title}" added to your task list.`);
    setTaskTitle('');
    onItemCreated?.();
    onClose();
  };

  const handleCreateNote = (e: React.FormEvent) => {
    e.preventDefault();
    if (!noteTitle.trim()) {
      showError('Note title is required.');
      return;
    }

    const newNote: Note = {
      id: 'note_' + Date.now(),
      title: noteTitle.trim(),
      content: noteContent.trim(),
      category: noteCategory,
      tags: [],
      isPinned: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    StorageAdapter.saveNote(newNote);
    showSuccess('Note saved', `"${newNote.title}" saved to your library.`);
    setNoteTitle('');
    setNoteContent('');
    onItemCreated?.();
    onClose();
  };

  const handleCreateBookmark = (e: React.FormEvent) => {
    e.preventDefault();
    if (!bmTitle.trim() || !bmUrl.trim()) {
      showError('Bookmark title and valid URL are required.');
      return;
    }

    let formattedUrl = bmUrl.trim();
    if (!formattedUrl.startsWith('http://') && !formattedUrl.startsWith('https://')) {
      formattedUrl = 'https://' + formattedUrl;
    }

    const newBm: Bookmark = {
      id: 'bm_' + Date.now(),
      title: bmTitle.trim(),
      url: formattedUrl,
      category: bmCategory,
      tags: [],
      isFavorite: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    StorageAdapter.saveBookmark(newBm);
    showSuccess('Bookmark saved', `"${newBm.title}" saved.`);
    setBmTitle('');
    setBmUrl('');
    onItemCreated?.();
    onClose();
  };

  const handleCreateProject = (e: React.FormEvent) => {
    e.preventDefault();
    if (!projName.trim()) {
      showError('Project name is required.');
      return;
    }

    const newProj: Project = {
      id: 'proj_' + Date.now(),
      name: projName.trim(),
      url: projUrl.trim() || undefined,
      platform: projPlatform,
      status: 'active',
      type: projType,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    StorageAdapter.saveProject(newProj);
    showSuccess('Project registered', `"${newProj.name}" added to projects.`);
    setProjName('');
    setProjUrl('');
    onItemCreated?.();
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Quick Capture (Ctrl+Q)" maxWidth="md">
      {/* Tab Switcher */}
      <div className="flex border-b border-slate-200 dark:border-slate-800 mb-4 pb-2 gap-2">
        <button
          type="button"
          onClick={() => setActiveTab('task')}
          className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${
            activeTab === 'task'
              ? 'bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
          }`}
        >
          <CheckSquare className="w-3.5 h-3.5" />
          Task
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('note')}
          className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${
            activeTab === 'note'
              ? 'bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
          }`}
        >
          <FileText className="w-3.5 h-3.5" />
          Note
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('bookmark')}
          className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${
            activeTab === 'bookmark'
              ? 'bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
          }`}
        >
          <BookmarkIcon className="w-3.5 h-3.5" />
          Bookmark
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('project')}
          className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${
            activeTab === 'project'
              ? 'bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
          }`}
        >
          <FolderKanban className="w-3.5 h-3.5" />
          Project
        </button>
      </div>

      {/* Task Form */}
      {activeTab === 'task' && (
        <form onSubmit={handleCreateTask} className="space-y-3.5">
          <Input
            label="Task Title *"
            placeholder="e.g. Verify Kotak Bank physical statement"
            value={taskTitle}
            onChange={(e) => setTaskTitle(e.target.value)}
            autoFocus
          />
          <div className="grid grid-cols-2 gap-3">
            <Select
              label="Priority"
              value={taskPriority}
              onChange={(e) => setTaskPriority(e.target.value as Task['priority'])}
              options={[
                { value: 'low', label: 'Low' },
                { value: 'medium', label: 'Medium' },
                { value: 'high', label: 'High' },
                { value: 'urgent', label: 'Urgent' },
              ]}
            />
            <Select
              label="Category"
              value={taskCategory}
              onChange={(e) => setTaskCategory(e.target.value as Task['category'])}
              options={[
                { value: 'general', label: 'General' },
                { value: 'business', label: 'Business' },
                { value: 'finance', label: 'Finance' },
                { value: 'study', label: 'Study' },
                { value: 'personal', label: 'Personal' },
              ]}
            />
          </div>
          <Input
            label="Due Date (Optional)"
            type="date"
            value={taskDueDate}
            onChange={(e) => setTaskDueDate(e.target.value)}
          />
          <div className="flex justify-end gap-2 pt-2">
            <Button variant="ghost" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" variant="primary">
              Save Task
            </Button>
          </div>
        </form>
      )}

      {/* Note Form */}
      {activeTab === 'note' && (
        <form onSubmit={handleCreateNote} className="space-y-3.5">
          <Input
            label="Note Title *"
            placeholder="e.g. Netlify deployment procedure checklist"
            value={noteTitle}
            onChange={(e) => setNoteTitle(e.target.value)}
            autoFocus
          />
          <Select
            label="Category"
            value={noteCategory}
            onChange={(e) => setNoteCategory(e.target.value as Note['category'])}
            options={[
              { value: 'general', label: 'General' },
              { value: 'ideas', label: 'Ideas' },
              { value: 'procedures', label: 'Procedures' },
              { value: 'study', label: 'Study' },
              { value: 'business', label: 'Business' },
            ]}
          />
          <Textarea
            label="Content"
            rows={4}
            placeholder="Write markdown or plain text notes..."
            value={noteContent}
            onChange={(e) => setNoteContent(e.target.value)}
          />
          <div className="flex justify-end gap-2 pt-2">
            <Button variant="ghost" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" variant="primary">
              Save Note
            </Button>
          </div>
        </form>
      )}

      {/* Bookmark Form */}
      {activeTab === 'bookmark' && (
        <form onSubmit={handleCreateBookmark} className="space-y-3.5">
          <Input
            label="Bookmark Title *"
            placeholder="e.g. Firebase Console"
            value={bmTitle}
            onChange={(e) => setBmTitle(e.target.value)}
            autoFocus
          />
          <Input
            label="Website URL *"
            placeholder="https://console.firebase.google.com"
            value={bmUrl}
            onChange={(e) => setBmUrl(e.target.value)}
          />
          <Select
            label="Category"
            value={bmCategory}
            onChange={(e) => setBmCategory(e.target.value as Bookmark['category'])}
            options={[
              { value: 'tools', label: 'Tools' },
              { value: 'business', label: 'Business' },
              { value: 'finance', label: 'Finance' },
              { value: 'dev', label: 'Development' },
              { value: 'personal', label: 'Personal' },
            ]}
          />
          <div className="flex justify-end gap-2 pt-2">
            <Button variant="ghost" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" variant="primary">
              Save Bookmark
            </Button>
          </div>
        </form>
      )}

      {/* Project Form */}
      {activeTab === 'project' && (
        <form onSubmit={handleCreateProject} className="space-y-3.5">
          <Input
            label="Project Name *"
            placeholder="e.g. Sai Decoration Catering Portal"
            value={projName}
            onChange={(e) => setProjName(e.target.value)}
            autoFocus
          />
          <Input
            label="Deployment / Preview URL"
            placeholder="https://example.netlify.app"
            value={projUrl}
            onChange={(e) => setProjUrl(e.target.value)}
          />
          <div className="grid grid-cols-2 gap-3">
            <Select
              label="Hosting Platform"
              value={projPlatform}
              onChange={(e) => setProjPlatform(e.target.value as Project['platform'])}
              options={[
                { value: 'Netlify', label: 'Netlify' },
                { value: 'Firebase', label: 'Firebase Hosting' },
                { value: 'Vercel', label: 'Vercel' },
                { value: 'GitHub', label: 'GitHub Pages' },
                { value: 'Custom', label: 'Custom' },
              ]}
            />
            <Select
              label="Type"
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
          <div className="flex justify-end gap-2 pt-2">
            <Button variant="ghost" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" variant="primary">
              Save Project
            </Button>
          </div>
        </form>
      )}
    </Modal>
  );
};
