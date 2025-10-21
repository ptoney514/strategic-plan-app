import { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useGoal, useChildGoals } from '../../../hooks/useGoals';
import { useMetrics } from '../../../hooks/useMetrics';
import { ChevronLeft, Target, TrendingUp, BarChart2, Edit2 } from 'lucide-react';
import { MetricsChart } from '../../../components/MetricsChart';
import { GoalEditWizard } from '../../../components/GoalEditWizard';
import { LikertScaleChart } from '../../../components/LikertScaleChart';
import { calculateGoalProgress, getGoalStatus } from '../../../lib/types';

export function GoalDetail() {
  const { slug, goalId } = useParams<{ slug: string; goalId: string }>();
  const { data: goal, isLoading: goalLoading, refetch: refetchGoal } = useGoal(goalId!);
  const { data: metrics, isLoading: metricsLoading } = useMetrics(goalId!);
  const { data: childGoals, isLoading: childrenLoading } = useChildGoals(goalId!);
  const [showEditModal, setShowEditModal] = useState(false);

  const isLoading = goalLoading || metricsLoading || childrenLoading;

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-muted-foreground">Loading goal details...</p>
        </div>
      </div>
    );
  }

  if (!goal) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <p className="text-xl text-muted-foreground">Goal not found</p>
          <Link to={`/${slug}`} className="mt-4 inline-flex items-center text-primary hover:underline">
            <ChevronLeft className="h-4 w-4 mr-1" />
            Back to district
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border bg-card">
        <div className="container mx-auto px-6 py-6">
          <Link to={`/${slug}`} className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground mb-4">
            <ChevronLeft className="h-4 w-4 mr-1" />
            Back to district dashboard
          </Link>
          
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <span className="text-sm font-medium text-muted-foreground">
                {goal.level === 0 ? 'Strategic Objective' : goal.level === 1 ? 'Goal' : 'Sub-goal'} {goal.goal_number}
              </span>
              <h1 className="text-3xl font-bold text-card-foreground mt-1">
                {goal.title}
              </h1>
              {goal.description && (
                <p className="text-muted-foreground mt-2">
                  {goal.description}
                </p>
              )}
            </div>
            <button
              onClick={() => setShowEditModal(true)}
              className="ml-4 flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition"
            >
              <Edit2 className="h-4 w-4" />
              Edit Goal
            </button>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-6 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
            {/* Metrics Chart - exclude Likert metrics as they have their own visualization */}
            {(() => {
              const chartMetrics = metrics?.filter(m => {
                const isLikert = m.visualization_type === 'bar' &&
                                m.visualization_config &&
                                (m.visualization_config as any).scaleMin;
                return !isLikert;
              }) || [];

              return chartMetrics.length > 0 && (
                <div className="bg-card rounded-lg border border-border p-6">
                  <h2 className="text-xl font-semibold text-card-foreground mb-4">
                    <BarChart2 className="inline h-5 w-5 mr-2" />
                    Metrics Performance
                  </h2>
                  <MetricsChart metrics={chartMetrics} variant="line" />
                </div>
              );
            })()}

            {/* Metrics Details */}
            <div className="bg-card rounded-lg border border-border p-6">
              <h2 className="text-xl font-semibold text-card-foreground mb-4">
                Metrics Details
              </h2>
              
              {!metrics || metrics.length === 0 ? (
                <p className="text-muted-foreground">No metrics defined for this goal</p>
              ) : (
                <div className="space-y-6">
                  {metrics.map((metric) => {
                    const progress = metric.target_value
                      ? Math.round((metric.current_value || 0) / metric.target_value * 100)
                      : 0;

                    // Check if this is a Likert scale metric
                    const isLikertScale = metric.visualization_type === 'bar' &&
                                        metric.visualization_config &&
                                        (metric.visualization_config as any).scaleMin;

                    if (isLikertScale) {
                      const config = metric.visualization_config as any;
                      const dataPoints = config.dataPoints || [];
                      const likertData = dataPoints.map((dp: any) => ({
                        year: dp.label,
                        value: dp.value || 0
                      }));

                      return (
                        <div key={metric.id} className="border border-border rounded-lg p-4">
                          <h3 className="font-medium text-card-foreground mb-4">
                            {metric.name}
                          </h3>
                          {metric.description && (
                            <p className="text-sm text-muted-foreground mb-4">
                              {metric.description}
                            </p>
                          )}
                          <LikertScaleChart
                            data={likertData}
                            scaleMin={config.scaleMin || 1}
                            scaleMax={config.scaleMax || 5}
                            scaleLabel={config.scaleLabel || '(5 high)'}
                            targetValue={config.targetValue}
                            showAverage={config.showAverage !== false}
                          />
                        </div>
                      );
                    }

                    // Check if this is a Ratio metric
                    const isRatio = metric.visualization_type === 'number' &&
                                   metric.visualization_config &&
                                   (metric.visualization_config as any)._frontendType === 'ratio';

                    if (isRatio) {
                      const config = metric.visualization_config as any;
                      const fullDisplay = config.label
                        ? `${config.label}${config.ratioValue || '1.0:1'}`
                        : config.ratioValue || '1.0:1';

                      return (
                        <div key={metric.id} className="border border-border rounded-lg p-4">
                          <h3 className="font-medium text-card-foreground mb-4">
                            {metric.name}
                          </h3>
                          {metric.description && (
                            <p className="text-sm text-muted-foreground mb-4">
                              {metric.description}
                            </p>
                          )}
                          <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
                            <p className="text-sm text-neutral-600 mb-2">Ratio</p>
                            <p className="text-3xl font-bold text-neutral-900">{fullDisplay}</p>
                            {config.showTarget && config.targetValue && (
                              <p className="text-sm text-neutral-500 mt-2">
                                Target: {config.label}{config.targetValue}
                              </p>
                            )}
                          </div>
                        </div>
                      );
                    }

                    // Check if this is a Number/KPI metric
                    const isNumber = metric.visualization_type === 'number' &&
                                    metric.visualization_config &&
                                    (metric.visualization_config as any)._frontendType === 'number';

                    if (isNumber) {
                      const config = metric.visualization_config as any;
                      const decimals = config.decimals ?? 0;
                      const formattedValue = typeof config.currentValue === 'number'
                        ? config.currentValue.toFixed(decimals)
                        : config.currentValue || '0';
                      const valueWithUnit = config.unit
                        ? `${formattedValue}${config.unit}`
                        : formattedValue;
                      const fullDisplay = config.label
                        ? `${config.label} - ${valueWithUnit}`
                        : valueWithUnit;

                      return (
                        <div key={metric.id} className="border border-border rounded-lg p-4">
                          <h3 className="font-medium text-card-foreground mb-4">
                            {metric.name}
                          </h3>
                          {metric.description && (
                            <p className="text-sm text-muted-foreground mb-4">
                              {metric.description}
                            </p>
                          )}
                          <div className="bg-white border border-border rounded-lg p-6">
                            <p className="text-sm text-neutral-600 mb-2">Current Value</p>
                            <p className="text-4xl font-bold text-neutral-900">{fullDisplay}</p>
                            {config.targetValue && (
                              <p className="text-sm text-neutral-500 mt-2">
                                Target: {config.targetValue.toFixed(decimals)}{config.unit || ''}
                              </p>
                            )}
                          </div>
                        </div>
                      );
                    }

                    // Check if this is a Narrative/Rich Text metric
                    const isNarrative = metric.visualization_type === 'blog' &&
                                       metric.visualization_config &&
                                       (metric.visualization_config as any)._frontendType === 'narrative';

                    if (isNarrative) {
                      const config = metric.visualization_config as any;

                      return (
                        <div key={metric.id} className="border border-border rounded-lg p-4">
                          <h3 className="font-medium text-card-foreground mb-4">
                            {metric.name}
                          </h3>
                          {metric.description && (
                            <p className="text-sm text-muted-foreground mb-4">
                              {metric.description}
                            </p>
                          )}
                          <div className="prose prose-sm max-w-none">
                            {config.showTitle && config.title && (
                              <h4 className="text-lg font-semibold mb-2">{config.title}</h4>
                            )}
                            <div
                              dangerouslySetInnerHTML={{ __html: config.content || '<p>No content available</p>' }}
                              style={{ lineHeight: '1.7' }}
                            />
                          </div>
                        </div>
                      );
                    }

                    // Default metric rendering (progress bar)
                    return (
                      <div key={metric.id} className="border-l-4 border-primary pl-4">
                        <h3 className="font-medium text-card-foreground">
                          {metric.name}
                        </h3>
                        {metric.description && (
                          <p className="text-sm text-muted-foreground mt-1">
                            {metric.description}
                          </p>
                        )}
                        <div className="flex items-center gap-4 mt-2">
                          <div>
                            <span className="text-sm text-muted-foreground">Current: </span>
                            <span className="font-medium">
                              {metric.current_value || 0} {metric.unit}
                            </span>
                          </div>
                          <div>
                            <span className="text-sm text-muted-foreground">Target: </span>
                            <span className="font-medium">
                              {metric.target_value || 0} {metric.unit}
                            </span>
                          </div>
                          <div>
                            <span className="text-sm text-muted-foreground">Progress: </span>
                            <span className="font-medium">
                              {progress}%
                            </span>
                          </div>
                        </div>
                        <div className="mt-2">
                          <div className="w-full bg-secondary rounded-full h-2 overflow-hidden">
                            <div
                              className="h-full bg-primary transition-all duration-300 ease-out"
                              style={{ width: `${Math.min(progress, 100)}%` }}
                            />
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>

          <div className="space-y-6">
            <div className="bg-card rounded-lg border border-border p-6">
              <h3 className="text-lg font-semibold text-card-foreground mb-4">
                Goal Information
              </h3>
              <dl className="space-y-3">
                {goal.owner_name && (
                  <>
                    <dt className="text-sm text-muted-foreground">Owner</dt>
                    <dd className="font-medium">{goal.owner_name}</dd>
                  </>
                )}
                {goal.department && (
                  <>
                    <dt className="text-sm text-muted-foreground">Department</dt>
                    <dd className="font-medium">{goal.department}</dd>
                  </>
                )}
                {goal.priority && (
                  <>
                    <dt className="text-sm text-muted-foreground">Priority</dt>
                    <dd className="font-medium capitalize">{goal.priority}</dd>
                  </>
                )}
                {goal.status_detail && (
                  <>
                    <dt className="text-sm text-muted-foreground">Status</dt>
                    <dd className="font-medium capitalize">{goal.status_detail.replace('_', ' ')}</dd>
                  </>
                )}
              </dl>
            </div>
          </div>
        </div>
      </main>

      {/* Goal Edit Wizard */}
      <GoalEditWizard
        goal={goal}
        isOpen={showEditModal}
        onClose={() => setShowEditModal(false)}
        onSuccess={() => {
          refetchGoal();
        }}
      />
    </div>
  );
}