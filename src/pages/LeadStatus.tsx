import { useState } from 'react';
import { useCRM } from '@/context/CRMContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { LeadStatus as LeadStatusType } from '@/types/crm';
import { Users, Phone, Building2, ArrowLeft, Search } from 'lucide-react';

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
  const [searchQuery, setSearchQuery] = useState('');

  const statusCounts = STATUSES.map(s => ({ status: s, count: leads.filter(l => l.status === s).length }));

  const q = searchQuery.toLowerCase();
  const filteredLeads = q
    ? leads.filter(l =>
        l.name.toLowerCase().includes(q) ||
        l.phone.includes(searchQuery) ||
        (l.company || '').toLowerCase().includes(q) ||
        l.status.toLowerCase().includes(q) ||
        (users.find(u => u.id === l.assignedTo)?.name || '').toLowerCase().includes(q)
      )
    : leads;

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="icon" onClick={() => window.history.back()}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div>
          <h1 className="text-3xl font-bold">Lead Status Overview</h1>
          <p className="text-muted-foreground mt-1">{leads.length} total leads</p>
        </div>
      </div>

      {/* Status summary cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
        {statusCounts.map(({ status, count }) => (
          <Card key={status} className="bg-card border-border cursor-pointer hover:border-primary/50 transition-colors" onClick={() => setSearchQuery(status)}>
            <CardContent className="p-4 text-center">
              <Badge variant="outline" className={STATUS_COLORS[status]}>{status}</Badge>
              <p className="text-2xl font-bold mt-2">{count}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Search bar */}
      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input placeholder="Search leads by name, phone, company, status..." value={searchQuery} onChange={e => setSearchQuery(e.target.value)} className="pl-9" />
      </div>

      {/* Leads table */}
      <Card className="bg-card border-border">
        <CardHeader>
          <CardTitle className="text-lg">All Leads {q && `(${filteredLeads.length} results)`}</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left py-3 px-4 text-muted-foreground font-medium">Name</th>
                  <th className="text-left py-3 px-4 text-muted-foreground font-medium">Phone</th>
                  <th className="text-left py-3 px-4 text-muted-foreground font-medium">Company</th>
                  <th className="text-left py-3 px-4 text-muted-foreground font-medium">Assigned To</th>
                  <th className="text-left py-3 px-4 text-muted-foreground font-medium">Status</th>
                </tr>
              </thead>
              <tbody>
                {filteredLeads.length === 0 ? (
                  <tr><td colSpan={5} className="text-center py-8 text-muted-foreground">{q ? 'No matching leads found' : 'No leads found'}</td></tr>
                ) : filteredLeads.map(lead => {
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
