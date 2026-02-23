'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import {
  FiSettings,
  FiTool,
  FiBell,
  FiSave,
  FiClock,
  FiAlertCircle,
} from 'react-icons/fi';
import Link from 'next/link';
import Button from '@/components/ui/Button';

interface SiteSettingsState {
  maintenanceMode: boolean;
  maintenanceMessage: string;
  maintenanceEndsAt: string;
  announcement: string;
  announcementActive: boolean;
}

export default function AdminSiteSettingsPage() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [form, setForm] = useState<SiteSettingsState>({
    maintenanceMode: false,
    maintenanceMessage: '',
    maintenanceEndsAt: '',
    announcement: '',
    announcementActive: false,
  });

  useEffect(() => {
    fetch('/api/admin/site-settings')
      .then((res) => res.json())
      .then((data) => {
        if (data.error) throw new Error(data.error);
        setForm({
          maintenanceMode: !!data.maintenanceMode,
          maintenanceMessage: data.maintenanceMessage || '',
          maintenanceEndsAt: data.maintenanceEndsAt
            ? new Date(data.maintenanceEndsAt).toISOString().slice(0, 16)
            : '',
          announcement: data.announcement || '',
          announcementActive: !!data.announcementActive,
        });
      })
      .catch(() => setMessage({ type: 'error', text: 'Failed to load settings' }))
      .finally(() => setLoading(false));
  }, []);

  const handleSave = async () => {
    setSaving(true);
    setMessage(null);
    try {
      const res = await fetch('/api/admin/site-settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          maintenanceMode: form.maintenanceMode,
          maintenanceMessage: form.maintenanceMessage,
          maintenanceEndsAt: form.maintenanceEndsAt || null,
          announcement: form.announcement,
          announcementActive: form.announcementActive,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to save');
      setMessage({ type: 'success', text: 'Settings saved.' });
    } catch (e: any) {
      setMessage({ type: 'error', text: e.message || 'Failed to save settings' });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[40vh]">
        <div className="animate-spin rounded-full h-10 w-10 border-2 border-[#F9629F] border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="space-y-4 sm:space-y-6 w-full max-w-full">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative overflow-hidden rounded-lg sm:rounded-xl md:rounded-2xl bg-gradient-to-r from-[#050b2c] via-[#1a1a2e] to-[#050b2c] p-4 sm:p-5 md:p-6 lg:p-8"
      >
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_50%,rgba(255,165,9,0.12),transparent_50%)]" />
        <div className="relative z-10 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div className="flex items-center gap-3 sm:gap-4">
            <motion.div
              whileHover={{ scale: 1.1, rotate: -5 }}
              className="p-2 sm:p-3 bg-gradient-to-br from-[#ffa509] to-[#F9629F] rounded-lg sm:rounded-xl shadow-lg"
            >
              <FiSettings className="w-6 h-6 sm:w-7 sm:h-7 text-white" />
            </motion.div>
            <div>
              <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-white">
                Site Settings
              </h1>
              <p className="text-white/80 text-sm sm:text-base">
                Maintenance mode and announcements
              </p>
            </div>
          </div>
        </div>
      </motion.div>

      {message && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className={`rounded-xl px-4 py-3 flex items-center gap-2 ${
            message.type === 'success'
              ? 'bg-emerald-500/20 text-emerald-800 border border-emerald-500/30'
              : 'bg-red-500/20 text-red-800 border border-red-500/30'
          }`}
        >
          {message.type === 'success' ? (
            <FiSave className="w-5 h-5 shrink-0" />
          ) : (
            <FiAlertCircle className="w-5 h-5 shrink-0" />
          )}
          <span>{message.text}</span>
        </motion.div>
      )}

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="bg-gradient-to-br from-white to-gray-50 rounded-lg sm:rounded-xl md:rounded-2xl shadow-lg border-2 border-[#F9629F]/20 p-4 sm:p-6 lg:p-8 space-y-8"
      >
        {/* Maintenance */}
        <section>
          <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2 mb-4">
            <FiTool className="w-5 h-5 text-[#F9629F]" />
            Under maintenance
          </h2>
          <p className="text-gray-600 text-sm mb-4">
            When enabled, only admins can access the site. Customers are redirected to the
            maintenance page on their next page load or refresh. Users already browsing will
            see the maintenance page as soon as they navigate or reload.
          </p>
          <div className="space-y-4">
            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={form.maintenanceMode}
                onChange={(e) =>
                  setForm((prev) => ({ ...prev, maintenanceMode: e.target.checked }))
                }
                className="w-5 h-5 rounded border-gray-300 text-[#F9629F] focus:ring-[#F9629F]"
              />
              <span className="font-medium text-gray-800">Site under maintenance</span>
            </label>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Estimated duration (shown on maintenance page)
              </label>
              <input
                type="text"
                value={form.maintenanceMessage}
                onChange={(e) =>
                  setForm((prev) => ({ ...prev, maintenanceMessage: e.target.value }))
                }
                placeholder="e.g. Approximately 2 hours"
                className="w-full max-w-md px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#F9629F] focus:border-[#F9629F] text-gray-900 placeholder:text-gray-500 bg-white"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center gap-1">
                <FiClock className="w-4 h-4" />
                Expected end (optional)
              </label>
              <input
                type="datetime-local"
                value={form.maintenanceEndsAt}
                onChange={(e) =>
                  setForm((prev) => ({ ...prev, maintenanceEndsAt: e.target.value }))
                }
                className="w-full max-w-md px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#F9629F] focus:border-[#F9629F] text-gray-900 placeholder:text-gray-500 bg-white"
              />
            </div>
          </div>
        </section>

        {/* Announcement */}
        <section>
          <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2 mb-4">
            <FiBell className="w-5 h-5 text-[#F9629F]" />
            Announcement
          </h2>
          <p className="text-gray-600 text-sm mb-4">
            Show a banner to all visitors (e.g. &quot;Maintenance scheduled for Saturday 10pm–12am&quot;).
            Use &quot;Show announcement&quot; to display it; turn off to hide.
          </p>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Announcement text
              </label>
              <textarea
                value={form.announcement}
                onChange={(e) =>
                  setForm((prev) => ({ ...prev, announcement: e.target.value }))
                }
                placeholder="e.g. Scheduled maintenance on Saturday 10pm–12am. We'll be back shortly."
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#F9629F] focus:border-[#F9629F] text-gray-900 placeholder:text-gray-500 bg-white"
              />
            </div>
            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={form.announcementActive}
                onChange={(e) =>
                  setForm((prev) => ({ ...prev, announcementActive: e.target.checked }))
                }
                className="w-5 h-5 rounded border-gray-300 text-[#F9629F] focus:ring-[#F9629F]"
              />
              <span className="font-medium text-gray-800">Show announcement on site</span>
            </label>
          </div>
        </section>

        <div className="pt-4">
          <Button
            onClick={handleSave}
            disabled={saving}
            className="bg-gradient-to-r from-[#F9629F] to-[#FC9BC2] text-white hover:opacity-90"
          >
            {saving ? 'Saving…' : 'Save settings'}
          </Button>
        </div>
      </motion.div>
    </div>
  );
}
