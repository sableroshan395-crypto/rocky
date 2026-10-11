import { describe, it, expect, beforeEach } from 'vitest';
import { StorageAdapter } from '@/services/storageAdapter';
import type { Task } from '@/types/workspace';

describe('StorageAdapter Persistence & Integrity', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('saves and retrieves tasks with audit logging', () => {
    const task: Task = {
      id: 'task_test_1',
      title: 'Inspect Sai Billing deployment',
      priority: 'high',
      completed: false,
      category: 'business',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    StorageAdapter.saveTask(task);
    const retrieved = StorageAdapter.getTasks();
    expect(retrieved.length).toBe(1);
    expect(retrieved[0].title).toBe('Inspect Sai Billing deployment');

    // Verify audit log entry was created
    const logs = StorageAdapter.getAuditLogs();
    expect(logs.length).toBeGreaterThan(0);
    expect(logs[0].action).toBe('create');
    expect(logs[0].entityType).toBe('task');
  });

  it('updates existing tasks and updates the audit trail', () => {
    const task: Task = {
      id: 'task_test_2',
      title: 'Initial Title',
      priority: 'low',
      completed: false,
      category: 'general',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    StorageAdapter.saveTask(task);
    StorageAdapter.saveTask({ ...task, completed: true, title: 'Updated Title' });

    const tasks = StorageAdapter.getTasks();
    expect(tasks.length).toBe(1);
    expect(tasks[0].completed).toBe(true);
    expect(tasks[0].title).toBe('Updated Title');

    const logs = StorageAdapter.getAuditLogs();
    expect(logs[0].action).toBe('update');
  });

  it('exports and restores full workspace JSON cleanly', () => {
    const task: Task = {
      id: 'task_export_test',
      title: 'Export Test Task',
      priority: 'medium',
      completed: false,
      category: 'personal',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    StorageAdapter.saveTask(task);

    const json = StorageAdapter.exportFullWorkspaceJSON();
    expect(json).toContain('Export Test Task');

    localStorage.clear();
    expect(StorageAdapter.getTasks().length).toBe(0);

    const restoreResult = StorageAdapter.restoreFullWorkspaceJSON(json);
    expect(restoreResult.success).toBe(true);
    expect(StorageAdapter.getTasks().length).toBe(1);
    expect(StorageAdapter.getTasks()[0].title).toBe('Export Test Task');
  });
});
