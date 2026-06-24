import React, { ReactNode } from 'react';
import { BottomNav } from './BottomNav';
import { Sidebar } from './Sidebar';

export function AppShell({
  children,
  showNav = true,
}: {
  children: ReactNode;
  showNav?: boolean;
}) {
  return (
    <div className="flex h-[100dvh] w-full bg-slate-100">
      {showNav && <Sidebar />}
      <div className="relative flex flex-col flex-1 min-w-0 h-full">
        {children}
        {showNav && <BottomNav />}
      </div>
    </div>
  );
}

/** Shared page wrapper — mobile bottom-nav padding, desktop full height */
export function Page({ children, className = '' }: { children: ReactNode; className?: string }) {
  return (
    <div
      className={`flex flex-col h-full bg-slate-50 pb-24 lg:pb-0 overflow-hidden ${className}`}>
      {children}
    </div>
  );
}

export function PageHeader({ children, className = '' }: { children: ReactNode; className?: string }) {
  return (
    <header
      className={`bg-white px-4 lg:px-8 pt-12 lg:pt-6 pb-4 lg:pb-5 border-b border-slate-200 sticky top-0 z-10 shrink-0 ${className}`}>
      {children}
    </header>
  );
}

export function PageMain({ children, className = '' }: { children: ReactNode; className?: string }) {
  return (
    <main
      className={`flex-1 overflow-y-auto p-4 lg:p-8 w-full max-w-6xl mx-auto ${className}`}>
      {children}
    </main>
  );
}

/** Mobile: fixed above bottom nav. Desktop: in document flow */
export function PageFooter({ children, className = '' }: { children: ReactNode; className?: string }) {
  return (
    <div
      className={`fixed bottom-[72px] left-0 right-0 lg:static lg:bottom-auto p-4 lg:px-8 lg:py-5 bg-white border-t border-slate-200 z-20 shrink-0 ${className}`}>
      <div className="max-w-6xl mx-auto">{children}</div>
    </div>
  );
}
