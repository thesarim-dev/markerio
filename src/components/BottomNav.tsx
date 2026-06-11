import React from 'react';
import { FileText, Camera, LayoutDashboard } from 'lucide-react';
import { useAppContext } from '../AppContext';
export function BottomNav() {
  const { view, setView } = useAppContext();
  const navItems = [
  {
    id: 'dashboard',
    icon: LayoutDashboard,
    label: 'Exams',
    target: {
      name: 'dashboard'
    } as const
  },
  {
    id: 'capture',
    icon: Camera,
    label: 'Capture',
    target: {
      name: 'capture'
    } as const
  },
  {
    id: 'reports_list',
    icon: FileText,
    label: 'Reports',
    target: {
      name: 'reports_list'
    } as const
  }];

  const isActive = (id: string) => {
    if (
    id === 'dashboard' && (
    view.name === 'dashboard' ||
    view.name === 'create_exam' ||
    view.name === 'exam_detail'))

    return true;
    if (id === 'capture' && view.name === 'capture') return true;
    if (
    id === 'reports_list' && (
    view.name === 'reports_list' || view.name === 'report'))

    return true;
    return false;
  };
  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-slate-200 pb-safe pt-2 px-6 flex justify-between items-center z-50">
      {navItems.map((item) => {
        const active = isActive(item.id);
        const Icon = item.icon;
        return (
          <button
            key={item.id}
            onClick={() => setView(item.target)}
            className={`flex flex-col items-center p-2 min-w-[64px] transition-colors ${active ? 'text-blue-600' : 'text-slate-400 hover:text-slate-600'}`}>
            
            <Icon
              className={`w-6 h-6 mb-1 ${active ? 'stroke-[2.5px]' : 'stroke-2'}`} />
            
            <span
              className={`text-[10px] font-medium ${active ? 'text-blue-600' : 'text-slate-500'}`}>
              
              {item.label}
            </span>
          </button>);

      })}
    </div>);

}