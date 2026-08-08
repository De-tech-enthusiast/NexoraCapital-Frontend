// ============================================
// NEXORA CAPITAL - Tabs Component
// ============================================

import { useState, createContext, useContext } from 'react';
import { cn } from '@/utils/cn';
import { motion } from 'framer-motion';

interface TabsContextType {
  activeTab: string;
  setActiveTab: (id: string) => void;
}

const TabsContext = createContext<TabsContextType | undefined>(undefined);

const useTabs = () => {
  const context = useContext(TabsContext);
  if (!context) {
    throw new Error('useTabs must be used within a Tabs provider');
  }
  return context;
};

// Tabs Container
interface TabsProps {
  children: React.ReactNode;
  defaultTab: string;
  className?: string;
  onChange?: (tabId: string) => void;
}

const Tabs = ({ children, defaultTab, className, onChange }: TabsProps) => {
  const [activeTab, setActiveTab] = useState(defaultTab);

  const handleTabChange = (id: string) => {
    setActiveTab(id);
    onChange?.(id);
  };

  return (
    <TabsContext.Provider value={{ activeTab, setActiveTab: handleTabChange }}>
      <div className={className}>{children}</div>
    </TabsContext.Provider>
  );
};

// Tab List
interface TabListProps {
  children: React.ReactNode;
  className?: string;
}

const TabList = ({ children, className }: TabListProps) => {
  return (
    <div
      className={cn(
        'flex items-center gap-1 border-b border-[#e7e5e4]',
        className
      )}
    >
      {children}
    </div>
  );
};

// Tab
interface TabProps {
  id: string;
  children: React.ReactNode;
  disabled?: boolean;
  className?: string;
}

const Tab = ({ id, children, disabled, className }: TabProps) => {
  const { activeTab, setActiveTab } = useTabs();
  const isActive = activeTab === id;

  return (
    <button
      onClick={() => !disabled && setActiveTab(id)}
      disabled={disabled}
      className={cn(
        'relative px-4 py-3 text-sm font-medium transition-colors',
        'focus:outline-none focus-visible:ring-2 focus-visible:ring-[#1e3a5f]',
        isActive
          ? 'text-[#1e3a5f]'
          : 'text-[#78716c] hover:text-[#44403c]',
        disabled && 'opacity-50 cursor-not-allowed',
        className
      )}
    >
      {children}
      {isActive && (
        <motion.div
          layoutId="activeTab"
          className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#1e3a5f]"
          transition={{ type: 'spring', stiffness: 500, damping: 30 }}
        />
      )}
    </button>
  );
};

// Tab Panel
interface TabPanelProps {
  id: string;
  children: React.ReactNode;
  className?: string;
}

const TabPanel = ({ id, children, className }: TabPanelProps) => {
  const { activeTab } = useTabs();

  if (activeTab !== id) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 10 }}
      transition={{ duration: 0.2 }}
      className={className}
    >
      {children}
    </motion.div>
  );
};

export { Tabs, TabList, Tab, TabPanel };
