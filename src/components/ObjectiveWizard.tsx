import React, { useState, useEffect } from 'react';
import { X, ChevronRight, ChevronLeft, Target, Users, TrendingUp, BookOpen, CheckCircle, Info, Plus, Trash2, Upload, Image, AlertCircle, Clock } from 'lucide-react';

interface ObjectiveWizardProps {
  isOpen: boolean;
  onClose: () => void;
  onComplete: (data: any) => void;
  districtId: string;
  existingObjective?: any;
}

type WizardStep = 'type' | 'basics' | 'photo' | 'goals' | 'metrics' | 'review';

interface Goal {
  id: string;
  title: string;
  description: string;
  metrics: Metric[];
}

interface Metric {
  id: string;
  name: string;
  type: string;
  targetValue: number;
  unit: string;
}

export function ObjectiveWizard({ isOpen, onClose, onComplete, districtId, existingObjective }: ObjectiveWizardProps) {
  const isEditMode = !!existingObjective;
  const [currentStep, setCurrentStep] = useState<WizardStep>('type');
  const [objectiveType, setObjectiveType] = useState<'strategic' | 'operational'>('strategic');
  const [objectiveData, setObjectiveData] = useState({
    title: '',
    description: '',
    timeframe: '3-year',
    status: 'not-started',
    coverPhotoUrl: null,
    coverPhotoAlt: '',
  });
  const [goals, setGoals] = useState<Goal[]>([]);
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Update state when existingObjective changes or when opening in edit mode
  useEffect(() => {
    if (existingObjective && isOpen) {
      setCurrentStep('basics'); // Start at basics for edit mode
      setObjectiveType(existingObjective.level === 0 ? 'strategic' : 'operational');
      setObjectiveData({
        title: existingObjective.title || '',
        description: existingObjective.description || '',
        timeframe: existingObjective.timeframe || '3-year',
        status: existingObjective.status || 'not-started',
        coverPhotoUrl: existingObjective.cover_photo_url || null,
        coverPhotoAlt: existingObjective.cover_photo_alt || '',
      });
      // Map children to goals if they exist
      if (existingObjective.children && Array.isArray(existingObjective.children)) {
        setGoals(existingObjective.children.map((child: any) => ({
          id: child.id,
          title: child.title || '',
          description: child.description || '',
          metrics: child.metrics || [],
        })));
      }
    } else if (!existingObjective && isOpen) {
      // Reset to create mode
      setCurrentStep('type');
      setObjectiveType('strategic');
      setObjectiveData({
        title: '',
        description: '',
        timeframe: '3-year',
        status: 'not-started',
        coverPhotoUrl: null,
        coverPhotoAlt: '',
      });
      setGoals([]);
      setErrors({});
    }
  }, [existingObjective, isOpen]);

  if (!isOpen) return null;

  const steps: { key: WizardStep; label: string; number: number }[] = isEditMode
    ? [
        { key: 'basics', label: 'Basic Info', number: 1 },
        { key: 'photo', label: 'Cover Photo', number: 2 },
        { key: 'goals', label: 'Manage Goals', number: 3 },
        { key: 'metrics', label: 'Success Metrics', number: 4 },
        { key: 'review', label: 'Review & Update', number: 5 },
      ]
    : [
        { key: 'type', label: 'Choose Type', number: 1 },
        { key: 'basics', label: 'Basic Info', number: 2 },
        { key: 'photo', label: 'Cover Photo', number: 3 },
        { key: 'goals', label: 'Add Goals', number: 4 },
        { key: 'metrics', label: 'Success Metrics', number: 5 },
        { key: 'review', label: 'Review & Create', number: 6 },
      ];

  const currentStepIndex = steps.findIndex(s => s.key === currentStep);

  const validateCurrentStep = (requireGoals = true): boolean => {
    const newErrors: Record<string, string> = {};
    
    if (currentStep === 'basics') {
      if (!objectiveData.title.trim()) {
        newErrors.title = 'Title is required';
      }
      if (!objectiveData.description.trim()) {
        newErrors.description = 'Description is required';
      }
    }
    
    // Only require goals if we're completing the full flow
    if (currentStep === 'goals' && goals.length === 0 && requireGoals) {
      newErrors.goals = 'At least one goal is required';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    if (!validateCurrentStep()) return;
    
    const nextIndex = currentStepIndex + 1;
    if (nextIndex < steps.length) {
      setCurrentStep(steps[nextIndex].key);
    }
  };

  const handleBack = () => {
    const prevIndex = currentStepIndex - 1;
    if (prevIndex >= 0) {
      setCurrentStep(steps[prevIndex].key);
    }
  };

  const addGoal = () => {
    const newGoal: Goal = {
      id: `goal-${Date.now()}`,
      title: '',
      description: '',
      metrics: [],
    };
    setGoals([...goals, newGoal]);
  };

  const updateGoal = (goalId: string, field: keyof Goal, value: any) => {
    setGoals(goals.map(g => g.id === goalId ? { ...g, [field]: value } : g));
  };

  const removeGoal = (goalId: string) => {
    setGoals(goals.filter(g => g.id !== goalId));
  };

  const addMetricToGoal = (goalId: string) => {
    const newMetric: Metric = {
      id: `metric-${Date.now()}`,
      name: '',
      type: 'percent',
      targetValue: 0,
      unit: '%',
    };
    setGoals(goals.map(g => 
      g.id === goalId 
        ? { ...g, metrics: [...g.metrics, newMetric] }
        : g
    ));
  };

  const handleSaveAndClose = () => {
    // Only validate current step and required fields
    const newErrors: Record<string, string> = {};
    
    // Always require title and description
    if (!objectiveData.title.trim()) {
      newErrors.title = 'Title is required';
    }
    if (!objectiveData.description.trim()) {
      newErrors.description = 'Description is required';
    }
    
    // If we have errors and we're not past the basics step, show them
    if (Object.keys(newErrors).length > 0 && currentStep === 'basics') {
      setErrors(newErrors);
      return;
    }
    
    // Save with current data (goals and metrics are optional)
    const completeData = {
      ...objectiveData,
      type: objectiveType,
      goals: goals.length > 0 ? goals : [], // Default to empty if no goals added
      districtId,
    };
    
    onComplete(completeData);
  };

  const handleComplete = () => {
    if (!validateCurrentStep()) return;
    
    const completeData = {
      ...objectiveData,
      type: objectiveType,
      goals,
      districtId,
    };
    
    onComplete(completeData);
  };

  const renderStepIndicator = () => (
    <div className="flex items-center justify-between mb-8 px-6">
      {steps.map((step, index) => (
        <div key={step.key} className="flex items-center">
          <div className={`flex items-center ${index < steps.length - 1 ? 'flex-1' : ''}`}>
            <div className={`
              w-10 h-10 rounded-full flex items-center justify-center text-sm font-semibold
              ${currentStepIndex >= index 
                ? 'bg-primary text-primary-foreground' 
                : 'bg-gray-200 text-gray-500'}
              ${currentStepIndex === index ? 'ring-2 ring-primary ring-offset-2' : ''}
            `}>
              {currentStepIndex > index ? <CheckCircle className="h-5 w-5" /> : step.number}
            </div>
            <div className="ml-3">
              <p className={`text-sm font-medium ${currentStepIndex >= index ? 'text-foreground' : 'text-muted-foreground'}`}>
                {step.label}
              </p>
            </div>
          </div>
          {index < steps.length - 1 && (
            <ChevronRight className={`mx-4 h-5 w-5 ${currentStepIndex > index ? 'text-primary' : 'text-gray-300'}`} />
          )}
        </div>
      ))}
    </div>
  );

  const renderStepContent = () => {
    switch (currentStep) {
      case 'type':
        return (
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold mb-2">What type of objective are you creating?</h3>
              <p className="text-sm text-muted-foreground mb-6">
                Choose the type that best fits your planning needs
              </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <button
                onClick={() => setObjectiveType('strategic')}
                className={`p-6 rounded-lg border-2 text-left transition-all ${
                  objectiveType === 'strategic'
                    ? 'border-primary bg-primary/5'
                    : 'border-border hover:border-primary/50'
                }`}
              >
                <Target className="h-8 w-8 text-primary mb-3" />
                <h4 className="font-semibold mb-2">Strategic Objective</h4>
                <p className="text-sm text-muted-foreground">
                  Long-term, high-level goals that align with your district's vision and mission. 
                  Typically spans 3-5 years.
                </p>
                <div className="mt-4 space-y-1">
                  <p className="text-xs text-muted-foreground">✓ District-wide impact</p>
                  <p className="text-xs text-muted-foreground">✓ Multiple goals and metrics</p>
                  <p className="text-xs text-muted-foreground">✓ Annual progress tracking</p>
                </div>
              </button>
              
              <button
                onClick={() => setObjectiveType('operational')}
                className={`p-6 rounded-lg border-2 text-left transition-all ${
                  objectiveType === 'operational'
                    ? 'border-primary bg-primary/5'
                    : 'border-border hover:border-primary/50'
                }`}
              >
                <TrendingUp className="h-8 w-8 text-primary mb-3" />
                <h4 className="font-semibold mb-2">Operational Objective</h4>
                <p className="text-sm text-muted-foreground">
                  Shorter-term, specific objectives focused on improving operations and processes. 
                  Typically spans 1-2 years.
                </p>
                <div className="mt-4 space-y-1">
                  <p className="text-xs text-muted-foreground">✓ Department or school-level</p>
                  <p className="text-xs text-muted-foreground">✓ Specific, measurable outcomes</p>
                  <p className="text-xs text-muted-foreground">✓ Quarterly progress tracking</p>
                </div>
              </button>
            </div>
            
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="flex gap-3">
                <Info className="h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-blue-900">Pro Tip</p>
                  <p className="text-sm text-blue-700 mt-1">
                    Strategic objectives are best for district-wide initiatives like "Student Achievement & Well-being", 
                    while operational objectives work well for specific improvements like "Reduce IT Support Response Time".
                  </p>
                </div>
              </div>
            </div>
          </div>
        );

      case 'basics':
        return (
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold mb-2">Define Your {objectiveType === 'strategic' ? 'Strategic' : 'Operational'} Objective</h3>
              <p className="text-sm text-muted-foreground">
                Provide a clear title and description that communicates your objective's purpose
              </p>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">
                  Objective Title *
                </label>
                <input
                  type="text"
                  value={objectiveData.title}
                  onChange={(e) => setObjectiveData({ ...objectiveData, title: e.target.value })}
                  className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary ${
                    errors.title ? 'border-red-500' : 'border-input'
                  }`}
                  placeholder="e.g., Student Achievement & Well-being"
                />
                {errors.title && (
                  <p className="text-red-500 text-sm mt-1">{errors.title}</p>
                )}
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-2">
                  Description *
                </label>
                <textarea
                  value={objectiveData.description}
                  onChange={(e) => setObjectiveData({ ...objectiveData, description: e.target.value })}
                  className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary h-24 ${
                    errors.description ? 'border-red-500' : 'border-input'
                  }`}
                  placeholder="Describe the objective's purpose and expected outcomes..."
                />
                {errors.description && (
                  <p className="text-red-500 text-sm mt-1">{errors.description}</p>
                )}
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-3">
                  Status
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setObjectiveData({ ...objectiveData, status: 'on-track' })}
                    className={`p-4 rounded-lg border-2 transition-all flex items-center gap-3 ${
                      objectiveData.status === 'on-track'
                        ? 'border-green-500 bg-green-50'
                        : 'border-gray-200 hover:border-green-300'
                    }`}
                  >
                    <CheckCircle className="h-5 w-5 text-green-600" />
                    <span className="font-medium">On Track</span>
                  </button>
                  
                  <button
                    type="button"
                    onClick={() => setObjectiveData({ ...objectiveData, status: 'at-risk' })}
                    className={`p-4 rounded-lg border-2 transition-all flex items-center gap-3 ${
                      objectiveData.status === 'at-risk'
                        ? 'border-red-500 bg-red-50'
                        : 'border-gray-200 hover:border-red-300'
                    }`}
                  >
                    <AlertCircle className="h-5 w-5 text-red-600" />
                    <span className="font-medium">At Risk</span>
                  </button>
                  
                  <button
                    type="button"
                    onClick={() => setObjectiveData({ ...objectiveData, status: 'on-target' })}
                    className={`p-4 rounded-lg border-2 transition-all flex items-center gap-3 ${
                      objectiveData.status === 'on-target'
                        ? 'border-blue-500 bg-blue-50'
                        : 'border-gray-200 hover:border-blue-300'
                    }`}
                  >
                    <Target className="h-5 w-5 text-blue-600" />
                    <span className="font-medium">On Target</span>
                  </button>
                  
                  <button
                    type="button"
                    onClick={() => setObjectiveData({ ...objectiveData, status: 'not-started' })}
                    className={`p-4 rounded-lg border-2 transition-all flex items-center gap-3 ${
                      objectiveData.status === 'not-started'
                        ? 'border-gray-500 bg-gray-50'
                        : 'border-gray-200 hover:border-gray-400'
                    }`}
                  >
                    <Clock className="h-5 w-5 text-gray-600" />
                    <span className="font-medium">Not Started</span>
                  </button>
                </div>
              </div>
              
              {isEditMode && (
                <div className="mt-4">
                  <label className="block text-sm font-medium mb-2 text-muted-foreground">
                    Goals under this objective
                  </label>
                  <div className="space-y-2">
                    {existingObjective?.children?.map((child: any, index: number) => (
                      <div key={child.id} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                        <Clock className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm font-medium">{child.goal_number} {child.title}</span>
                        <span className={`ml-auto px-2 py-1 text-xs rounded-full ${
                          child.status === 'on-target' ? 'bg-green-100 text-green-700' :
                          child.status === 'monitoring' ? 'bg-amber-100 text-amber-700' :
                          child.status === 'critical' ? 'bg-red-100 text-red-700' :
                          'bg-gray-100 text-gray-700'
                        }`}>
                          {child.status?.replace('-', ' ')}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        );

      case 'photo':
        const stockPhotos = [
          { url: 'https://images.unsplash.com/photo-1523050854058-8df90110c9f1', alt: 'Students celebrating success' },
          { url: 'https://images.unsplash.com/photo-1522202176988-66273c2fd55f', alt: 'Students collaborating' },
          { url: 'https://images.unsplash.com/photo-1509062522246-3755977927d7', alt: 'Teacher with students' },
          { url: 'https://images.unsplash.com/photo-1427504494785-3a9ca7044f45', alt: 'Students studying' },
          { url: 'https://images.unsplash.com/photo-1580582932707-520aed937b7b', alt: 'School classroom' },
          { url: 'https://images.unsplash.com/photo-1571260899304-425eee4c7efc', alt: 'Students reading' },
          { url: 'https://images.unsplash.com/photo-1503676260728-1c00da094a0b', alt: 'Education books' },
          { url: 'https://images.unsplash.com/photo-1559827260-dc66d52bef19', alt: 'Students with technology' },
          { url: 'https://images.unsplash.com/photo-1588072432836-e10032774350', alt: 'Online learning' },
          { url: 'https://images.unsplash.com/photo-1596495578065-6e0763fa1178', alt: 'Graduation celebration' },
        ];

        return (
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold mb-2">Cover Photo <span className="text-sm font-normal text-muted-foreground">(Optional)</span></h3>
              <p className="text-sm text-muted-foreground">
                Choose an image to display on the strategic objective card. You can skip this step and add it later.
              </p>
            </div>
            
            <div className="space-y-6">
              {/* Upload Custom Image */}
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-medium mb-1">Upload Custom Image</h4>
                    <p className="text-sm text-muted-foreground">Recommended: 800x400px (2:1), Max 2MB</p>
                  </div>
                  <button className="flex items-center gap-2 px-4 py-2 bg-secondary text-secondary-foreground rounded-lg hover:bg-secondary/80">
                    <Upload className="h-4 w-4" />
                    Choose File
                  </button>
                </div>
              </div>
              
              {/* Stock Photos Library */}
              <div>
                <h4 className="font-medium mb-3">Choose from Library</h4>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  {stockPhotos.map((photo, index) => (
                    <button
                      key={index}
                      type="button"
                      onClick={() => setObjectiveData({ 
                        ...objectiveData, 
                        coverPhotoUrl: photo.url,
                        coverPhotoAlt: photo.alt 
                      })}
                      className={`relative rounded-lg overflow-hidden border-2 transition-all ${
                        objectiveData.coverPhotoUrl === photo.url
                          ? 'border-primary ring-2 ring-primary ring-offset-2'
                          : 'border-gray-200 hover:border-primary/50'
                      }`}
                    >
                      <img 
                        src={photo.url}
                        alt={photo.alt}
                        className="w-full h-32 object-cover"
                      />
                      {objectiveData.coverPhotoUrl === photo.url && (
                        <div className="absolute inset-0 bg-primary/20 flex items-center justify-center">
                          <CheckCircle className="h-8 w-8 text-white drop-shadow-lg" />
                        </div>
                      )}
                    </button>
                  ))}
                </div>
                <div className="text-center text-sm text-muted-foreground mt-2">10 options</div>
              </div>
              
              {objectiveData.coverPhotoUrl && (
                <div className="bg-gray-50 rounded-lg p-4">
                  <h4 className="font-medium mb-2">Selected Photo Preview</h4>
                  <img 
                    src={objectiveData.coverPhotoUrl}
                    alt={objectiveData.coverPhotoAlt}
                    className="w-full rounded-lg"
                  />
                  <button
                    type="button"
                    onClick={() => setObjectiveData({ ...objectiveData, coverPhotoUrl: null, coverPhotoAlt: '' })}
                    className="mt-3 text-sm text-red-600 hover:text-red-700"
                  >
                    Remove Photo
                  </button>
                </div>
              )}
            </div>
          </div>
        );

      case 'goals':
        return (
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold mb-2">{isEditMode ? 'Manage' : 'Define'} Goals for Your Objective</h3>
              <p className="text-sm text-muted-foreground">
                {isEditMode 
                  ? 'Update or add goals for your objective'
                  : 'Break down your objective into specific, achievable goals'}
              </p>
            </div>
            
            {errors.goals && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <p className="text-red-600 text-sm">{errors.goals}</p>
              </div>
            )}
            
            <div className="space-y-4">
              {goals.map((goal, index) => (
                <div key={goal.id} className="border border-border rounded-lg p-4">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center">
                        <span className="text-sm font-semibold">{index + 1}</span>
                      </div>
                      <h4 className="font-medium">Goal {index + 1}</h4>
                    </div>
                    <button
                      onClick={() => removeGoal(goal.id)}
                      className="text-red-500 hover:text-red-600 p-1"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                  
                  <div className="space-y-3">
                    <input
                      type="text"
                      value={goal.title}
                      onChange={(e) => updateGoal(goal.id, 'title', e.target.value)}
                      className="w-full px-3 py-2 border border-input rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                      placeholder="Goal title (e.g., ELA/Reading Proficiency)"
                    />
                    
                    <textarea
                      value={goal.description}
                      onChange={(e) => updateGoal(goal.id, 'description', e.target.value)}
                      className="w-full px-3 py-2 border border-input rounded-lg focus:outline-none focus:ring-2 focus:ring-primary h-20"
                      placeholder="Describe what this goal aims to achieve..."
                    />
                  </div>
                </div>
              ))}
              
              <button
                onClick={addGoal}
                className="w-full py-3 border-2 border-dashed border-primary/30 rounded-lg text-primary hover:bg-primary/5 transition-colors flex items-center justify-center gap-2"
              >
                <Plus className="h-5 w-5" />
                Add Goal
              </button>
            </div>
            
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="flex gap-3">
                <Info className="h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-blue-900">Goal Writing Tips</p>
                  <ul className="text-sm text-blue-700 mt-1 space-y-1">
                    <li>• Make goals specific and measurable</li>
                    <li>• Align each goal with your objective</li>
                    <li>• Consider different aspects (academic, operational, cultural)</li>
                    <li>• Typically 3-6 goals per objective work best</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        );

      case 'metrics':
        return (
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold mb-2">How Will You Measure Success? <span className="text-sm font-normal text-muted-foreground">(Optional)</span></h3>
              <p className="text-sm text-muted-foreground">
                Add key measures to track progress for each goal. You can skip this step and add measures later.
              </p>
            </div>
            
            <div className="space-y-4">
              {goals.map((goal, goalIndex) => (
                <div key={goal.id} className="border border-border rounded-lg p-4">
                  <div className="flex items-center gap-2 mb-3">
                    <div className="w-6 h-6 bg-primary/10 rounded-full flex items-center justify-center">
                      <span className="text-xs font-semibold">{goalIndex + 1}</span>
                    </div>
                    <h4 className="font-medium text-sm">{goal.title || `Goal ${goalIndex + 1}`}</h4>
                  </div>
                  
                  {goal.metrics.map((metric, metricIndex) => (
                    <div key={metric.id} className="ml-8 mb-2 p-2 bg-gray-50 rounded">
                      <div className="grid grid-cols-4 gap-2">
                        <input
                          type="text"
                          value={metric.name}
                          onChange={(e) => {
                            const newMetrics = [...goal.metrics];
                            newMetrics[metricIndex] = { ...metric, name: e.target.value };
                            updateGoal(goal.id, 'metrics', newMetrics);
                          }}
                          className="px-2 py-1 border border-input rounded text-sm"
                          placeholder="Metric name"
                        />
                        <select
                          value={metric.type}
                          onChange={(e) => {
                            const newMetrics = [...goal.metrics];
                            newMetrics[metricIndex] = { ...metric, type: e.target.value };
                            updateGoal(goal.id, 'metrics', newMetrics);
                          }}
                          className="px-2 py-1 border border-input rounded text-sm"
                        >
                          <option value="percent">Percentage</option>
                          <option value="number">Number</option>
                          <option value="currency">Currency</option>
                          <option value="rating">Rating</option>
                        </select>
                        <input
                          type="number"
                          value={metric.targetValue}
                          onChange={(e) => {
                            const newMetrics = [...goal.metrics];
                            newMetrics[metricIndex] = { ...metric, targetValue: parseFloat(e.target.value) };
                            updateGoal(goal.id, 'metrics', newMetrics);
                          }}
                          className="px-2 py-1 border border-input rounded text-sm"
                          placeholder="Target"
                        />
                        <input
                          type="text"
                          value={metric.unit}
                          onChange={(e) => {
                            const newMetrics = [...goal.metrics];
                            newMetrics[metricIndex] = { ...metric, unit: e.target.value };
                            updateGoal(goal.id, 'metrics', newMetrics);
                          }}
                          className="px-2 py-1 border border-input rounded text-sm"
                          placeholder="Unit"
                        />
                      </div>
                    </div>
                  ))}
                  
                  <button
                    onClick={() => addMetricToGoal(goal.id)}
                    className="ml-8 mt-2 text-sm text-primary hover:text-primary/80 flex items-center gap-1"
                  >
                    <Plus className="h-4 w-4" />
                    Add Measure
                  </button>
                </div>
              ))}
            </div>
            
            <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
              <div className="flex gap-3">
                <Info className="h-5 w-5 text-amber-600 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-amber-900">Note</p>
                  <p className="text-sm text-amber-700 mt-1">
                    You can skip adding metrics now and add them later. This gives you flexibility to define metrics as you develop your implementation plan.
                  </p>
                </div>
              </div>
            </div>
          </div>
        );

      case 'review':
        return (
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold mb-2">Review Your Objective</h3>
              <p className="text-sm text-muted-foreground">
                Review the details before {isEditMode ? 'updating' : 'creating'} your objective
              </p>
            </div>
            
            <div className="space-y-4">
              <div className="border border-border rounded-lg p-4">
                <h4 className="font-medium text-sm text-muted-foreground mb-1">Objective Type</h4>
                <p className="capitalize">{objectiveType}</p>
              </div>
              
              <div className="border border-border rounded-lg p-4">
                <h4 className="font-medium text-sm text-muted-foreground mb-1">Title</h4>
                <p className="font-semibold">{objectiveData.title}</p>
              </div>
              
              <div className="border border-border rounded-lg p-4">
                <h4 className="font-medium text-sm text-muted-foreground mb-1">Description</h4>
                <p className="text-sm">{objectiveData.description}</p>
              </div>
              
              <div className="border border-border rounded-lg p-4">
                <h4 className="font-medium text-sm text-muted-foreground mb-1">Status</h4>
                <div className="flex items-center gap-2">
                  <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium"
                    style={{
                      backgroundColor: objectiveData.status === 'on-target' ? '#10b98120' : 
                                     objectiveData.status === 'on-track' ? '#10b98120' :
                                     objectiveData.status === 'at-risk' ? '#ef444420' :
                                     '#6b728020',
                      color: objectiveData.status === 'on-target' ? '#059669' : 
                            objectiveData.status === 'on-track' ? '#059669' :
                            objectiveData.status === 'at-risk' ? '#dc2626' :
                            '#4b5563'
                    }}>
                    <span className="w-1.5 h-1.5 rounded-full"
                      style={{
                        backgroundColor: objectiveData.status === 'on-target' ? '#059669' : 
                                        objectiveData.status === 'on-track' ? '#059669' :
                                        objectiveData.status === 'at-risk' ? '#dc2626' :
                                        '#4b5563'
                      }} />
                    {objectiveData.status === 'on-target' ? 'On Target' :
                     objectiveData.status === 'on-track' ? 'On Track' :
                     objectiveData.status === 'at-risk' ? 'At Risk' : 'Not Started'}
                  </span>
                </div>
              </div>
              
              {objectiveData.coverPhotoUrl && (
                <div className="border border-border rounded-lg p-4">
                  <h4 className="font-medium text-sm text-muted-foreground mb-2">Cover Photo</h4>
                  <img 
                    src={objectiveData.coverPhotoUrl}
                    alt={objectiveData.coverPhotoAlt}
                    className="w-full h-32 object-cover rounded-lg"
                  />
                </div>
              )}
              
              <div className="border border-border rounded-lg p-4">
                <h4 className="font-medium text-sm text-muted-foreground mb-3">Goals ({goals.length})</h4>
                <div className="space-y-2">
                  {goals.map((goal, index) => (
                    <div key={goal.id} className="flex items-start gap-2">
                      <div className="w-5 h-5 bg-primary/10 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                        <span className="text-xs">{index + 1}</span>
                      </div>
                      <div className="flex-1">
                        <p className="font-medium text-sm">{goal.title || 'Untitled Goal'}</p>
                        {goal.description && (
                          <p className="text-xs text-muted-foreground mt-1">{goal.description}</p>
                        )}
                        {goal.metrics.length > 0 && (
                          <p className="text-xs text-primary mt-1">{goal.metrics.length} metrics defined</p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
            
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <div className="flex gap-3">
                <CheckCircle className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-green-900">Ready to {isEditMode ? 'Update' : 'Create'}!</p>
                  <p className="text-sm text-green-700 mt-1">
                    Your objective is ready to be {isEditMode ? 'updated' : 'created'}. You can always edit and add more details later.
                  </p>
                </div>
              </div>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-background rounded-xl shadow-xl max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col">
        <div className="flex items-center justify-between p-6 border-b border-border">
          <div>
            <h2 className="text-2xl font-bold">
              {isEditMode ? 'Edit' : 'Create New'} {objectiveType === 'strategic' ? 'Strategic' : 'Operational'} Objective
            </h2>
            <p className="text-sm text-muted-foreground mt-1">
              {isEditMode 
                ? 'Update your objective with guided assistance' 
                : 'Build your objective step by step with guided assistance'}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
        
        <div className="flex-1 overflow-y-auto">
          <div className="py-6">
            {renderStepIndicator()}
            <div className="px-6">
              {renderStepContent()}
            </div>
          </div>
        </div>
        
        <div className="flex items-center justify-between p-6 border-t border-border bg-gray-50">
          <button
            onClick={onClose}
            className="px-4 py-2 text-muted-foreground hover:text-foreground transition-colors"
          >
            Cancel
          </button>
          
          <div className="flex gap-3">
            {currentStepIndex > 0 && (
              <button
                onClick={handleBack}
                className="px-4 py-2 border border-input rounded-lg hover:bg-gray-50 transition-colors flex items-center gap-2"
              >
                <ChevronLeft className="h-4 w-4" />
                Back
              </button>
            )}
            
            {/* Show Save & Close after basics step or in edit mode */}
            {(currentStep !== 'type' && currentStep !== 'basics') && (
              <button
                onClick={handleSaveAndClose}
                className="px-4 py-2 border border-input bg-white rounded-lg hover:bg-gray-50 transition-colors flex items-center gap-2"
              >
                Save & Close
              </button>
            )}
            
            {currentStepIndex < steps.length - 1 ? (
              <button
                onClick={handleNext}
                className="px-6 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors flex items-center gap-2"
              >
                Next
                <ChevronRight className="h-4 w-4" />
              </button>
            ) : (
              <button
                onClick={handleComplete}
                className="px-6 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors flex items-center gap-2"
              >
                <CheckCircle className="h-4 w-4" />
                {isEditMode ? 'Update' : 'Create'} Objective
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}