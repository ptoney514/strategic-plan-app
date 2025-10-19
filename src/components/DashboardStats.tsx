import React from 'react';
import { Target, TrendingUp, AlertCircle, CheckCircle } from 'lucide-react';
import type { HierarchicalGoal } from '../lib/types';
import { calculateGoalProgress, getGoalStatus } from '../lib/types';

interface DashboardStatsProps {
  goals: HierarchicalGoal[];
}

export function DashboardStats({ goals }: DashboardStatsProps) {
  // Calculate statistics
  const totalGoals = goals.length;
  const avgProgress = goals.length > 0 
    ? Math.round(goals.reduce((sum, goal) => sum + calculateGoalProgress(goal), 0) / goals.length)
    : 0;
  
  const statusCounts = goals.reduce((acc, goal) => {
    const status = getGoalStatus(goal);
    acc[status] = (acc[status] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const stats = [
    {
      label: 'Total Goals',
      value: totalGoals,
      icon: Target,
      color: 'text-primary',
      bgColor: 'bg-primary/10',
    },
    {
      label: 'Average Progress',
      value: `${avgProgress}%`,
      icon: TrendingUp,
      color: 'text-blue-600',
      bgColor: 'bg-blue-100',
    },
    {
      label: 'On Track',
      value: statusCounts['on-track'] || 0,
      icon: CheckCircle,
      color: 'text-green-600',
      bgColor: 'bg-green-100',
    },
    {
      label: 'At Risk',
      value: statusCounts['at-risk'] || 0,
      icon: AlertCircle,
      color: 'text-yellow-600',
      bgColor: 'bg-yellow-100',
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {stats.map((stat, index) => {
        const Icon = stat.icon;
        return (
          <div key={index} className="bg-card border border-border rounded-lg p-6">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">{stat.label}</p>
                <p className="text-2xl font-bold text-card-foreground mt-1">{stat.value}</p>
              </div>
              <div className={`p-2 rounded-lg ${stat.bgColor}`}>
                <Icon className={`h-5 w-5 ${stat.color}`} />
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}