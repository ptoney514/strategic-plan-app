import React, { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, Save, X } from 'lucide-react';
import { MetricTypeSelector } from './MetricTypeSelector';
import { MetricDataForm } from './MetricDataForm';
import { MetricPreview } from './MetricPreview';
import { type VisualizationType, getDefaultConfig } from '../lib/metric-visualizations';

interface MetricBuilderWizardProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (metric: any) => Promise<void>;
  goalId: string;
  goalNumber: string;
  existingMetric?: any;
}

type WizardStep = 'visualization' | 'title' | 'data' | 'preview';

const STEPS: { id: WizardStep; title: string; description: string }[] = [
  {
    id: 'visualization',
    title: 'Choose Visual',
    description: 'What type of chart or display would you like?'
  },
  {
    id: 'title',
    title: 'Name Your Metric',
    description: 'What should we call this metric?'
  },
  {
    id: 'data',
    title: 'Add Your Data',
    description: 'Enter the values for your visualization'
  },
  {
    id: 'preview',
    title: 'Review & Save',
    description: 'Check everything looks good before saving'
  }
];

export function MetricBuilderWizard({
  isOpen,
  onClose,
  onSave,
  goalId,
  goalNumber,
  existingMetric
}: MetricBuilderWizardProps) {
  const [currentStep, setCurrentStep] = useState<WizardStep>('visualization');
  const [selectedType, setSelectedType] = useState<VisualizationType | undefined>();
  const [metricData, setMetricData] = useState<any>({});
  const [metricDetails, setMetricDetails] = useState({
    name: '',
    description: ''
  });
  const [isSaving, setIsSaving] = useState(false);

  // Load existing metric data when editing
  useEffect(() => {
    if (existingMetric && isOpen) {
      console.log('[MetricBuilderWizard] Loading existing metric for editing:', existingMetric);
      console.log('[MetricBuilderWizard] Visualization config:', existingMetric.visualization_config);
      setSelectedType(existingMetric.visualization_type || 'bar-chart');
      setMetricData(existingMetric.visualization_config || getDefaultConfig('bar-chart'));
      setMetricDetails({
        name: existingMetric.metric_name || existingMetric.name || '',
        description: existingMetric.description || ''
      });
      setCurrentStep('title');
    } else if (isOpen) {
      setCurrentStep('visualization');
      setSelectedType(undefined);
      setMetricData({});
      setMetricDetails({
        name: '',
        description: ''
      });
    }
  }, [existingMetric, isOpen]);

  const activeSteps = existingMetric ? STEPS.filter(s => s.id !== 'visualization') : STEPS;
  const currentStepIndex = activeSteps.findIndex(s => s.id === currentStep);
  const isFirstStep = currentStepIndex === 0;
  const isLastStep = currentStepIndex === activeSteps.length - 1;

  const handleTypeSelect = (type: VisualizationType) => {
    setSelectedType(type);
    setMetricData(getDefaultConfig(type));
  };

  const handleNext = () => {
    if (currentStep === 'visualization' && !selectedType) {
      alert('Please select a visualization type first');
      return;
    }

    if (currentStep === 'title' && !metricDetails.name) {
      alert('Please provide a title for your metric');
      return;
    }

    if (currentStep === 'data') {
      if (selectedType === 'number') {
        if (!metricData.label || metricData.label.trim() === '') {
          alert('Please enter a title/summary for your number/KPI metric');
          return;
        }
        const currentVal = metricData.currentValue;
        if (currentVal === '' || currentVal === undefined || currentVal === null) {
          alert('Please enter a current value');
          return;
        }
      }
      if (selectedType === 'ratio') {
        if (!metricData.label || metricData.label.trim() === '') {
          alert('Please enter descriptive text for your ratio metric');
          return;
        }
        if (!metricData.ratioValue || metricData.ratioValue.trim() === '') {
          alert('Please enter a ratio value (e.g., 2.6:1)');
          return;
        }
      }
      if (selectedType === 'percentage') {
        const currentVal = metricData.currentValue;
        if (currentVal === '' || currentVal === undefined || currentVal === null) {
          alert('Please enter a current percentage value');
          return;
        }
        if (currentVal < 0 || currentVal > 100) {
          alert('Please enter a valid percentage value (0-100)');
          return;
        }
      }
      if (selectedType === 'bar-chart' && (!metricData.dataPoints || metricData.dataPoints.length === 0)) {
        alert('Please add at least one data point');
        return;
      }
      if (selectedType === 'line-chart' && (!metricData.dataPoints || metricData.dataPoints.length === 0)) {
        alert('Please add at least one data point');
        return;
      }
      if (selectedType === 'likert-scale' && (!metricData.dataPoints || metricData.dataPoints.length === 0)) {
        alert('Please add at least one data point');
        return;
      }
    }

    const nextIndex = currentStepIndex + 1;
    if (nextIndex < activeSteps.length) {
      setCurrentStep(activeSteps[nextIndex].id);
    }
  };

  const handleBack = () => {
    const prevIndex = currentStepIndex - 1;
    if (prevIndex >= 0) {
      setCurrentStep(activeSteps[prevIndex].id);
    }
  };

  const handleSave = async () => {
    // Prevent duplicate saves
    if (isSaving) {
      console.log('[MetricBuilderWizard] Save already in progress, ignoring duplicate request');
      return;
    }

    if (!selectedType || !metricDetails.name) {
      alert('Please complete all required fields');
      return;
    }

    // Set saving state immediately to prevent race condition
    setIsSaving(true);
    try {
      // For ratio metrics, we don't use numeric current_value/target_value
      // The ratio values are stored as strings in visualization_config
      const isNumericMetric = selectedType === 'number' || selectedType === 'percentage';

      const metric = {
        goal_id: goalId,
        name: metricDetails.name,
        metric_name: metricDetails.name,
        description: metricDetails.description,
        visualization_type: selectedType,
        visualization_config: metricData, // This JSONB field stores all the chart data including dataPoints
        chart_type: selectedType,
        current_value: isNumericMetric ? (metricData.currentValue || null) : null,
        target_value: isNumericMetric ? (metricData.targetValue || null) : null,
        unit: metricData.unit || metricData.yAxisLabel || '',
        frequency: 'yearly' as const,
        aggregation_method: 'latest' as const,
        data_source: 'survey' as const,
        metric_type: selectedType === 'percentage' ? 'percent' : 'number' as const
      };

      console.log('[MetricBuilderWizard] Saving metric:', existingMetric ? 'UPDATE' : 'CREATE', metric);
      console.log('[MetricBuilderWizard] Metric data structure:', {
        visualization_type: metric.visualization_type,
        dataPoints: metricData.dataPoints,
        targetValue: metricData.targetValue
      });

      await onSave(metric);

      // Only reset and close if save was successful
      handleReset();
      onClose();
      console.log('[MetricBuilderWizard] Metric saved successfully and wizard closed');
    } catch (error: any) {
      console.error('[MetricBuilderWizard] Failed to save metric:', error);
      const errorMessage = error?.message || error?.error_description || JSON.stringify(error);
      alert(`Failed to save metric: ${errorMessage}\n\nPlease check the console for details.`);
    } finally {
      setIsSaving(false);
    }
  };

  const handleReset = () => {
    setCurrentStep('visualization');
    setSelectedType(undefined);
    setMetricData({});
    setMetricDetails({
      name: '',
      description: '',
      is_primary: false
    });
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 'visualization':
        if (existingMetric) {
          setCurrentStep('title');
          return null;
        }
        return (
          <div className="space-y-4">
            <div className="text-center">
              <h3 className="text-xl font-semibold mb-2">How would you like to visualize your data?</h3>
              <p className="text-muted-foreground">
                Choose the best way to display your metric. Each visualization type works best for different kinds of data.
              </p>
            </div>
            <MetricTypeSelector
              selectedType={selectedType}
              onSelect={handleTypeSelect}
            />
          </div>
        );

      case 'title':
        return (
          <div className="space-y-6">
            <div className="text-center">
              <h3 className="text-xl font-semibold mb-2">What should we call this {selectedType?.replace('-', ' ')}?</h3>
              <p className="text-muted-foreground">
                Give your metric a clear, descriptive title that explains what it measures
              </p>
            </div>

            <div className="max-w-xl mx-auto space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Metric Title *</label>
                <input
                  type="text"
                  value={metricDetails.name}
                  onChange={(e) => setMetricDetails({ ...metricDetails, name: e.target.value })}
                  placeholder="e.g., Student Achievement Rate"
                  className="w-full px-3 py-2 border border-border rounded-md text-lg"
                  autoFocus
                />
                <p className="text-sm text-muted-foreground mt-1">
                  This will be displayed as the main title of your metric
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Description (optional)</label>
                <textarea
                  value={metricDetails.description}
                  onChange={(e) => setMetricDetails({ ...metricDetails, description: e.target.value })}
                  placeholder="Add any additional context about what this metric measures..."
                  rows={3}
                  className="w-full px-3 py-2 border border-border rounded-md"
                />
              </div>

              <div className="flex items-center gap-2 mt-4">
                <input
                  type="checkbox"
                  id="is_primary"
                  checked={metricDetails.is_primary}
                  onChange={(e) => setMetricDetails({ ...metricDetails, is_primary: e.target.checked })}
                  className="rounded border-border"
                />
                <label htmlFor="is_primary" className="text-sm font-medium">Primary metric for this goal</label>
              </div>
            </div>
          </div>
        );

      case 'data':
        return selectedType ? (
          <div className="space-y-4">
            <div className="text-center">
              <h3 className="text-xl font-semibold mb-2">
                Now let's add the data for your {selectedType?.replace('-', ' ')}
              </h3>
              <p className="text-muted-foreground">
                {selectedType === 'number' && 'Enter a descriptive title and the numeric value to display'}
                {selectedType === 'percentage' && 'Enter the current percentage value'}
                {selectedType === 'bar-chart' && 'Add categories and their values for your bar chart'}
                {selectedType === 'line-chart' && 'Add data points for your line chart over time'}
                {selectedType === 'donut-chart' && 'Add segments and their values for your donut chart'}
                {selectedType === 'status' && 'Set the current status and add any relevant details'}
                {selectedType === 'survey' && 'Configure your survey questions and response options'}
                {selectedType === 'likert-scale' && 'Set your scale range and add data points over time'}
              </p>
            </div>
            <MetricDataForm
              type={selectedType}
              data={metricData}
              onChange={setMetricData}
            />
          </div>
        ) : (
          <div className="text-center py-8 text-muted-foreground">
            Please complete the previous steps first
          </div>
        );

      case 'preview':
        return selectedType ? (
          <div className="space-y-6">
            <div className="text-center">
              <h3 className="text-xl font-semibold mb-2">Here's how your metric will look</h3>
              <p className="text-muted-foreground">
                Review your {selectedType?.replace('-', ' ')} and make sure everything is correct
              </p>
            </div>

            <MetricPreview type={selectedType} data={metricData} />

            <div className="bg-muted/50 rounded-lg p-4 space-y-2">
              <h4 className="font-medium">Metric Summary</h4>
              <div className="text-sm space-y-1">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Title:</span>
                  <span className="font-medium">{metricDetails.name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Visualization:</span>
                  <span className="font-medium capitalize">{selectedType?.replace('-', ' ')}</span>
                </div>
                {metricDetails.is_primary && (
                  <div className="pt-2">
                    <span className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded">
                      Primary Metric
                    </span>
                  </div>
                )}
              </div>
              {metricDetails.description && (
                <div className="pt-2 border-t border-border">
                  <p className="text-sm text-muted-foreground">{metricDetails.description}</p>
                </div>
              )}
            </div>
          </div>
        ) : (
          <div className="text-center py-8 text-muted-foreground">
            Please complete the previous steps
          </div>
        );

      default:
        return null;
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="px-6 py-4 border-b border-border">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-bold">
                {existingMetric ? 'Edit Metric' : `Create New Metric for Goal ${goalNumber}`}
              </h2>
              <p className="text-sm text-muted-foreground">
                Let's build a custom metric visualization step by step
              </p>
            </div>
            <button
              onClick={onClose}
              disabled={isSaving}
              className="p-2 hover:bg-muted rounded"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Progress Steps */}
        <div className="flex items-center justify-between px-4 py-2 border-b border-border">
          {activeSteps.map((step, index) => (
            <div
              key={step.id}
              className="flex items-center flex-1"
            >
              <button
                onClick={() => {
                  if (index <= currentStepIndex) {
                    setCurrentStep(step.id);
                  }
                }}
                disabled={index > currentStepIndex}
                className={`
                  flex items-center gap-2 px-3 py-1.5 rounded-lg transition-colors
                  ${currentStep === step.id ? 'bg-blue-50 text-blue-600' : ''}
                  ${index < currentStepIndex ? 'text-muted-foreground hover:bg-muted' : ''}
                  ${index > currentStepIndex ? 'text-muted-foreground cursor-not-allowed' : ''}
                `}
              >
                <div className={`
                  w-6 h-6 rounded-full flex items-center justify-center text-xs font-medium
                  ${currentStep === step.id ? 'bg-blue-600 text-white' : ''}
                  ${index < currentStepIndex ? 'bg-green-600 text-white' : ''}
                  ${index > currentStepIndex ? 'bg-muted text-muted-foreground' : ''}
                `}>
                  {index + 1}
                </div>
                <span className="hidden sm:inline text-sm font-medium">
                  {step.title}
                </span>
              </button>
              {index < activeSteps.length - 1 && (
                <div className="flex-1 mx-2">
                  <div className={`h-0.5 ${index < currentStepIndex ? 'bg-green-600' : 'bg-border'}`} />
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Step Content */}
        <div className="flex-1 overflow-y-auto px-6 py-4">
          {renderStepContent()}
        </div>

        {/* Footer Actions */}
        <div className="border-t border-border px-6 py-4">
          <div className="flex items-center justify-between">
            <button
              onClick={onClose}
              disabled={isSaving}
              className="px-4 py-2 border border-border rounded-md hover:bg-muted transition-colors"
            >
              <X className="w-4 h-4 inline mr-1" />
              Cancel
            </button>

            <div className="flex gap-2">
              {!isFirstStep && (
                <button
                  onClick={handleBack}
                  disabled={isSaving}
                  className="px-4 py-2 border border-border rounded-md hover:bg-muted transition-colors"
                >
                  <ChevronLeft className="w-4 h-4 inline mr-1" />
                  Back
                </button>
              )}

              {!isLastStep ? (
                <button
                  onClick={handleNext}
                  disabled={isSaving}
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                >
                  Next
                  <ChevronRight className="w-4 h-4 inline ml-1" />
                </button>
              ) : (
                <button
                  onClick={handleSave}
                  disabled={isSaving || !selectedType || !metricDetails.name}
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Save className="w-4 h-4 inline mr-1" />
                  {isSaving ? 'Saving...' : 'Save Metric'}
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
