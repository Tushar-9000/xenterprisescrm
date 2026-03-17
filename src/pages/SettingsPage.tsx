import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Settings, ArrowLeft } from 'lucide-react';

const SettingsPage = () => {
  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="icon" onClick={() => window.history.back()}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <h1 className="text-3xl font-bold">Settings</h1>
      </div>
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
