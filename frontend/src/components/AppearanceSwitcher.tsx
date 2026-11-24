import { useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { Check, Monitor, Moon, Sun, type LucideIcon } from "lucide-react";
import { useTheme, type ThemeMode } from "../context/ThemeContext";

const options: { value: ThemeMode; label: string; description: string; icon: LucideIcon }[] = [
  { value: "light", label: "Light", description: "A bright, clear workspace", icon: Sun },
  { value: "dark", label: "Dark", description: "Easy on the eyes", icon: Moon },
  { value: "system", label: "System", description: "Follow your device settings", icon: Monitor },
];

export default function AppearanceSwitcher() {
  const [open, setOpen] = useState(false);
  const { theme, setTheme } = useTheme();
  const ActiveIcon = options.find((option) => option.value === theme)?.icon ?? Monitor;

  return (
    <div className="relative">
      <motion.button
        type="button"
        whileTap={{ scale: 0.94 }}
        onClick={() => setOpen((current) => !current)}
        aria-label={`Appearance: ${theme}. Change appearance`}
        aria-expanded={open}
        aria-haspopup="menu"
        className="relative flex h-9 items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 text-slate-600 shadow-sm transition-colors hover:border-indigo-200 hover:bg-indigo-50 hover:text-indigo-700 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 dark:hover:border-indigo-500/50 dark:hover:bg-slate-700"
      >
        <motion.span
          key={theme}
          initial={{ rotate: -35, scale: 0.65, opacity: 0 }}
          animate={{ rotate: 0, scale: 1, opacity: 1 }}
          transition={{ type: "spring", stiffness: 360, damping: 19 }}
          className="flex items-center justify-center"
        >
          <ActiveIcon size={16} strokeWidth={1.9} />
        </motion.span>
        <span className="hidden text-xs font-medium sm:inline">Appearance</span>
      </motion.button>

      <AnimatePresence>
        {open && (
          <>
            <button
              type="button"
              aria-label="Close appearance menu"
              className="fixed inset-0 z-40 cursor-default"
              onClick={() => setOpen(false)}
            />
            <motion.div
              role="menu"
              initial={{ opacity: 0, y: -8, scale: 0.96 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -6, scale: 0.97 }}
              transition={{ duration: 0.16, ease: "easeOut" }}
              className="absolute right-0 z-50 mt-3 w-[258px] origin-top-right overflow-hidden rounded-2xl border border-slate-200 bg-white p-2 shadow-[0_18px_55px_-18px_rgba(15,23,42,.28)] dark:border-slate-700 dark:bg-slate-900"
            >
              <div className="px-3 pb-2 pt-2">
                <p className="text-xs font-semibold text-slate-900 dark:text-slate-100">Appearance</p>
                <p className="mt-0.5 text-[11px] text-slate-500 dark:text-slate-400">Choose how Nexora looks</p>
              </div>
              <div className="space-y-1">
                {options.map((option) => {
                  const Icon = option.icon;
                  const selected = theme === option.value;
                  return (
                    <motion.button
                      key={option.value}
                      type="button"
                      role="menuitemradio"
                      aria-checked={selected}
                      whileTap={{ scale: 0.985 }}
                      onClick={() => {
                        setTheme(option.value);
                        setOpen(false);
                      }}
                      className={`flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left transition-colors ${
                        selected
                          ? "bg-indigo-50 text-indigo-700 dark:bg-indigo-500/15 dark:text-indigo-300"
                          : "text-slate-600 hover:bg-slate-50 dark:text-slate-300 dark:hover:bg-slate-800"
                      }`}
                    >
                      <span className={`flex h-9 w-9 items-center justify-center rounded-lg ${
                        selected
                          ? "bg-white text-indigo-600 shadow-sm dark:bg-slate-800 dark:text-indigo-300"
                          : "bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400"
                      }`}>
                        <Icon size={17} strokeWidth={1.8} />
                      </span>
                      <span className="min-w-0 flex-1">
                        <span className="block text-xs font-semibold">{option.label}</span>
                        <span className={`mt-0.5 block text-[10px] ${
                          selected ? "text-indigo-600/75 dark:text-indigo-300/70" : "text-slate-400 dark:text-slate-500"
                        }`}>{option.description}</span>
                      </span>
                      {selected && (
                        <motion.span
                          layoutId="nexora-theme-check"
                          initial={{ scale: 0.6, opacity: 0 }}
                          animate={{ scale: 1, opacity: 1 }}
                          className="flex h-5 w-5 items-center justify-center rounded-full bg-indigo-600 text-white"
                        >
                          <Check size={12} strokeWidth={2.6} />
                        </motion.span>
                      )}
                    </motion.button>
                  );
                })}
              </div>
              <div className="mt-2 border-t border-slate-100 px-3 py-2 dark:border-slate-800">
                <p className="text-[10px] text-slate-400 dark:text-slate-500">Your preference is saved on this device.</p>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
