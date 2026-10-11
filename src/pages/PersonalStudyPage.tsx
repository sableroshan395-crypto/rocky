import React, { useState, useEffect } from 'react';
import {
  BookOpen,
  Calendar,
  Clock,
} from 'lucide-react';
import { StorageAdapter } from '@/services/storageAdapter';
import { Badge } from '@/components/ui/Badge';
import { SubjectsManager } from './study/SubjectsManager';
import { ExamsManager } from './study/ExamsManager';
import { HabitsManager } from './study/HabitsManager';
import type { SubjectModule, AcademicExam, DailyHabit } from '@/types/studyAndIdeas';

type StudyTab = 'subjects' | 'exams' | 'habits';

export const PersonalStudyPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<StudyTab>('subjects');

  const [subjects, setSubjects] = useState<SubjectModule[]>([]);
  const [exams, setExams] = useState<AcademicExam[]>([]);
  const [habits, setHabits] = useState<DailyHabit[]>([]);

  const loadData = () => {
    setSubjects(StorageAdapter.getSubjects());
    setExams(StorageAdapter.getExams());
    setHabits(StorageAdapter.getHabits());
  };

  useEffect(() => {
    loadData();
  }, []);

  return (
    <div className="space-y-6 max-w-5xl">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-slate-100 tracking-tight">
              Personal & Study
            </h1>
            <Badge variant="primary">B.Com Degree & Discipline HQ</Badge>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Academic degree syllabus tracker, university exam timetables, daily habits, and routine streaks.
          </p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-1.5 border-b border-slate-200 dark:border-slate-800 pb-2 overflow-x-auto">
        {[
          { id: 'subjects', label: `Degree Modules (${subjects.length})`, icon: <BookOpen className="w-3.5 h-3.5" /> },
          { id: 'exams', label: `Exam Schedule (${exams.length})`, icon: <Calendar className="w-3.5 h-3.5" /> },
          { id: 'habits', label: `Habits & Streaks (${habits.length})`, icon: <Clock className="w-3.5 h-3.5" /> },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as StudyTab)}
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

      {/* Tab Content */}
      {activeTab === 'subjects' && (
        <SubjectsManager subjects={subjects} onRefresh={loadData} />
      )}

      {activeTab === 'exams' && (
        <ExamsManager exams={exams} onRefresh={loadData} />
      )}

      {activeTab === 'habits' && (
        <HabitsManager habits={habits} onRefresh={loadData} />
      )}
    </div>
  );
};
