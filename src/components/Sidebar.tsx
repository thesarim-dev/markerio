import React from 'react';
import {
  Camera,
  FileText,
  GraduationCap,
  LayoutDashboard,
  LogOut,
} from 'lucide-react';
import { useAppContext } from '../AppContext';
import { useAuth } from '../context/AuthContext';
import { isNavActive, NAV_ITEMS } from '../lib/nav';

const ICONS = {
  dashboard: LayoutDashboard,
  capture: Camera,
  reports_list: FileText,
} as const;

export function Sidebar() {
  const { view, setView } = useAppContext();
  const { signOut, user } = useAuth();

  return (
    <aside className="hidden lg:flex lg:flex-col lg:w-64 lg:shrink-0 lg:border-r lg:border-slate-200 lg:bg-white lg:h-full">
      <div className="px-6 py-6 border-b border-slate-100">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center shadow-md shadow-blue-600/20">
            <GraduationCap className="w-5 h-5 text-white" />
          </div>
          <div>
            <p className="font-bold text-slate-900 leading-tight">Markerio</p>
            <p className="text-xs text-slate-500">Exam grading</p>
          </div>
        </div>
      </div>

      <nav className="flex-1 p-4 space-y-1">
        {NAV_ITEMS.map((item) => {
          const active = isNavActive(item.id, view);
          const Icon = ICONS[item.id as keyof typeof ICONS];
          return (
            <button
              key={item.id}
              onClick={() => setView(item.target)}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-colors ${
                active
                  ? 'bg-blue-50 text-blue-700'
                  : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
              }`}>
              <Icon className={`w-5 h-5 ${active ? 'stroke-[2.5px]' : ''}`} />
              {item.label}
            </button>
          );
        })}
      </nav>

      <div className="p-4 border-t border-slate-100">
        {user?.email && (
          <p className="text-xs text-slate-400 truncate px-2 mb-3">{user.email}</p>
        )}
        <button
          onClick={() => signOut()}
          className="w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium text-slate-600 hover:bg-slate-50 hover:text-slate-900 transition-colors">
          <LogOut className="w-4 h-4" />
          Sign out
        </button>
      </div>
    </aside>
  );
}
