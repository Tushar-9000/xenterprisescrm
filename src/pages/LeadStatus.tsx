import { useCRM } from '@/context/CRMContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { LeadStatus as LeadStatusType } from '@/types/crm';
import { Users, Phone, Building2 } from 'lucide-react';

const STATUS_COLORS: Record<LeadStatusType, string> = {
  'New': 'bg-blue-500/10 text-blue-500 border-blue-500/20',
  'Contacted': 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20',
  'Follow-up': 'bg-orange-500/10 text-orange-500 border-orange-500/20',
  'Interested': 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20',
  'Not Interested': 'bg-destructive/10 text-destructive border-destructive/20',
  'Converted': 'bg-primary/10 text-primary border-primary/20',
};

const STATUSES: LeadStatusType[] = ['New', 'Contacted', 'Follow-up', 'Interested', 'Not Interested', 'Converted'];

const LeadStatus = () => {
  const { leads, users } = useCRM();

  const statusCounts = STATUSES.map(s => ({ status: s, count: leads.filter(l => l.status === s).length }));

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-3xl font-bold">Lead Status Overview</h1>
        <p className="text-muted-foreground mt-1">{leads.length} total leads</p>
      </div>

      {/* Status summary cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
        {statusCounts.map(({ status, count }) => (
          <Card key={status} className="bg-card border-border">
            <CardContent className="p-4 text-center">
              <Badge variant="outline" className={STATUS_COLORS[status]}>{status}</Badge>
              <p className="text-2xl font-bold mt-2">{count}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Leads table */}
      <Card className="bg-card border-border">
        <CardHeader>
          <CardTitle className="text-lg">All Leads</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left py-3 px-4 text-muted-foreground font-medium">Name</th>
                  <th className="text-left py-3 px-4 text-muted-foreground font-medium">Phone</th>
                  <th className="text-left py-3 px-4 text-muted-foreground font-medium">Company</th>
                  <th className="text-left py-3 px-4 text-muted-foreground font-medium">Source</th>
                  <th className="text-left py-3 px-4 text-muted-foreground font-medium">Assigned To</th>
                  <th className="text-left py-3 px-4 text-muted-foreground font-medium">Status</th>
                </tr>
              </thead>
              <tbody>
                {leads.length === 0 ? (
                  <tr><td colSpan={6} className="text-center py-8 text-muted-foreground">No leads found</td></tr>
                ) : leads.map(lead => {
                  const assignee = users.find(u => u.id === lead.assignedTo);
                  return (
                    <tr key={lead.id} className="border-b border-border/50 hover:bg-secondary/30 transition-colors">
                      <td className="py-3 px-4 font-medium flex items-center gap-2">
                        <Users className="h-4 w-4 text-muted-foreground" />
                        {lead.name}
                      </td>
                      <td className="py-3 px-4">
                        <span className="flex items-center gap-1"><Phone className="h-3 w-3 text-muted-foreground" />{lead.phone}</span>
                      </td>
                      <td className="py-3 px-4">
                        {lead.company ? <span className="flex items-center gap-1"><Building2 className="h-3 w-3 text-muted-foreground" />{lead.company}</span> : <span className="text-muted-foreground">—</span>}
                      </td>
                      <td className="py-3 px-4 text-muted-foreground">{lead.source || '—'}</td>
                      <td className="py-3 px-4 text-muted-foreground">{assignee?.name || 'Unassigned'}</td>
                      <td className="py-3 px-4">
                        <Badge variant="outline" className={STATUS_COLORS[lead.status]}>{lead.status}</Badge>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default LeadStatus;
