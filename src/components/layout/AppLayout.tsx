import React, { useEffect, useState } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { Sidebar } from './Sidebar';
import { Topbar } from './Topbar';
import { SearchContext } from '../../context/SearchContext';

export function AppLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [search, setSearch] = useState('');
  const { pathname } = useLocation();

  useEffect(() => {
    setSidebarOpen(false);
  }, [pathname]);

  return (
    <SearchContext.Provider value={{ search, setSearch }}>
      <div className="flex min-h-screen w-full bg-canvas">
        <aside className="fixed inset-y-0 left-0 hidden w-[264px] lg:block">
          <Sidebar />
        </aside>

        <AnimatePresence>
          {sidebarOpen &&
          <>
              <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.18, ease: [0.23, 1, 0.32, 1] }}
              onClick={() => setSidebarOpen(false)}
              className="fixed inset-0 z-40 bg-slate-900/40 backdrop-blur-[2px] lg:hidden"
              aria-hidden />
            
              <motion.aside
              initial={{ x: -280 }}
              animate={{ x: 0 }}
              exit={{ x: -280 }}
              transition={{ duration: 0.24, ease: [0.23, 1, 0.32, 1] }}
              className="fixed inset-y-0 left-0 z-50 w-[264px] lg:hidden">
              
                <Sidebar onNavigate={() => setSidebarOpen(false)} />
              </motion.aside>
            </>
          }
        </AnimatePresence>

        <div className="flex min-w-0 flex-1 flex-col lg:pl-[264px]">
          <Topbar onOpenSidebar={() => setSidebarOpen(true)} search={search} onSearchChange={setSearch} />
          <main className="flex-1 px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
            <div className="mx-auto w-full max-w-[1400px]">
              <Outlet />
            </div>
          </main>
        </div>
      </div>
    </SearchContext.Provider>);

}