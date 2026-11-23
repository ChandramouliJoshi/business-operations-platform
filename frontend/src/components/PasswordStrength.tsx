
import { Check, Circle, ShieldCheck } from 'lucide-react';

interface PasswordStrengthProps {
  password: string;
}

export const passwordRequirements = [
  {
    label: 'At least 8 characters',
    test: (password: string) => password.length >= 8,
  },
  {
    label: 'One uppercase letter (A–Z)',
    test: (password: string) => /[A-Z]/.test(password),
  },
  {
    label: 'One lowercase letter (a–z)',
    test: (password: string) => /[a-z]/.test(password),
  },
  {
    label: 'One number (0–9)',
    test: (password: string) => /[0-9]/.test(password),
  },
  {
    label: 'One special character (@#$!)',
    test: (password: string) => /[^A-Za-z0-9]/.test(password),
  },
];

export function isPasswordValid(password: string) {
  return passwordRequirements.every((requirement) =>
    requirement.test(password),
  );
}

export default function PasswordStrength({
  password,
}: PasswordStrengthProps) {
  const score = passwordRequirements.filter((requirement) =>
    requirement.test(password),
  ).length;

  const strengthLabels = [
    'Very weak',
    'Weak',
    'Fair',
    'Good',
    'Strong',
  ];

  const strengthColors = [
    'bg-rose-500',
    'bg-orange-500',
    'bg-amber-500',
    'bg-lime-500',
    'bg-emerald-500',
  ];

  const strengthTextColors = [
    'text-rose-600',
    'text-orange-600',
    'text-amber-600',
    'text-lime-700',
    'text-emerald-600',
  ];

  const strengthIndex = Math.max(0, score - 1);

  return (
    <div className="mt-3 rounded-xl border border-indigo-100 bg-gradient-to-br from-indigo-50/80 via-white to-violet-50/70 p-3.5">
      <div className="mb-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-indigo-100 text-indigo-600">
            <ShieldCheck size={15} />
          </div>
          <span className="text-[11px] font-bold text-slate-700">
            Password security
          </span>
        </div>

        <span
          className={`text-[10px] font-bold ${
            password
              ? strengthTextColors[strengthIndex]
              : 'text-slate-400'
          }`}
        >
          {password ? strengthLabels[strengthIndex] : 'Not entered'}
        </span>
      </div>

      {/* Strength meter */}
      <div className="mb-3 flex gap-1.5">
        {passwordRequirements.map((requirement, index) => (
          <div
            key={requirement.label}
            className="h-1.5 flex-1 overflow-hidden rounded-full bg-slate-200"
          >
            <div
              className={`h-full rounded-full transition-all duration-300 ${
                index < score
                  ? strengthColors[strengthIndex]
                  : 'w-0'
              }`}
              style={{ width: index < score ? '100%' : '0%' }}
            />
          </div>
        ))}
      </div>

      {/* Requirements */}
      <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
        {passwordRequirements.map((requirement) => {
          const passed = requirement.test(password);

          return (
            <div
              key={requirement.label}
              className="flex items-center gap-2"
            >
              <span
                className={`flex h-4 w-4 shrink-0 items-center justify-center rounded-full transition-colors ${
                  passed
                    ? 'bg-emerald-100 text-emerald-600'
                    : 'bg-slate-100 text-slate-400'
                }`}
              >
                {passed ? (
                  <Check size={10} strokeWidth={3} />
                ) : (
                  <Circle size={9} />
                )}
              </span>

              <span
                className={`text-[10px] transition-colors ${
                  passed
                    ? 'font-medium text-emerald-700'
                    : 'text-slate-500'
                }`}
              >
                {requirement.label}
              </span>
            </div>
          );
        })}
      </div>

      {score === 5 && (
        <div className="mt-3 border-t border-emerald-100 pt-2 text-[10px] font-semibold text-emerald-700">
          <Check size={12} className="mr-1 inline" />
          Excellent! Your password meets all security requirements.
        </div>
      )}
    </div>
  );
}
