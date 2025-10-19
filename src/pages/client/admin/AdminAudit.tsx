import React, { useState } from 'react';
import { useParams } from 'react-router-dom';
import { 
  FileText, 
  User, 
  Calendar,
  Filter,
  Download,
  ChevronDown,
  ChevronUp,
  Edit,
  Trash2,
  Upload,
  CheckCircle,
  AlertCircle
} from 'lucide-react';
import { useDistrict } from '../../../hooks/useDistricts';

interface AuditEntry {
  id: string;
  timestamp: string;
  user: string;
  action: string;
  entity: string;
  entityName: string;
  oldValue?: string;
  newValue?: string;
  reason?: string;
  ipAddress?: string;
}

// Mock audit data for demonstration
const mockAuditData: AuditEntry[] = [
  {
    id: '1',
    timestamp: '2024-01-15T10:30:00',
    user: 'admin@district.edu',
    action: 'update',
    entity: 'goal',
    entityName: '1.1 Culture & Belonging',
    oldValue: 'off-target',
    newValue: 'on-target',
    reason: 'December intervention programs showing strong early results',
    ipAddress: '192.168.1.100'
  },
  {
    id: '2',
    timestamp: '2024-01-15T09:15:00',
    user: 'data@district.edu',
    action: 'import',
    entity: 'metric',
    entityName: 'Bulk Import - Q4 Data',
    newValue: '24 metrics updated',
    ipAddress: '192.168.1.101'
  },
  {
    id: '3',
    timestamp: '2024-01-14T16:45:00',
    user: 'admin@district.edu',
    action: 'update',
    entity: 'metric_value',
    entityName: 'Belonging Score',
    oldValue: '3.72',
    newValue: '3.74',
    ipAddress: '192.168.1.100'
  },
  {
    id: '4',
    timestamp: '2024-01-14T14:20:00',
    user: 'finance@district.edu',
    action: 'create',
    entity: 'metric',
    entityName: 'Budget Utilization Rate',
    newValue: 'New metric added',
    ipAddress: '192.168.1.105'
  }
];

export function AdminAudit() {
  const { slug } = useParams();
  const { district } = useDistrict(slug!);
  const [auditEntries] = useState<AuditEntry[]>(mockAuditData);
  const [expandedEntry, setExpandedEntry] = useState<string | null>(null);
  const [filterUser, setFilterUser] = useState<string>('all');
  const [filterAction, setFilterAction] = useState<string>('all');
  const [filterEntity, setFilterEntity] = useState<string>('all');
  const [dateRange, setDateRange] = useState<string>('7days');
  
  const getActionIcon = (action: string) => {
    switch (action) {
      case 'create':
        return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'update':
        return <Edit className="h-4 w-4 text-blue-600" />;
      case 'delete':
        return <Trash2 className="h-4 w-4 text-red-600" />;
      case 'import':
        return <Upload className="h-4 w-4 text-purple-600" />;
      default:
        return <AlertCircle className="h-4 w-4 text-gray-600" />;
    }
  };
  
  const getActionColor = (action: string) => {
    switch (action) {
      case 'create':
        return 'bg-green-100 text-green-800';
      case 'update':
        return 'bg-blue-100 text-blue-800';
      case 'delete':
        return 'bg-red-100 text-red-800';
      case 'import':
        return 'bg-purple-100 text-purple-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };
  
  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    
    if (diffHours < 1) {
      const diffMins = Math.floor(diffMs / (1000 * 60));
      return `${diffMins} minutes ago`;
    } else if (diffHours < 24) {
      return `${diffHours} hours ago`;
    } else if (diffHours < 48) {
      return 'Yesterday';
    } else {
      return date.toLocaleDateString();
    }
  };
  
  const handleExportAudit = () => {
    // TODO: Implement CSV export of audit log
    console.log('Exporting audit log...');
  };
  
  // Filter audit entries based on selected filters
  const filteredEntries = auditEntries.filter(entry => {
    if (filterUser !== 'all' && entry.user !== filterUser) return false;
    if (filterAction !== 'all' && entry.action !== filterAction) return false;
    if (filterEntity !== 'all' && entry.entity !== filterEntity) return false;
    // Add date range filtering logic here
    return true;
  });
  
  // Get unique values for filters
  const uniqueUsers = Array.from(new Set(auditEntries.map(e => e.user)));
  const uniqueActions = Array.from(new Set(auditEntries.map(e => e.action)));
  const uniqueEntities = Array.from(new Set(auditEntries.map(e => e.entity)));
  
  return (
    
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground">
              Audit Trail
            </h1>
            <p className="text-muted-foreground mt-1">
              Track all changes and data modifications
            </p>
          </div>
          <button
            onClick={handleExportAudit}
            className="px-4 py-2 border border-border rounded-md hover:bg-muted flex items-center space-x-2"
          >
            <Download className="h-4 w-4" />
            <span>Export Audit Log</span>
          </button>
        </div>
        
        {/* Filters */}
        <div className="bg-card rounded-lg border border-border p-4">
          <div className="flex items-center mb-3">
            <Filter className="h-5 w-5 mr-2 text-muted-foreground" />
            <span className="font-medium">Filters</span>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">User</label>
              <select
                value={filterUser}
                onChange={(e) => setFilterUser(e.target.value)}
                className="w-full px-3 py-2 border border-border rounded-md bg-background"
              >
                <option value="all">All Users</option>
                {uniqueUsers.map(user => (
                  <option key={user} value={user}>{user}</option>
                ))}
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-1">Action</label>
              <select
                value={filterAction}
                onChange={(e) => setFilterAction(e.target.value)}
                className="w-full px-3 py-2 border border-border rounded-md bg-background"
              >
                <option value="all">All Actions</option>
                {uniqueActions.map(action => (
                  <option key={action} value={action}>
                    {action.charAt(0).toUpperCase() + action.slice(1)}
                  </option>
                ))}
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-1">Entity Type</label>
              <select
                value={filterEntity}
                onChange={(e) => setFilterEntity(e.target.value)}
                className="w-full px-3 py-2 border border-border rounded-md bg-background"
              >
                <option value="all">All Entities</option>
                {uniqueEntities.map(entity => (
                  <option key={entity} value={entity}>
                    {entity.replace('_', ' ').charAt(0).toUpperCase() + entity.slice(1)}
                  </option>
                ))}
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-1">Date Range</label>
              <select
                value={dateRange}
                onChange={(e) => setDateRange(e.target.value)}
                className="w-full px-3 py-2 border border-border rounded-md bg-background"
              >
                <option value="today">Today</option>
                <option value="7days">Last 7 Days</option>
                <option value="30days">Last 30 Days</option>
                <option value="90days">Last 90 Days</option>
                <option value="all">All Time</option>
              </select>
            </div>
          </div>
        </div>
        
        {/* Audit Entries */}
        <div className="bg-card rounded-lg border border-border">
          <div className="divide-y divide-border">
            {filteredEntries.map(entry => (
              <div key={entry.id} className="p-4 hover:bg-muted/30">
                <div className="flex items-start justify-between">
                  <div className="flex items-start space-x-3">
                    {getActionIcon(entry.action)}
                    <div className="flex-1">
                      <div className="flex items-center space-x-2">
                        <span className={`px-2 py-0.5 text-xs font-medium rounded-full ${getActionColor(entry.action)}`}>
                          {entry.action}
                        </span>
                        <span className="text-sm font-medium">
                          {entry.entityName}
                        </span>
                        <span className="text-xs text-muted-foreground">
                          ({entry.entity})
                        </span>
                      </div>
                      
                      <div className="flex items-center space-x-4 mt-1 text-sm text-muted-foreground">
                        <div className="flex items-center space-x-1">
                          <User className="h-3 w-3" />
                          <span>{entry.user}</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <Calendar className="h-3 w-3" />
                          <span>{formatTimestamp(entry.timestamp)}</span>
                        </div>
                        {entry.ipAddress && (
                          <span className="text-xs">IP: {entry.ipAddress}</span>
                        )}
                      </div>
                      
                      {/* Change Details */}
                      {(entry.oldValue || entry.newValue) && (
                        <div className="mt-2 text-sm">
                          {entry.oldValue && entry.newValue && (
                            <div className="flex items-center space-x-2">
                              <span className="px-2 py-1 bg-red-100 text-red-700 rounded">
                                {entry.oldValue}
                              </span>
                              <span>→</span>
                              <span className="px-2 py-1 bg-green-100 text-green-700 rounded">
                                {entry.newValue}
                              </span>
                            </div>
                          )}
                          {!entry.oldValue && entry.newValue && (
                            <span className="text-green-600">
                              {entry.newValue}
                            </span>
                          )}
                        </div>
                      )}
                      
                      {/* Reason/Notes */}
                      {entry.reason && (
                        <div className="mt-2 p-2 bg-muted/50 rounded text-sm">
                          <span className="font-medium">Reason: </span>
                          {entry.reason}
                        </div>
                      )}
                    </div>
                  </div>
                  
                  <button
                    onClick={() => setExpandedEntry(expandedEntry === entry.id ? null : entry.id)}
                    className="p-1 hover:bg-muted rounded"
                  >
                    {expandedEntry === entry.id ? 
                      <ChevronUp className="h-4 w-4" /> : 
                      <ChevronDown className="h-4 w-4" />
                    }
                  </button>
                </div>
                
                {/* Expanded Details */}
                {expandedEntry === entry.id && (
                  <div className="mt-4 pl-10 text-sm text-muted-foreground">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="font-medium">Full Timestamp</p>
                        <p>{new Date(entry.timestamp).toLocaleString()}</p>
                      </div>
                      <div>
                        <p className="font-medium">Session ID</p>
                        <p className="font-mono text-xs">sess_2024_abc123xyz</p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
        
        {/* Summary Statistics */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-card rounded-lg border border-border p-4">
            <p className="text-sm text-muted-foreground">Total Changes Today</p>
            <p className="text-2xl font-bold mt-1">24</p>
          </div>
          <div className="bg-card rounded-lg border border-border p-4">
            <p className="text-sm text-muted-foreground">Active Users</p>
            <p className="text-2xl font-bold mt-1">5</p>
          </div>
          <div className="bg-card rounded-lg border border-border p-4">
            <p className="text-sm text-muted-foreground">Data Imports</p>
            <p className="text-2xl font-bold mt-1">3</p>
          </div>
          <div className="bg-card rounded-lg border border-border p-4">
            <p className="text-sm text-muted-foreground">Status Overrides</p>
            <p className="text-2xl font-bold mt-1">7</p>
          </div>
        </div>
      </div>
    
  );
}