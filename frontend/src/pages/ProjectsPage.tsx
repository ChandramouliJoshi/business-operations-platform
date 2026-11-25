import { useMemo, useState, type FormEvent } from "react";
import { AnimatePresence, motion } from "motion/react";
import {
  Activity,
  AlertTriangle,
  ArrowRight,
  ArrowUpRight,
  CalendarDays,
  Check,
  CheckCircle2,
  Circle,
  FolderKanban,
  LayoutGrid,
  List,
  MoreHorizontal,
  Plus,
  Search,
  Sparkles,
  Target,
  Users,
  X,
} from "lucide-react";
import AppearanceSwitcher from "../components/AppearanceSwitcher";

type ProjectStatus = "In Progress" | "Planning" | "In Review" | "Completed";
type ProjectPriority = "High" | "Medium" | "Low";
type ProjectHealth = "On track" | "At risk" | "Delayed";

type ProjectTask = {
  id: string;
  title: string;
  assignee: string;
  dueDate: string;
  completed: boolean;
};

type ProjectActivity = {
  id: string;
  person: string;
  initials: string;
  action: string;
  time: string;
};

type Project = {
  id: string;
  name: string;
  description: string;
  department: string;
  owner: string;
  ownerInitials: string;
  ownerColor: string;
  members: string[];
  status: ProjectStatus;
  priority: ProjectPriority;
  health: ProjectHealth;
  progress: number;
  startDate: string;
  dueDate: string;
  budget: number;
  tasks: ProjectTask[];
  milestones: { id: string; title: string; date: string; completed: boolean }[];
  activity: ProjectActivity[];
};

const initialProjects: Project[] = [
  {
    id: "PRJ-024",
    name: "Website Redesign",
    description: "Revamp the company website with a modern design system, improved accessibility and a faster customer experience.",
    department: "Design",
    owner: "Sarah Chen",
    ownerInitials: "SC",
    ownerColor: "bg-violet-100 text-violet-700",
    members: ["SC", "AM", "JL", "TK"],
    status: "In Progress",
    priority: "High",
    health: "On track",
    progress: 78,
    startDate: "Nov 04, 2026",
    dueDate: "Nov 28, 2026",
    budget: 24000,
    tasks: [
      { id: "T-101", title: "Finalize homepage wireframes", assignee: "Sarah Chen", dueDate: "Nov 18", completed: true },
      { id: "T-102", title: "Approve design system", assignee: "Alex Morgan", dueDate: "Nov 20", completed: true },
      { id: "T-103", title: "Build responsive landing page", assignee: "Jordan Lee", dueDate: "Nov 24", completed: true },
      { id: "T-104", title: "Complete accessibility review", assignee: "Taylor Kim", dueDate: "Nov 26", completed: false },
      { id: "T-105", title: "Production handoff", assignee: "Sarah Chen", dueDate: "Nov 28", completed: false },
    ],
    milestones: [
      { id: "M-1", title: "Discovery and requirements", date: "Nov 08, 2026", completed: true },
      { id: "M-2", title: "Design approval", date: "Nov 16, 2026", completed: true },
      { id: "M-3", title: "Development complete", date: "Nov 25, 2026", completed: false },
      { id: "M-4", title: "Production launch", date: "Nov 28, 2026", completed: false },
    ],
    activity: [
      { id: "A-1", person: "Sarah Chen", initials: "SC", action: "completed Homepage wireframes", time: "18 min ago" },
      { id: "A-2", person: "Alex Morgan", initials: "AM", action: "updated the design system", time: "1 hour ago" },
      { id: "A-3", person: "Jordan Lee", initials: "JL", action: "added 2 new tasks", time: "Yesterday" },
    ],
  },
  {
    id: "PRJ-023",
    name: "Mobile Application",
    description: "Build a cross-platform mobile application that gives customers a seamless way to manage their accounts.",
    department: "Engineering",
    owner: "Alex Morgan",
    ownerInitials: "AM",
    ownerColor: "bg-blue-100 text-blue-700",
    members: ["AM", "TK", "CJ"],
    status: "In Progress",
    priority: "High",
    health: "At risk",
    progress: 56,
    startDate: "Oct 20, 2026",
    dueDate: "Dec 04, 2026",
    budget: 48000,
    tasks: [
      { id: "T-201", title: "Set up application architecture", assignee: "Alex Morgan", dueDate: "Nov 15", completed: true },
      { id: "T-202", title: "Implement authentication", assignee: "Taylor Kim", dueDate: "Nov 21", completed: true },
      { id: "T-203", title: "Build account dashboard", assignee: "CJ", dueDate: "Nov 25", completed: false },
      { id: "T-204", title: "Integrate payment service", assignee: "Alex Morgan", dueDate: "Nov 29", completed: false },
      { id: "T-205", title: "QA and release candidate", assignee: "Taylor Kim", dueDate: "Dec 02", completed: false },
    ],
    milestones: [
      { id: "M-5", title: "Architecture sign-off", date: "Nov 05, 2026", completed: true },
      { id: "M-6", title: "Core features", date: "Nov 24, 2026", completed: false },
      { id: "M-7", title: "Beta release", date: "Nov 30, 2026", completed: false },
      { id: "M-8", title: "Public launch", date: "Dec 04, 2026", completed: false },
    ],
    activity: [
      { id: "A-4", person: "Taylor Kim", initials: "TK", action: "flagged an API dependency", time: "25 min ago" },
      { id: "A-5", person: "Alex Morgan", initials: "AM", action: "updated project progress", time: "3 hours ago" },
    ],
  },
  {
    id: "PRJ-022",
    name: "CRM Integration",
    description: "Connect the customer relationship management platform with internal business tools and data.",
    department: "Product",
    owner: "Jordan Lee",
    ownerInitials: "JL",
    ownerColor: "bg-cyan-100 text-cyan-700",
    members: ["JL", "SC"],
    status: "In Review",
    priority: "Medium",
    health: "On track",
    progress: 92,
    startDate: "Oct 02, 2026",
    dueDate: "Nov 25, 2026",
    budget: 18000,
    tasks: [
      { id: "T-301", title: "Map customer data fields", assignee: "Jordan Lee", dueDate: "Nov 12", completed: true },
      { id: "T-302", title: "Build integration service", assignee: "Sarah Chen", dueDate: "Nov 18", completed: true },
      { id: "T-303", title: "Run integration tests", assignee: "Jordan Lee", dueDate: "Nov 23", completed: true },
      { id: "T-304", title: "Stakeholder sign-off", assignee: "Jordan Lee", dueDate: "Nov 25", completed: false },
    ],
    milestones: [
      { id: "M-9", title: "Data mapping", date: "Oct 15, 2026", completed: true },
      { id: "M-10", title: "Integration complete", date: "Nov 18, 2026", completed: true },
      { id: "M-11", title: "Stakeholder review", date: "Nov 25, 2026", completed: false },
    ],
    activity: [
      { id: "A-6", person: "Jordan Lee", initials: "JL", action: "submitted the integration for review", time: "2 hours ago" },
    ],
  },
  {
    id: "PRJ-021",
    name: "Analytics Dashboard",
    description: "Deliver business intelligence dashboards that make operational performance easier to understand.",
    department: "Data",
    owner: "CJ",
    ownerInitials: "CJ",
    ownerColor: "bg-indigo-100 text-indigo-700",
    members: ["CJ", "TK"],
    status: "In Progress",
    priority: "Medium",
    health: "On track",
    progress: 34,
    startDate: "Nov 01, 2026",
    dueDate: "Dec 12, 2026",
    budget: 32000,
    tasks: [
      { id: "T-401", title: "Define KPI requirements", assignee: "CJ", dueDate: "Nov 18", completed: true },
      { id: "T-402", title: "Prepare source datasets", assignee: "Taylor Kim", dueDate: "Nov 25", completed: false },
      { id: "T-403", title: "Build dashboard views", assignee: "CJ", dueDate: "Dec 05", completed: false },
    ],
    milestones: [
      { id: "M-12", title: "Requirements approved", date: "Nov 18, 2026", completed: true },
      { id: "M-13", title: "Data pipeline ready", date: "Nov 28, 2026", completed: false },
      { id: "M-14", title: "Dashboard release", date: "Dec 12, 2026", completed: false },
    ],
    activity: [
      { id: "A-7", person: "CJ", initials: "CJ", action: "created the KPI requirements", time: "Yesterday" },
    ],
  },
  {
    id: "PRJ-020",
    name: "Employee Onboarding",
    description: "Streamline onboarding workflows and centralize the resources new employees need to get started.",
    department: "Human Resources",
    owner: "Sarah Chen",
    ownerInitials: "SC",
    ownerColor: "bg-violet-100 text-violet-700",
    members: ["SC", "JL"],
    status: "Planning",
    priority: "Low",
    health: "On track",
    progress: 10,
    startDate: "Nov 18, 2026",
    dueDate: "Jan 10, 2027",
    budget: 12000,
    tasks: [
      { id: "T-501", title: "Document onboarding process", assignee: "Sarah Chen", dueDate: "Nov 28", completed: false },
      { id: "T-502", title: "Identify workflow owners", assignee: "Jordan Lee", dueDate: "Dec 02", completed: false },
    ],
    milestones: [
      { id: "M-15", title: "Process discovery", date: "Nov 28, 2026", completed: false },
      { id: "M-16", title: "Workflow rollout", date: "Jan 10, 2027", completed: false },
    ],
    activity: [
      { id: "A-8", person: "Sarah Chen", initials: "SC", action: "created the project plan", time: "2 days ago" },
    ],
  },
  {
    id: "PRJ-019",
    name: "Payment Gateway",
    description: "Implement secure payment processing and transaction management for the customer platform.",
    department: "Engineering",
    owner: "Alex Morgan",
    ownerInitials: "AM",
    ownerColor: "bg-blue-100 text-blue-700",
    members: ["AM", "CJ", "TK"],
    status: "Completed",
    priority: "High",
    health: "On track",
    progress: 100,
    startDate: "Sep 12, 2026",
    dueDate: "Nov 18, 2026",
    budget: 26000,
    tasks: [
      { id: "T-601", title: "Payment provider integration", assignee: "Alex Morgan", dueDate: "Nov 08", completed: true },
      { id: "T-602", title: "Security testing", assignee: "CJ", dueDate: "Nov 12", completed: true },
      { id: "T-603", title: "Production deployment", assignee: "Taylor Kim", dueDate: "Nov 18", completed: true },
    ],
    milestones: [
      { id: "M-17", title: "Integration complete", date: "Oct 20, 2026", completed: true },
      { id: "M-18", title: "Security sign-off", date: "Nov 12, 2026", completed: true },
      { id: "M-19", title: "Production launch", date: "Nov 18, 2026", completed: true },
    ],
    activity: [
      { id: "A-9", person: "Alex Morgan", initials: "AM", action: "marked the project as completed", time: "Nov 18" },
    ],
  },
];

const statusStyles: Record<ProjectStatus, string> = {
  "In Progress": "bg-blue-50 text-blue-700 ring-blue-600/10",
  Planning: "bg-amber-50 text-amber-700 ring-amber-600/10",
  "In Review": "bg-violet-50 text-violet-700 ring-violet-600/10",
  Completed: "bg-emerald-50 text-emerald-700 ring-emerald-600/10",
};

const priorityStyles: Record<ProjectPriority, string> = {
  High: "bg-rose-50 text-rose-700",
  Medium: "bg-amber-50 text-amber-700",
  Low: "bg-slate-100 text-slate-600",
};

const healthStyles: Record<ProjectHealth, string> = {
  "On track": "text-emerald-700 bg-emerald-50",
  "At risk": "text-amber-700 bg-amber-50",
  Delayed: "text-rose-700 bg-rose-50",
};

const tabs = ["Overview", "Tasks", "Timeline", "Team", "Activity"] as const;
type ProjectTab = (typeof tabs)[number];

function initials(name: string) {
  return name
    .split(" ")
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

function formatCurrency(value: number) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(value);
}

function ProgressBar({ value, color = "bg-indigo-600" }: { value: number; color?: string }) {
  return (
    <div className="h-2 overflow-hidden rounded-full bg-slate-100">
      <motion.div
        className={`h-full rounded-full ${color}`}
        initial={{ width: 0 }}
        animate={{ width: `${value}%` }}
        transition={{ duration: 0.65, ease: "easeOut" }}
      />
    </div>
  );
}

function AvatarStack({ members }: { members: string[] }) {
  return (
    <div className="flex -space-x-2">
      {members.slice(0, 4).map((member, index) => (
        <div
          key={`${member}-${index}`}
          title={member}
          className="flex h-7 w-7 items-center justify-center rounded-full border-2 border-white bg-slate-100 text-[9px] font-bold text-slate-600"
        >
          {member}
        </div>
      ))}
      {members.length > 4 && (
        <div className="flex h-7 w-7 items-center justify-center rounded-full border-2 border-white bg-slate-800 text-[9px] font-semibold text-white">
          +{members.length - 4}
        </div>
      )}
    </div>
  );
}

function MetricCard({
  label,
  value,
  note,
  icon: Icon,
  tone,
}: {
  label: string;
  value: string;
  note: string;
  icon: typeof FolderKanban;
  tone: string;
}) {
  return (
    <div className="rounded-2xl border border-slate-200/80 bg-white p-4 shadow-[0_2px_10px_rgba(15,23,42,0.025)]">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-xs font-medium text-slate-500">{label}</p>
          <p className="mt-2 text-2xl font-bold tracking-tight text-slate-900">{value}</p>
          <p className="mt-1 text-[11px] text-slate-400">{note}</p>
        </div>
        <div className={`rounded-xl p-2.5 ${tone}`}>
          <Icon size={17} />
        </div>
      </div>
    </div>
  );
}

function ProjectWorkspace({
  project,
  onBack,
  onToggleTask,
}: {
  project: Project;
  onBack: () => void;
  onToggleTask: (projectId: string, taskId: string) => void;
}) {
  const [activeTab, setActiveTab] = useState<ProjectTab>("Overview");
  const completedTasks = project.tasks.filter((task) => task.completed).length;
  const taskPercent = project.tasks.length
    ? Math.round((completedTasks / project.tasks.length) * 100)
    : project.progress;

  return (
    <motion.div
      key={project.id}
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -8 }}
      transition={{ duration: 0.22 }}
      className="space-y-6"
    >
      <div className="flex flex-wrap items-center gap-2 text-xs text-slate-400">
        <button onClick={onBack} className="transition hover:text-indigo-600">Projects</button>
        <span>/</span>
        <span className="font-medium text-slate-700">{project.name}</span>
      </div>

      <div className="flex flex-col justify-between gap-4 xl:flex-row xl:items-start">
        <div className="flex min-w-0 gap-4">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-indigo-50 text-indigo-600">
            <FolderKanban size={22} />
          </div>
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <h1 className="text-2xl font-bold tracking-tight text-slate-900">{project.name}</h1>
              <span className={`rounded-full px-2.5 py-1 text-[10px] font-semibold ring-1 ring-inset ${statusStyles[project.status]}`}>
                {project.status}
              </span>
            </div>
            <p className="mt-1 max-w-2xl text-sm leading-6 text-slate-500">{project.description}</p>
            <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-2 text-xs text-slate-500">
              <span className="font-medium text-slate-600">{project.id}</span>
              <span className="flex items-center gap-1.5"><Users size={13} /> {project.department}</span>
              <span className="flex items-center gap-1.5"><CalendarDays size={13} /> Due {project.dueDate}</span>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button className="rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-xs font-semibold text-slate-600 transition hover:bg-slate-50">
            <MoreHorizontal size={16} />
          </button>
          <button className="flex items-center gap-2 rounded-xl bg-indigo-600 px-4 py-2.5 text-xs font-semibold text-white shadow-lg shadow-indigo-600/15 transition hover:bg-indigo-700">
            <Plus size={15} /> Add task
          </button>
        </div>
      </div>

      <div className="flex gap-1 overflow-x-auto border-b border-slate-200">
        {tabs.map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`relative whitespace-nowrap px-4 py-3 text-xs font-semibold transition ${
              activeTab === tab ? "text-indigo-700" : "text-slate-500 hover:text-slate-800"
            }`}
          >
            {tab}
            {tab === "Tasks" && (
              <span className="ml-2 rounded-full bg-slate-100 px-1.5 py-0.5 text-[9px] text-slate-500">{project.tasks.length}</span>
            )}
            {activeTab === tab && <motion.span layoutId="project-tab-underline" className="absolute inset-x-3 bottom-0 h-0.5 rounded-full bg-indigo-600" />}
          </button>
        ))}
      </div>

      <AnimatePresence mode="wait">
        {activeTab === "Overview" && (
          <motion.div key="overview" initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="grid gap-5 xl:grid-cols-[1.45fr_1fr]">
            <div className="space-y-5">
              <section className="rounded-2xl border border-slate-200 bg-white p-5 sm:p-6">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="text-sm font-bold text-slate-800">Project execution</p>
                    <p className="mt-1 text-xs text-slate-400">Progress against planned delivery</p>
                  </div>
                  <span className={`rounded-full px-2.5 py-1 text-[10px] font-semibold ${healthStyles[project.health]}`}>{project.health}</span>
                </div>
                <div className="mt-6 flex items-end justify-between">
                  <span className="text-4xl font-bold tracking-tight text-slate-900">{project.progress}%</span>
                  <span className="text-xs text-slate-500">{completedTasks} of {project.tasks.length} tasks completed</span>
                </div>
                <div className="mt-3"><ProgressBar value={project.progress} /></div>
                <div className="mt-5 grid grid-cols-2 gap-4 border-t border-slate-100 pt-5 sm:grid-cols-3">
                  <div><p className="text-[11px] text-slate-400">Start date</p><p className="mt-1 text-xs font-semibold text-slate-700">{project.startDate}</p></div>
                  <div><p className="text-[11px] text-slate-400">Due date</p><p className="mt-1 text-xs font-semibold text-slate-700">{project.dueDate}</p></div>
                  <div><p className="text-[11px] text-slate-400">Priority</p><p className="mt-1 text-xs font-semibold text-slate-700">{project.priority}</p></div>
                </div>
              </section>

              <section className="rounded-2xl border border-slate-200 bg-white p-5 sm:p-6">
                <div className="flex items-center justify-between">
                  <div><h2 className="text-sm font-bold text-slate-800">Upcoming milestones</h2><p className="mt-1 text-xs text-slate-400">Key delivery checkpoints</p></div>
                  <button onClick={() => setActiveTab("Timeline")} className="text-xs font-semibold text-indigo-600 hover:text-indigo-700">View timeline <ArrowRight size={13} className="ml-1 inline"/></button>
                </div>
                <div className="mt-5 space-y-4">
                  {project.milestones.slice(0, 3).map((milestone, index) => (
                    <div key={milestone.id} className="flex gap-3">
                      <div className="flex flex-col items-center">
                        <div className={`flex h-7 w-7 items-center justify-center rounded-full ${milestone.completed ? "bg-emerald-50 text-emerald-600" : "bg-slate-100 text-slate-400"}`}>
                          {milestone.completed ? <Check size={14}/> : <Circle size={10}/>}
                        </div>
                        {index < Math.min(project.milestones.length, 3) - 1 && <div className="mt-1 h-7 w-px bg-slate-200"/>}
                      </div>
                      <div className="min-w-0 flex-1 pb-2">
                        <p className={`text-xs font-semibold ${milestone.completed ? "text-slate-500" : "text-slate-800"}`}>{milestone.title}</p>
                        <p className="mt-1 text-[11px] text-slate-400">{milestone.date}</p>
                      </div>
                      {milestone.completed && <span className="text-[10px] font-medium text-emerald-600">Complete</span>}
                    </div>
                  ))}
                </div>
              </section>
            </div>

            <div className="space-y-5">
              <section className="rounded-2xl border border-slate-200 bg-white p-5">
                <h2 className="text-sm font-bold text-slate-800">Project ownership</h2>
                <div className="mt-4 flex items-center gap-3">
                  <div className={`flex h-10 w-10 items-center justify-center rounded-full text-xs font-bold ${project.ownerColor}`}>{project.ownerInitials}</div>
                  <div><p className="text-xs font-semibold text-slate-800">{project.owner}</p><p className="mt-0.5 text-[11px] text-slate-400">Project owner · {project.department}</p></div>
                </div>
                <div className="mt-5 border-t border-slate-100 pt-4">
                  <div className="flex items-center justify-between"><span className="text-[11px] text-slate-400">Contributors</span><button onClick={() => setActiveTab("Team")} className="text-[11px] font-semibold text-indigo-600">Manage team</button></div>
                  <div className="mt-3 flex items-center justify-between"><AvatarStack members={project.members}/><span className="text-xs font-semibold text-slate-600">{project.members.length} members</span></div>
                </div>
              </section>

              <section className="rounded-2xl border border-slate-200 bg-white p-5">
                <div className="flex items-center gap-2"><Target size={16} className="text-indigo-600"/><h2 className="text-sm font-bold text-slate-800">Delivery snapshot</h2></div>
                <div className="mt-4 space-y-4">
                  <div className="flex items-center justify-between"><span className="text-xs text-slate-500">Task completion</span><span className="text-xs font-bold text-slate-800">{taskPercent}%</span></div>
                  <ProgressBar value={taskPercent} color="bg-emerald-500"/>
                  <div className="flex items-center justify-between"><span className="text-xs text-slate-500">Project budget</span><span className="text-xs font-bold text-slate-800">{formatCurrency(project.budget)}</span></div>
                  <div className="flex items-center justify-between"><span className="text-xs text-slate-500">Priority</span><span className={`rounded-full px-2 py-1 text-[10px] font-semibold ${priorityStyles[project.priority]}`}>{project.priority}</span></div>
                </div>
              </section>
            </div>
          </motion.div>
        )}

        {activeTab === "Tasks" && (
          <motion.section key="tasks" initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="overflow-hidden rounded-2xl border border-slate-200 bg-white">
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 p-5">
              <div><h2 className="text-sm font-bold text-slate-800">Project tasks</h2><p className="mt-1 text-xs text-slate-400">{completedTasks} completed · {project.tasks.length - completedTasks} remaining</p></div>
              <button className="flex items-center gap-2 rounded-lg bg-indigo-600 px-3 py-2 text-xs font-semibold text-white"><Plus size={14}/> Add task</button>
            </div>
            <div className="divide-y divide-slate-100">
              {project.tasks.map((task) => (
                <label key={task.id} className="flex cursor-pointer items-center gap-3 px-5 py-4 transition hover:bg-slate-50/70">
                  <input type="checkbox" checked={task.completed} onChange={() => onToggleTask(project.id, task.id)} className="h-4 w-4 rounded border-slate-300 accent-indigo-600"/>
                  <div className="min-w-0 flex-1"><p className={`text-xs font-semibold ${task.completed ? "text-slate-400 line-through" : "text-slate-700"}`}>{task.title}</p><p className="mt-1 text-[10px] text-slate-400">{task.id} · {task.assignee}</p></div>
                  <span className="hidden items-center gap-1 text-[11px] text-slate-400 sm:flex"><CalendarDays size={12}/>{task.dueDate}</span>
                  {task.completed ? <CheckCircle2 size={16} className="text-emerald-500"/> : <Circle size={16} className="text-slate-300"/>}
                </label>
              ))}
            </div>
          </motion.section>
        )}

        {activeTab === "Timeline" && (
          <motion.section key="timeline" initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="rounded-2xl border border-slate-200 bg-white p-5 sm:p-6">
            <div><h2 className="text-sm font-bold text-slate-800">Project timeline</h2><p className="mt-1 text-xs text-slate-400">Milestones from kickoff to delivery</p></div>
            <div className="mt-6 space-y-0">
              {project.milestones.map((milestone, index) => (
                <div key={milestone.id} className="flex gap-4">
                  <div className="flex flex-col items-center"><div className={`z-10 flex h-8 w-8 items-center justify-center rounded-full ${milestone.completed ? "bg-emerald-50 text-emerald-600" : "bg-indigo-50 text-indigo-600"}`}>{milestone.completed ? <Check size={15}/> : <CalendarDays size={14}/>}</div>{index < project.milestones.length - 1 && <div className="h-14 w-px bg-slate-200"/>}</div>
                  <div className="flex flex-1 items-start justify-between gap-3 pb-7"><div><p className="text-xs font-semibold text-slate-800">{milestone.title}</p><p className="mt-1 text-[11px] text-slate-400">{milestone.date}</p></div><span className={`rounded-full px-2 py-1 text-[10px] font-semibold ${milestone.completed ? "bg-emerald-50 text-emerald-700" : "bg-slate-100 text-slate-500"}`}>{milestone.completed ? "Completed" : "Upcoming"}</span></div>
                </div>
              ))}
            </div>
          </motion.section>
        )}

        {activeTab === "Team" && (
          <motion.section key="team" initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="rounded-2xl border border-slate-200 bg-white p-5 sm:p-6">
            <div className="flex items-center justify-between"><div><h2 className="text-sm font-bold text-slate-800">Project team</h2><p className="mt-1 text-xs text-slate-400">People contributing to this project</p></div><button className="flex items-center gap-2 rounded-lg border border-slate-200 px-3 py-2 text-xs font-semibold text-slate-600"><Plus size={14}/> Invite member</button></div>
            <div className="mt-5 grid gap-3 sm:grid-cols-2">
              {[project.owner, ...project.members.filter((member) => member !== project.ownerInitials)].map((member, index) => {
                const fullName = member.length <= 3 ? ({ SC: "Sarah Chen", AM: "Alex Morgan", JL: "Jordan Lee", TK: "Taylor Kim", CJ: "CJ" } as Record<string, string>)[member] ?? member : member;
                return <div key={`${fullName}-${index}`} className="flex items-center gap-3 rounded-xl border border-slate-100 p-3"><div className="flex h-9 w-9 items-center justify-center rounded-full bg-indigo-50 text-[11px] font-bold text-indigo-700">{initials(fullName)}</div><div className="min-w-0 flex-1"><p className="text-xs font-semibold text-slate-800">{fullName}</p><p className="mt-0.5 text-[10px] text-slate-400">{index === 0 ? "Project owner" : project.department}</p></div>{index === 0 && <span className="rounded-full bg-indigo-50 px-2 py-1 text-[9px] font-semibold text-indigo-700">Owner</span>}</div>;
              })}
            </div>
          </motion.section>
        )}

        {activeTab === "Activity" && (
          <motion.section key="activity" initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="rounded-2xl border border-slate-200 bg-white p-5 sm:p-6">
            <div><h2 className="text-sm font-bold text-slate-800">Project activity</h2><p className="mt-1 text-xs text-slate-400">A record of recent updates</p></div>
            <div className="mt-5 space-y-5">
              {project.activity.map((item) => <div key={item.id} className="flex gap-3"><div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-slate-100 text-[10px] font-bold text-slate-600">{item.initials}</div><div className="flex-1"><p className="text-xs text-slate-600"><span className="font-semibold text-slate-800">{item.person}</span> {item.action}</p><p className="mt-1 text-[10px] text-slate-400">{item.time}</p></div><Activity size={14} className="text-slate-300"/></div>)}
            </div>
          </motion.section>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

function CreateProjectModal({
  onClose,
  onCreate,
}: {
  onClose: () => void;
  onCreate: (project: Project) => void;
}) {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [department, setDepartment] = useState("Engineering");
  const [priority, setPriority] = useState<ProjectPriority>("Medium");
  const [dueDate, setDueDate] = useState("");

  const submit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!name.trim()) return;
    const project: Project = {
      id: `PRJ-${String(Date.now()).slice(-3)}`,
      name: name.trim(),
      description: description.trim() || "No project description has been added yet.",
      department,
      owner: "CJ",
      ownerInitials: "CJ",
      ownerColor: "bg-indigo-100 text-indigo-700",
      members: ["CJ"],
      status: "Planning",
      priority,
      health: "On track",
      progress: 0,
      startDate: new Date().toLocaleDateString("en-US", { month: "short", day: "2-digit", year: "numeric" }),
      dueDate: dueDate ? new Date(`${dueDate}T00:00:00`).toLocaleDateString("en-US", { month: "short", day: "2-digit", year: "numeric" }) : "Not set",
      budget: 0,
      tasks: [],
      milestones: [],
      activity: [{ id: "A-new", person: "CJ", initials: "CJ", action: "created this project", time: "Just now" }],
    };
    onCreate(project);
  };

  return (
    <motion.div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-950/45 p-4 backdrop-blur-sm" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onMouseDown={(event) => { if (event.target === event.currentTarget) onClose(); }}>
      <motion.form onSubmit={submit} initial={{ opacity: 0, y: 16, scale: 0.98 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: 10 }} className="w-full max-w-lg rounded-2xl border border-white/60 bg-white p-6 shadow-2xl">
        <div className="flex items-start justify-between"><div><h2 className="text-lg font-bold text-slate-900">Create project</h2><p className="mt-1 text-xs text-slate-500">Set up a new project in your workspace.</p></div><button type="button" onClick={onClose} className="rounded-lg p-2 text-slate-400 hover:bg-slate-100"><X size={18}/></button></div>
        <div className="mt-6 space-y-4">
          <label className="block"><span className="mb-1.5 block text-xs font-semibold text-slate-700">Project name <span className="text-rose-500">*</span></span><input required autoFocus value={name} onChange={(event) => setName(event.target.value)} placeholder="e.g. Customer portal redesign" className="w-full rounded-xl border border-slate-200 px-3.5 py-3 text-sm outline-none transition focus:border-indigo-400 focus:ring-4 focus:ring-indigo-500/10"/></label>
          <label className="block"><span className="mb-1.5 block text-xs font-semibold text-slate-700">Description</span><textarea rows={3} value={description} onChange={(event) => setDescription(event.target.value)} placeholder="What does this project aim to achieve?" className="w-full resize-none rounded-xl border border-slate-200 px-3.5 py-3 text-sm outline-none transition focus:border-indigo-400 focus:ring-4 focus:ring-indigo-500/10"/></label>
          <div className="grid gap-4 sm:grid-cols-2">
            <label className="block"><span className="mb-1.5 block text-xs font-semibold text-slate-700">Department</span><select value={department} onChange={(event) => setDepartment(event.target.value)} className="w-full rounded-xl border border-slate-200 bg-white px-3 py-3 text-sm outline-none focus:border-indigo-400"><option>Engineering</option><option>Design</option><option>Product</option><option>Data</option><option>Human Resources</option><option>Operations</option></select></label>
            <label className="block"><span className="mb-1.5 block text-xs font-semibold text-slate-700">Priority</span><select value={priority} onChange={(event) => setPriority(event.target.value as ProjectPriority)} className="w-full rounded-xl border border-slate-200 bg-white px-3 py-3 text-sm outline-none focus:border-indigo-400"><option>High</option><option>Medium</option><option>Low</option></select></label>
          </div>
          <label className="block"><span className="mb-1.5 block text-xs font-semibold text-slate-700">Target delivery date</span><input type="date" value={dueDate} onChange={(event) => setDueDate(event.target.value)} className="w-full rounded-xl border border-slate-200 px-3 py-3 text-sm outline-none focus:border-indigo-400"/></label>
        </div>
        <div className="mt-7 flex justify-end gap-2 border-t border-slate-100 pt-5"><button type="button" onClick={onClose} className="rounded-xl border border-slate-200 px-4 py-2.5 text-xs font-semibold text-slate-600 hover:bg-slate-50">Cancel</button><button type="submit" className="rounded-xl bg-indigo-600 px-4 py-2.5 text-xs font-semibold text-white shadow-lg shadow-indigo-600/20 hover:bg-indigo-700">Create project</button></div>
      </motion.form>
    </motion.div>
  );
}

export default function ProjectsPage() {
  const [projects, setProjects] = useState<Project[]>(initialProjects);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [priorityFilter, setPriorityFilter] = useState("All priorities");
  const [healthFilter, setHealthFilter] = useState("All health");
  const [view, setView] = useState<"list" | "grid">("list");
  const [selectedProjectId, setSelectedProjectId] = useState<string | null>(null);
  const [showCreate, setShowCreate] = useState(false);

  const selectedProject = projects.find((project) => project.id === selectedProjectId) ?? null;

  const metrics = useMemo(() => {
    const active = projects.filter((project) => project.status !== "Completed");
    const totalTasks = projects.reduce((sum, project) => sum + project.tasks.length, 0);
    const completedTasks = projects.reduce((sum, project) => sum + project.tasks.filter((task) => task.completed).length, 0);
    const averageProgress = projects.length ? Math.round(projects.reduce((sum, project) => sum + project.progress, 0) / projects.length) : 0;
    return {
      total: projects.length,
      active: active.length,
      atRisk: projects.filter((project) => project.health === "At risk" || project.health === "Delayed").length,
      completed: projects.filter((project) => project.status === "Completed").length,
      averageProgress,
      taskPercent: totalTasks ? Math.round((completedTasks / totalTasks) * 100) : 0,
    };
  }, [projects]);

  const filteredProjects = useMemo(() => {
    const query = search.trim().toLowerCase();
    return projects.filter((project) => {
      const matchesSearch = !query || [project.name, project.description, project.department, project.owner, project.id].some((value) => value.toLowerCase().includes(query));
      const matchesStatus = statusFilter === "All" || project.status === statusFilter;
      const matchesPriority = priorityFilter === "All priorities" || project.priority === priorityFilter;
      const matchesHealth = healthFilter === "All health" || project.health === healthFilter;
      return matchesSearch && matchesStatus && matchesPriority && matchesHealth;
    });
  }, [projects, search, statusFilter, priorityFilter, healthFilter]);

  const createProject = (project: Project) => {
    setProjects((current) => [project, ...current]);
    setShowCreate(false);
    setSelectedProjectId(project.id);
  };

  const toggleTask = (projectId: string, taskId: string) => {
    setProjects((current) => current.map((project) => {
      if (project.id !== projectId) return project;
      const tasks = project.tasks.map((task) => task.id === taskId ? { ...task, completed: !task.completed } : task);
      const completed = tasks.filter((task) => task.completed).length;
      const progress = tasks.length ? Math.round((completed / tasks.length) * 100) : project.progress;
      return { ...project, tasks, progress };
    }));
  };

  const statusTabs = ["All", "In Progress", "Planning", "In Review", "Completed"];

  return (
    <div className="relative space-y-6">
      <div className="fixed right-5 top-5 z-[90]">
        <AppearanceSwitcher />
      </div>
      <AnimatePresence mode="wait">
        {selectedProject ? (
          <ProjectWorkspace key={selectedProject.id} project={selectedProject} onBack={() => setSelectedProjectId(null)} onToggleTask={toggleTask}/>
        ) : (
          <motion.div key="portfolio" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -6 }} transition={{ duration: 0.22 }} className="space-y-6">
            <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
              <div>
                <div className="mb-2 flex items-center gap-2"><span className="rounded-full bg-indigo-50 px-2.5 py-1 text-[10px] font-bold tracking-wide text-indigo-700">WORKSPACE / PROJECTS</span><span className="text-[11px] text-slate-400">Portfolio overview</span></div>
                <h1 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-[30px]">Project command centre</h1>
                <p className="mt-1.5 max-w-2xl text-sm text-slate-500">A live view of delivery, ownership and project health across your organization.</p>
              </div>
              <button onClick={() => setShowCreate(true)} className="inline-flex items-center justify-center gap-2 rounded-xl bg-indigo-600 px-4 py-3 text-xs font-semibold text-white shadow-lg shadow-indigo-600/20 transition hover:-translate-y-0.5 hover:bg-indigo-700"><Plus size={16}/> Create project</button>
            </div>

            <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
              <MetricCard label="Total projects" value={String(metrics.total).padStart(2, "0")} note="Across all departments" icon={FolderKanban} tone="bg-indigo-50 text-indigo-600"/>
              <MetricCard label="Active projects" value={String(metrics.active).padStart(2, "0")} note="Currently being delivered" icon={Activity} tone="bg-blue-50 text-blue-600"/>
              <MetricCard label="Need attention" value={String(metrics.atRisk).padStart(2, "0")} note="At risk or delayed" icon={AlertTriangle} tone="bg-amber-50 text-amber-600"/>
              <MetricCard label="Completed" value={String(metrics.completed).padStart(2, "0")} note="Successfully delivered" icon={CheckCircle2} tone="bg-emerald-50 text-emerald-600"/>
            </div>

            <div className="grid gap-4 xl:grid-cols-[1.5fr_1fr]">
              <section className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-[0_2px_10px_rgba(15,23,42,0.025)] sm:p-6">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div><div className="flex items-center gap-2"><Sparkles size={15} className="text-indigo-600"/><h2 className="text-sm font-bold text-slate-800">Portfolio execution</h2></div><p className="mt-1 text-xs text-slate-400">A high-level view of delivery across your projects</p></div>
                  <span className="rounded-full bg-indigo-50 px-2.5 py-1 text-[10px] font-semibold text-indigo-700">All departments</span>
                </div>
                <div className="mt-5 flex flex-wrap items-end justify-between gap-4">
                  <div><p className="text-4xl font-bold tracking-tight text-slate-900">{metrics.averageProgress}%</p><p className="mt-1 text-xs text-slate-500">Average project completion</p></div>
                  <div className="flex gap-5 text-right"><div><p className="text-lg font-bold text-slate-800">{metrics.taskPercent}%</p><p className="text-[10px] text-slate-400">Tasks complete</p></div><div><p className="text-lg font-bold text-slate-800">{metrics.active}</p><p className="text-[10px] text-slate-400">Active</p></div></div>
                </div>
                <div className="mt-4"><ProgressBar value={metrics.averageProgress}/></div>
                <div className="mt-4 flex flex-wrap items-center gap-x-5 gap-y-2 text-[10px] text-slate-500"><span className="flex items-center gap-1.5"><span className="h-2 w-2 rounded-full bg-emerald-500"/>On track</span><span className="flex items-center gap-1.5"><span className="h-2 w-2 rounded-full bg-amber-500"/>At risk</span><span className="flex items-center gap-1.5"><span className="h-2 w-2 rounded-full bg-rose-500"/>Delayed</span></div>
              </section>

              <section className="rounded-2xl border border-amber-200/70 bg-gradient-to-br from-amber-50/80 to-white p-5 shadow-[0_2px_10px_rgba(15,23,42,0.02)] sm:p-6">
                <div className="flex items-center gap-2"><div className="rounded-lg bg-amber-100 p-2 text-amber-700"><AlertTriangle size={16}/></div><h2 className="text-sm font-bold text-slate-800">Needs your attention</h2></div>
                {projects.filter((project) => project.health !== "On track").length ? (
                  <div className="mt-4 space-y-3">
                    {projects.filter((project) => project.health !== "On track").slice(0, 2).map((project) => <button key={project.id} onClick={() => setSelectedProjectId(project.id)} className="flex w-full items-start justify-between gap-3 rounded-xl border border-amber-200/70 bg-white/80 p-3 text-left transition hover:border-amber-300 hover:bg-white"><div className="min-w-0"><p className="truncate text-xs font-semibold text-slate-800">{project.name}</p><p className="mt-1 text-[10px] text-slate-500">{project.health} · {project.progress}% complete</p></div><ArrowUpRight size={15} className="shrink-0 text-amber-600"/></button>)}
                  </div>
                ) : <p className="mt-4 text-xs text-slate-500">All projects are currently on track.</p>}
                <p className="mt-3 text-[10px] leading-relaxed text-slate-400">Review project blockers and upcoming delivery dates before they affect execution.</p>
              </section>
            </div>

            <section className="overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-[0_2px_10px_rgba(15,23,42,0.025)]">
              <div className="border-b border-slate-100 p-5 sm:p-6">
                <div className="flex flex-col justify-between gap-4 xl:flex-row xl:items-center">
                  <div><h2 className="text-sm font-bold text-slate-800">Project portfolio</h2><p className="mt-1 text-xs text-slate-400">Explore projects, owners and delivery status</p></div>
                  <div className="flex flex-col gap-2 sm:flex-row">
                    <div className="flex h-10 min-w-0 items-center gap-2 rounded-xl border border-slate-200 bg-slate-50/70 px-3 sm:w-56"><Search size={15} className="shrink-0 text-slate-400"/><input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search projects..." className="min-w-0 flex-1 bg-transparent text-xs outline-none placeholder:text-slate-400"/></div>
                    <select value={priorityFilter} onChange={(event) => setPriorityFilter(event.target.value)} className="h-10 rounded-xl border border-slate-200 bg-white px-3 text-xs text-slate-600 outline-none focus:border-indigo-400"><option>All priorities</option><option>High</option><option>Medium</option><option>Low</option></select>
                    <select value={healthFilter} onChange={(event) => setHealthFilter(event.target.value)} className="h-10 rounded-xl border border-slate-200 bg-white px-3 text-xs text-slate-600 outline-none focus:border-indigo-400"><option>All health</option><option>On track</option><option>At risk</option><option>Delayed</option></select>
                    <div className="flex h-10 items-center rounded-xl border border-slate-200 p-1"><button onClick={() => setView("list")} className={`rounded-lg p-1.5 ${view === "list" ? "bg-indigo-50 text-indigo-700" : "text-slate-400 hover:text-slate-700"}`} aria-label="List view"><List size={16}/></button><button onClick={() => setView("grid")} className={`rounded-lg p-1.5 ${view === "grid" ? "bg-indigo-50 text-indigo-700" : "text-slate-400 hover:text-slate-700"}`} aria-label="Grid view"><LayoutGrid size={16}/></button></div>
                  </div>
                </div>
                <div className="mt-5 flex items-center justify-between gap-3">
                  <div className="flex max-w-full gap-1 overflow-x-auto">
                    {statusTabs.map((status) => <button key={status} onClick={() => setStatusFilter(status)} className={`whitespace-nowrap rounded-lg px-3 py-2 text-[11px] font-semibold transition ${statusFilter === status ? "bg-indigo-600 text-white shadow-sm shadow-indigo-600/20" : "text-slate-500 hover:bg-slate-100 hover:text-slate-800"}`}>{status}</button>)}
                  </div>
                  <span className="hidden shrink-0 text-[10px] text-slate-400 sm:block">{filteredProjects.length} of {projects.length} projects</span>
                </div>
              </div>

              {filteredProjects.length === 0 ? (
                <div className="px-6 py-16 text-center"><div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-100 text-slate-400"><Search size={20}/></div><h3 className="mt-4 text-sm font-semibold text-slate-800">No projects found</h3><p className="mt-1 text-xs text-slate-400">Try changing your search or filters.</p><button onClick={() => { setSearch(""); setStatusFilter("All"); setPriorityFilter("All priorities"); setHealthFilter("All health"); }} className="mt-4 text-xs font-semibold text-indigo-600">Clear filters</button></div>
              ) : view === "list" ? (
                <div className="divide-y divide-slate-100">
                  {filteredProjects.map((project, index) => (
                    <motion.button key={project.id} initial={{ opacity: 0, y: 7 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * 0.035 }} onClick={() => setSelectedProjectId(project.id)} className="group grid w-full gap-4 px-5 py-4 text-left transition hover:bg-slate-50/80 sm:px-6 lg:grid-cols-[minmax(0,1.5fr)_minmax(110px,.7fr)_minmax(130px,.8fr)_minmax(140px,.9fr)_auto] lg:items-center">
                      <div className="flex min-w-0 items-center gap-3"><div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600"><FolderKanban size={17}/></div><div className="min-w-0"><div className="flex flex-wrap items-center gap-2"><p className="truncate text-xs font-bold text-slate-800 group-hover:text-indigo-700">{project.name}</p><span className={`rounded-full px-2 py-0.5 text-[9px] font-semibold ring-1 ring-inset ${statusStyles[project.status]}`}>{project.status}</span></div><p className="mt-1 truncate text-[10px] text-slate-400">{project.id} · {project.department}</p></div></div>
                      <div><p className="text-[10px] text-slate-400 lg:hidden">Owner</p><p className="text-xs font-medium text-slate-700">{project.owner}</p><p className="mt-0.5 text-[10px] text-slate-400">Project owner</p></div>
                      <div><p className="text-[10px] text-slate-400 lg:hidden">Progress</p><div className="flex items-center justify-between gap-3"><span className="text-xs font-semibold text-slate-700">{project.progress}%</span><span className={`rounded-full px-2 py-0.5 text-[9px] font-semibold ${healthStyles[project.health]}`}>{project.health}</span></div><div className="mt-2"><ProgressBar value={project.progress} color={project.health === "Delayed" ? "bg-rose-500" : project.health === "At risk" ? "bg-amber-500" : "bg-indigo-600"}/></div></div>
                      <div className="flex items-center justify-between gap-4 sm:justify-start sm:gap-6"><div><p className="text-[10px] text-slate-400">Due date</p><p className="mt-1 flex items-center gap-1.5 text-[11px] font-medium text-slate-600"><CalendarDays size={12} className="text-slate-400"/>{project.dueDate}</p></div><div><p className="text-[10px] text-slate-400">Priority</p><span className={`mt-1 inline-flex rounded-full px-2 py-1 text-[9px] font-semibold ${priorityStyles[project.priority]}`}>{project.priority}</span></div></div>
                      <div className="flex items-center justify-between sm:justify-end"><AvatarStack members={project.members}/><ArrowRight size={16} className="text-slate-300 transition group-hover:translate-x-0.5 group-hover:text-indigo-600"/></div>
                    </motion.button>
                  ))}
                </div>
              ) : (
                <div className="grid gap-3 p-4 sm:grid-cols-2 xl:grid-cols-3 sm:p-5">
                  {filteredProjects.map((project, index) => <motion.button key={project.id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * 0.04 }} onClick={() => setSelectedProjectId(project.id)} className="rounded-2xl border border-slate-200 p-4 text-left transition hover:-translate-y-0.5 hover:border-indigo-200 hover:shadow-md">
                    <div className="flex items-start justify-between"><div className="flex h-9 w-9 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600"><FolderKanban size={16}/></div><span className={`rounded-full px-2 py-1 text-[9px] font-semibold ${healthStyles[project.health]}`}>{project.health}</span></div>
                    <h3 className="mt-4 text-sm font-bold text-slate-800">{project.name}</h3><p className="mt-1 line-clamp-2 min-h-9 text-[11px] leading-relaxed text-slate-400">{project.description}</p>
                    <div className="mt-4 flex items-center justify-between"><span className="text-[10px] text-slate-500">{project.department}</span><span className={`rounded-full px-2 py-1 text-[9px] font-semibold ${priorityStyles[project.priority]}`}>{project.priority} priority</span></div>
                    <div className="mt-4 flex items-center justify-between"><span className="text-[10px] text-slate-400">Progress</span><span className="text-xs font-bold text-slate-700">{project.progress}%</span></div><div className="mt-2"><ProgressBar value={project.progress}/></div>
                    <div className="mt-4 flex items-center justify-between border-t border-slate-100 pt-3"><AvatarStack members={project.members}/><span className="flex items-center gap-1 text-[10px] text-slate-400"><CalendarDays size={11}/>{project.dueDate}</span></div>
                  </motion.button>)}
                </div>
              )}
              <div className="flex flex-wrap items-center justify-between gap-2 border-t border-slate-100 bg-slate-50/50 px-5 py-3 text-[10px] text-slate-400"><span>Showing {filteredProjects.length} projects</span><span>Portfolio overview · Updated just now</span></div>
            </section>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>{showCreate && <CreateProjectModal onClose={() => setShowCreate(false)} onCreate={createProject}/>}</AnimatePresence>
    </div>
  );
}
