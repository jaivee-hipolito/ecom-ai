'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { FiTool, FiClock } from 'react-icons/fi';

interface SiteSettings {
  maintenanceMessage: string;
  maintenanceEndsAt: string | null;
}

export default function MaintenancePage() {
  const [settings, setSettings] = useState<SiteSettings | null>(null);

  useEffect(() => {
    fetch('/api/site-settings')
      .then((res) => res.json())
      .then((data) =>
        setSettings({
          maintenanceMessage: data.maintenanceMessage || '',
          maintenanceEndsAt: data.maintenanceEndsAt || null,
        })
      )
      .catch(() => setSettings({ maintenanceMessage: '', maintenanceEndsAt: null }));
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex flex-col items-center justify-center px-4 text-white">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="max-w-lg w-full text-center space-y-6"
      >
        <motion.div
          initial={{ scale: 0.8 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
          className="inline-flex items-center justify-center w-24 h-24 rounded-full bg-amber-500/20 border border-amber-400/30"
        >
          <FiTool className="w-12 h-12 text-amber-400" />
        </motion.div>
        <h1 className="text-3xl sm:text-4xl font-bold tracking-tight">
          Under maintenance
        </h1>
        <p className="text-slate-400 text-lg">
          We’re making things better. Please check back soon.
        </p>
        {settings && (settings.maintenanceMessage || settings.maintenanceEndsAt) && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="flex flex-col items-center gap-2 rounded-xl bg-slate-800/50 border border-slate-700 p-4"
          >
            <span className="flex items-center gap-2 text-amber-400 font-medium">
              <FiClock className="w-5 h-5" />
              Estimated duration
            </span>
            {settings.maintenanceMessage && (
              <p className="text-slate-200">{settings.maintenanceMessage}</p>
            )}
            {settings.maintenanceEndsAt && (
              <p className="text-slate-400 text-sm">
                Expected by:{' '}
                {new Date(settings.maintenanceEndsAt).toLocaleString(undefined, {
                  dateStyle: 'medium',
                  timeStyle: 'short',
                })}
              </p>
            )}
          </motion.div>
        )}
      </motion.div>
    </div>
  );
}
