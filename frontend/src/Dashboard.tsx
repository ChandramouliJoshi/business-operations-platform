import { useEffect, useMemo, useState, type ReactNode } from 'react';
import { Link, useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { Activity, ArrowLeft, FolderKanban, LogOut, Plus, RefreshCw, Users } from 'lucide-react';
import api from './lib/api';
import AppearanceSwitcher from './components/AppearanceSwitcher';
import { useAuth } from './context/AuthContext';
import ProjectsPage from './pages/ProjectsPage';
import TeamPage from './pages/TeamPage';
import OperationsPage from './pages/OperationsPage';
import AuditLogsPage from './pages/AuditLogsPage';
import { Bar, BarChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';

type Organization = { id: string; name: string; role?: { name: string } };
type Project = { id: string; name: string; description?: string | null; status: string; deadline?: string | null; created_at: string };
type Analytics = { projects: { total: number; active: number; completed: number }; tasks: { total: number; completed: number; pending: number; overdue: number; byStatus: { status: string; count: number }[]; byPriority: { priority: string; count: number }[] }; requests: { pending: number }; approvals: { pending: number }; activity: { id: string; action: string; entity_type: string; created_at: string; users?: { name: string } | null }[] };

export default function Dashboard() {
  const { organizationId } = useParams<{ organizationId: string }>();
  const { logout } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [organization, setOrganization] = useState<Organization | null>(null);
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [analytics, setAnalytics] = useState<Analytics | null>(null);

  const loadWorkspace = async () => {
    if (!organizationId) return;
    setLoading(true); setError('');
    try {
      const [organizationsResponse, projectsResponse] = await Promise.all([
        api.get<Organization[]>('/organizations'),
        api.get<Project[]>(`/organizations/${organizationId}/projects`),
      ]);
      const current = organizationsResponse.data.find((item) => item.id === organizationId);
      if (!current) { navigate('/organizations', { replace: true }); return; }
      setOrganization(current); setProjects(projectsResponse.data);
      try { const analyticsResponse = await api.get<Analytics>(`/organizations/${organizationId}/analytics`); setAnalytics(analyticsResponse.data); } catch { setAnalytics(null); }
    } catch { setError('We could not load this workspace. Your session may have expired.'); }
    finally { setLoading(false); }
  };

  useEffect(() => { void loadWorkspace(); }, [organizationId]);
  const activeProjects = useMemo(() => analytics?.projects.active ?? projects.filter((project) => !['completed', 'archived'].includes(project.status.toLowerCase())).length, [analytics, projects]);
  const signOut = () => { logout(); navigate('/login', { replace: true }); };

  if (searchParams.get('view') === 'projects') return <ProjectsPage />;
  if (searchParams.get('view') === 'team') return <TeamPage />;
  if (searchParams.get('view') === 'operations') return <OperationsPage />;
  if (searchParams.get('view') === 'audit') return <AuditLogsPage />;

  return <div className="min-h-screen bg-slate-50 text-slate-900 dark:bg-[#11121b] dark:text-slate-100">
    <aside className="fixed inset-y-0 left-0 hidden w-64 border-r border-slate-200 bg-[#171923] px-5 py-6 text-slate-300 md:flex md:flex-col dark:border-white/10">
      <Link to="/organizations" className="mb-10 flex items-center gap-3 text-lg font-semibold text-white"><span className="grid h-9 w-9 place-items-center rounded-xl bg-indigo-500 text-sm font-bold">N</span>Nexora</Link>
      <p className="mb-3 px-3 text-xs font-semibold uppercase tracking-wider text-slate-500">Workspace</p>
      <nav className="space-y-1"><Link to={`/workspace/${organizationId}`} className="flex items-center gap-3 rounded-xl bg-white/10 px-3 py-2.5 text-sm text-white"><Activity size={17} />Overview</Link><Link to={`/workspace/${organizationId}?view=projects`} className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm hover:bg-white/10"><FolderKanban size={17} />Projects</Link><Link to="/organizations" className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm hover:bg-white/10"><Users size={17} />Organizations</Link><Link to={`/workspace/${organizationId}?view=team`} className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm hover:bg-white/10"><Users size={17} />Team & access</Link><Link to={`/workspace/${organizationId}?view=operations`} className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm hover:bg-white/10"><Activity size={17} />Operations</Link></nav>
      <button onClick={signOut} className="mt-auto flex items-center gap-3 rounded-xl px-3 py-2.5 text-left text-sm hover:bg-white/10"><LogOut size={17} />Sign out</button>
    </aside>
    <main className="md:pl-64"><header className="flex items-center justify-between border-b border-slate-200 bg-white/80 px-5 py-4 backdrop-blur md:px-10 dark:border-white/10 dark:bg-[#11121b]/80"><div><Link to="/organizations" className="mb-1 flex items-center gap-1 text-xs text-slate-500"><ArrowLeft size={14} />All organizations</Link><h1 className="text-xl font-semibold">{organization?.name ?? 'Workspace'}</h1></div><div className="flex items-center gap-3"><AppearanceSwitcher /><button onClick={() => void loadWorkspace()} className="rounded-lg border border-slate-200 p-2 hover:bg-slate-100 dark:border-white/10 dark:hover:bg-white/10" aria-label="Refresh workspace"><RefreshCw size={17} /></button></div></header>
      <section className="mx-auto max-w-6xl space-y-8 p-5 md:p-10">{loading && <State text="Loading workspace…" />}{error && <div className="rounded-2xl border border-rose-200 bg-rose-50 p-5 text-sm text-rose-700 dark:border-rose-400/20 dark:bg-rose-400/10 dark:text-rose-200">{error}</div>}{!loading && !error && <><div><p className="text-sm text-slate-500">{organization?.role?.name ?? 'Member'} workspace</p><h2 className="mt-1 text-3xl font-semibold tracking-tight">Good to see you.</h2></div><div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4"><Metric label="Total projects" value={analytics?.projects.total ?? projects.length} icon={<FolderKanban size={18} />} /><Metric label="Active projects" value={activeProjects} icon={<Activity size={18} />} /><Metric label="Tasks" value={analytics?.tasks.total ?? 0} icon={<Activity size={18} />} /><Metric label="Overdue tasks" value={analytics?.tasks.overdue ?? 0} icon={<Activity size={18} />} /></div><div className="grid gap-4 sm:grid-cols-2"><Metric label="Pending requests" value={analytics?.requests.pending ?? 0} icon={<Activity size={18} />} /><Metric label="Pending approvals" value={analytics?.approvals.pending ?? 0} icon={<Activity size={18} />} /></div>{analytics && <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-white/10 dark:bg-white/[0.03]"><div className="mb-5"><h3 className="font-semibold">Task distribution</h3><p className="text-sm text-slate-500">Current task volume by status.</p></div><div className="h-56"><ResponsiveContainer width="100%" height="100%"><BarChart data={analytics.tasks.byStatus}><XAxis dataKey="status" tick={{ fontSize: 11 }} /><YAxis allowDecimals={false} tick={{ fontSize: 11 }} /><Tooltip /><Bar dataKey="count" fill="#6366f1" radius={[6, 6, 0, 0]} /></BarChart></ResponsiveContainer></div></div>}<div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-white/10 dark:bg-white/[0.03]"><div className="mb-5 flex items-center justify-between"><div><h3 className="font-semibold">Projects</h3><p className="text-sm text-slate-500">Live projects from this organization.</p></div><button onClick={() => navigate(`/workspace/${organizationId}?view=projects`)} className="flex items-center gap-2 rounded-lg bg-indigo-600 px-3 py-2 text-sm font-medium text-white hover:bg-indigo-500"><Plus size={16} />New project</button></div>{projects.length === 0 ? <div className="rounded-xl border border-dashed border-slate-300 p-10 text-center text-sm text-slate-500 dark:border-white/15">No projects yet. Create the first project to start tracking work.</div> : <div className="divide-y divide-slate-200 dark:divide-white/10">{projects.map((project) => <div key={project.id} className="flex items-center justify-between gap-4 py-4"><div><p className="font-medium">{project.name}</p><p className="mt-1 text-sm text-slate-500">{project.description || 'No description provided'}</p></div><span className="rounded-full bg-indigo-50 px-3 py-1 text-xs font-medium capitalize text-indigo-700 dark:bg-indigo-400/10 dark:text-indigo-300">{project.status}</span></div>)}</div>}</div></>}</section></main>
  </div>;
}

function Metric({ label, value, icon }: { label: string; value: string | number; icon: ReactNode }) { return <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-white/10 dark:bg-white/[0.03]"><div className="mb-4 flex h-9 w-9 items-center justify-center rounded-lg bg-indigo-50 text-indigo-600 dark:bg-indigo-400/10 dark:text-indigo-300">{icon}</div><p className="text-sm text-slate-500">{label}</p><p className="mt-1 text-2xl font-semibold">{value}</p></div>; }
function State({ text }: { text: string }) { return <div className="rounded-2xl border border-slate-200 bg-white p-10 text-center text-slate-500 dark:border-white/10 dark:bg-white/[0.03]">{text}</div>; }
