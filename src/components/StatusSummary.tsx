import React from 'react';
import { Target, AlertCircle, CheckCircle, Clock, XCircle } from 'lucide-react';
import type { Goal } from '../lib/types';

interface StatusSummaryProps {
  goals: Goal[];
  metrics?: any[];
}

export function StatusSummary({ goals, metrics = [] }: StatusSummaryProps) {
  // Count goals by status
  const statusCounts = goals.reduce((acc, goal) => {
    const status = goal.status || 'not-started';
    acc[status] = (acc[status] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const totalGoals = goals.length;
  const totalMetrics = metrics.length;

  const statusConfig = [
    { 
      key: 'on-target', 
      label: 'On Target', 
      color: 'bg-green-500',
      lightColor: 'bg-green-50 text-green-700',
      icon: CheckCircle 
    },
    { 
      key: 'monitoring', 
      label: 'Monitoring', 
      color: 'bg-amber-500',
      lightColor: 'bg-amber-50 text-amber-700',
      icon: AlertCircle 
    },
    { 
      key: 'critical', 
      label: 'Critical', 
      color: 'bg-red-500',
      lightColor: 'bg-red-50 text-red-700',
      icon: XCircle 
    },
    { 
      key: 'off-target', 
      label: 'Off Target', 
      color: 'bg-orange-500',
      lightColor: 'bg-orange-50 text-orange-700',
      icon: AlertCircle 
    },
    { 
      key: 'not-started', 
      label: 'Not Started', 
      color: 'bg-gray-500',
      lightColor: 'bg-gray-50 text-gray-700',
      icon: Clock 
    }
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
      {/* Total Goals Card */}
      <div className="bg-card rounded-lg border border-border p-4">
        <div className="flex items-center justify-between mb-2">
          <Target className="h-5 w-5 text-muted-foreground" />
        </div>
        <p className="text-2xl font-bold text-card-foreground">{totalGoals}</p>
        <p className="text-sm text-muted-foreground">Total Goals</p>
      </div>

      {/* Status Cards */}
      {statusConfig.map(({ key, label, lightColor, icon: Icon }) => {
        const count = statusCounts[key] || 0;
        if (count === 0 && key !== 'on-target') return null; // Hide empty statuses except on-target
        
        return (
          <div key={key} className="bg-card rounded-lg border border-border p-4">
            <div className="flex items-center justify-between mb-2">
              <Icon className="h-5 w-5 text-muted-foreground" />
            </div>
            <p className="text-2xl font-bold text-card-foreground">{count}</p>
            <p className="text-sm text-muted-foreground">{label}</p>
          </div>
        );
      })}
    </div>
  );
}