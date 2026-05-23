/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { AnimatePresence, motion } from 'motion/react';
import { ArrowUpRight, ArrowDownRight, Award, ShieldCheck } from 'lucide-react';
import { formatCurrency } from '../lib/utils';

interface ActivityItem {
  id: string;
  name: string;
  city: string;
  action: 'deposit' | 'withdraw' | 'invest';
  amount: number;
  planName?: string;
  timestamp: string;
}

const FIRST_NAMES = [
  'Juan', 'Maria', 'Mark', 'Sarah', 'Jose', 'John', 'Ana', 'Datu', 'Paolo', 'Kristell',
  'Angelo', 'Reynold', 'Grace', 'Michael', 'Christian', 'Diana', 'Jessica', 'Daniel',
  'Patricia', 'Robert', 'Jennifer', 'Richard', 'Rachelle', 'Emmanuel', 'Christopher',
  'Noel', 'Rhea', 'Francis', 'Arnel', 'Julius', 'Michelle', 'Alden', 'Maine', 'Catriona',
  'Manny', 'Kenneth', 'Liza', 'Enrique', 'Geraldine', 'Maricar', 'Dominic', 'Carlos'
];

const LAST_INITIALS = ['A.', 'B.', 'C.', 'D.', 'G.', 'K.', 'L.', 'M.', 'O.', 'P.', 'R.', 'S.', 'T.', 'V.'];

const PH_CITIES = [
  'Manila', 'Quezon City', 'Davao', 'Cebu', 'Zamboanga', 'Taguig', 'Pasig', 'Cagayan de Oro',
  'Parañaque', 'Valenzuela', 'Makati', 'Bacolod', 'Angeles', 'Iloilo', 'Cainta', 'Bagui',
  'Batangas', 'General Santos', 'Lapu-Lapu', 'Imus', 'Tagbilaran', 'Dumaguete', 'Cavite'
];

const PLANS = ['Starter Core', 'Silver Vault', 'Gold Elite', 'Freedom Capital', 'VIP Ultra', 'Plat Yield'];

const DEPOSIT_AMOUNTS = [1500, 3000, 5000, 8000, 10000, 15000, 20000, 25000, 30000, 50000];
const WITHDRAW_AMOUNTS = [1000, 2500, 4000, 7500, 12000, 18000, 22000, 35000];
const INVEST_AMOUNTS = [2000, 5000, 10000, 20000, 30000, 50000, 100000];

const generateRandomActivity = (): ActivityItem => {
  const firstName = FIRST_NAMES[Math.floor(Math.random() * FIRST_NAMES.length)];
  const lastInitial = LAST_INITIALS[Math.floor(Math.random() * LAST_INITIALS.length)];
  const name = `${firstName} ${lastInitial}`;
  const city = PH_CITIES[Math.floor(Math.random() * PH_CITIES.length)];
  
  const actions: Array<'deposit' | 'withdraw' | 'invest'> = ['deposit', 'withdraw', 'invest'];
  // Keep withdrawals slightly less frequent to boost deposit/investment trust
  const actionWeights = ['deposit', 'deposit', 'invest', 'invest', 'withdraw'];
  const action = actionWeights[Math.floor(Math.random() * actionWeights.length)] as 'deposit' | 'withdraw' | 'invest';

  let amount = 0;
  let planName: string | undefined;

  if (action === 'deposit') {
    amount = DEPOSIT_AMOUNTS[Math.floor(Math.random() * DEPOSIT_AMOUNTS.length)];
  } else if (action === 'withdraw') {
    amount = WITHDRAW_AMOUNTS[Math.floor(Math.random() * WITHDRAW_AMOUNTS.length)];
  } else {
    amount = INVEST_AMOUNTS[Math.floor(Math.random() * INVEST_AMOUNTS.length)];
    planName = PLANS[Math.floor(Math.random() * PLANS.length)];
  }

  return {
    id: Math.random().toString(36).substring(2, 9),
    name,
    city,
    action,
    amount,
    planName,
    timestamp: 'just now'
  };
};

export const LiveActivityPopup: React.FC = () => {
  const [currentActivity, setCurrentActivity] = useState<ActivityItem | null>(null);
  const location = useLocation();

  // Adjust position carefully depending on whether we are on pages that hide bottom navigation
  const hideNav = ['/login', '/register', '/admin/login', '/landing', '/chat', '/loan-info'].includes(location.pathname);
  const isAdminPage = location.pathname.startsWith('/admin');
  
  // On mobile (below sm): 
  // - If standard page with BottomNav (height h-20), lift to bottom-24 (above the nav bar).
  // - If auth/landing/admin page (no BottomNav), stay at bottom-5.
  // On desktop (sm): standard bottom-6 position
  const positionClass = hideNav || isAdminPage
    ? "left-4 sm:left-6 bottom-5 sm:bottom-6"
    : "left-4 sm:left-6 bottom-24 sm:bottom-6";

  useEffect(() => {
    // Show first popup after a short initial delay of 3 seconds
    const initialTimeout = setTimeout(() => {
      setCurrentActivity(generateRandomActivity());
    }, 3000);

    return () => clearTimeout(initialTimeout);
  }, []);

  useEffect(() => {
    if (!currentActivity) return;

    // Show each popup for 6 seconds, then clear it
    const dismissTimeout = setTimeout(() => {
      setCurrentActivity(null);
    }, 6000);

    return () => clearTimeout(dismissTimeout);
  }, [currentActivity]);

  useEffect(() => {
    if (currentActivity) return;

    // After a popup is cleared, wait between 6 to 12 random seconds before showing a new one
    const randomDelay = Math.floor(Math.random() * (12000 - 6000 + 1) + 6000);
    const nextTimeout = setTimeout(() => {
      setCurrentActivity(generateRandomActivity());
    }, randomDelay);

    return () => clearTimeout(nextTimeout);
  }, [currentActivity]);

  return (
    <div className={`fixed z-50 pointer-events-none ${positionClass} max-w-[90vw] w-80`}>
      <AnimatePresence>
        {currentActivity && (
          <motion.div
            key={currentActivity.id}
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: -10 }}
            transition={{ type: "spring", stiffness: 300, damping: 25 }}
            className="pointer-events-auto bg-[#0F172A]/95 border border-white/5 rounded-2xl p-3.5 shadow-[0_10px_35px_-10px_rgba(0,0,0,0.6)] backdrop-blur-md flex items-center gap-3 relative overflow-hidden"
          >
            {/* Soft accent glow inside the card based on action */}
            <div className={`absolute -right-12 -bottom-12 w-28 h-28 rounded-full blur-2xl opacity-20 transition-all duration-300 ${
              currentActivity.action === 'deposit' ? 'bg-emerald-500/80' : 
              currentActivity.action === 'invest' ? 'bg-blue-500/80' : 'bg-rose-500/80'
            }`} />

            {/* Icon / Avatar section with dynamic backgrounds */}
            <div className={`flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center relative ${
              currentActivity.action === 'deposit' ? 'bg-emerald-500/10 border border-emerald-500/20 text-emerald-400' :
              currentActivity.action === 'invest' ? 'bg-blue-500/10 border border-blue-500/20 text-blue-400' :
              'bg-rose-500/10 border border-rose-500/20 text-rose-400'
            }`}>
              {currentActivity.action === 'deposit' && <ArrowUpRight className="w-5 h-5" />}
              {currentActivity.action === 'invest' && <ShieldCheck className="w-5 h-5 animate-pulse" />}
              {currentActivity.action === 'withdraw' && <ArrowDownRight className="w-5 h-5" />}
              
              {/* Pulse active dot */}
              <span className="absolute -top-0.5 -right-0.5 w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_6px_rgba(16,185,129,0.8)]" />
            </div>

            {/* Message and details */}
            <div className="flex-1 min-w-0 pr-1">
              <div className="flex items-center justify-between gap-1 mb-0.5">
                <span className="text-[11px] font-black tracking-tight text-white uppercase italic truncate">
                  {currentActivity.name}
                </span>
                <span className="text-[8px] font-bold text-slate-500 uppercase tracking-widest whitespace-nowrap">
                  {currentActivity.city}
                </span>
              </div>
              
              <p className="text-[10px] text-slate-300 font-bold uppercase tracking-wide leading-tight mt-0.5">
                {currentActivity.action === 'deposit' && (
                  <span>
                    just deposited <span className="text-emerald-400 font-black">{formatCurrency(currentActivity.amount)}</span>
                  </span>
                )}
                {currentActivity.action === 'withdraw' && (
                  <span>
                    just withdrew <span className="text-rose-400 font-black">{formatCurrency(currentActivity.amount)}</span>
                  </span>
                )}
                {currentActivity.action === 'invest' && (
                  <span>
                    invested <span className="text-blue-400 font-black">{formatCurrency(currentActivity.amount)}</span> in <span className="text-white font-black italic">{currentActivity.planName}</span>
                  </span>
                )}
              </p>
              
              <div className="flex items-center gap-1.5 mt-1">
                <div className="w-1 h-1 rounded-full bg-emerald-500" />
                <span className="text-[8px] font-black text-emerald-400 uppercase tracking-widest leading-none">
                  Live Activity
                </span>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
