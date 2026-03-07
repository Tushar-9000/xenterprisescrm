import { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { MOCK_USERS, ROLE_LABELS, UserRole } from '@/types/crm';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

const ROLE_ORDER: UserRole[] = ['admin', 'tech_lead', 'sales_manager', 'telecaller'];

const Login = () => {
  const { login, loginAs } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!login(email, password)) {
      toast.error('Invalid credentials. Try one of the quick login options.');
    }
  };

  return (
    <div className="flex min-h-screen">
      {/* Left side - Branding */}
      <div className="hidden lg:flex lg:flex-1 flex-col justify-center px-16 bg-background">
        <div className="animate-fade-in">
          <h1 className="text-5xl font-extrabold tracking-tight mb-12">
            X Enterprise <span className="text-primary">CRM</span>
          </h1>

          <div className="grid grid-cols-2 gap-4 max-w-lg">
            {ROLE_ORDER.map((role) => (
              <div
                key={role}
                className="rounded-lg border border-border bg-card p-5 transition-colors hover:border-primary/40"
              >
                <span className="text-xs font-medium uppercase tracking-wider text-primary">
                  Role
                </span>
                <p className="mt-1 text-lg font-semibold text-foreground">
                  {ROLE_LABELS[role]}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Right side - Login form */}
      <div className="flex flex-1 items-center justify-center p-8 lg:flex-none lg:w-[480px] bg-login-card">
        <div className="w-full max-w-sm animate-fade-in" style={{ animationDelay: '0.1s' }}>
          <h2 className="text-3xl font-bold text-login-card-foreground text-center">Sign In</h2>
          <p className="mt-2 text-sm text-muted-foreground text-center mb-8">
            Access your enterprise dashboard
          </p>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="text-sm font-medium text-login-card-foreground">Name</label>
              <Input
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Your name"
                className="mt-1 bg-secondary/10 border-border text-login-card-foreground"
              />
            </div>
            <div>
              <label className="text-sm font-medium text-login-card-foreground">Email Address</label>
              <Input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="admin@enterprisecrm.com"
                className="mt-1 bg-secondary/10 border-border text-login-card-foreground"
              />
            </div>
            <div>
              <label className="text-sm font-medium text-login-card-foreground">Password</label>
              <Input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="mt-1 bg-secondary/10 border-border text-login-card-foreground"
              />
            </div>

            <Button type="submit" className="w-full mt-2 bg-background text-foreground hover:bg-background/90 font-semibold py-5">
              Sign In
            </Button>
          </form>

          {/* Quick login */}
          <div className="mt-8 space-y-1">
            {MOCK_USERS.map((user) => (
              <button
                key={user.id}
                onClick={() => loginAs(user)}
                className="w-full flex items-center justify-between px-4 py-3 rounded-md text-login-card-foreground hover:bg-secondary/10 transition-colors"
              >
                <span className="font-medium text-sm">{user.name}</span>
                <span className="text-xs text-primary">{ROLE_LABELS[user.role]}</span>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
