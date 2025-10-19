import React, { useState, useEffect } from 'react';
import { Target, Plus, Edit2, Save, X } from 'lucide-react';
import { useUpdateGoal } from '../../hooks';
import { MetricsSection } from './MetricsSection';
import { StrategicObjectiveEditor } from './StrategicObjectiveEditor';
import { ActiveComponentsPanel } from './ActiveComponentsPanel';
import type { Goal } from '../../lib/types';

interface GoalDetailPanelProps {
  goal: Goal | null;
  districtSlug: string;
  onRefresh: () => void;
}

export function GoalDetailPanel({ goal, districtSlug, onRefresh }: GoalDetailPanelProps) {
  const updateGoalMutation = useUpdateGoal();
  const [isEditing, setIsEditing] = useState(false);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [indicatorText, setIndicatorText] = useState('');
  const [indicatorColor, setIndicatorColor] = useState('#10b981');
  const [showProgressBar, setShowProgressBar] = useState(true);
  const [headerColor, setHeaderColor] = useState<string | null>(null);
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (goal) {
      console.log('[GoalDetailPanel] Selected goal:', {
        id: goal.id,
        goal_number: goal.goal_number,
        title: goal.title,
        level: goal.level,
        metrics_count: goal.metrics?.length || 0
      });
      setTitle(goal.title || '');
      setDescription(goal.description || '');
      setIndicatorText(goal.indicator_text || '');
      setIndicatorColor(goal.indicator_color || '#10b981');
      setShowProgressBar(goal.show_progress_bar !== false);
      setHeaderColor(goal.header_color || null);
      setImageUrl(goal.image_url || null);
      setIsEditing(false);
    }
  }, [goal]);

  const handleSave = async () => {
    if (!goal || !title.trim()) return;

    setIsSaving(true);
    try {
      const updates: any = {
        title: title.trim(),
        description: description.trim(),
        indicator_text: indicatorText || undefined,
        indicator_color: indicatorColor || undefined,
        show_progress_bar: showProgressBar
      };

      // Add header fields for strategic objectives
      if (goal.level === 0) {
        updates.header_color = headerColor;
        updates.image_url = imageUrl;
      }

      await updateGoalMutation.mutateAsync({
        id: goal.id,
        updates
      });
      setIsEditing(false);
      onRefresh();
    } catch (error) {
      console.error('Failed to update goal:', error);
      alert('Failed to update goal');
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancel = () => {
    if (goal) {
      setTitle(goal.title || '');
      setDescription(goal.description || '');
      setIndicatorText(goal.indicator_text || '');
      setIndicatorColor(goal.indicator_color || '#10b981');
      setShowProgressBar(goal.show_progress_bar !== false);
      setHeaderColor(goal.header_color || null);
      setImageUrl(goal.image_url || null);
    }
    setIsEditing(false);
  };

  if (!goal) {
    return (
      <div className="flex-1 bg-white flex items-center justify-center">
        <div className="text-center px-8 max-w-md">
          <div className="mx-auto h-20 w-20 rounded-full bg-gray-50 flex items-center justify-center mb-6">
            <Target className="h-10 w-10 text-gray-300" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            No objective selected
          </h3>
          <p className="text-sm text-gray-500">
            Select a strategic objective or goal from the left panel to view its details and metrics
          </p>
        </div>
      </div>
    );
  }

  const activeComponents = [
    { id: 'title', label: 'Title', sublabel: goal?.title || 'Test Objective', enabled: !!title },
    { id: 'description', label: 'Description', sublabel: goal?.description?.substring(0, 20) || '', enabled: !!description },
    { id: 'header', label: 'Header Visual', enabled: !!(headerColor || imageUrl) },
    { id: 'progressBar', label: 'Progress Bar', sublabel: 'Enabled', enabled: showProgressBar },
    { id: 'visualBadge', label: 'Visual Badge', enabled: !!indicatorText },
  ];

  const handleComponentToggle = (componentId: string) => {
    switch (componentId) {
      case 'progressBar':
        setShowProgressBar(!showProgressBar);
        break;
      case 'visualBadge':
        if (!indicatorText) {
          setIndicatorText('On Track');
        } else {
          setIndicatorText('');
        }
        break;
    }
  };

  return (
    <div className="flex-1 bg-white overflow-hidden flex">
      <div className="flex-1 overflow-y-auto">
        <div className="max-w-3xl mx-auto p-6">
        {/* Header Section */}
        <div className="mb-8">
          <div className="flex items-start justify-between mb-4">
            <div className="flex-1">
              {/* Visual Badge */}
              {indicatorText && !isEditing && (
                <div className="mb-3">
                  <span
                    className="inline-flex items-center gap-1.5 rounded-full text-xs font-medium px-3 py-1"
                    style={{
                      backgroundColor: indicatorColor,
                      color: '#ffffff'
                    }}
                  >
                    <span className="h-1.5 w-1.5 rounded-full bg-white/80"></span>
                    {indicatorText}
                  </span>
                </div>
              )}

              {/* Goal Number & Title */}
              {isEditing ? (
                <div className="space-y-3">
                  <input
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className="w-full text-2xl font-bold px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Goal title"
                  />
                  <textarea
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Goal description"
                  />

                  {/* Strategic Objective Header Editor - Only for level 0 */}
                  {goal.level === 0 && (
                    <StrategicObjectiveEditor
                      objective={{
                        ...goal,
                        header_color: headerColor,
                        image_url: imageUrl
                      }}
                      isEditing={isEditing}
                      onUpdate={(updates) => {
                        if (updates.header_color !== undefined) setHeaderColor(updates.header_color);
                        if (updates.image_url !== undefined) setImageUrl(updates.image_url);
                      }}
                    />
                  )}

                  {/* Editing controls */}
                  <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg">
                    <div className="flex-1">
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Badge Text
                      </label>
                      <input
                        type="text"
                        value={indicatorText}
                        onChange={(e) => setIndicatorText(e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                        placeholder="e.g., On Track, Featured"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Badge Color
                      </label>
                      <input
                        type="color"
                        value={indicatorColor}
                        onChange={(e) => setIndicatorColor(e.target.value)}
                        className="h-10 w-20 rounded border border-gray-300 cursor-pointer"
                      />
                    </div>
                    <div className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        id="show-progress"
                        checked={showProgressBar}
                        onChange={(e) => setShowProgressBar(e.target.checked)}
                        className="rounded border-gray-300"
                      />
                      <label htmlFor="show-progress" className="text-sm font-medium text-gray-700">
                        Show Progress Bar
                      </label>
                    </div>
                  </div>
                </div>
              ) : (
                <>
                  <h1 className="text-3xl font-bold text-gray-900 mb-2">
                    {goal.goal_number}. {goal.title}
                  </h1>
                  {goal.description && (
                    <p className="text-gray-600 text-lg">
                      {goal.description}
                    </p>
                  )}
                </>
              )}
            </div>

            {/* Action Buttons */}
            <div className="flex items-center gap-2 ml-4">
              {isEditing ? (
                <>
                  <button
                    onClick={handleCancel}
                    disabled={isSaving}
                    className="px-4 py-2 text-sm border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors flex items-center gap-2"
                  >
                    <X className="w-4 h-4" />
                    Cancel
                  </button>
                  <button
                    onClick={handleSave}
                    disabled={isSaving}
                    className="px-4 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2 disabled:opacity-50"
                  >
                    <Save className="w-4 h-4" />
                    {isSaving ? 'Saving...' : 'Save Changes'}
                  </button>
                </>
              ) : (
                <button
                  onClick={() => setIsEditing(true)}
                  className="px-4 py-2 text-sm border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors flex items-center gap-2"
                >
                  <Edit2 className="w-4 h-4" />
                  Edit Goal
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Metrics Section - Only show for Goals (level 1+), not Strategic Objectives (level 0) */}
        {goal.level > 0 && (
          <div className="border-t border-gray-200 pt-8">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-xl font-semibold text-gray-900">Metrics & Visualizations</h2>
                <p className="text-sm text-gray-500 mt-1">
                  Add charts, graphs, and data visualizations to track this goal
                </p>
              </div>
            </div>

            <MetricsSection
              goalId={goal.id}
              metrics={goal.metrics || []}
              onRefresh={onRefresh}
            />
          </div>
        )}

        {/* Progress Bar Section - Only show for Strategic Objectives (level 0) */}
        {goal.level === 0 && (
          <div className="border-t border-gray-200 pt-8">
            <div className="mb-6">
              <h2 className="text-xl font-semibold text-gray-900">Overall Progress</h2>
              <p className="text-sm text-gray-500 mt-1">
                Progress is calculated from child goals
              </p>
            </div>

            {/* Show progress bar if enabled */}
            {goal.show_progress_bar && (
              <div className="bg-gray-50 rounded-lg p-6">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-gray-700">Overall Progress</span>
                  <span className="text-sm font-semibold text-gray-900">
                    {goal.overall_progress || 0}%
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-3">
                  <div
                    className="bg-blue-600 h-3 rounded-full transition-all duration-300"
                    style={{ width: `${goal.overall_progress || 0}%` }}
                  />
                </div>
              </div>
            )}

            {/* Show child goals */}
            {goal.children && goal.children.length > 0 && (
              <div className="mt-8">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Goals</h3>
                <div className="space-y-3">
                  {goal.children.map((child) => (
                    <div
                      key={child.id}
                      className="p-4 border border-gray-200 rounded-lg hover:border-blue-300 transition-colors"
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <h4 className="font-medium text-gray-900">
                            {child.goal_number}. {child.title}
                          </h4>
                          {child.description && (
                            <p className="text-sm text-gray-600 mt-1">{child.description}</p>
                          )}
                          <div className="flex items-center gap-3 mt-2">
                            <span className="text-xs text-gray-500">
                              {child.metrics?.length || 0} metrics
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
        </div>
      </div>

      {/* Active Components Panel - Only show when editing */}
      {isEditing && (
        <ActiveComponentsPanel
          components={activeComponents}
          onToggle={handleComponentToggle}
        />
      )}
    </div>
  );
}
