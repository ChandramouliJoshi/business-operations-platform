import { useState, type ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ArrowDownRight, ArrowRight, ArrowUpRight, Check, CheckCircle2,
  Command, FileText, GitBranch, Menu,
  ShieldCheck, Users, X,
} from 'lucide-react';

function Brand() {
  return (
    <div className="flex items-center gap-3">
      <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-500 to-violet-600 text-white shadow-lg shadow-indigo-500/20">
        <Command size={19} />
      </span>
      <span>
        <span className="block text-[19px] font-extrabold leading-none tracking-[-0.07em]">nexora</span>
        <span className="mt-1 block text-xs font-bold tracking-[0.24em] text-slate-500">BUSINESS OS</span>
      </span>
    </div>
  );
}

function Eyebrow({ children }: { children: ReactNode }) {
  return (
    <div className="mb-5 flex items-center gap-2 text-xs font-bold uppercase tracking-[0.2em] text-indigo-600">
      <span className="h-1.5 w-1.5 rounded-full bg-indigo-500" />
      {children}
    </div>
  );
}

function Workstream() {
  const events = [
    { time: '09:12', title: 'New request submitted', sub: 'Equipment purchase · Operations', tag: 'REQUEST', color: 'bg-violet-500', icon: FileText },
    { time: '09:26', title: 'Manager review completed', sub: 'Approved by A. Mehta', tag: 'APPROVAL', color: 'bg-indigo-500', icon: CheckCircle2 },
    { time: '09:41', title: 'Project task created', sub: 'Procurement · Vendor shortlist', tag: 'TASK', color: 'bg-sky-500', icon: GitBranch },
  ];
  return (
    <div className="relative mx-auto max-w-[620px]">
      <style>{`
        @keyframes nexora-float { 0%, 100% { transform: translate3d(0, 0, 0) rotate(0deg); } 50% { transform: translate3d(0, -9px, 0) rotate(-.4deg); } }
        @keyframes nexora-float-reverse { 0%, 100% { transform: translate3d(0, 0, 0) rotate(0deg); } 50% { transform: translate3d(0, 8px, 0) rotate(.4deg); } }
        @keyframes nexora-enter { from { opacity: 0; translate: 0 14px; } to { opacity: 1; translate: 0 0; } }
        .nexora-float { animation: nexora-float 6s ease-in-out infinite, nexora-enter .8s ease-out both; }
        .nexora-float-reverse { animation: nexora-float-reverse 7s ease-in-out infinite, nexora-enter 1s ease-out both; }
        .nexora-float-soft { animation: nexora-float 7.5s ease-in-out infinite; }
        .nexora-enter-late { animation: nexora-enter 1s .2s ease-out both; }
        @media (prefers-reduced-motion: reduce) { .nexora-float, .nexora-float-reverse, .nexora-float-soft, .nexora-enter-late { animation: none !important; } }
      `}</style>
      <div className="absolute -inset-8 rounded-[40px] bg-gradient-to-br from-indigo-100 via-violet-100 to-sky-100 blur-3xl opacity-80" />
      <div className="relative rounded-[22px] border border-slate-200 bg-white p-5 shadow-[0_30px_90px_-45px_rgba(49,46,129,.4)] sm:p-7">
        <div className="flex items-center justify-between border-b border-slate-100 pb-5">
          <div>
            <p className="text-[11px] font-bold uppercase tracking-[.18em] text-slate-400">Nexora activity stream</p>
            <p className="mt-1 text-sm font-bold text-slate-900">Monday, 23 November</p>
          </div>
          <span className="flex items-center gap-2 rounded-full bg-emerald-50 px-3 py-1.5 text-[11px] font-bold text-emerald-700"><i className="h-1.5 w-1.5 rounded-full bg-emerald-500"/> LIVE WORKSPACE</span>
        </div>
        <div className="relative py-5">
          <div className="absolute bottom-9 left-[17px] top-10 w-px bg-gradient-to-b from-violet-300 via-indigo-300 to-sky-300" />
          {events.map((event) => {
            const Icon = event.icon;
            return (
              <div key={event.title} className="relative flex gap-4 pb-7 last:pb-0">
                <div className={`relative z-10 mt-1 flex h-9 w-9 shrink-0 items-center justify-center rounded-xl ${event.color} text-white shadow-md shadow-indigo-900/10`}><Icon size={16}/></div>
                <div className="min-w-0 flex-1 border-b border-slate-100 pb-5 last:border-0 last:pb-0">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <p className="text-sm font-bold text-slate-800">{event.title}</p>
                    <span className="font-mono text-[11px] text-slate-400">{event.time}</span>
                  </div>
                  <p className="mt-1 text-xs text-slate-500">{event.sub}</p>
                  <span className="mt-3 inline-flex rounded-md bg-slate-50 px-2 py-1 text-xs font-bold tracking-wider text-slate-500">{event.tag}</span>
                </div>
              </div>
            );
          })}
        </div>
        <div className="flex items-center justify-between rounded-xl bg-[#F5F5FF] px-4 py-3">
          <div className="flex items-center gap-2 text-xs font-semibold text-slate-700"><ShieldCheck size={14} className="text-indigo-600"/> A clear next step, every time</div>
          <ArrowUpRight size={14} className="text-indigo-600"/>
        </div>
      </div>
      <div className="absolute -bottom-6 -left-6 hidden rounded-xl border border-slate-100 bg-white px-4 py-3 shadow-xl shadow-indigo-900/10 sm:block">
        <div className="flex items-center gap-2"><span className="flex h-7 w-7 items-center justify-center rounded-lg bg-emerald-50 text-emerald-600"><Check size={14}/></span><span><b className="block text-[11px] text-slate-800">Workspace activity</b><small className="text-xs text-slate-400">Recent actions and decisions</small></span></div>
      </div>
      <div className="nexora-float absolute -right-8 top-16 z-20 hidden rounded-xl border border-slate-200/80 bg-white/95 p-3 shadow-[0_18px_45px_-22px_rgba(49,46,129,.35)] backdrop-blur sm:block lg:-right-12">
        <div className="flex items-center gap-2.5"><span className="flex h-8 w-8 items-center justify-center rounded-lg bg-violet-50 text-violet-600"><FileText size={15}/></span><span><b className="block text-[11px] text-slate-800">Approval requested</b><small className="text-[10px] text-slate-400">Marketing budget · Pending</small></span></div>
        <div className="mt-2.5 flex items-center justify-between"><span className="text-[9px] font-semibold uppercase tracking-wider text-slate-400">Needs review</span><span className="rounded-full bg-amber-50 px-2 py-1 text-[9px] font-bold text-amber-700">PENDING</span></div>
      </div>
      <div className="nexora-float-reverse absolute -bottom-8 right-5 z-20 hidden w-[178px] rounded-xl border border-slate-200/80 bg-white/95 p-3 shadow-[0_18px_45px_-22px_rgba(49,46,129,.35)] backdrop-blur sm:block">
        <div className="flex items-center justify-between"><span className="text-[10px] font-semibold text-slate-700">Project progress</span><span className="text-[10px] font-bold text-indigo-600">72%</span></div>
        <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-slate-100"><div className="h-full w-[72%] rounded-full bg-gradient-to-r from-indigo-500 to-violet-500"/></div>
        <p className="mt-2 text-[9px] text-slate-400">Website relaunch · On track</p>
      </div>
    </div>
  );
}

function FlowLine() {
  const steps = [
    { n: '01', title: 'Submit a request', detail: 'Record what is needed and who needs it.', icon: FileText, tone: 'bg-violet-100 text-violet-700' },
    { n: '02', title: 'Review and approve', detail: 'Route it through the people responsible for the decision.', icon: Users, tone: 'bg-indigo-100 text-indigo-700' },
    { n: '03', title: 'Create the follow-up task', detail: 'Once approved, the work can be assigned and tracked.', icon: CheckCircle2, tone: 'bg-sky-100 text-sky-700' },
  ];
  return (
    <div className="relative mt-14 grid gap-8 md:grid-cols-3 md:gap-5">
      <div className="absolute left-[8%] right-[8%] top-7 hidden h-px bg-gradient-to-r from-violet-200 via-indigo-300 to-sky-200 md:block"/>
      {steps.map((step) => {
        const Icon = step.icon;
        return (
          <div key={step.n} className="relative">
            <div className="flex items-center gap-4 md:block">
              <div className={`nexora-float-soft relative z-10 flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl ${step.tone} ring-8 ring-[#F7F8FC]`}><Icon size={21}/></div>
              <div className="md:mt-6">
                <p className="text-[11px] font-bold tracking-widest text-indigo-500">{step.n} / THE HANDOFF</p>
                <h3 className="mt-2 text-lg font-bold tracking-tight text-slate-900">{step.title}</h3>
                <p className="mt-1 text-sm text-slate-500">{step.detail}</p>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}

function ProjectScene() {
  return (
    <div className="relative overflow-hidden rounded-[22px] bg-[#EEF0FF] p-5 sm:p-7">
      <div className="absolute -right-16 -top-20 h-64 w-64 rounded-full border border-indigo-200/70"/>
      <div className="absolute -right-5 -top-9 h-44 w-44 rounded-full border border-violet-200/70"/>
      <div className="nexora-enter-late relative rounded-xl border border-white bg-white p-5 shadow-xl shadow-indigo-900/5 sm:p-6">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 pb-4">
          <div><p className="text-xs font-bold uppercase tracking-widest text-slate-400">Project / Q4 launch</p><p className="mt-1 text-sm font-bold text-slate-800">Q4 launch · Project progress</p></div>
          <span className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-bold text-emerald-700">ON TRACK</span>
        </div>
        <div className="mt-5 space-y-4">
          {[
            ['Research & brief', 'Completed', 'w-full', 'bg-emerald-400'],
            ['Product design', 'In progress', 'w-[72%]', 'bg-indigo-500'],
            ['Development', 'In progress', 'w-[43%]', 'bg-violet-500'],
            ['Launch review', 'Up next', 'w-[8%]', 'bg-slate-300'],
          ].map(([label,status,width,color]) => (
            <div key={label} className="grid grid-cols-[minmax(0,1fr)_88px] items-center gap-4">
              <div><div className="mb-2 flex items-center justify-between gap-2"><span className="text-xs font-semibold text-slate-700">{label}</span><span className="text-xs text-slate-400">{status}</span></div><div className="h-1.5 rounded-full bg-slate-100"><div className={`h-full rounded-full ${width} ${color}`}/></div></div>
              <span className="text-right font-mono text-[11px] text-slate-400">{width === 'w-full' ? '100%' : width === 'w-[72%]' ? '72%' : width === 'w-[43%]' ? '43%' : '08%'}</span>
            </div>
          ))}
        </div>
        <div className="mt-6 flex items-center justify-between border-t border-slate-100 pt-4">
          <div className="flex -space-x-2">{['CJ','AM','SK','RJ'].map((x,i)=><span key={x} className={`flex h-7 w-7 items-center justify-center rounded-full border-2 border-white text-xs font-bold ${['bg-indigo-100 text-indigo-700','bg-violet-100 text-violet-700','bg-sky-100 text-sky-700','bg-rose-100 text-rose-700'][i]}`}>{x}</span>)}</div>
          <span className="text-[11px] font-semibold text-slate-500">4 owners · 12 tasks</span>
        </div>
      </div>
    </div>
  );
}

function ApprovalScene() {
  return (
    <div className="rounded-[22px] bg-[#171827] p-5 text-white sm:p-7">
      <div className="flex items-start justify-between"><div><p className="text-xs font-bold uppercase tracking-[.18em] text-indigo-300">Request / #REQ-028</p><h3 className="mt-2 text-lg font-bold">Equipment purchase</h3><p className="mt-1 text-xs text-slate-400">Submitted by Operations · ₹48,500</p></div><span className="nexora-float rounded-full bg-indigo-400/15 px-3 py-1 text-xs font-bold text-indigo-200">IN REVIEW</span></div>
      <div className="mt-7 space-y-0">
        {[
          ['Request submitted', 'Operations team', 'done'],
          ['Department review', 'A. Mehta · Team lead', 'done'],
          ['Finance approval', 'Finance department', 'active'],
          ['Ready to execute', 'Procurement', 'waiting'],
        ].map(([title,owner,status],i)=><div key={title} className="relative flex gap-4 pb-5 last:pb-0"><div className="relative flex w-7 shrink-0 justify-center"><span className={`relative z-10 flex h-7 w-7 items-center justify-center rounded-full border ${status==='done'?'border-indigo-400 bg-indigo-500 text-white':status==='active'?'border-indigo-300 text-indigo-200':'border-white/20 text-slate-500'}`}>{status==='done'?<Check size={13}/>:<span className="text-xs font-bold">0{i+1}</span>}</span>{i!==3&&<span className={`absolute top-7 h-full w-px ${status==='done'?'bg-indigo-400/70':'bg-white/10'}`}/>}</div><div className="flex-1"><p className="text-xs font-semibold">{title}</p><p className="mt-1 text-xs text-slate-400">{owner}</p></div><span className={`pt-1 text-xs font-bold tracking-wider ${status==='done'?'text-indigo-300':status==='active'?'text-violet-300':'text-slate-500'}`}>{status==='done'?'DONE':status==='active'?'CURRENT':'WAITING'}</span></div>)}
      </div>
    </div>
  );
}

export default function LandingPage() {
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);
  const go = (path: string) => { setMenuOpen(false); navigate(path); };
  const jump = (id: string) => { setMenuOpen(false); document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' }); };

  return (
    <div style={{ fontFamily: "Manrope, ui-sans-serif, system-ui, sans-serif" }} className="min-h-screen overflow-hidden bg-[#F7F8FC] text-[#11121B] selection:bg-indigo-200 selection:text-indigo-950">
      <header className="sticky top-0 z-50 border-b border-slate-200/80 bg-white/90 backdrop-blur-xl">
        <nav className="mx-auto flex h-[74px] max-w-[1320px] items-center justify-between px-5 sm:px-8 lg:px-12">
          <button onClick={() => window.scrollTo({top:0,behavior:'smooth'})} aria-label="Nexora home"><Brand/></button>
          <div className="hidden items-center gap-8 md:flex">
            <button onClick={() => jump('how')} className="text-sm font-medium text-slate-600 hover:text-indigo-600">How it works</button>
            <button onClick={() => jump('work')} className="text-sm font-medium text-slate-600 hover:text-indigo-600">The workspace</button>
            <button onClick={() => jump('approach')} className="text-sm font-medium text-slate-600 hover:text-indigo-600">Why Nexora</button>
          </div>
          <div className="hidden items-center gap-5 md:flex"><button onClick={() => go('/login')} className="text-sm font-semibold text-slate-700 hover:text-indigo-600">Log in</button><button onClick={() => go('/register')} className="inline-flex items-center gap-2 rounded-lg bg-gradient-to-r from-indigo-600 to-violet-600 px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-indigo-500/20 transition hover:-translate-y-0.5">Get started <ArrowUpRight size={14}/></button></div>
          <button onClick={() => setMenuOpen(!menuOpen)} className="rounded-lg border border-slate-200 p-2 md:hidden" aria-label="Toggle navigation">{menuOpen?<X size={19}/>:<Menu size={19}/>}</button>
        </nav>
        {menuOpen&&<div className="border-t border-slate-100 bg-white px-5 py-5 md:hidden"><div className="flex flex-col gap-4"><button onClick={()=>jump('how')} className="text-left text-sm font-semibold">How it works</button><button onClick={()=>jump('work')} className="text-left text-sm font-semibold">The workspace</button><button onClick={()=>jump('approach')} className="text-left text-sm font-semibold">Why Nexora</button><div className="flex gap-3 border-t border-slate-100 pt-4"><button onClick={()=>go('/login')} className="flex-1 rounded-lg border border-slate-200 py-3 text-xs font-bold">Log in</button><button onClick={()=>go('/register')} className="flex-1 rounded-lg bg-indigo-600 py-3 text-sm font-semibold text-white">Get started</button></div></div></div>}
      </header>

      <main>
        {/* A more editorial opening: one clear thought, one real operational story */}
        <section className="relative mx-auto max-w-[1320px] px-5 pb-24 pt-16 sm:px-8 sm:pt-24 lg:px-12 lg:pb-32">
          <div className="grid items-center gap-16 lg:grid-cols-[.9fr_1.1fr] lg:gap-12">
            <div className="relative z-10">
              <Eyebrow>NEXORA / BUSINESS OPERATIONS</Eyebrow>
              <p className="mb-5 font-mono text-[11px] font-semibold tracking-[.2em] text-slate-400">PROJECTS · TEAMS · TASKS · APPROVALS</p>
              <h1 className="max-w-[620px] text-[clamp(3.8rem,7vw,7rem)] font-medium leading-[.98] tracking-[-.045em]">One workspace. <span className="bg-gradient-to-r from-indigo-600 to-violet-600 bg-clip-text text-transparent">For the way your team works.</span></h1>
              <p className="mt-7 max-w-[450px] text-[15px] leading-7 text-slate-500">Nexora is a workspace for organizing projects, assigning tasks, managing teams and handling internal requests. The different parts of your organization sit together, instead of being spread across separate tools.</p>
              <div className="mt-9 flex flex-wrap items-center gap-3"><button onClick={()=>go('/register')} className="group inline-flex items-center gap-4 rounded-lg bg-gradient-to-r from-indigo-600 to-violet-600 px-6 py-4 text-sm font-semibold text-white shadow-xl shadow-indigo-500/20 transition hover:-translate-y-0.5">Create an account <ArrowRight size={15} className="transition group-hover:translate-x-1"/></button><button onClick={()=>jump('how')} className="inline-flex items-center gap-2 rounded-lg px-4 py-4 text-sm font-semibold text-slate-700 hover:bg-white hover:text-indigo-600">See how it works <ArrowDownRight size={15}/></button></div>
              <div className="mt-11 border-t border-slate-200 pt-5"><p className="text-[11px] font-bold uppercase tracking-[.18em] text-slate-400">What you can manage</p><div className="mt-3 flex flex-wrap gap-x-5 gap-y-2 text-xs font-semibold text-slate-600"><span>Projects</span><span className="text-indigo-300">/</span><span>People</span><span className="text-indigo-300">/</span><span>Requests</span><span className="text-indigo-300">/</span><span>Approvals</span></div></div>
            </div>
            <div className="relative py-4 lg:pl-2"><Workstream/><p className="mt-8 flex items-center justify-between font-mono text-xs uppercase tracking-[.16em] text-slate-400"><span>From first request to final sign-off</span><span>FIG. 01</span></p></div>
          </div>
        </section>

        {/* The product is explained as a sequence, not a feature-card grid */}
        <section id="how" className="scroll-mt-24 border-y border-indigo-100 bg-white px-5 py-20 sm:px-8 lg:px-12 lg:py-24">
          <div className="mx-auto max-w-[1200px]">
            <div className="flex flex-col justify-between gap-6 md:flex-row md:items-end">
              <div><Eyebrow>How the workspace is organized</Eyebrow><h2 className="max-w-[650px] text-5xl font-medium leading-[1.08] tracking-[-.045em] sm:text-7xl">Requests have a clear path from start to finish.</h2></div>
              <p className="max-w-sm text-base leading-8 text-slate-600">A request is submitted, reviewed by the relevant person and turned into an action when approved. Each stage has a place in the workspace.</p>
            </div>
            <FlowLine/>
          </div>
        </section>

        {/* Two distinct product stories, not three identical cards */}
        <section id="work" className="scroll-mt-24 px-5 py-24 sm:px-8 lg:px-12 lg:py-32">
          <div className="mx-auto max-w-[1200px]">
            <div className="mb-16 grid gap-6 md:grid-cols-[1fr_.55fr] md:items-end">
              <div><Eyebrow>The main parts of the workspace</Eyebrow><h2 className="max-w-[700px] text-5xl font-medium leading-[1.08] tracking-[-.045em] sm:text-7xl">Projects, requests and team information share the same workspace.</h2></div>
              <p className="max-w-sm text-base leading-8 text-slate-600">Use project views to follow tasks and milestones, manage departments and roles, and keep internal requests and approvals organized.</p>
            </div>
            <article className="grid items-center gap-10 border-t border-slate-200 py-12 lg:grid-cols-[.72fr_1.28fr] lg:gap-20">
              <div><p className="font-mono text-xs font-bold tracking-widest text-indigo-500">01 — PLAN AND DELIVER</p><h3 className="mt-5 text-4xl font-medium leading-[1.1] tracking-[-.04em] sm:text-5xl">Projects, milestones and tasks</h3><p className="mt-5 max-w-md text-base leading-8 text-slate-600">Create projects, break work into tasks, assign owners and follow progress against milestones.</p><div className="mt-7 space-y-3 text-xs font-semibold text-slate-600"><p className="flex items-center gap-2"><Check size={14} className="text-indigo-600"/> Milestones and task assignments</p><p className="flex items-center gap-2"><Check size={14} className="text-indigo-600"/> Project status and progress</p></div></div>
              <ProjectScene/>
            </article>
            <article className="grid items-center gap-10 border-y border-slate-200 py-12 lg:grid-cols-[1.1fr_.9fr] lg:gap-20">
              <div className="order-2 lg:order-1"><ApprovalScene/></div>
              <div className="order-1 lg:order-2"><p className="font-mono text-xs font-bold tracking-widest text-violet-500">02 — ROUTE THE DECISIONS</p><h3 className="mt-5 text-4xl font-medium leading-[1.1] tracking-[-.04em] sm:text-5xl">Requests and approval stages</h3><p className="mt-5 max-w-md text-base leading-8 text-slate-600">Record internal requests and track each review stage, including who is responsible for the next decision.</p><div className="mt-7 space-y-3 text-xs font-semibold text-slate-600"><p className="flex items-center gap-2"><Check size={14} className="text-indigo-600"/> Configurable workflow stages</p><p className="flex items-center gap-2"><Check size={14} className="text-indigo-600"/> Assigned reviewers and approvers</p></div></div>
            </article>
            <div className="grid gap-8 py-12 md:grid-cols-[.8fr_1.2fr] md:items-center">
              <div><p className="font-mono text-xs font-bold tracking-widest text-sky-600">03 — BRING PEOPLE TOGETHER</p><h3 className="mt-5 text-4xl font-medium leading-[1.1] tracking-[-.04em] sm:text-5xl">Departments, roles and access</h3><p className="mt-5 max-w-md text-base leading-8 text-slate-600">Organize members into departments, assign roles and manage which areas of the workspace each role can access.</p></div>
              <div className="relative overflow-hidden rounded-[22px] bg-gradient-to-br from-[#EEF0FF] to-[#F4F0FF] p-6 sm:p-9">
                <div className="relative mx-auto max-w-lg rounded-xl border border-white bg-white p-5 shadow-xl shadow-indigo-900/5">
                  <div className="flex items-center justify-between border-b border-slate-100 pb-4"><div><p className="text-xs font-bold uppercase tracking-widest text-slate-400">Organization structure</p><p className="mt-1 text-sm font-bold text-slate-800">CJ Technologies</p></div><Users size={18} className="text-indigo-600"/></div>
                  <div className="mt-5 flex items-center justify-center"><div className="rounded-lg bg-indigo-600 px-5 py-3 text-center text-white shadow-lg shadow-indigo-500/20"><p className="text-xs font-bold">Organization</p><p className="mt-1 text-xs text-indigo-100">Workspace owner</p></div></div>
                  <div className="mx-auto h-6 w-px bg-indigo-200"/>
                  <div className="grid grid-cols-3 gap-2">
                    {['Engineering','Operations','Finance'].map((name,i)=><div key={name} className="relative rounded-lg border border-slate-100 bg-slate-50 p-3 text-center"><div className="absolute -top-3 left-1/2 h-3 w-px -translate-x-1/2 bg-indigo-200"/><span className={`mx-auto flex h-7 w-7 items-center justify-center rounded-lg text-[11px] font-bold ${['bg-violet-100 text-violet-700','bg-indigo-100 text-indigo-700','bg-sky-100 text-sky-700'][i]}`}>{name.slice(0,2).toUpperCase()}</span><p className="mt-2 text-xs font-bold text-slate-700">{name}</p><p className="mt-1 text-[11px] text-slate-400">{[6,4,2][i]} members</p></div>)}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section id="approach" className="scroll-mt-24 bg-[#11121B] px-5 py-24 text-white sm:px-8 lg:px-12 lg:py-28">
          <div className="mx-auto grid max-w-[1200px] gap-12 lg:grid-cols-[.9fr_1.1fr] lg:gap-24">
            <div><Eyebrow>A note on the product</Eyebrow><h2 className="text-5xl font-medium leading-[1.08] tracking-[-.045em] sm:text-7xl">Business operations, <span className="bg-gradient-to-r from-indigo-300 to-violet-300 bg-clip-text text-transparent">organized in one place.</span></h2><p className="mt-7 max-w-md text-base leading-8 text-slate-300">Nexora brings together the routine systems a team uses to operate: project tracking, task ownership, organization structure, internal requests and approval workflows.</p></div>
            <div className="border-y border-white/10">
              {([
                ['01', 'One place to find the full picture', 'Keep the project, its people, its tasks and its decisions in the same workspace.'],
                ['02', 'Know who is taking it forward', "Put a name next to the next step, so work doesn't sit waiting for someone to notice it."],
                ['03', 'Build structure around your team', 'Set up departments, roles and approval routes that support the way your team already works.'],
              ] as const).map(([n, title, copy]) => (
                <div
                  key={n}
                  className="grid gap-4 border-b border-white/10 py-7 last:border-0 sm:grid-cols-[42px_1fr]"
                >
                  <span className="pt-1 font-mono text-xs font-bold text-indigo-300">
                    {n}
                  </span>
                  <div>
                    <h3 className="text-lg font-bold">{title}</h3>
                    <p className="mt-2 max-w-lg text-sm leading-7 text-slate-300">
                      {copy}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="px-5 py-20 sm:px-8 lg:px-12 lg:py-24">
          <div className="mx-auto max-w-[1200px] border-b border-slate-200 pb-12">
            <div className="flex flex-col justify-between gap-8 md:flex-row md:items-end">
              <div><Eyebrow>Ready when your team is</Eyebrow><h2 className="max-w-[720px] text-5xl font-medium leading-[1.08] tracking-[-.045em] sm:text-7xl">A workspace for your organization.</h2><p className="mt-5 max-w-lg text-base leading-8 text-slate-600">Create an organization, add its members and set up the projects, departments and workflows your team uses.</p></div>
              <button onClick={()=>go('/register')} className="group inline-flex shrink-0 items-center gap-4 rounded-lg bg-gradient-to-r from-indigo-600 to-violet-600 px-6 py-4 text-sm font-semibold text-white shadow-lg shadow-indigo-500/20 transition hover:-translate-y-0.5">Create an account <ArrowUpRight size={15} className="transition group-hover:translate-x-0.5 group-hover:-translate-y-0.5"/></button>
            </div>
          </div>
        </section>
      </main>

      <footer className="bg-white px-5 py-8 sm:px-8 lg:px-12">
        <div className="mx-auto flex max-w-[1320px] flex-col justify-between gap-6 sm:flex-row sm:items-center"><div><Brand/><p className="mt-3 text-xs text-slate-400">Nexora Business OS · Projects, teams, tasks and workflows.</p></div><div className="flex flex-wrap gap-x-6 gap-y-3"><button onClick={()=>jump('how')} className="text-sm font-medium text-slate-600 hover:text-indigo-600">How it works</button><button onClick={()=>jump('work')} className="text-sm font-medium text-slate-600 hover:text-indigo-600">Platform</button><button onClick={()=>go('/login')} className="text-sm font-medium text-slate-600 hover:text-indigo-600">Log in</button><button onClick={()=>go('/register')} className="text-sm font-medium text-slate-600 hover:text-indigo-600">Get started</button></div><p className="text-[11px] text-slate-400">© {new Date().getFullYear()} Nexora Business OS</p></div>
      </footer>
    </div>
  );
}
