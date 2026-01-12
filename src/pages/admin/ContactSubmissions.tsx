import { useState } from 'react';
import {
  MessageSquare,
  Search,
  Loader2,
  Trash2,
  CheckCircle2,
  Clock,
  Mail,
  Phone,
  Building2,
  Calendar,
  X,
} from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import {
  useContactSubmissions,
  useUpdateContactSubmissionStatus,
  useDeleteContactSubmission,
} from '../../hooks/useContactSubmissions';
import type { ContactSubmission } from '../../lib/services/contact.service';

const STATUS_OPTIONS = ['new', 'contacted', 'converted', 'closed'] as const;

const STATUS_COLORS: Record<string, { bg: string; text: string; icon: typeof Clock }> = {
  new: { bg: 'bg-blue-100', text: 'text-blue-700', icon: Clock },
  contacted: { bg: 'bg-yellow-100', text: 'text-yellow-700', icon: Mail },
  converted: { bg: 'bg-green-100', text: 'text-green-700', icon: CheckCircle2 },
  closed: { bg: 'bg-gray-100', text: 'text-gray-700', icon: X },
};

/**
 * ContactSubmissions - View and manage contact form submissions
 * Only accessible to system administrators
 */
export function ContactSubmissions() {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const { data: submissions = [], isLoading, error } = useContactSubmissions();
  const updateStatusMutation = useUpdateContactSubmissionStatus();
  const deleteMutation = useDeleteContactSubmission();

  // Filter submissions
  const filteredSubmissions = submissions.filter((sub) => {
    const matchesSearch =
      searchTerm === '' ||
      sub.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      sub.first_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      sub.last_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      sub.organization.toLowerCase().includes(searchTerm.toLowerCase()) ||
      sub.topic.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus = statusFilter === 'all' || sub.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  // Calculate stats
  const stats = {
    total: submissions.length,
    new: submissions.filter((s) => s.status === 'new').length,
    contacted: submissions.filter((s) => s.status === 'contacted').length,
    converted: submissions.filter((s) => s.status === 'converted').length,
  };

  const handleStatusChange = (id: string, status: string) => {
    updateStatusMutation.mutate({ id, status });
  };

  const handleDelete = (id: string) => {
    deleteMutation.mutate(id, {
      onSuccess: () => setDeleteConfirm(null),
    });
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
    });
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <Loader2 className="h-12 w-12 animate-spin text-primary mx-auto mb-4" />
          <p className="text-muted-foreground">Loading contact submissions...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-6 text-center">
        <p className="text-destructive font-medium">Failed to load contact submissions</p>
        <p className="text-sm text-destructive/80 mt-1">{(error as Error).message}</p>
      </div>
    );
  }

  return (
    <div>
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-foreground">Contact Submissions</h1>
        <p className="text-muted-foreground mt-2">
          View and manage contact form submissions from the marketing site
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-card border border-border rounded-lg p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Total</p>
              <p className="text-3xl font-bold text-foreground mt-1">{stats.total}</p>
            </div>
            <MessageSquare className="h-12 w-12 text-primary opacity-50" />
          </div>
        </div>
        <div className="bg-card border border-border rounded-lg p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">New</p>
              <p className="text-3xl font-bold text-blue-600 mt-1">{stats.new}</p>
            </div>
            <Clock className="h-12 w-12 text-blue-600 opacity-50" />
          </div>
        </div>
        <div className="bg-card border border-border rounded-lg p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Contacted</p>
              <p className="text-3xl font-bold text-yellow-600 mt-1">{stats.contacted}</p>
            </div>
            <Mail className="h-12 w-12 text-yellow-600 opacity-50" />
          </div>
        </div>
        <div className="bg-card border border-border rounded-lg p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Converted</p>
              <p className="text-3xl font-bold text-green-600 mt-1">{stats.converted}</p>
            </div>
            <CheckCircle2 className="h-12 w-12 text-green-600 opacity-50" />
          </div>
        </div>
      </div>

      {/* Search and Filter */}
      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            type="text"
            placeholder="Search by name, email, organization..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="px-4 py-2 border border-border rounded-lg bg-card text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20"
        >
          <option value="all">All Status</option>
          {STATUS_OPTIONS.map((status) => (
            <option key={status} value={status}>
              {status.charAt(0).toUpperCase() + status.slice(1)}
            </option>
          ))}
        </select>
      </div>

      {/* Submissions List */}
      {filteredSubmissions.length === 0 ? (
        <div className="bg-card border border-border rounded-lg p-12 text-center">
          <MessageSquare className="h-16 w-16 text-muted-foreground/30 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-foreground mb-2">No submissions found</h3>
          <p className="text-muted-foreground">
            {submissions.length === 0
              ? 'Contact form submissions will appear here.'
              : 'Try adjusting your search or filter criteria.'}
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredSubmissions.map((submission) => (
            <SubmissionCard
              key={submission.id}
              submission={submission}
              isExpanded={expandedId === submission.id}
              onToggleExpand={() =>
                setExpandedId(expandedId === submission.id ? null : submission.id)
              }
              onStatusChange={handleStatusChange}
              onDelete={() => setDeleteConfirm(submission.id)}
              isDeleting={deleteConfirm === submission.id}
              onConfirmDelete={() => handleDelete(submission.id)}
              onCancelDelete={() => setDeleteConfirm(null)}
              formatDate={formatDate}
            />
          ))}
        </div>
      )}
    </div>
  );
}

interface SubmissionCardProps {
  submission: ContactSubmission;
  isExpanded: boolean;
  onToggleExpand: () => void;
  onStatusChange: (id: string, status: string) => void;
  onDelete: () => void;
  isDeleting: boolean;
  onConfirmDelete: () => void;
  onCancelDelete: () => void;
  formatDate: (date: string) => string;
}

function SubmissionCard({
  submission,
  isExpanded,
  onToggleExpand,
  onStatusChange,
  onDelete,
  isDeleting,
  onConfirmDelete,
  onCancelDelete,
  formatDate,
}: SubmissionCardProps) {
  const statusConfig = STATUS_COLORS[submission.status] || STATUS_COLORS.new;
  const StatusIcon = statusConfig.icon;

  return (
    <div className="bg-card border border-border rounded-lg overflow-hidden">
      {/* Header Row */}
      <div
        className="p-4 cursor-pointer hover:bg-muted/50 transition-colors"
        onClick={onToggleExpand}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div
              className={`px-3 py-1 rounded-full text-xs font-medium flex items-center gap-1.5 ${statusConfig.bg} ${statusConfig.text}`}
            >
              <StatusIcon className="h-3 w-3" />
              {submission.status.charAt(0).toUpperCase() + submission.status.slice(1)}
            </div>
            <div>
              <p className="font-medium text-foreground">
                {submission.first_name} {submission.last_name}
              </p>
              <p className="text-sm text-muted-foreground">{submission.email}</p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <div className="text-right hidden sm:block">
              <p className="text-sm font-medium text-foreground">{submission.topic}</p>
              <p className="text-xs text-muted-foreground">{formatDate(submission.created_at)}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Expanded Details */}
      {isExpanded && (
        <div className="border-t border-border p-4 bg-muted/30">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div className="flex items-center gap-2 text-sm">
              <Building2 className="h-4 w-4 text-muted-foreground" />
              <span className="text-muted-foreground">Organization:</span>
              <span className="text-foreground font-medium">{submission.organization}</span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <Calendar className="h-4 w-4 text-muted-foreground" />
              <span className="text-muted-foreground">Topic:</span>
              <span className="text-foreground font-medium">{submission.topic}</span>
            </div>
            {submission.phone && (
              <div className="flex items-center gap-2 text-sm">
                <Phone className="h-4 w-4 text-muted-foreground" />
                <span className="text-muted-foreground">Phone:</span>
                <a
                  href={`tel:${submission.phone}`}
                  className="text-primary hover:underline font-medium"
                >
                  {submission.phone}
                </a>
              </div>
            )}
            <div className="flex items-center gap-2 text-sm">
              <Mail className="h-4 w-4 text-muted-foreground" />
              <span className="text-muted-foreground">Email:</span>
              <a
                href={`mailto:${submission.email}`}
                className="text-primary hover:underline font-medium"
              >
                {submission.email}
              </a>
            </div>
          </div>

          {submission.message && (
            <div className="mb-4">
              <p className="text-sm text-muted-foreground mb-1">Message:</p>
              <p className="text-sm text-foreground bg-card border border-border rounded-lg p-3">
                {submission.message}
              </p>
            </div>
          )}

          {/* Actions */}
          <div className="flex flex-wrap items-center justify-between gap-4 pt-4 border-t border-border">
            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground">Status:</span>
              <select
                value={submission.status}
                onChange={(e) => onStatusChange(submission.id, e.target.value)}
                className="px-3 py-1.5 text-sm border border-border rounded-lg bg-card text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20"
              >
                {STATUS_OPTIONS.map((status) => (
                  <option key={status} value={status}>
                    {status.charAt(0).toUpperCase() + status.slice(1)}
                  </option>
                ))}
              </select>
            </div>

            {isDeleting ? (
              <div className="flex items-center gap-2">
                <span className="text-sm text-destructive">Delete this submission?</span>
                <Button variant="destructive" size="sm" onClick={onConfirmDelete}>
                  Yes, Delete
                </Button>
                <Button variant="outline" size="sm" onClick={onCancelDelete}>
                  Cancel
                </Button>
              </div>
            ) : (
              <Button
                variant="ghost"
                size="sm"
                onClick={(e) => {
                  e.stopPropagation();
                  onDelete();
                }}
                className="text-destructive hover:text-destructive hover:bg-destructive/10"
              >
                <Trash2 className="h-4 w-4 mr-1" />
                Delete
              </Button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
