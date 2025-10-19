import React from 'react';

interface GoalCardProps {
  title: string;
  description: string;
  progress: number;
  status: 'on-track' | 'at-risk' | 'completed';
}

export function GoalCard({ title, description, progress, status }: GoalCardProps) {
  const statusColors = {
    'on-track': 'bg-green-100 text-green-800 border-green-200',
    'at-risk': 'bg-yellow-100 text-yellow-800 border-yellow-200',
    'completed': 'bg-blue-100 text-blue-800 border-blue-200'
  };

  return (
    <div className="bg-card rounded-lg border border-border p-6 shadow-sm hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between mb-4">
        <h3 className="text-lg font-semibold text-card-foreground">{title}</h3>
        <span className={`px-2 py-1 rounded-md text-sm font-medium border ${statusColors[status]}`}>
          {status.replace('-', ' ')}
        </span>
      </div>
      
      <p className="text-muted-foreground mb-4">{description}</p>
      
      <div className="space-y-2">
        <div className="flex justify-between text-sm">
          <span className="text-muted-foreground">Progress</span>
          <span className="font-medium text-card-foreground">{progress}%</span>
        </div>
        <div className="w-full bg-secondary rounded-full h-2 overflow-hidden">
          <div 
            className="h-full bg-primary transition-all duration-300 ease-out"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>
    </div>
  );
}