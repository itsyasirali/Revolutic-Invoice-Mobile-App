import React, { createContext, useCallback, useContext, useMemo, useState } from 'react';

interface SidebarContextValue {
  open: boolean;
  openSidebar: () => void;
  closeSidebar: () => void;
}

const SidebarContext = createContext<SidebarContextValue>({
  open: false,
  openSidebar: () => {},
  closeSidebar: () => {},
});

export const SidebarProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [open, setOpen] = useState(false);
  const openSidebar = useCallback(() => setOpen(true), []);
  const closeSidebar = useCallback(() => setOpen(false), []);
  const value = useMemo(() => ({ open, openSidebar, closeSidebar }), [open, openSidebar, closeSidebar]);
  return <SidebarContext.Provider value={value}>{children}</SidebarContext.Provider>;
};

export const useSidebar = () => useContext(SidebarContext);
