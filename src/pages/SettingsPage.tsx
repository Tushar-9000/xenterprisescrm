import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Settings } from 'lucide-react';

const SettingsPage = () => {
  return (
    <div className="space-y-6 animate-fade-in">
      <h1 className="text-3xl font-bold">Settings</h1>
      <Card className="bg-card border-border">
        <CardHeader><CardTitle className="flex items-center gap-2"><Settings className="h-5 w-5" /> System Configuration</CardTitle></CardHeader>
        <CardContent>
          <p className="text-muted-foreground">System settings will be available in future updates.</p>
        </CardContent>
      </Card>
    </div>
  );
};

export default SettingsPage;
