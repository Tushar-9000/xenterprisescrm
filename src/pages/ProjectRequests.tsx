import { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useCRM } from '@/context/CRMContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';
import { CheckCircle2, XCircle, Clock, FileText, User as UserIcon, Mail, Phone, ArrowLeft } from 'lucide-react';

const ProjectRequests = () => {
  const { user } = useAuth();
  const { projectRequests, approveProjectRequest, rejectProjectRequest, users } = useCRM();
  const [rejectOpen, setRejectOpen] = useState<string | null>(null);
  const [rejectReason, setRejectReason] = useState('');

  if (!user) return null;

  const isAdmin = user.role === 'admin';
  const pending = projectRequests.filter(r => r.status === 'pending');
  const processed = projectRequests.filter(r => r.status !== 'pending');

  const handleApprove = (requestId: string) => {
    approveProjectRequest(requestId);
    toast.success('Project request approved and assigned to Tech Lead');
  };

  const handleReject = () => {
    if (!rejectOpen || !rejectReason.trim()) {
      toast.error('Please provide a reason for rejection');
      return;
    }
    rejectProjectRequest(rejectOpen, rejectReason.trim());
    setRejectOpen(null);
    setRejectReason('');
    toast.success('Project request rejected');
  };

  const getRequesterName = (id: string) => users.find(u => u.id === id)?.name || 'Unknown';

  const statusBadge = (status: string) => {
    const styles: Record<string, string> = {
      pending: 'bg-warning/10 text-warning border-warning/20',
      approved: 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20',
      rejected: 'bg-destructive/10 text-destructive border-destructive/20',
    };
    return <Badge variant="outline" className={styles[status] || ''}>{status.charAt(0).toUpperCase() + status.slice(1)}</Badge>;
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="icon" onClick={() => window.history.back()}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div>
          <h1 className="text-3xl font-bold">Project Requests</h1>
          <p className="text-muted-foreground mt-1">
            {isAdmin ? `${pending.length} pending approval` : `${projectRequests.filter(r => r.requestedBy === user.id).length} requests submitted`}
          </p>
        </div>
      </div>

      {/* Pending Requests */}
      {pending.length > 0 && (
        <div className="space-y-3">
          <h2 className="text-lg font-semibold flex items-center gap-2">
            <Clock className="h-5 w-5 text-warning" /> Pending Approval
          </h2>
          <div className="grid gap-4">
            {pending.map(request => (
              <Card key={request.id} className="bg-card border-border border-l-4 border-l-warning">
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle className="text-lg">{request.projectName}</CardTitle>
                      <p className="text-sm text-muted-foreground mt-1">
                        Requested by <span className="font-medium text-foreground">{getRequesterName(request.requestedBy)}</span>
                      </p>
                    </div>
                    {statusBadge(request.status)}
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-sm">
                    <div className="flex items-center gap-2">
                      <UserIcon className="h-4 w-4 text-muted-foreground" />
                      <span>{request.clientName}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Mail className="h-4 w-4 text-muted-foreground" />
                      <span>{request.clientEmail}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Phone className="h-4 w-4 text-muted-foreground" />
                      <span>{request.clientPhone || '—'}</span>
                    </div>
                  </div>
                  {request.description && (
                    <div className="bg-secondary/50 rounded-md p-3 text-sm">
                      <p className="text-muted-foreground text-xs mb-1">Description</p>
                      <p>{request.description}</p>
                    </div>
                  )}
                  <p className="text-xs text-muted-foreground">
                    Lead: {request.leadName} · Submitted {new Date(request.createdAt).toLocaleDateString()}
                  </p>
                  {isAdmin && (
                    <div className="flex gap-2 pt-2">
                      <Button onClick={() => handleApprove(request.id)} className="gap-1">
                        <CheckCircle2 className="h-4 w-4" /> Approve & Assign to Tech Lead
                      </Button>
                      <Button variant="destructive" onClick={() => { setRejectOpen(request.id); setRejectReason(''); }} className="gap-1">
                        <XCircle className="h-4 w-4" /> Reject
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Processed */}
      {processed.length > 0 && (
        <div className="space-y-3">
          <h2 className="text-lg font-semibold flex items-center gap-2">
            <FileText className="h-5 w-5 text-muted-foreground" /> Processed Requests
          </h2>
          <div className="grid gap-3">
            {processed.map(request => (
              <Card key={request.id} className={`bg-card border-border border-l-4 ${request.status === 'approved' ? 'border-l-emerald-500' : 'border-l-destructive'}`}>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-semibold">{request.projectName}</p>
                      <p className="text-sm text-muted-foreground">{request.clientName} · by {getRequesterName(request.requestedBy)}</p>
                      {request.rejectionReason && (
                        <p className="text-sm text-destructive mt-1">Reason: {request.rejectionReason}</p>
                      )}
                    </div>
                    {statusBadge(request.status)}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {projectRequests.length === 0 && (
        <Card className="bg-card border-border">
          <CardContent className="py-12 text-center text-muted-foreground">
            <FileText className="h-12 w-12 mx-auto mb-3 opacity-50" />
            No project requests yet. Requests are created when leads are converted.
          </CardContent>
        </Card>
      )}

      {/* Reject Dialog */}
      <Dialog open={!!rejectOpen} onOpenChange={(o) => { if (!o) setRejectOpen(null); }}>
        <DialogContent className="bg-card border-border">
          <DialogHeader><DialogTitle>Reject Project Request</DialogTitle></DialogHeader>
          <Textarea placeholder="Reason for rejection..." value={rejectReason} onChange={e => setRejectReason(e.target.value)} />
          <Button variant="destructive" onClick={handleReject}>Reject Request</Button>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ProjectRequests;
