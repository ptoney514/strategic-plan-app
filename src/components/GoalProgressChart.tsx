import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from 'recharts';
import type { HierarchicalGoal } from '../lib/types';
import { calculateGoalProgress, getGoalStatus } from '../lib/types';

interface GoalProgressChartProps {
  goals: HierarchicalGoal[];
  variant?: 'bar' | 'pie';
}

export function GoalProgressChart({ goals, variant = 'bar' }: GoalProgressChartProps) {
  const chartData = goals.map(goal => ({
    name: `Goal ${goal.goal_number}`,
    title: goal.title.length > 30 ? goal.title.substring(0, 30) + '...' : goal.title,
    progress: calculateGoalProgress(goal),
    status: getGoalStatus(goal),
  }));

  const statusColors = {
    'on-track': '#10b981',
    'at-risk': '#f59e0b',
    'critical': '#ef4444',
    'completed': '#3b82f6',
  };

  const RADIAN = Math.PI / 180;
  const renderCustomizedLabel = ({
    cx, cy, midAngle, innerRadius, outerRadius, percent
  }: any) => {
    const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
    const x = cx + radius * Math.cos(-midAngle * RADIAN);
    const y = cy + radius * Math.sin(-midAngle * RADIAN);

    return (
      <text 
        x={x} 
        y={y} 
        fill="white" 
        textAnchor={x > cx ? 'start' : 'end'} 
        dominantBaseline="central"
        className="text-xs font-medium"
      >
        {`${(percent * 100).toFixed(0)}%`}
      </text>
    );
  };

  if (variant === 'pie') {
    const statusData = goals.reduce((acc, goal) => {
      const status = getGoalStatus(goal);
      const existing = acc.find(item => item.name === status);
      if (existing) {
        existing.value += 1;
      } else {
        acc.push({ 
          name: status, 
          value: 1,
          label: status.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase())
        });
      }
      return acc;
    }, [] as { name: string; value: number; label: string }[]);

    return (
      <div className="w-full h-64">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={statusData}
              cx="50%"
              cy="50%"
              labelLine={false}
              label={renderCustomizedLabel}
              outerRadius={80}
              fill="#8884d8"
              dataKey="value"
            >
              {statusData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={statusColors[entry.name as keyof typeof statusColors]} />
              ))}
            </Pie>
            <Tooltip 
              formatter={(value: any) => [`${value} goals`, '']}
              contentStyle={{ 
                backgroundColor: 'hsl(var(--card))',
                border: '1px solid hsl(var(--border))',
                borderRadius: '0.5rem'
              }}
            />
            <Legend 
              formatter={(value: string) => value.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase())}
              wrapperStyle={{ paddingTop: '1rem' }}
            />
          </PieChart>
        </ResponsiveContainer>
      </div>
    );
  }

  return (
    <div className="w-full h-64">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
          <XAxis 
            dataKey="name" 
            stroke="hsl(var(--muted-foreground))"
            fontSize={12}
          />
          <YAxis 
            stroke="hsl(var(--muted-foreground))"
            fontSize={12}
            domain={[0, 100]}
            ticks={[0, 25, 50, 75, 100]}
          />
          <Tooltip 
            contentStyle={{ 
              backgroundColor: 'hsl(var(--card))',
              border: '1px solid hsl(var(--border))',
              borderRadius: '0.5rem'
            }}
            labelStyle={{ color: 'hsl(var(--card-foreground))' }}
            formatter={(value: any) => [`${value}%`, 'Progress']}
            labelFormatter={(label) => {
              const goal = chartData.find(d => d.name === label);
              return goal?.title || label;
            }}
          />
          <Bar 
            dataKey="progress" 
            fill="hsl(var(--primary))"
            radius={[4, 4, 0, 0]}
          />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}