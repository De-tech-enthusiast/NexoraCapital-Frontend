// ============================================
// NEXORA CAPITAL - Sidebar Component
// ============================================

import { NavLink } from 'react-router-dom';
import { cn } from '@/utils/cn';
import { motion, AnimatePresence } from 'framer-motion';
import {
  LayoutDashboard,
  PieChart,
  ArrowDownLeft,
  ArrowUpRight,
  Receipt,
  Bell,
  User,
  Shield,
  ShieldCheck,
  ChevronLeft,
  ChevronRight,
  LogOut,
} from 'lucide-react';
import { useAuthStore } from '@/store/authStore';

interface SidebarProps {
  isCollapsed: boolean;
  onToggle: () => void;
  isMobileOpen: boolean;
  onMobileClose: () => void;
}

const navigation = [
  { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
  { name: 'Portfolio', href: '/portfolio', icon: PieChart },
  { name: 'Deposit', href: '/deposit', icon: ArrowDownLeft },
  { name: 'Withdraw', href: '/withdraw', icon: ArrowUpRight },
  { name: 'Transactions', href: '/transactions', icon: Receipt },
  { name: 'Notifications', href: '/notifications', icon: Bell },
];

const secondaryNavigation = [
  { name: 'Profile', href: '/profile', icon: User },
  { name: 'Security', href: '/security', icon: Shield },
];

const Sidebar = ({
  isCollapsed,
  onToggle,
  isMobileOpen,
  onMobileClose,
}: SidebarProps) => {
  const { logout, user } = useAuthStore();
  const isAdmin = user?.role === 'admin';

  const NavItem = ({
    item,
    isSecondary = false,
  }: {
    item: (typeof navigation)[0];
    isSecondary?: boolean;
  }) => {
    const Icon = item.icon;

    return (
      <NavLink
        to={item.href}
        onClick={onMobileClose}
        className={({ isActive }) =>
          cn(
            'group flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200',
            isActive
              ? 'bg-[#1e3a5f] text-white'
              : 'text-[#78716c] hover:bg-[#f5f5f4] hover:text-[#44403c]',
            isCollapsed && !isSecondary && 'justify-center px-2',
            isSecondary && isCollapsed && 'justify-center px-2'
          )
        }
      >
        <Icon className={cn('h-5 w-5 flex-shrink-0', isCollapsed && 'mx-auto')} />
        <AnimatePresence mode="wait">
          {!isCollapsed && (
            <motion.span
              initial={{ opacity: 0, width: 0 }}
              animate={{ opacity: 1, width: 'auto' }}
              exit={{ opacity: 0, width: 0 }}
              transition={{ duration: 0.2 }}
              className="truncate"
            >
              {item.name}
            </motion.span>
          )}
        </AnimatePresence>
      </NavLink>
    );
  };

  return (
    <>
      {/* Mobile Overlay */}
      <AnimatePresence>
        {isMobileOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 z-40 lg:hidden"
            onClick={onMobileClose}
          />
        )}
      </AnimatePresence>

      {/* Sidebar */}
      <motion.aside
        initial={false}
        animate={{ width: isCollapsed ? 80 : 256 }}
        transition={{ duration: 0.3, ease: 'easeInOut' }}
        className={cn(
          'fixed left-0 top-0 z-50 h-screen bg-white border-r border-[#e7e5e4]',
          'flex flex-col',
          'transition-transform duration-300',
          isMobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        )}
      >
        {/* Logo */}
        <div className="h-16 flex items-center px-4 border-b border-[#e7e5e4]">
          <div className={cn('flex items-center gap-3', isCollapsed && 'justify-center w-full')}>
            <div className="w-8 h-8 bg-[#1e3a5f] rounded-lg flex items-center justify-center flex-shrink-0">
              <span className="text-white font-bold text-sm">N</span>
            </div>
            <AnimatePresence mode="wait">
              {!isCollapsed && (
                <motion.span
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="font-semibold text-[#1c1917] whitespace-nowrap"
                >
                  Nexora Capital
                </motion.span>
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* Navigation */}
        <div className="flex-1 overflow-y-auto py-4 px-3 space-y-6">
          {/* Main Navigation */}
          <nav className="space-y-1">
            {navigation.map((item) => (
              <NavItem key={item.name} item={item} />
            ))}
          </nav>

          {/* Secondary Navigation */}
          <div>
            <AnimatePresence mode="wait">
              {!isCollapsed && (
                <motion.p
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="px-3 mb-2 text-xs font-medium text-[#a8a29e] uppercase tracking-wider"
                >
                  Settings
                </motion.p>
              )}
            </AnimatePresence>
            <nav className="space-y-1">
              {secondaryNavigation.map((item) => (
                <NavItem key={item.name} item={item} isSecondary />
              ))}
            </nav>
          </div>

          {/* Admin Panel Link - only visible to admins */}
          {isAdmin && (
            <div>
              {!isCollapsed && (
                <p className="px-3 mb-2 text-xs font-medium text-[#c9a227] uppercase tracking-wider">
                  Administration
                </p>
              )}
              <NavLink
                to="/admin"
                onClick={onMobileClose}
                className={cn(
                  'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200',
                  'bg-[#c9a227] text-white hover:bg-[#b8941f]',
                  isCollapsed && 'justify-center px-2'
                )}
              >
                <ShieldCheck className={cn('h-5 w-5 flex-shrink-0', isCollapsed && 'mx-auto')} />
                <AnimatePresence mode="wait">
                  {!isCollapsed && (
                    <motion.span
                      initial={{ opacity: 0, width: 0 }}
                      animate={{ opacity: 1, width: 'auto' }}
                      exit={{ opacity: 0, width: 0 }}
                      transition={{ duration: 0.2 }}
                      className="truncate"
                    >
                      Admin Panel
                    </motion.span>
                  )}
                </AnimatePresence>
              </NavLink>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="border-t border-[#e7e5e4] p-3 space-y-2">
          {/* Logout */}
          <button
            onClick={logout}
            className={cn(
              'w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium',
              'text-[#78716c] hover:bg-red-50 hover:text-red-600 transition-all duration-200',
              isCollapsed && 'justify-center'
            )}
          >
            <LogOut className="h-5 w-5 flex-shrink-0" />
            <AnimatePresence mode="wait">
              {!isCollapsed && (
                <motion.span
                  initial={{ opacity: 0, width: 0 }}
                  animate={{ opacity: 1, width: 'auto' }}
                  exit={{ opacity: 0, width: 0 }}
                  transition={{ duration: 0.2 }}
                >
                  Logout
                </motion.span>
              )}
            </AnimatePresence>
          </button>

          {/* Collapse Toggle (Desktop only) */}
          <button
            onClick={onToggle}
            className={cn(
              'hidden lg:flex w-full items-center justify-center gap-2 px-3 py-2',
              'text-xs text-[#a8a29e] hover:text-[#78716c] transition-colors',
              'border border-dashed border-[#d6d3d1] rounded-lg',
              isCollapsed && 'px-2'
            )}
          >
            {isCollapsed ? (
              <ChevronRight className="h-4 w-4" />
            ) : (
              <>
                <ChevronLeft className="h-4 w-4" />
                <span>Collapse</span>
              </>
            )}
          </button>
        </div>
      </motion.aside>
    </>
  );
};

export { Sidebar };
