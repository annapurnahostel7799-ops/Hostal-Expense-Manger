import { useState } from "react";
import { Card } from "../components/ui/Card";
import { Button } from "../components/ui/Button";

export default function SettingsPage() {
  const [darkMode, setDarkMode] = useState(true);

  return (
    <main className="min-h-screen bg-gradient-to-br from-rose-50 via-amber-50 to-sky-100 px-4 py-8 sm:px-6 lg:px-10">
      <div className="grid gap-6 lg:grid-cols-[1fr_0.8fr]">
        <Card title="Personal Settings">
          <div className="space-y-6">
            <div className="grid gap-2">
              <label className="text-sm text-slate-700">Hostel Name</label>
              <input
                className="rounded-3xl border border-slate-200 bg-white/90 px-4 py-3 text-sm text-slate-900 outline-none focus:ring-2 focus:ring-amber-400"
                value="Annapurna Hostel"
                readOnly
              />
            </div>
            <div className="grid gap-2">
              <label className="text-sm text-slate-700">Currency</label>
              <input
                className="rounded-3xl border border-slate-200 bg-white/90 px-4 py-3 text-sm text-slate-900 outline-none focus:ring-2 focus:ring-amber-400"
                value="INR"
                readOnly
              />
            </div>
            <div className="flex flex-col gap-3 rounded-3xl border border-slate-200 bg-white/90 px-5 py-4 shadow-soft sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="text-sm text-slate-700">Dark Mode</p>
                <p className="text-xs text-slate-500">
                  Toggle app theme for comfortable viewing.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setDarkMode((current) => !current)}
                className="rounded-full border border-amber-300 bg-amber-100 px-4 py-2 text-sm text-slate-900"
              >
                {darkMode ? "Enabled" : "Disabled"}
              </button>
            </div>
            <Button type="button" variant="secondary">
              Save settings
            </Button>
          </div>
        </Card>
        <Card title="App Preferences">
          <div className="space-y-4">
            <div className="rounded-3xl border border-slate-200 bg-white/90 p-5 text-slate-700 shadow-soft">
              <p className="text-sm font-semibold text-slate-900">
                Backup & Export
              </p>
              <p className="mt-3 text-sm text-slate-600">
                Export expense data or backup your settings for offline
                recovery.
              </p>
              <div className="mt-4 flex flex-wrap gap-3">
                <Button type="button" variant="secondary">
                  Export CSV
                </Button>
                <Button type="button" variant="secondary">
                  Export PDF
                </Button>
              </div>
            </div>
          </div>
        </Card>
      </div>
    </main>
  );
}
