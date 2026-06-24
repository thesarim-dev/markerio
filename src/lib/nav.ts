import type { ViewState } from '../types';

export interface NavItem {
  id: string;
  label: string;
  target: ViewState;
}

export const NAV_ITEMS: NavItem[] = [
  { id: 'dashboard', label: 'Exams', target: { name: 'dashboard' } },
  { id: 'capture', label: 'Capture', target: { name: 'capture' } },
  { id: 'reports_list', label: 'Reports', target: { name: 'reports_list' } },
];

export function isNavActive(id: string, view: ViewState): boolean {
  if (
    id === 'dashboard' &&
    (view.name === 'dashboard' ||
      view.name === 'create_exam' ||
      view.name === 'edit_exam' ||
      view.name === 'exam_detail')
  ) {
    return true;
  }
  if (id === 'capture' && view.name === 'capture') return true;
  if (
    id === 'reports_list' &&
    (view.name === 'reports_list' || view.name === 'report')
  ) {
    return true;
  }
  return false;
}
