
import { useState } from "react";
import { motion } from "motion/react";
import {
  LayoutDashboard, FolderKanban, CheckSquare, Users, Building2,
  Workflow, ClipboardList, ShieldCheck, Bell, Settings, Search,
  ChevronDown, Plus, ArrowUpRight, ArrowDownRight, MoreHorizontal,
  Clock3, CalendarDays, CircleCheck, CircleAlert, Menu, X,
  BriefcaseBusiness, Command, Sparkles, Activity, ListTodo,
} from "lucide-react";
import {
  Area, AreaChart, CartesianGrid, ResponsiveContainer,
  Tooltip, XAxis, YAxis,
} from "recharts";
import ProjectsPage from "./pages/ProjectsPage";

const navigation = [
  { label: "Overview", icon: LayoutDashboard, section: "WORKSPACE" },
  { label: "Projects", icon: FolderKanban, section: "WORKSPACE" },
  { label: "Tasks", icon: CheckSquare },
  { label: "Members", icon: Users, section: "MANAGEMENT" },
  { label: "Departments", icon: Building2 },
  { label: "Workflows", icon: Workflow, section: "MANAGEMENT" },
  { label: "Requests", icon: ClipboardList },
  { label: "Approvals", icon: ShieldCheck },
];

const stats = [
  { title: "Total Projects", value: "24", change: "+12.5%", positive: true, icon: FolderKanban, note: "vs. last month" },
  { title: "Active Tasks", value: "148", change: "+8.2%", positive: true, icon: ListTodo, note: "vs. last month" },
  { title: "Team Members", value: "36", change: "+4.3%", positive: true, icon: Users, note: "vs. last month" },
  { title: "Pending Approvals", value: "12", change: "-2.4%", positive: true, icon: Clock3, note: "vs. last month" },
];

const chartData = [
  { name: "Mon", completed: 18, created: 12 },
  { name: "Tue", completed: 25, created: 18 },
  { name: "Wed", completed: 20, created: 15 },
  { name: "Thu", completed: 34, created: 23 },
  { name: "Fri", completed: 28, created: 20 },
  { name: "Sat", completed: 39, created: 25 },
  { name: "Sun", completed: 32, created: 18 },
];

const projects = [
  { name: "Website Redesign", team: "Design Team", progress: 78, color: "bg-violet-500", status: "In progress", due: "Nov 28" },
  { name: "Mobile Application", team: "Engineering", progress: 56, color: "bg-blue-500", status: "In progress", due: "Dec 04" },
  { name: "CRM Integration", team: "Product Team", progress: 92, color: "bg-cyan-500", status: "Review", due: "Nov 25" },
  { name: "Analytics Dashboard", team: "Data Team", progress: 34, color: "bg-amber-500", status: "In progress", due: "Dec 12" },
];

const activities = [
  { name: "Sarah Chen", action: "completed a task in", target: "Website Redesign", time: "10 minutes ago", initials: "SC", color: "bg-violet-100 text-violet-700" },
  { name: "Alex Morgan", action: "created a new project", target: "Mobile Application", time: "32 minutes ago", initials: "AM", color: "bg-blue-100 text-blue-700" },
  { name: "Jordan Lee", action: "requested approval for", target: "Budget Revision", time: "1 hour ago", initials: "JL", color: "bg-emerald-100 text-emerald-700" },
  { name: "Taylor Kim", action: "joined the department", target: "Engineering", time: "3 hours ago", initials: "TK", color: "bg-amber-100 text-amber-700" },
];

function App() {
  const [activePage, setActivePage] = useState("Overview");
  const [mobileMenu, setMobileMenu] = useState(false);
  const [search, setSearch] = useState("");

  const pageDescriptions: Record<string, string> = {
    Overview: "Here's what's happening across your organization.",
    Projects: "Track projects, progress, deadlines and teams.",
    Tasks: "Manage tasks and keep work moving forward.",
    Members: "Manage your organization's people and access.",
    Departments: "Organize teams and departmental structures.",
    Workflows: "Build and manage your business workflows.",
    Requests: "Review and manage incoming requests.",
    Approvals: "Keep track of items waiting for approval.",
  };

  const selectPage = (page: string) => {
    setActivePage(page);
    setMobileMenu(false);
  };

  return (
    <div className="min-h-screen bg-[#f7f8fc] text-slate-800">
      {mobileMenu && (
        <button
          className="fixed inset-0 z-40 bg-slate-950/40 lg:hidden"
          onClick={() => setMobileMenu(false)}
          aria-label="Close navigation"
        />
      )}

      <aside className={`fixed inset-y-0 left-0 z-50 flex w-[258px] flex-col bg-[#171923] text-white transition-transform duration-300 lg:translate-x-0 ${mobileMenu ? "translate-x-0" : "-translate-x-full"}`}>
        <div className="flex h-[76px] items-center justify-between border-b border-white/[0.07] px-6">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-500 to-violet-600 shadow-lg shadow-indigo-950/30">
              <BriefcaseBusiness size={19} />
            </div>
            <div>
              <p className="text-[15px] font-semibold tracking-tight">Nexora</p>
              <p className="text-[10px] tracking-[0.18em] text-slate-500">BUSINESS OS</p>
            </div>
          </div>
          <button onClick={() => setMobileMenu(false)} className="text-slate-400 lg:hidden">
            <X size={20} />
          </button>
        </div>

        <div className="mx-4 mt-5 rounded-xl border border-white/[0.08] bg-white/[0.04] p-3">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-indigo-500/20 text-indigo-300">
              <Building2 size={18} />
            </div>
            <div className="min-w-0 flex-1">
              <p className="truncate text-xs font-semibold">Acme Corporation</p>
              <p className="mt-0.5 text-[11px] text-slate-500">Enterprise workspace</p>
            </div>
            <ChevronDown size={15} className="text-slate-500" />
          </div>
        </div>

        <nav className="mt-7 flex-1 overflow-y-auto px-4">
          {["WORKSPACE", "MANAGEMENT"].map((section) => (
            <div key={section} className="mb-6">
              <p className="mb-2 px-3 text-[10px] font-semibold tracking-[0.16em] text-slate-500">
                {section}
              </p>
              {navigation.filter((item) => item.section === section).map((item) => {
                const Icon = item.icon;
                const active = activePage === item.label;
                return (
                  <button
                    key={item.label}
                    onClick={() => selectPage(item.label)}
                    className={`mb-1 flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left text-[13px] transition-all ${
                      active
                        ? "bg-indigo-500/15 font-medium text-indigo-300"
                        : "text-slate-400 hover:bg-white/[0.05] hover:text-white"
                    }`}
                  >
                    <Icon size={17} strokeWidth={1.8} />
                    {item.label}
                    {item.label === "Approvals" && (
                      <span className="ml-auto rounded-md bg-amber-400/15 px-2 py-0.5 text-[10px] font-semibold text-amber-300">12</span>
                    )}
                  </button>
                );
              })}
            </div>
          ))}
        </nav>

        <div className="mx-4 mb-4 rounded-xl border border-indigo-400/15 bg-gradient-to-br from-indigo-500/15 to-violet-500/10 p-3.5">
          <div className="mb-2 flex items-center gap-2 text-indigo-300">
            <Sparkles size={15} />
            <span className="text-xs font-semibold">Workspace insights</span>
          </div>
          <p className="text-[11px] leading-relaxed text-slate-400">
            Your team's productivity is up 12% this month. Keep it going!
          </p>
        </div>

        <div className="border-t border-white/[0.07] p-4">
          <button
            onClick={() => selectPage("Settings")}
            className={`flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-[13px] transition ${activePage === "Settings" ? "bg-white/10 text-white" : "text-slate-400 hover:bg-white/[0.05] hover:text-white"}`}
          >
            <Settings size={17} />
            Settings
          </button>
          <div className="mt-3 flex items-center gap-3 border-t border-white/[0.07] pt-4">
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br from-indigo-400 to-violet-500 text-xs font-bold">CJ</div>
            <div className="min-w-0 flex-1">
              <p className="text-xs font-semibold">Workspace Admin</p>
              <p className="text-[10px] text-slate-500">Administrator</p>
            </div>
            <MoreHorizontal size={18} className="text-slate-500" />
          </div>
        </div>
      </aside>

      <main className="min-h-screen lg:ml-[258px]">
        <header className="sticky top-0 z-30 flex h-[76px] items-center justify-between border-b border-slate-200/80 bg-white/85 px-5 backdrop-blur-xl sm:px-8">
          <div className="flex items-center gap-3">
            <button onClick={() => setMobileMenu(true)} className="rounded-lg p-2 text-slate-500 hover:bg-slate-100 lg:hidden">
              <Menu size={20} />
            </button>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs text-slate-400">Workspace</span>
                <span className="text-xs text-slate-300">/</span>
                <span className="text-xs font-semibold text-slate-700">{activePage}</span>
              </div>
              <p className="mt-1 hidden text-[11px] text-slate-400 sm:block">Monday, November 23, 2026</p>
            </div>
          </div>

          <div className="flex items-center gap-2 sm:gap-4">
            <div className="hidden h-9 w-56 items-center gap-2 rounded-lg border border-slate-200 bg-slate-50 px-3 md:flex">
              <Search size={15} className="text-slate-400" />
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search anything..."
                className="w-full bg-transparent text-xs outline-none placeholder:text-slate-400"
              />
              <kbd className="rounded border border-slate-200 bg-white px-1.5 py-0.5 text-[9px] text-slate-400">⌘ K</kbd>
            </div>
            <button className="relative rounded-lg p-2 text-slate-500 transition hover:bg-slate-100">
              <Bell size={19} />
              <span className="absolute right-1.5 top-1.5 h-2 w-2 rounded-full border-2 border-white bg-rose-500" />
            </button>
            <div className="hidden h-8 w-px bg-slate-200 sm:block" />
            <button className="flex items-center gap-2 rounded-lg p-1.5 transition hover:bg-slate-100">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-indigo-100 text-[11px] font-bold text-indigo-700">CJ</div>
              <ChevronDown size={14} className="hidden text-slate-400 sm:block" />
            </button>
          </div>
        </header>

        <div className="mx-auto max-w-[1500px] p-5 sm:p-8">
          <motion.div
            key={activePage}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            {activePage === "Projects" ? (
              <ProjectsPage />
            ) : (
              <>
            <div className="mb-8 flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
              <div>
                <div className="mb-2 flex items-center gap-2">
                  <span className="rounded-full bg-indigo-50 px-2.5 py-1 text-[10px] font-semibold tracking-wide text-indigo-600">OVERVIEW</span>
                  <span className="text-[11px] text-slate-400">• Updated just now</span>
                </div>
                <h1 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-[28px]">
                  {activePage === "Overview" ? "Good morning, CJ 👋" : activePage}
                </h1>
                <p className="mt-1.5 text-sm text-slate-500">
                  {pageDescriptions[activePage] || "Manage your workspace preferences and configuration."}
                </p>
              </div>
              <div className="flex gap-2">
                <button className="flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-3.5 py-2.5 text-xs font-medium text-slate-600 shadow-sm transition hover:bg-slate-50">
                  <CalendarDays size={15} />
                  This week
                  <ChevronDown size={13} />
                </button>
                <button className="flex items-center gap-2 rounded-lg bg-indigo-600 px-4 py-2.5 text-xs font-semibold text-white shadow-lg shadow-indigo-600/20 transition hover:bg-indigo-700">
                  <Plus size={15} />
                  Create new
                </button>
              </div>
            </div>

            {activePage !== "Overview" && (
              <div className="mb-6 rounded-xl border border-indigo-100 bg-indigo-50/70 p-4 text-sm text-indigo-700">
                This is the {activePage} workspace preview. We'll build out its full functionality and connect it to the backend next.
              </div>
            )}

            <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
              {stats.map((stat, index) => {
                const Icon = stat.icon;
                return (
                  <motion.div
                    key={stat.title}
                    initial={{ opacity: 0, y: 14 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.07, duration: 0.35 }}
                    className="rounded-xl border border-slate-200/80 bg-white p-5 shadow-[0_2px_8px_rgba(15,23,42,0.025)] transition duration-200 hover:-translate-y-0.5 hover:shadow-md"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-medium text-slate-500">{stat.title}</span>
                      <div className="rounded-lg bg-indigo-50 p-2 text-indigo-600"><Icon size={17} /></div>
                    </div>
                    <div className="mt-4 flex items-end justify-between">
                      <span className="text-[30px] font-bold tracking-tight text-slate-900">{stat.value}</span>
                      <span className={`mb-1 flex items-center gap-1 text-[11px] font-semibold ${stat.positive ? "text-emerald-600" : "text-rose-600"}`}>
                        {stat.positive ? <ArrowUpRight size={14} /> : <ArrowDownRight size={14} />}
                        {stat.change}
                      </span>
                    </div>
                    <p className="mt-1 text-[10px] text-slate-400">{stat.note}</p>
                  </motion.div>
                );
              })}
            </div>

            <div className="mb-6 grid grid-cols-1 gap-5 xl:grid-cols-[1.65fr_1fr]">
              <section className="rounded-xl border border-slate-200/80 bg-white p-5 shadow-sm sm:p-6">
                <div className="mb-5 flex items-start justify-between">
                  <div>
                    <h2 className="text-sm font-bold text-slate-800">Task activity</h2>
                    <p className="mt-1 text-[11px] text-slate-400">Tasks created vs. completed this week</p>
                  </div>
                  <button className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100"><MoreHorizontal size={19} /></button>
                </div>
                <div className="mb-4 flex gap-5">
                  <div className="flex items-center gap-2 text-[11px] text-slate-500"><span className="h-2 w-2 rounded-full bg-indigo-500" /> Completed</div>
                  <div className="flex items-center gap-2 text-[11px] text-slate-500"><span className="h-2 w-2 rounded-full bg-violet-200" /> Created</div>
                </div>
                <div className="h-[235px] w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={chartData} margin={{ top: 5, right: 5, left: -20, bottom: 0 }}>
                      <defs>
                        <linearGradient id="completedGradient" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0%" stopColor="#6366f1" stopOpacity={0.2} />
                          <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                        </linearGradient>
                        <linearGradient id="createdGradient" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0%" stopColor="#c4b5fd" stopOpacity={0.2} />
                          <stop offset="95%" stopColor="#c4b5fd" stopOpacity={0} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid stroke="#f1f5f9" vertical={false} />
                      <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: "#94a3b8", fontSize: 11 }} dy={10} />
                      <YAxis axisLine={false} tickLine={false} tick={{ fill: "#94a3b8", fontSize: 10 }} />
                      <Tooltip contentStyle={{ borderRadius: 10, border: "1px solid #e2e8f0", fontSize: 11, boxShadow: "0 8px 25px rgba(15,23,42,.08)" }} />
                      <Area type="monotone" dataKey="created" stroke="#c4b5fd" strokeWidth={2} fill="url(#createdGradient)" />
                      <Area type="monotone" dataKey="completed" stroke="#6366f1" strokeWidth={2.5} fill="url(#completedGradient)" />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </section>

              <section className="rounded-xl border border-slate-200/80 bg-white p-5 shadow-sm sm:p-6">
                <div className="mb-5 flex items-center justify-between">
                  <div>
                    <h2 className="text-sm font-bold text-slate-800">Task overview</h2>
                    <p className="mt-1 text-[11px] text-slate-400">Current task distribution</p>
                  </div>
                  <MoreHorizontal size={19} className="text-slate-400" />
                </div>
                <div className="flex items-center justify-center py-3">
                  <div className="relative flex h-40 w-40 items-center justify-center rounded-full" style={{ background: "conic-gradient(#6366f1 0% 58%, #a78bfa 58% 78%, #fbbf24 78% 90%, #e2e8f0 90% 100%)" }}>
                    <div className="flex h-[116px] w-[116px] flex-col items-center justify-center rounded-full bg-white">
                      <span className="text-3xl font-bold tracking-tight text-slate-900">148</span>
                      <span className="text-[10px] text-slate-400">Total tasks</span>
                    </div>
                  </div>
                </div>
                <div className="mt-4 space-y-3">
                  {[
                    { label: "Completed", count: 86, color: "bg-indigo-500" },
                    { label: "In progress", count: 30, color: "bg-violet-400" },
                    { label: "Pending", count: 18, color: "bg-amber-400" },
                    { label: "Overdue", count: 14, color: "bg-slate-200" },
                  ].map((item) => (
                    <div key={item.label} className="flex items-center justify-between text-[11px]">
                      <span className="flex items-center gap-2 text-slate-500"><span className={`h-2 w-2 rounded-full ${item.color}`} />{item.label}</span>
                      <span className="font-semibold text-slate-700">{item.count}</span>
                    </div>
                  ))}
                </div>
              </section>
            </div>

            <div className="grid grid-cols-1 gap-5 xl:grid-cols-[1.4fr_1fr]">
              <section className="rounded-xl border border-slate-200/80 bg-white p-5 shadow-sm sm:p-6">
                <div className="mb-5 flex items-center justify-between">
                  <div>
                    <h2 className="text-sm font-bold text-slate-800">Active projects</h2>
                    <p className="mt-1 text-[11px] text-slate-400">Keep an eye on your team's progress</p>
                  </div>
                  <button onClick={() => selectPage("Projects")} className="text-[11px] font-semibold text-indigo-600 hover:text-indigo-700">View all →</button>
                </div>
                <div className="space-y-5">
                  {projects.map((project) => (
                    <div key={project.name}>
                      <div className="mb-2 flex items-center justify-between gap-3">
                        <div className="min-w-0">
                          <p className="truncate text-xs font-semibold text-slate-700">{project.name}</p>
                          <p className="mt-0.5 text-[10px] text-slate-400">{project.team}</p>
                        </div>
                        <div className="shrink-0 text-right">
                          <span className="text-xs font-bold text-slate-700">{project.progress}%</span>
                          <p className="mt-0.5 text-[10px] text-slate-400">Due {project.due}</p>
                        </div>
                      </div>
                      <div className="h-1.5 overflow-hidden rounded-full bg-slate-100">
                        <motion.div initial={{ width: 0 }} animate={{ width: `${project.progress}%` }} transition={{ duration: 0.8, delay: 0.2 }} className={`h-full rounded-full ${project.color}`} />
                      </div>
                    </div>
                  ))}
                </div>
              </section>

              <section className="rounded-xl border border-slate-200/80 bg-white p-5 shadow-sm sm:p-6">
                <div className="mb-5 flex items-center justify-between">
                  <div>
                    <h2 className="text-sm font-bold text-slate-800">Recent activity</h2>
                    <p className="mt-1 text-[11px] text-slate-400">Latest updates from your team</p>
                  </div>
                  <button className="text-[11px] font-semibold text-indigo-600">View all →</button>
                </div>
                <div className="space-y-5">
                  {activities.map((activity, index) => (
                    <div key={index} className="flex gap-3">
                      <div className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-[10px] font-bold ${activity.color}`}>{activity.initials}</div>
                      <div className="min-w-0 flex-1">
                        <p className="text-[11px] leading-relaxed text-slate-500">
                          <span className="font-semibold text-slate-800">{activity.name}</span>{" "}
                          {activity.action}{" "}
                          <span className="font-semibold text-slate-700">{activity.target}</span>
                        </p>
                        <p className="mt-1 flex items-center gap-1 text-[10px] text-slate-400"><Clock3 size={11} />{activity.time}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            </div>

            <footer className="mt-8 flex flex-col items-center justify-between gap-2 border-t border-slate-200/80 py-5 text-[10px] text-slate-400 sm:flex-row">
              <span>© 2026 Nexora Business OS. All rights reserved.</span>
              <span className="flex items-center gap-1.5"><Activity size={12} /> All systems operational <span className="ml-1 h-1.5 w-1.5 rounded-full bg-emerald-500" /></span>
            </footer>
              </>
            )}
          </motion.div>
        </div>
      </main>
    </div>
  );
}

export default App;
