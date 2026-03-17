import { useAuth } from '@/context/AuthContext';
import { useTheme } from '@/context/ThemeContext';
import { useCRM } from '@/context/CRMContext';
import { ROLE_LABELS } from '@/types/crm';
import { Link, useLocation } from 'react-router-dom';
import {
  LayoutDashboard, Users, FolderKanban, Bell, Trophy,
  Settings, LogOut, Phone, UserCircle, Moon, Sun, FileCheck, History
} from 'lucide-react';

const Sidebar = () => {
  const { user: authUser, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const { getUnreadCount, users } = useCRM();
  const location = useLocation();

  if (!authUser) return null;

  const user = users.find(u => u.id === authUser.id) || authUser;
  const unread = getUnreadCount(user.id);
  const navItems = getNavItems(user.role);

  return (
    <aside className="w-64 min-h-screen bg-sidebar flex flex-col border-r border-sidebar-border">
      <div className="p-6 flex items-center justify-between">
        <h1 className="text-xl font-bold text-sidebar-foreground">
          X Enterprise <span className="text-sidebar-primary">CRM</span>
        </h1>
        <button
          onClick={toggleTheme}
          className="p-2 rounded-md text-sidebar-foreground hover:bg-sidebar-accent transition-colors"
          aria-label="Toggle theme"
        >
          {theme === 'dark' ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
        </button>
      </div>

      <nav className="flex-1 px-3 space-y-1">
        {navItems.map((item) => {
          const isActive = location.pathname === item.path;
          return (
            <Link
              key={item.path}
              to={item.path}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-md text-sm font-medium transition-colors ${
                isActive
                  ? 'bg-sidebar-accent text-sidebar-primary'
                  : 'text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground'
              }`}
            >
              <item.icon className="h-4 w-4" />
              {item.label}
              {item.label === 'Notifications' && unread > 0 && (
                <span className="ml-auto bg-primary text-primary-foreground text-xs rounded-full px-2 py-0.5">
                  {unread}
                </span>
              )}
            </Link>
          );
        })}
      </nav>

      <div className="p-4 border-t border-sidebar-border">
        <Link
          to="/profile"
          className={`flex items-center gap-3 px-3 py-2 rounded-md transition-colors ${
            location.pathname === '/profile' ? 'bg-sidebar-accent' : 'hover:bg-sidebar-accent'
          }`}
        >
          {user.profilePic ? (
            <img src={user.profilePic} alt={user.name} className="h-8 w-8 rounded-full object-cover" />
          ) : (
            <UserCircle className="h-8 w-8 text-sidebar-foreground" />
          )}
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-sidebar-foreground truncate">{user.name}</p>
            <p className="text-xs text-primary">{ROLE_LABELS[user.role]}</p>
          </div>
        </Link>
        <button
          onClick={logout}
          className="mt-2 flex items-center gap-3 px-3 py-2 w-full rounded-md text-sm text-sidebar-foreground hover:bg-sidebar-accent transition-colors"
        >
          <LogOut className="h-4 w-4" />
          Sign Out
        </button>
      </div>
    </aside>
  );
};

function getNavItems(role: string) {
  const common = [
    { path: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  ];

  switch (role) {
    case 'admin':
      return [...common,
        { path: '/leads', label: 'All Leads', icon: Phone },
        { path: '/project-requests', label: 'Project Requests', icon: FileCheck },
        { path: '/projects', label: 'Projects', icon: FolderKanban },
        { path: '/developers', label: 'Developers', icon: UserCircle },
        { path: '/users', label: 'User Management', icon: Users },
        { path: '/notifications', label: 'Notifications', icon: Bell },
        { path: '/settings', label: 'Settings', icon: Settings },
      ];
    case 'sales_manager':
      return [...common,
        { path: '/leads', label: 'Leads', icon: Phone },
        { path: '/leaderboard', label: 'Leaderboard', icon: Trophy },
        { path: '/notifications', label: 'Notifications', icon: Bell },
      ];
    case 'telecaller':
      return [...common,
        { path: '/my-leads', label: 'My Leads', icon: Phone },
        { path: '/notifications', label: 'Notifications', icon: Bell },
      ];
    case 'tech_lead':
      return [...common,
        { path: '/projects', label: 'Projects', icon: FolderKanban },
        { path: '/lead-status', label: 'Lead Status', icon: Phone },
        { path: '/notifications', label: 'Notifications', icon: Bell },
      ];
    default:
      return common;
  }
}

export default Sidebar;
