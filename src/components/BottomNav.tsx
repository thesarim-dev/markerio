import React from 'react';
import { Camera, FileText, LayoutDashboard } from 'lucide-react';
import { useAppContext } from '../AppContext';
import { isNavActive, NAV_ITEMS } from '../lib/nav';

const ICONS = {
  dashboard: LayoutDashboard,
  capture: Camera,
  reports_list: FileText,
} as const;

export function BottomNav() {
  const { view, setView } = useAppContext();

  return (
    <div className="lg:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-slate-200 pb-safe pt-2 px-6 flex justify-between items-center z-50">
      {NAV_ITEMS.map((item) => {
        const active = isNavActive(item.id, view);
        const Icon = ICONS[item.id as keyof typeof ICONS];
        return (
          <button
            key={item.id}
            onClick={() => setView(item.target)}
            className={`flex flex-col items-center p-2 min-w-[64px] transition-colors ${
              active ? 'text-blue-600' : 'text-slate-400 hover:text-slate-600'
            }`}>
            <Icon
              className={`w-6 h-6 mb-1 ${active ? 'stroke-[2.5px]' : 'stroke-2'}`}
            />
            <span
              className={`text-[10px] font-medium ${
                active ? 'text-blue-600' : 'text-slate-500'
              }`}>
              {item.label}
            </span>
          </button>
        );
      })}
    </div>
  );
}
