import { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useTheme } from '@/context/ThemeContext';
import { MOCK_USERS, ROLE_LABELS, UserRole } from '@/types/crm';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { Moon, Sun, BarChart3, Users, FolderOpen, TrendingUp, Eye, EyeOff } from 'lucide-react';

const ROLE_ORDER: UserRole[] = ['admin', 'tech_lead', 'sales_manager', 'telecaller'];

const HIGHLIGHTS = [
  { icon: BarChart3, text: 'Lead pipeline & tracking' },
  { icon: Users, text: 'Role-based team management' },
  { icon: FolderOpen, text: 'Project-wise lead folders' },
  { icon: TrendingUp, text: 'Performance analytics' },
];

const Login = () => {
  const { login } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!login(email, password)) {
      toast.error('Invalid credentials. Try one of the quick login options.');
    }
  };

  return (
    <div className="flex min-h-screen relative">
      {/* Theme toggle */}
      <button
        onClick={toggleTheme}
        className="absolute top-5 right-5 z-50 p-2.5 rounded-full bg-card border border-border text-foreground hover:bg-muted transition-colors"
        aria-label="Toggle theme"
      >
        {theme === 'dark' ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
      </button>

      {/* Left side - Branding */}
      <div className="hidden lg:flex lg:flex-1 flex-col justify-center px-16 bg-background">
        <div className="animate-fade-in max-w-md">
          <h1 className="text-5xl font-extrabold tracking-tight mb-3">
            X Enterprise <span className="text-primary">CRM</span>
          </h1>
          <p className="text-muted-foreground text-lg mb-10">
            Real estate CRM for modern teams.
          </p>

          <div className="space-y-4 mb-10">
            {HIGHLIGHTS.map((h) => (
              <div key={h.text} className="flex items-center gap-3">
                <div className="rounded-md bg-primary/10 p-2">
                  <h.icon className="h-4 w-4 text-primary" />
                </div>
                <p className="text-sm text-foreground">{h.text}</p>
              </div>
            ))}
          </div>

          <div className="flex flex-wrap gap-2">
            <span className="text-xs text-muted-foreground mr-1 self-center">Built for:</span>
            {ROLE_ORDER.map((role) => (
              <span
                key={role}
                className="rounded-full border border-border bg-secondary px-3 py-1 text-xs font-medium text-secondary-foreground"
              >
                {ROLE_LABELS[role]}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* Right side - Login form */}
      <div className="flex flex-1 items-center justify-center p-8 lg:flex-none lg:w-[480px] bg-login-card">
        <div className="w-full max-w-sm animate-fade-in" style={{ animationDelay: '0.1s' }}>
          {/* Mobile logo */}
          <div className="lg:hidden text-center mb-6">
            <h1 className="text-2xl font-bold text-login-card-foreground">
              X Enterprise <span className="text-primary">CRM</span>
            </h1>
          </div>

          <h2 className="text-3xl font-bold text-login-card-foreground text-center">Welcome Back</h2>
          <p className="mt-2 text-sm text-muted-foreground text-center mb-8">
            Sign in to access your dashboard
          </p>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="text-sm font-medium text-login-card-foreground">Name</label>
              <Input
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Your name"
                className="mt-1 bg-secondary/10 border-border text-login-card-foreground placeholder:text-muted-foreground"
              />
            </div>
            <div>
              <label className="text-sm font-medium text-login-card-foreground">Email Address</label>
              <Input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="admin@enterprisecrm.com"
                className="mt-1 bg-secondary/10 border-border text-login-card-foreground placeholder:text-muted-foreground"
              />
            </div>
            <div>
              <label className="text-sm font-medium text-login-card-foreground">Password</label>
              <div className="relative mt-1">
                <Input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="bg-secondary/10 border-border text-login-card-foreground placeholder:text-muted-foreground pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            <Button type="submit" className="w-full mt-2 bg-primary text-primary-foreground hover:bg-primary/90 font-semibold py-5">
              Sign In
            </Button>
          </form>

          {/* Quick login */}
          <div className="mt-8 space-y-1">
            <p className="text-xs text-muted-foreground mb-2 text-center uppercase tracking-wider">Quick fill by role</p>
            {MOCK_USERS.map((u) => (
              <button
                key={u.id}
                onClick={() => {
                  setName(u.name);
                  setEmail(u.email);
                  setPassword('password123');
                }}
                className="w-full flex items-center justify-between px-4 py-3 rounded-md text-login-card-foreground hover:bg-secondary/10 transition-colors group"
              >
                <span className="font-medium text-sm">{u.name}</span>
                <span className="text-xs text-primary opacity-70 group-hover:opacity-100 transition-opacity">{ROLE_LABELS[u.role]}</span>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
