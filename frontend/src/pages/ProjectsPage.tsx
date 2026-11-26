import { useEffect, useMemo, useState } from 'react';
import type { FormEvent } from 'react';
import { ArrowLeft, CheckCircle2, Circle, Edit3, FolderKanban, Plus, RefreshCw, Search, Trash2, X } from 'lucide-react';
import { Link, useParams } from 'react-router-dom';
import api from '../lib/api';

type Project = { id: string; name: string; description?: string | null; status: string; manager_id?: string | null; start_date?: string | null; deadline?: string | null; created_at: string };
type Task = { id: string; title: string; description?: string | null; assigned_to?: string | null; status: string; priority: string; deadline?: string | null };
type Member = { user_id: string; users: { name: string; email: string } };
type ProjectForm = { name: string; description: string; status: string; startDate: string; deadline: string; managerId: string };
type TaskForm = { title: string; description: string; status: string; priority: string; deadline: string; assignedTo: string };

const emptyProject: ProjectForm = { name: '', description: '', status: 'planned', startDate: '', deadline: '', managerId: '' };
const emptyTask: TaskForm = { title: '', description: '', status: 'todo', priority: 'medium', deadline: '', assignedTo: '' };
const statuses = ['planned', 'active', 'on_hold', 'completed', 'archived'];

export default function ProjectsPage() {
  const { organizationId } = useParams<{ organizationId: string }>();
  const [projects, setProjects] = useState<Project[]>([]);
  const [members, setMembers] = useState<Member[]>([]);
  const [selected, setSelected] = useState<Project | null>(null);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [projectForm, setProjectForm] = useState<ProjectForm>(emptyProject);
  const [taskForm, setTaskForm] = useState<TaskForm>(emptyTask);
  const [editing, setEditing] = useState(false);
  const [showProjectForm, setShowProjectForm] = useState(false);
  const [showTaskForm, setShowTaskForm] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [query, setQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [loading, setLoading] = useState(true);
  const [detailLoading, setDetailLoading] = useState(false);
  const [error, setError] = useState('');

  const loadProjects = async () => {
    if (!organizationId) return;
    setLoading(true); setError('');
    try {
      const [projectsResponse, membersResponse] = await Promise.all([
        api.get<Project[]>(`/organizations/${organizationId}/projects`),
        api.get<Member[]>(`/organizations/${organizationId}/members`),
      ]);
      setProjects(projectsResponse.data); setMembers(membersResponse.data);
    } catch { setError('Projects could not be loaded. Check your access and try again.'); }
    finally { setLoading(false); }
  };
  useEffect(() => { void loadProjects(); }, [organizationId]);

  const openProject = async (project: Project) => {
    if (!organizationId) return;
    setSelected(project); setDetailLoading(true); setError('');
    try { const response = await api.get<Project & { tasks: Task[] }>(`/organizations/${organizationId}/projects/${project.id}`); setSelected(response.data); setTasks(response.data.tasks); }
    catch { setError('Project details could not be loaded.'); }
    finally { setDetailLoading(false); }
  };
  const submitProject = async (event: FormEvent) => {
    event.preventDefault(); if (!organizationId) return;
    try {
      const payload = { ...projectForm, managerId: projectForm.managerId || undefined, startDate: projectForm.startDate || undefined, deadline: projectForm.deadline || undefined };
      if (editing && selected) await api.patch(`/organizations/${organizationId}/projects/${selected.id}`, payload);
      else await api.post(`/organizations/${organizationId}/projects`, payload);
      setShowProjectForm(false); setEditing(false); setProjectForm(emptyProject); await loadProjects();
      if (selected) { const fresh = projects.find((project) => project.id === selected.id); if (fresh) await openProject(fresh); }
    } catch { setError('Project could not be saved.'); }
  };
  const removeProject = async () => {
    if (!organizationId || !selected || !window.confirm(`Delete project “${selected.name}” and its tasks?`)) return;
    try { await api.delete(`/organizations/${organizationId}/projects/${selected.id}`); setSelected(null); setTasks([]); await loadProjects(); }
    catch { setError('Project could not be deleted.'); }
  };
  const submitTask = async (event: FormEvent) => {
    event.preventDefault(); if (!organizationId || !selected) return;
    try { const payload = { ...taskForm, assignedTo: taskForm.assignedTo || undefined, deadline: taskForm.deadline || undefined }; if (editingTask) await api.patch(`/organizations/${organizationId}/projects/${selected.id}/tasks/${editingTask.id}`, payload); else await api.post(`/organizations/${organizationId}/projects/${selected.id}/tasks`, payload); setTaskForm(emptyTask); setEditingTask(null); setShowTaskForm(false); await openProject(selected); }
    catch { setError('Task could not be created.'); }
  };
  const beginTaskEdit = (task: Task) => { setEditingTask(task); setTaskForm({ title: task.title, description: task.description ?? '', status: task.status, priority: task.priority, deadline: task.deadline ? task.deadline.slice(0, 16) : '', assignedTo: task.assigned_to ?? '' }); setShowTaskForm(true); };
  const toggleTask = async (task: Task) => {
    if (!organizationId || !selected) return;
    try { await api.patch(`/organizations/${organizationId}/projects/${selected.id}/tasks/${task.id}`, { status: task.status === 'done' ? 'todo' : 'done' }); await openProject(selected); }
    catch { setError('Task status could not be updated.'); }
  };
  const removeTask = async (task: Task) => {
    if (!organizationId || !selected || !window.confirm(`Delete task “${task.title}”?`)) return;
    try { await api.delete(`/organizations/${organizationId}/projects/${selected.id}/tasks/${task.id}`); await openProject(selected); }
    catch { setError('Task could not be deleted.'); }
  };

  const visibleProjects = useMemo(() => projects.filter((project) => project.name.toLowerCase().includes(query.toLowerCase()) && (statusFilter === 'all' || project.status === statusFilter)), [projects, query, statusFilter]);
  const beginEdit = () => { if (!selected) return; setProjectForm({ name: selected.name, description: selected.description ?? '', status: selected.status, managerId: selected.manager_id ?? '', startDate: selected.start_date?.slice(0, 10) ?? '', deadline: selected.deadline?.slice(0, 10) ?? '' }); setEditing(true); setShowProjectForm(true); };

  return <div className="min-h-screen bg-slate-50 p-5 text-slate-900 dark:bg-[#11121b] dark:text-slate-100 md:p-10"><div className="mx-auto max-w-6xl space-y-6">
    <header className="flex flex-wrap items-center justify-between gap-4"><div><Link to={`/workspace/${organizationId}`} className="mb-2 flex items-center gap-1 text-xs text-slate-500"><ArrowLeft size={14} />Workspace</Link><h1 className="text-3xl font-semibold">Projects</h1><p className="mt-1 text-sm text-slate-500">Manage delivery work and the tasks attached to it.</p></div><div className="flex gap-2"><button onClick={() => void loadProjects()} className="rounded-lg border border-slate-200 p-2 dark:border-white/10" aria-label="Refresh projects"><RefreshCw size={17} /></button><button onClick={() => { setEditing(false); setProjectForm(emptyProject); setShowProjectForm(true); }} className="flex items-center gap-2 rounded-lg bg-indigo-600 px-3 py-2 text-sm font-medium text-white"><Plus size={16} />New project</button></div></header>
    {error && <div className="rounded-xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-700 dark:border-rose-400/20 dark:bg-rose-400/10 dark:text-rose-200">{error}</div>}
    {selected ? <ProjectDetail project={selected} tasks={tasks} members={members} loading={detailLoading} onBack={() => setSelected(null)} onEdit={beginEdit} onDelete={() => void removeProject()} onAddTask={() => { setEditingTask(null); setTaskForm(emptyTask); setShowTaskForm(true); }} onToggleTask={(task) => void toggleTask(task)} onEditTask={beginTaskEdit} onDeleteTask={(task) => void removeTask(task)} /> : <><div className="flex flex-wrap gap-3"><label className="flex flex-1 items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-2 dark:border-white/10 dark:bg-white/[0.03]"><Search size={16} className="text-slate-400" /><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search projects" className="w-full bg-transparent text-sm outline-none" /></label><select value={statusFilter} onChange={(event) => setStatusFilter(event.target.value)} className="rounded-lg border border-slate-200 bg-white px-3 text-sm dark:border-white/10 dark:bg-white/[0.03]"><option value="all">All statuses</option>{statuses.map((status) => <option key={status} value={status}>{status.replace('_', ' ')}</option>)}</select></div>{loading ? <State text="Loading projects…" /> : visibleProjects.length === 0 ? <State text="No projects match your filters." /> : <div className="grid gap-4 md:grid-cols-2">{visibleProjects.map((project) => <button key={project.id} onClick={() => void openProject(project)} className="rounded-2xl border border-slate-200 bg-white p-5 text-left shadow-sm transition hover:-translate-y-0.5 hover:border-indigo-300 dark:border-white/10 dark:bg-white/[0.03]"><div className="flex items-start justify-between gap-3"><span className="rounded-lg bg-indigo-50 p-2 text-indigo-600 dark:bg-indigo-400/10 dark:text-indigo-300"><FolderKanban size={18} /></span><span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs capitalize text-slate-600 dark:bg-white/10 dark:text-slate-300">{project.status.replace('_', ' ')}</span></div><h2 className="mt-4 font-semibold">{project.name}</h2><p className="mt-1 line-clamp-2 text-sm text-slate-500">{project.description || 'No description provided'}</p><p className="mt-5 text-xs text-slate-400">Deadline: {project.deadline ? new Date(project.deadline).toLocaleDateString() : 'Not set'}</p></button>)}</div>}</>}
    {showProjectForm && <Modal title={editing ? 'Edit project' : 'Create project'} onClose={() => setShowProjectForm(false)}><form onSubmit={submitProject} className="space-y-4"><Input label="Name" value={projectForm.name} onChange={(value) => setProjectForm({ ...projectForm, name: value })} required /><Input label="Description" value={projectForm.description} onChange={(value) => setProjectForm({ ...projectForm, description: value })} /><div className="grid gap-3 sm:grid-cols-2"><Select label="Status" value={projectForm.status} options={statuses} onChange={(value) => setProjectForm({ ...projectForm, status: value })} /><Select label="Manager" value={projectForm.managerId} options={members.map((member) => member.user_id)} labels={Object.fromEntries(members.map((member) => [member.user_id, member.users.name]))} onChange={(value) => setProjectForm({ ...projectForm, managerId: value })} /></div><div className="grid gap-3 sm:grid-cols-2"><Input label="Start date" type="date" value={projectForm.startDate} onChange={(value) => setProjectForm({ ...projectForm, startDate: value })} /><Input label="Deadline" type="date" value={projectForm.deadline} onChange={(value) => setProjectForm({ ...projectForm, deadline: value })} /></div><Submit label={editing ? 'Save changes' : 'Create project'} /></form></Modal>}
    {showTaskForm && <Modal title={editingTask ? 'Edit task' : 'Create task'} onClose={() => { setShowTaskForm(false); setEditingTask(null); }}><form onSubmit={submitTask} className="space-y-4"><Input label="Title" value={taskForm.title} onChange={(value) => setTaskForm({ ...taskForm, title: value })} required /><Input label="Description" value={taskForm.description} onChange={(value) => setTaskForm({ ...taskForm, description: value })} /><div className="grid gap-3 sm:grid-cols-2"><Select label="Status" value={taskForm.status} options={['todo', 'in_progress', 'blocked', 'done']} onChange={(value) => setTaskForm({ ...taskForm, status: value })} /><Select label="Priority" value={taskForm.priority} options={['low', 'medium', 'high', 'urgent']} onChange={(value) => setTaskForm({ ...taskForm, priority: value })} /></div><Select label="Assignee" value={taskForm.assignedTo} options={members.map((member) => member.user_id)} labels={Object.fromEntries(members.map((member) => [member.user_id, member.users.name]))} onChange={(value) => setTaskForm({ ...taskForm, assignedTo: value })} /><Input label="Due date" type="datetime-local" value={taskForm.deadline} onChange={(value) => setTaskForm({ ...taskForm, deadline: value })} /><Submit label={editingTask ? 'Save task' : 'Create task'} /></form></Modal>}
  </div></div>;
}

function ProjectDetail({ project, tasks, members, loading, onBack, onEdit, onDelete, onAddTask, onToggleTask, onEditTask, onDeleteTask }: { project: Project; tasks: Task[]; members: Member[]; loading: boolean; onBack: () => void; onEdit: () => void; onDelete: () => void; onAddTask: () => void; onToggleTask: (task: Task) => void; onEditTask: (task: Task) => void; onDeleteTask: (task: Task) => void }) { const assignee = (id?: string | null) => members.find((member) => member.user_id === id)?.users.name ?? 'Unassigned'; return <div className="space-y-5"><button onClick={onBack} className="flex items-center gap-1 text-sm text-slate-500"><ArrowLeft size={15} />All projects</button><div className="rounded-2xl border border-slate-200 bg-white p-6 dark:border-white/10 dark:bg-white/[0.03]"><div className="flex flex-wrap items-start justify-between gap-4"><div><h2 className="text-2xl font-semibold">{project.name}</h2><p className="mt-2 max-w-2xl text-sm text-slate-500">{project.description || 'No description provided'}</p><p className="mt-4 text-xs text-slate-400">{project.status.replace('_', ' ')} · Deadline {project.deadline ? new Date(project.deadline).toLocaleDateString() : 'not set'}</p></div><div className="flex gap-2"><button onClick={onEdit} className="rounded-lg border border-slate-200 p-2 dark:border-white/10" aria-label="Edit project"><Edit3 size={16} /></button><button onClick={onDelete} className="rounded-lg border border-rose-200 p-2 text-rose-600 dark:border-rose-400/20" aria-label="Delete project"><Trash2 size={16} /></button></div></div></div><div className="rounded-2xl border border-slate-200 bg-white p-6 dark:border-white/10 dark:bg-white/[0.03]"><div className="mb-5 flex items-center justify-between"><div><h3 className="font-semibold">Tasks</h3><p className="text-sm text-slate-500">{tasks.filter((task) => task.status === 'done').length} of {tasks.length} complete</p></div><button onClick={onAddTask} className="flex items-center gap-2 rounded-lg bg-indigo-600 px-3 py-2 text-sm font-medium text-white"><Plus size={16} />Add task</button></div>{loading ? <State text="Loading tasks…" /> : tasks.length === 0 ? <State text="No tasks yet." /> : <div className="divide-y divide-slate-200 dark:divide-white/10">{tasks.map((task) => <div key={task.id} className="flex items-center gap-3 py-3"><button onClick={() => onToggleTask(task)} aria-label={`Mark ${task.title} ${task.status === 'done' ? 'todo' : 'done'}`} className="text-indigo-600">{task.status === 'done' ? <CheckCircle2 size={19} /> : <Circle size={19} />}</button><div className="min-w-0 flex-1"><p className={`font-medium ${task.status === 'done' ? 'text-slate-400 line-through' : ''}`}>{task.title}</p><p className="text-xs text-slate-500">{assignee(task.assigned_to)} · {task.priority} · {task.deadline ? new Date(task.deadline).toLocaleDateString() : 'No due date'}</p></div><button onClick={() => onEditTask(task)} className="text-slate-400 hover:text-indigo-600" aria-label={`Edit ${task.title}`}><Edit3 size={15} /></button><button onClick={() => onDeleteTask(task)} className="text-slate-400 hover:text-rose-600" aria-label={`Delete ${task.title}`}><Trash2 size={15} /></button></div>)}</div>}</div></div>; }
function Modal({ title, onClose, children }: { title: string; onClose: () => void; children: React.ReactNode }) { return <div className="fixed inset-0 z-50 grid place-items-center bg-slate-900/40 p-4"><div className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-2xl dark:bg-[#1b1d29]"><div className="mb-5 flex items-center justify-between"><h2 className="text-lg font-semibold">{title}</h2><button onClick={onClose} aria-label="Close"><X size={18} /></button></div>{children}</div></div>; }
function Input({ label, value, onChange, type = 'text', required = false }: { label: string; value: string; onChange: (value: string) => void; type?: string; required?: boolean }) { return <label className="block text-sm"><span className="mb-1.5 block text-xs font-medium text-slate-500">{label}</span><input required={required} type={type} value={value} onChange={(event) => onChange(event.target.value)} className="w-full rounded-lg border border-slate-200 bg-transparent px-3 py-2 outline-none focus:border-indigo-500 dark:border-white/10" /></label>; }
function Select({ label, value, options, labels = {}, onChange }: { label: string; value: string; options: string[]; labels?: Record<string, string>; onChange: (value: string) => void }) { return <label className="block text-sm"><span className="mb-1.5 block text-xs font-medium text-slate-500">{label}</span><select value={value} onChange={(event) => onChange(event.target.value)} className="w-full rounded-lg border border-slate-200 bg-transparent px-3 py-2 outline-none dark:border-white/10"><option value="">Not assigned</option>{options.map((option) => <option key={option} value={option}>{labels[option] ?? option.replace('_', ' ')}</option>)}</select></label>; }
function Submit({ label }: { label: string }) { return <button type="submit" className="w-full rounded-lg bg-indigo-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-indigo-500">{label}</button>; }
function State({ text }: { text: string }) { return <div className="rounded-xl border border-dashed border-slate-300 p-10 text-center text-sm text-slate-500 dark:border-white/15">{text}</div>; }
