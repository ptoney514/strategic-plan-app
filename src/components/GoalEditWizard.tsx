import React, { useEffect, useState } from 'react';
import { X, ChevronLeft, ChevronRight, Check, Target, Flag, Zap, Users, Building2, AlertCircle, BarChart3, Plus, Edit2, Trash2, HelpCircle } from 'lucide-react';
import { Button, Input, Textarea, Label, Badge } from './ui';
import { useUpdateGoal } from '../hooks/useGoals';
import { useCreateMetric, useUpdateMetric, useDeleteMetric } from '../hooks/useMetrics';
import { toast } from './Toast';
import type { Goal, Metric, TimeSeriesDataPoint, ChartType } from '../lib/types';
import { ChartTypePicker } from './ChartTypePicker';
import { TimeSeriesDataEntry } from './TimeSeriesDataEntry';

interface GoalEditWizardProps {
  goal: Goal | null;
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

type WizardStep = 1 | 2 | 3 | 4;

export function GoalEditWizard({
  goal,
  isOpen,
  onClose,
  onSuccess
}: GoalEditWizardProps) {
  const updateGoalMutation = useUpdateGoal();
  const createMetricMutation = useCreateMetric();
  const updateMetricMutation = useUpdateMetric();
  const deleteMetricMutation = useDeleteMetric();

  const [currentStep, setCurrentStep] = useState<WizardStep>(1);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    owner_name: '',
    department: '',
    priority: ''
  });

  // Metric management state
  const [editingMetricIndex, setEditingMetricIndex] = useState<number | null>(null);
  const [metricForm, setMetricForm] = useState({
    metric_name: '',
    description: '',
    target_value: '',
    current_value: '',
    unit: '%',
    data_source: 'manual' as const,
    metric_type: 'percentage' as const
  });
  const [localMetrics, setLocalMetrics] = useState<Metric[]>([]);
  const [metricChartType, setMetricChartType] = useState<ChartType | undefined>();
  const [metricDataPoints, setMetricDataPoints] = useState<TimeSeriesDataPoint[]>([]);
  const [showMeasureHelp, setShowMeasureHelp] = useState(false);

  useEffect(() => {
    if (goal) {
      setFormData({
        title: goal.title || '',
        description: goal.description || '',
        owner_name: goal.owner_name || '',
        department: goal.department || '',
        priority: goal.priority || ''
      });
      setLocalMetrics(goal.metrics || []);
      setCurrentStep(1);
    }
  }, [goal]);

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const getGoalTypeInfo = () => {
    if (!goal) return { icon: null, label: '', color: '' };
    if (goal.level === 0) return {
      icon: <Target className="h-5 w-5" />,
      label: 'Strategic Objective',
      color: 'text-blue-600'
    };
    if (goal.level === 1) return {
      icon: <Flag className="h-5 w-5" />,
      label: 'Goal',
      color: 'text-green-600'
    };
    return {
      icon: <Zap className="h-5 w-5" />,
      label: 'Sub-goal',
      color: 'text-purple-600'
    };
  };

  const handleNext = () => {
    if (currentStep < 4) {
      setCurrentStep((currentStep + 1) as WizardStep);
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep((currentStep - 1) as WizardStep);
    }
  };

  const handleAddMetric = () => {
    setEditingMetricIndex(null);
    setMetricForm({
      metric_name: '',
      description: '',
      target_value: '',
      current_value: '',
      unit: '%',
      data_source: 'manual',
      metric_type: 'percentage'
    });
  };

  const handleEditMetric = (index: number) => {
    const metric = localMetrics[index];
    setEditingMetricIndex(index);
    setMetricForm({
      metric_name: metric.metric_name || '',
      description: metric.description || '',
      target_value: metric.target_value?.toString() || '',
      current_value: metric.current_value?.toString() || '',
      unit: metric.unit || '%',
      data_source: metric.data_source || 'manual',
      metric_type: metric.metric_type || 'percentage'
    });
    setMetricChartType(metric.chart_type);
    setMetricDataPoints((metric.data_points as TimeSeriesDataPoint[]) || []);
  };

  const handleSaveMetricToList = () => {
    const newMetric: Partial<Metric> = {
      metric_name: metricForm.metric_name,
      description: metricForm.description,
      target_value: parseFloat(metricForm.target_value) || null,
      current_value: parseFloat(metricForm.current_value) || null,
      unit: metricForm.unit,
      data_source: metricForm.data_source,
      metric_type: metricForm.metric_type,
      goal_id: goal?.id,
      chart_type: metricChartType,
      data_points: metricDataPoints.length > 0 ? metricDataPoints : undefined
    };

    if (editingMetricIndex !== null) {
      // Update existing metric
      const updated = [...localMetrics];
      updated[editingMetricIndex] = { ...updated[editingMetricIndex], ...newMetric };
      setLocalMetrics(updated);
    } else {
      // Add new metric (temporary ID for UI)
      setLocalMetrics([...localMetrics, { ...newMetric, id: `temp-${Date.now()}` } as Metric]);
    }

    // Reset form
    setEditingMetricIndex(null);
    setMetricForm({
      metric_name: '',
      description: '',
      target_value: '',
      current_value: '',
      unit: '%',
      data_source: 'manual',
      metric_type: 'percentage'
    });
    setMetricChartType(undefined);
    setMetricDataPoints([]);
  };

  const handleRemoveMetric = (index: number) => {
    setLocalMetrics(localMetrics.filter((_, i) => i !== index));
  };

  const handleSubmit = async () => {
    if (!goal) return;

    try {
      // Update goal information
      await updateGoalMutation.mutateAsync({
        id: goal.id,
        updates: formData
      });

      // Handle metrics changes
      const existingMetrics = goal.metrics || [];

      // Update/create metrics
      for (const metric of localMetrics) {
        if (metric.id.startsWith('temp-')) {
          // Create new metric
          await createMetricMutation.mutateAsync({
            goal_id: goal.id,
            metric_name: metric.metric_name,
            description: metric.description,
            target_value: metric.target_value,
            current_value: metric.current_value,
            unit: metric.unit,
            data_source: metric.data_source,
            metric_type: metric.metric_type
          });
        } else {
          // Update existing metric
          await updateMetricMutation.mutateAsync({
            id: metric.id,
            updates: {
              metric_name: metric.metric_name,
              description: metric.description,
              target_value: metric.target_value,
              current_value: metric.current_value,
              unit: metric.unit,
              data_source: metric.data_source,
              metric_type: metric.metric_type
            }
          });
        }
      }

      // Delete removed metrics
      const localMetricIds = localMetrics.map(m => m.id).filter(id => !id.startsWith('temp-'));
      const deletedMetrics = existingMetrics.filter(m => !localMetricIds.includes(m.id));
      for (const metric of deletedMetrics) {
        await deleteMetricMutation.mutateAsync(metric.id);
      }

      toast.success('Goal updated successfully');
      onSuccess?.();
      onClose();
    } catch (error) {
      toast.error('Failed to update goal');
    }
  };

  const canProceed = () => {
    switch (currentStep) {
      case 1:
        return formData.title.trim().length > 0;
      case 2:
      case 3:
        return true;
      case 4:
        return true;
      default:
        return false;
    }
  };

  const typeInfo = getGoalTypeInfo();

  if (!isOpen || !goal) return null;

  const steps = [
    { number: 1, label: 'Basic Information' },
    { number: 2, label: 'Ownership & Details' },
    { number: 3, label: 'Measures' },
    { number: 4, label: 'Review & Save' }
  ];

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-xl shadow-2xl w-full max-w-4xl max-h-[90vh] flex flex-col">
          {/* Header */}
          <div className="px-6 py-4 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-semibold text-gray-900">Edit Goal</h2>
                <p className="text-sm text-gray-500 mt-1">
                  Update your {typeInfo.label.toLowerCase()} details step by step
                </p>
              </div>
              <button
                onClick={onClose}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X className="h-5 w-5 text-gray-500" />
              </button>
            </div>
          </div>

          {/* Step Indicators */}
          <div className="px-6 py-6 border-b border-gray-200 bg-gray-50">
            <div className="flex items-center justify-between max-w-3xl mx-auto">
              {steps.map((step, index) => (
                <React.Fragment key={step.number}>
                  <div className="flex flex-col items-center flex-1">
                    <div
                      className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-semibold transition-colors ${
                        currentStep === step.number
                          ? 'bg-blue-600 text-white'
                          : currentStep > step.number
                          ? 'bg-green-600 text-white'
                          : 'bg-gray-200 text-gray-500'
                      }`}
                    >
                      {currentStep > step.number ? (
                        <Check className="h-5 w-5" />
                      ) : (
                        step.number
                      )}
                    </div>
                    <span
                      className={`text-xs mt-2 font-medium ${
                        currentStep === step.number
                          ? 'text-blue-600'
                          : currentStep > step.number
                          ? 'text-green-600'
                          : 'text-gray-500'
                      }`}
                    >
                      {step.label}
                    </span>
                  </div>
                  {index < steps.length - 1 && (
                    <div
                      className={`h-0.5 flex-1 mx-2 mt-[-20px] transition-colors ${
                        currentStep > step.number ? 'bg-green-600' : 'bg-gray-200'
                      }`}
                    />
                  )}
                </React.Fragment>
              ))}
            </div>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto px-6 py-6">
            {currentStep === 1 && (
              <div className="max-w-2xl mx-auto space-y-6">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Basic Information</h3>
                  <p className="text-sm text-gray-600 mb-6">
                    Enter the fundamental details for your goal
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Goal Number</Label>
                    <div className="mt-1 px-3 py-2 bg-gray-50 rounded-md text-sm flex items-center gap-2">
                      <Badge variant="outline">{goal.goal_number}</Badge>
                    </div>
                  </div>
                  <div>
                    <Label>Type</Label>
                    <div className="mt-1 px-3 py-2 bg-gray-50 rounded-md text-sm flex items-center gap-2">
                      <span className={typeInfo.color}>{typeInfo.icon}</span>
                      <span>{typeInfo.label}</span>
                    </div>
                  </div>
                </div>

                <div>
                  <Label htmlFor="title" required>Goal Title</Label>
                  <Input
                    id="title"
                    value={formData.title}
                    onChange={(e) => handleInputChange('title', e.target.value)}
                    placeholder="Enter a clear, concise goal title"
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) => handleInputChange('description', e.target.value)}
                    rows={5}
                    placeholder="Provide detailed context about this goal, its purpose, and expected outcomes"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    A good description helps stakeholders understand the goal's intent
                  </p>
                </div>
              </div>
            )}

            {currentStep === 2 && (
              <div className="max-w-2xl mx-auto space-y-6">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Ownership & Details</h3>
                  <p className="text-sm text-gray-600 mb-6">
                    Assign responsibility and set organizational details
                  </p>
                </div>

                <div>
                  <Label htmlFor="owner_name">
                    <Users className="inline h-4 w-4 mr-1" />
                    Goal Owner
                  </Label>
                  <Input
                    id="owner_name"
                    value={formData.owner_name}
                    onChange={(e) => handleInputChange('owner_name', e.target.value)}
                    placeholder="Enter the name of the person responsible"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    The individual accountable for this goal's success
                  </p>
                </div>

                <div>
                  <Label htmlFor="department">
                    <Building2 className="inline h-4 w-4 mr-1" />
                    Department
                  </Label>
                  <Input
                    id="department"
                    value={formData.department}
                    onChange={(e) => handleInputChange('department', e.target.value)}
                    placeholder="e.g., Academic Affairs, Operations, HR"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    The organizational unit this goal belongs to
                  </p>
                </div>

                <div>
                  <Label htmlFor="priority">
                    <AlertCircle className="inline h-4 w-4 mr-1" />
                    Priority Level
                  </Label>
                  <select
                    id="priority"
                    value={formData.priority}
                    onChange={(e) => handleInputChange('priority', e.target.value)}
                    className="w-full px-3 py-2 text-sm rounded-md border border-gray-300 bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Select priority level</option>
                    <option value="high">High - Critical priority</option>
                    <option value="medium">Medium - Standard priority</option>
                    <option value="low">Low - When time permits</option>
                  </select>
                  <p className="text-xs text-gray-500 mt-1">
                    Helps stakeholders understand urgency and resource allocation
                  </p>
                </div>
              </div>
            )}

            {currentStep === 3 && (
              <div className="max-w-2xl mx-auto space-y-6">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Measures</h3>
                  <p className="text-sm text-gray-600 mb-6">
                    Define what you'll measure to track progress for this goal
                  </p>
                </div>

                {editingMetricIndex !== null || localMetrics.length === 0 ? (
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 space-y-4">
                    <h4 className="font-medium text-gray-900">
                      {editingMetricIndex !== null ? 'Edit Measure' : 'Add New Measure'}
                    </h4>

                    <div>
                      <Label htmlFor="metric_name" required>Metric Name</Label>
                      <Input
                        id="metric_name"
                        value={metricForm.metric_name}
                        onChange={(e) => setMetricForm({ ...metricForm, metric_name: e.target.value })}
                        placeholder="e.g., Student Attendance Rate"
                        required
                      />
                    </div>

                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <Label htmlFor="metric_description">Measure</Label>
                        <button
                          type="button"
                          onClick={() => setShowMeasureHelp(!showMeasureHelp)}
                          className="text-primary hover:text-primary/80 text-xs flex items-center gap-1"
                        >
                          <HelpCircle className="h-3.5 w-3.5" />
                          {showMeasureHelp ? 'Hide' : 'Show'} Examples
                        </button>
                      </div>
                      <Textarea
                        id="metric_description"
                        value={metricForm.description}
                        onChange={(e) => setMetricForm({ ...metricForm, description: e.target.value })}
                        placeholder="Format: [Data Source] - [Scale/Type] - [Description] (e.g., Teacher Survey - 1-5 scale - Average instructional score)"
                        rows={showMeasureHelp ? 2 : 2}
                      />
                      {showMeasureHelp && (
                        <div className="mt-2 p-3 bg-blue-50 border border-blue-200 rounded-md text-xs space-y-1.5">
                          <p className="font-medium text-blue-900">Format: [Data Source] - [Scale/Type] - [Description]</p>
                          <div className="space-y-1 text-blue-800">
                            <p>• Teacher Self-Assessment Survey - 1-5 scale (5 high) - Average instructional model score</p>
                            <p>• Student Belonging Survey - Likert 1-5 - Overall belonging score</p>
                            <p>• State Testing - Percent - Higher or lower than state average</p>
                            <p>• Enrollment Data - Ratio - Proportion of students in Honors/AP courses</p>
                          </div>
                        </div>
                      )}
                    </div>

                    <div className="grid grid-cols-3 gap-3">
                      <div>
                        <Label htmlFor="current_value">Current Value</Label>
                        <Input
                          id="current_value"
                          type="number"
                          step="any"
                          value={metricForm.current_value}
                          onChange={(e) => setMetricForm({ ...metricForm, current_value: e.target.value })}
                          placeholder="0"
                        />
                      </div>
                      <div>
                        <Label htmlFor="target_value">Target Value</Label>
                        <Input
                          id="target_value"
                          type="number"
                          step="any"
                          value={metricForm.target_value}
                          onChange={(e) => setMetricForm({ ...metricForm, target_value: e.target.value })}
                          placeholder="100"
                        />
                      </div>
                      <div>
                        <Label htmlFor="unit">Unit</Label>
                        <Input
                          id="unit"
                          value={metricForm.unit}
                          onChange={(e) => setMetricForm({ ...metricForm, unit: e.target.value })}
                          placeholder="%"
                        />
                      </div>
                    </div>

                    {/* Chart Type Selection */}
                    <div className="pt-4 border-t border-gray-200">
                      <ChartTypePicker value={metricChartType} onChange={setMetricChartType} />
                    </div>

                    {/* Time-Series Data Entry */}
                    {metricChartType && (
                      <div className="pt-4 border-t border-gray-200">
                        <TimeSeriesDataEntry
                          dataPoints={metricDataPoints}
                          onChange={setMetricDataPoints}
                        />
                      </div>
                    )}

                    <div className="flex justify-end gap-2 pt-2">
                      {(editingMetricIndex !== null || localMetrics.length > 0) && (
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            setEditingMetricIndex(null);
                            setMetricForm({
                              metric_name: '',
                              description: '',
                              target_value: '',
                              current_value: '',
                              unit: '%',
                              data_source: 'manual',
                              metric_type: 'percentage'
                            });
                          }}
                        >
                          Cancel
                        </Button>
                      )}
                      <Button
                        type="button"
                        size="sm"
                        onClick={handleSaveMetricToList}
                        disabled={!metricForm.metric_name.trim()}
                      >
                        {editingMetricIndex !== null ? 'Update Measure' : 'Add Measure'}
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {localMetrics.map((metric, index) => {
                      const progress = metric.target_value
                        ? Math.round(((metric.current_value || 0) / metric.target_value) * 100)
                        : 0;

                      return (
                        <div key={index} className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <h4 className="font-medium text-gray-900">{metric.metric_name}</h4>
                              {metric.description && (
                                <p className="text-sm text-gray-600 mt-1">{metric.description}</p>
                              )}
                              <div className="flex items-center gap-4 mt-3">
                                <Badge variant="secondary" className="text-xs">
                                  {metric.current_value || 0} / {metric.target_value || 0} {metric.unit}
                                </Badge>
                                {metric.target_value && (
                                  <div className="flex items-center gap-2 flex-1 max-w-xs">
                                    <div className="flex-1 bg-gray-200 rounded-full h-2 overflow-hidden">
                                      <div
                                        className="h-full bg-blue-600 transition-all"
                                        style={{ width: `${Math.min(progress, 100)}%` }}
                                      />
                                    </div>
                                    <span className="text-xs text-gray-600">{progress}%</span>
                                  </div>
                                )}
                              </div>
                            </div>
                            <div className="flex items-center gap-1 ml-4">
                              <button
                                onClick={() => handleEditMetric(index)}
                                className="p-2 hover:bg-gray-200 rounded-lg transition-colors"
                              >
                                <Edit2 className="h-4 w-4 text-gray-600" />
                              </button>
                              <button
                                onClick={() => handleRemoveMetric(index)}
                                className="p-2 hover:bg-red-100 rounded-lg transition-colors"
                              >
                                <Trash2 className="h-4 w-4 text-red-600" />
                              </button>
                            </div>
                          </div>
                        </div>
                      );
                    })}

                    <button
                      onClick={handleAddMetric}
                      className="w-full py-3 border-2 border-dashed border-gray-300 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition-colors text-gray-600 hover:text-blue-600 flex items-center justify-center gap-2"
                    >
                      <Plus className="h-5 w-5" />
                      Add Another Metric
                    </button>
                  </div>
                )}
              </div>
            )}

            {currentStep === 4 && (
              <div className="max-w-2xl mx-auto space-y-6">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Review & Save</h3>
                  <p className="text-sm text-gray-600 mb-6">
                    Review your changes before saving
                  </p>
                </div>

                <div className="space-y-4">
                  <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                    <h4 className="font-medium text-gray-900 mb-3">Basic Information</h4>
                    <dl className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <dt className="text-gray-600">Title:</dt>
                        <dd className="text-gray-900 font-medium">{formData.title}</dd>
                      </div>
                      {formData.description && (
                        <div>
                          <dt className="text-gray-600 mb-1">Description:</dt>
                          <dd className="text-gray-900">{formData.description}</dd>
                        </div>
                      )}
                    </dl>
                  </div>

                  <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                    <h4 className="font-medium text-gray-900 mb-3">Ownership & Details</h4>
                    <dl className="space-y-2 text-sm">
                      {formData.owner_name && (
                        <div className="flex justify-between">
                          <dt className="text-gray-600">Owner:</dt>
                          <dd className="text-gray-900 font-medium">{formData.owner_name}</dd>
                        </div>
                      )}
                      {formData.department && (
                        <div className="flex justify-between">
                          <dt className="text-gray-600">Department:</dt>
                          <dd className="text-gray-900 font-medium">{formData.department}</dd>
                        </div>
                      )}
                      {formData.priority && (
                        <div className="flex justify-between">
                          <dt className="text-gray-600">Priority:</dt>
                          <dd className="text-gray-900 font-medium capitalize">{formData.priority}</dd>
                        </div>
                      )}
                    </dl>
                  </div>

                  <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                    <h4 className="font-medium text-gray-900 mb-3">
                      <BarChart3 className="inline h-4 w-4 mr-1" />
                      Metrics ({localMetrics.length})
                    </h4>
                    {localMetrics.length > 0 ? (
                      <ul className="space-y-2">
                        {localMetrics.map((metric, index) => (
                          <li key={index} className="text-sm flex items-center justify-between">
                            <span className="text-gray-900">{metric.metric_name}</span>
                            <Badge variant="secondary" className="text-xs">
                              {metric.current_value || 0} / {metric.target_value || 0} {metric.unit}
                            </Badge>
                          </li>
                        ))}
                      </ul>
                    ) : (
                      <p className="text-sm text-gray-500">No metrics defined</p>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="px-6 py-4 border-t border-gray-200 bg-gray-50">
            <div className="flex items-center justify-between">
              <Button
                type="button"
                variant="outline"
                onClick={currentStep === 1 ? onClose : handleBack}
              >
                <ChevronLeft className="h-4 w-4 mr-1" />
                {currentStep === 1 ? 'Cancel' : 'Back'}
              </Button>

              <div className="flex items-center gap-2">
                {currentStep < 4 ? (
                  <Button
                    type="button"
                    onClick={handleNext}
                    disabled={!canProceed()}
                  >
                    Next
                    <ChevronRight className="h-4 w-4 ml-1" />
                  </Button>
                ) : (
                  <Button
                    type="button"
                    onClick={handleSubmit}
                    disabled={updateGoalMutation.isPending || !canProceed()}
                  >
                    <Check className="h-4 w-4 mr-1" />
                    {updateGoalMutation.isPending ? 'Saving...' : 'Save Changes'}
                  </Button>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
