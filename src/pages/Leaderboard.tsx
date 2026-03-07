import { useCRM } from '@/context/CRMContext';
import { MOCK_USERS } from '@/types/crm';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Trophy } from 'lucide-react';

const Leaderboard = () => {
  const { leads } = useCRM();

  const telecallers = MOCK_USERS.filter(u => u.role === 'telecaller');
  const rankings = telecallers.map(tc => {
    const assigned = leads.filter(l => l.assignedTo === tc.id);
    return {
      ...tc,
      total: assigned.length,
      converted: assigned.filter(l => l.status === 'Converted').length,
      contacted: assigned.filter(l => l.status !== 'New').length,
    };
  }).sort((a, b) => b.converted - a.converted || b.contacted - a.contacted);

  return (
    <div className="space-y-6 animate-fade-in">
      <h1 className="text-3xl font-bold">Leaderboard</h1>
      <div className="space-y-3">
        {rankings.map((tc, i) => (
          <Card key={tc.id} className="bg-card border-border">
            <CardContent className="py-4 flex items-center gap-4">
              <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-lg ${i === 0 ? 'bg-primary/20 text-primary' : 'bg-secondary text-muted-foreground'}`}>
                {i === 0 ? <Trophy className="h-5 w-5" /> : i + 1}
              </div>
              <div className="flex-1">
                <p className="font-semibold">{tc.name}</p>
              </div>
              <div className="flex gap-6 text-sm">
                <div className="text-center">
                  <p className="font-bold text-primary">{tc.converted}</p>
                  <p className="text-xs text-muted-foreground">Converted</p>
                </div>
                <div className="text-center">
                  <p className="font-bold">{tc.contacted}</p>
                  <p className="text-xs text-muted-foreground">Contacted</p>
                </div>
                <div className="text-center">
                  <p className="font-bold">{tc.total}</p>
                  <p className="text-xs text-muted-foreground">Total</p>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default Leaderboard;
