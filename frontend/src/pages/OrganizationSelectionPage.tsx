
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Building2,
  Plus,
  ArrowRight,
  Users,
  Globe,
  BriefcaseBusiness,
  Loader2,
  X,
  AlertCircle,
  RefreshCw,
  LogOut,
  ChevronDown,
} from 'lucide-react';

import api from '../lib/api';
import { useAuth } from '../context/AuthContext';

interface Organization {
  id: string;
  name: string;
  email: string | null;
  phone: string | null;
  website: string | null;
  industry: string | null;
  size: string | null;
  created_at: string;
  membership: {
    id: string;
    status: string;
    joined_at: string;
  };
  role: {
    id: string;
    name: string;
    description: string | null;
  };
}

interface OrganizationForm {
  name: string;
  email: string;
  phone: string;
  website: string;
  industry: string;
  size: string;
}

const initialForm: OrganizationForm = {
  name: '',
  email: '',
  phone: '',
  website: '',
  industry: '',
  size: '',
};

export default function OrganizationSelectionPage() {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [accountMenuOpen, setAccountMenuOpen] = useState(false);

  const [organizations, setOrganizations] = useState<Organization[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [form, setForm] = useState<OrganizationForm>(initialForm);
  const [creating, setCreating] = useState(false);
  const [createError, setCreateError] = useState('');

  const fetchOrganizations = async () => {
    try {
      setLoading(true);
      setError('');

      const response = await api.get<Organization[]>('/organizations');
      setOrganizations(response.data);
    } catch (err: any) {
      setError(
        err.response?.data?.message ||
          'Unable to load your organizations. Please try again.',
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrganizations();
  }, []);

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
  ) => {
    setForm((previous) => ({
      ...previous,
      [e.target.name]: e.target.value,
    }));
  };

  const handleCreateOrganization = async (
    e: React.FormEvent<HTMLFormElement>,
  ) => {
    e.preventDefault();

    if (!form.name.trim()) {
      setCreateError('Organization name is required.');
      return;
    }

    try {
      setCreating(true);
      setCreateError('');

      await api.post('/organizations', {
        name: form.name.trim(),
        email: form.email || undefined,
        phone: form.phone || undefined,
        website: form.website || undefined,
        industry: form.industry || undefined,
        size: form.size || undefined,
      });

      setForm(initialForm);
      setShowCreateForm(false);

      await fetchOrganizations();
    } catch (err: any) {
      setCreateError(
        err.response?.data?.message ||
          'Unable to create organization. Please try again.',
      );
    } finally {
      setCreating(false);
    }
  };

  const openWorkspace = (organizationId: string) => {
    navigate(`/workspace/${organizationId}`);
  };

  const handleLogout = () => {
    logout();
    navigate('/login', { replace: true });
  };

  const accountInitial = user?.email?.charAt(0).toUpperCase() || 'U';

  return (
    <div className="min-h-screen bg-[#f7f8fc] text-slate-900">
      {/* Header */}
      <header className="border-b border-slate-200/80 bg-white">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-5 lg:px-10">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-600 to-violet-600 text-white shadow-lg shadow-indigo-500/20">
              <Building2 size={21} />
            </div>

            <div>
              <h1 className="text-xl font-bold tracking-tight text-slate-900">
                nexora
              </h1>
              <p className="text-[11px] font-medium tracking-widest text-slate-400">
                BUSINESS OS
              </p>
            </div>
          </div>

          <div className="relative">
            <button
              type="button"
              onClick={() => setAccountMenuOpen((open) => !open)}
              aria-expanded={accountMenuOpen}
              aria-haspopup="menu"
              className="flex items-center gap-2 rounded-full border border-slate-200 bg-slate-50 px-3 py-2 transition hover:border-indigo-200 hover:bg-indigo-50"
            >
              <div className="flex h-7 w-7 items-center justify-center rounded-full bg-indigo-100 text-xs font-bold text-indigo-700">
                {accountInitial}
              </div>
              <span className="max-w-[180px] truncate text-sm font-medium text-slate-600">
                Your account
              </span>
              <ChevronDown
                size={15}
                className={`text-slate-400 transition-transform ${accountMenuOpen ? 'rotate-180' : ''}`}
              />
            </button>

            {accountMenuOpen && (
              <div
                role="menu"
                className="absolute right-0 top-full z-50 mt-2 w-64 overflow-hidden rounded-xl border border-slate-200 bg-white p-2 shadow-xl shadow-slate-900/10"
              >
                <div className="border-b border-slate-100 px-3 py-2.5">
                  <p className="text-xs font-medium text-slate-400">SIGNED IN AS</p>
                  <p className="mt-1 truncate text-sm font-semibold text-slate-800">
                    {user?.email || 'Your account'}
                  </p>
                </div>
                <button
                  type="button"
                  role="menuitem"
                  onClick={handleLogout}
                  className="mt-1 flex w-full items-center gap-2 rounded-lg px-3 py-2.5 text-left text-sm font-semibold text-red-600 transition hover:bg-red-50"
                >
                  <LogOut size={16} />
                  Log out
                </button>
              </div>
            )}
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-6 py-12 lg:px-10">
        {/* Welcome section */}
        <div className="mb-10 flex flex-col justify-between gap-6 sm:flex-row sm:items-end">
          <div>
            <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-indigo-100 bg-indigo-50 px-3 py-1.5 text-xs font-semibold text-indigo-700">
              <span className="h-1.5 w-1.5 rounded-full bg-indigo-500" />
              WORKSPACE MANAGEMENT
            </div>

            <h2 className="text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
              Welcome to Nexora
            </h2>

            <p className="mt-3 max-w-xl text-sm leading-6 text-slate-500 sm:text-base">
              Select an organization to continue working, or create a new
              workspace for your team.
            </p>
          </div>

          <button
            onClick={() => {
              setShowCreateForm(true);
              setCreateError('');
            }}
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-indigo-600 px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-indigo-600/20 transition hover:-translate-y-0.5 hover:bg-indigo-700"
          >
            <Plus size={18} />
            Create organization
          </button>
        </div>

        {/* Organization section */}
        <div className="mb-5 flex items-center justify-between">
          <div>
            <h3 className="text-lg font-bold text-slate-800">
              Your organizations
            </h3>
            <p className="mt-1 text-sm text-slate-500">
              Workspaces associated with your account
            </p>
          </div>

          {!loading && (
            <span className="rounded-full bg-slate-200/70 px-3 py-1 text-xs font-semibold text-slate-600">
              {organizations.length}{' '}
              {organizations.length === 1 ? 'workspace' : 'workspaces'}
            </span>
          )}
        </div>

        {/* Loading */}
        {loading && (
          <div className="flex min-h-64 flex-col items-center justify-center rounded-2xl border border-slate-200 bg-white">
            <Loader2 className="mb-3 animate-spin text-indigo-600" size={30} />
            <p className="text-sm font-medium text-slate-600">
              Loading your organizations...
            </p>
          </div>
        )}

        {/* Error */}
        {!loading && error && (
          <div className="rounded-2xl border border-red-200 bg-red-50 p-6">
            <div className="flex items-center gap-3">
              <AlertCircle className="text-red-500" size={22} />
              <p className="text-sm font-medium text-red-700">{error}</p>
            </div>

            <button
              onClick={fetchOrganizations}
              className="mt-4 inline-flex items-center gap-2 text-sm font-semibold text-red-700 hover:text-red-900"
            >
              <RefreshCw size={15} />
              Try again
            </button>
          </div>
        )}

        {/* Empty state */}
        {!loading && !error && organizations.length === 0 && (
          <div className="flex min-h-72 flex-col items-center justify-center rounded-2xl border border-dashed border-slate-300 bg-white px-6 text-center">
            <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-indigo-50 text-indigo-600">
              <Building2 size={30} />
            </div>

            <h3 className="text-lg font-bold text-slate-800">
              No organizations yet
            </h3>

            <p className="mt-2 max-w-sm text-sm leading-6 text-slate-500">
              Create your first organization to set up your Nexora workspace
              and start managing your business operations.
            </p>

            <button
              onClick={() => setShowCreateForm(true)}
              className="mt-6 inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-indigo-700"
            >
              <Plus size={17} />
              Create your first organization
            </button>
          </div>
        )}

        {/* Organization cards */}
        {!loading && !error && organizations.length > 0 && (
          <div className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-3">
            {organizations.map((organization) => (
              <button
                key={organization.id}
                onClick={() => openWorkspace(organization.id)}
                className="group rounded-2xl border border-slate-200 bg-white p-6 text-left shadow-sm transition duration-200 hover:-translate-y-1 hover:border-indigo-200 hover:shadow-xl hover:shadow-indigo-900/5"
              >
                <div className="mb-6 flex items-start justify-between">
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-100 to-violet-100 text-indigo-700">
                    <Building2 size={23} />
                  </div>

                  <span className="rounded-full bg-emerald-50 px-3 py-1 text-[11px] font-semibold text-emerald-700">
                    {organization.membership.status}
                  </span>
                </div>

                <h4 className="truncate text-lg font-bold text-slate-900 transition group-hover:text-indigo-700">
                  {organization.name}
                </h4>

                <p className="mt-1 text-sm text-slate-500">
                  {organization.industry || 'Industry not specified'}
                </p>

                <div className="my-5 grid grid-cols-2 gap-3">
                  <div className="rounded-xl bg-slate-50 p-3">
                    <div className="mb-1 flex items-center gap-1.5 text-slate-400">
                      <Users size={13} />
                      <span className="text-[11px] font-medium">Team size</span>
                    </div>
                    <p className="text-sm font-semibold text-slate-700">
                      {organization.size || 'Not specified'}
                    </p>
                  </div>

                  <div className="rounded-xl bg-slate-50 p-3">
                    <div className="mb-1 flex items-center gap-1.5 text-slate-400">
                      <BriefcaseBusiness size={13} />
                      <span className="text-[11px] font-medium">Your role</span>
                    </div>
                    <p className="text-sm font-semibold text-slate-700">
                      {organization.role.name}
                    </p>
                  </div>
                </div>

                {organization.website && (
                  <div className="mb-4 flex items-center gap-2 truncate text-xs text-slate-400">
                    <Globe size={13} />
                    <span className="truncate">{organization.website}</span>
                  </div>
                )}

                <div className="flex items-center justify-between border-t border-slate-100 pt-4">
                  <span className="text-xs font-medium text-slate-400">
                    Open workspace
                  </span>

                  <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-slate-100 text-slate-500 transition group-hover:bg-indigo-600 group-hover:text-white">
                    <ArrowRight size={16} />
                  </span>
                </div>
              </button>
            ))}
          </div>
        )}
      </main>

      {/* Create organization modal */}
      {showCreateForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-slate-950/50 p-4 backdrop-blur-sm">
          <div className="my-auto w-full max-w-xl rounded-2xl bg-white p-6 shadow-2xl sm:p-8">
            <div className="mb-6 flex items-start justify-between">
              <div>
                <div className="mb-3 flex h-11 w-11 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600">
                  <Building2 size={22} />
                </div>

                <h3 className="text-xl font-bold text-slate-900">
                  Create an organization
                </h3>

                <p className="mt-1 text-sm text-slate-500">
                  Set up a new workspace for your business.
                </p>
              </div>

              <button
                onClick={() => setShowCreateForm(false)}
                disabled={creating}
                className="rounded-lg p-2 text-slate-400 transition hover:bg-slate-100 hover:text-slate-700"
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleCreateOrganization} className="space-y-4">
              <div>
                <label className="mb-1.5 block text-sm font-semibold text-slate-700">
                  Organization name *
                </label>
                <input
                  name="name"
                  value={form.name}
                  onChange={handleInputChange}
                  required
                  placeholder="e.g. Nexora Technologies"
                  className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none transition focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10"
                />
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="mb-1.5 block text-sm font-semibold text-slate-700">
                    Business email
                  </label>
                  <input
                    name="email"
                    type="email"
                    value={form.email}
                    onChange={handleInputChange}
                    placeholder="contact@company.com"
                    className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10"
                  />
                </div>

                <div>
                  <label className="mb-1.5 block text-sm font-semibold text-slate-700">
                    Phone number
                  </label>
                  <input
                    name="phone"
                    value={form.phone}
                    onChange={handleInputChange}
                    placeholder="+91 9876543210"
                    className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10"
                  />
                </div>
              </div>

              <div>
                <label className="mb-1.5 block text-sm font-semibold text-slate-700">
                  Website
                </label>
                <input
                  name="website"
                  type="url"
                  value={form.website}
                  onChange={handleInputChange}
                  placeholder="https://company.com"
                  className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10"
                />
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="mb-1.5 block text-sm font-semibold text-slate-700">
                    Industry
                  </label>
                  <select
                    name="industry"
                    value={form.industry}
                    onChange={handleInputChange}
                    className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none focus:border-indigo-500"
                  >
                    <option value="">Select industry</option>
                    <option value="Technology">Technology</option>
                    <option value="Software">Software</option>
                    <option value="Finance">Finance</option>
                    <option value="Healthcare">Healthcare</option>
                    <option value="Education">Education</option>
                    <option value="Manufacturing">Manufacturing</option>
                    <option value="Retail">Retail</option>
                    <option value="Consulting">Consulting</option>
                    <option value="Other">Other</option>
                  </select>
                </div>

                <div>
                  <label className="mb-1.5 block text-sm font-semibold text-slate-700">
                    Organization size
                  </label>
                  <select
                    name="size"
                    value={form.size}
                    onChange={handleInputChange}
                    className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none focus:border-indigo-500"
                  >
                    <option value="">Select size</option>
                    <option value="Just me">Just me</option>
                    <option value="Small">Small</option>
                    <option value="Medium">Medium</option>
                    <option value="Large">Large</option>
                    <option value="Enterprise">Enterprise</option>
                  </select>
                </div>
              </div>

              {createError && (
                <div className="rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-700">
                  {createError}
                </div>
              )}

              <div className="flex flex-col-reverse gap-3 pt-3 sm:flex-row sm:justify-end">
                <button
                  type="button"
                  onClick={() => setShowCreateForm(false)}
                  disabled={creating}
                  className="rounded-xl border border-slate-200 px-5 py-3 text-sm font-semibold text-slate-600 transition hover:bg-slate-50 disabled:opacity-50"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={creating}
                  className="inline-flex items-center justify-center gap-2 rounded-xl bg-indigo-600 px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-indigo-600/20 transition hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {creating ? (
                    <>
                      <Loader2 size={17} className="animate-spin" />
                      Creating...
                    </>
                  ) : (
                    <>
                      <Plus size={17} />
                      Create organization
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
