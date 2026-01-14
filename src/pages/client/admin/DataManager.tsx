import React, { useState, useMemo, useRef } from 'react';
import { useParams } from 'react-router-dom';
import {
  ChevronDown,
  ChevronRight,
  AlertTriangle,
  Trash2,
  Edit2,
  Database,
  RefreshCw,
  CheckCircle,
  X,
  Save,
  Upload,
  FileText,
  GitCompare,
  Plus,
  Minus,
  ArrowRight
} from 'lucide-react';
import { useDistrict } from '../../../hooks/useDistricts';
import { useGoals, useUpdateGoal, useDeleteGoal } from '../../../hooks/useGoals';
import { useMetricsByDistrict } from '../../../hooks/useMetrics';
import type { Goal, HierarchicalGoal, Metric } from '../../../lib/types';
import { parseSqlImportFile, compareGoals, compareMetrics, type ParsedImportData, type ParsedGoal, type ParsedMetric, type ComparisonResult, type MetricComparisonResult } from '../../../lib/services/sqlImportParser';

type ViewTab = 'live' | 'staged' | 'compare';

// Validation issue types
interface ValidationIssue {
  type: 'duplicate' | 'missing_metrics' | 'orphan';
  severity: 'error' | 'warning';
  goalId: string;
  goalNumber: string;
  message: string;
}

// Validate district data for issues
function validateDistrictData(goals: Goal[], metrics: Metric[]): ValidationIssue[] {
  const issues: ValidationIssue[] = [];

  // Find duplicate goal numbers
  const goalNumberCounts = new Map<string, Goal[]>();
  goals.forEach(goal => {
    const existing = goalNumberCounts.get(goal.goal_number) || [];
    existing.push(goal);
    goalNumberCounts.set(goal.goal_number, existing);
  });

  goalNumberCounts.forEach((goalsWithNumber, goalNumber) => {
    if (goalsWithNumber.length > 1) {
      goalsWithNumber.forEach(goal => {
        issues.push({
          type: 'duplicate',
          severity: 'error',
          goalId: goal.id,
          goalNumber: goal.goal_number,
          message: `Duplicate goal number "${goalNumber}" (${goalsWithNumber.length} goals)`
        });
      });
    }
  });

  // Find level 1+ goals without metrics (warning only)
  goals.filter(g => g.level > 0).forEach(goal => {
    const goalMetrics = metrics.filter(m => m.goal_id === goal.id);
    if (goalMetrics.length === 0) {
      issues.push({
        type: 'missing_metrics',
        severity: 'warning',
        goalId: goal.id,
        goalNumber: goal.goal_number,
        message: `Goal ${goal.goal_number} has no metrics`
      });
    }
  });

  return issues;
}

// Tree node component
function TreeNode({
  goal,
  level,
  selectedId,
  onSelect,
  expandedIds,
  onToggleExpand,
  issues
}: {
  goal: HierarchicalGoal;
  level: number;
  selectedId: string | null;
  onSelect: (goal: HierarchicalGoal) => void;
  expandedIds: Set<string>;
  onToggleExpand: (id: string) => void;
  issues: ValidationIssue[];
}) {
  const hasChildren = goal.children && goal.children.length > 0;
  const isExpanded = expandedIds.has(goal.id);
  const isSelected = selectedId === goal.id;
  const goalIssues = issues.filter(i => i.goalId === goal.id);
  const hasError = goalIssues.some(i => i.severity === 'error');
  const hasWarning = goalIssues.some(i => i.severity === 'warning');

  return (
    <div>
      <div
        className={`flex items-center gap-1 px-2 py-1.5 cursor-pointer rounded transition-colors ${
          isSelected
            ? 'bg-blue-100 text-blue-900'
            : 'hover:bg-gray-100'
        }`}
        style={{ paddingLeft: `${level * 16 + 8}px` }}
        onClick={() => onSelect(goal)}
      >
        {hasChildren ? (
          <button
            onClick={(e) => {
              e.stopPropagation();
              onToggleExpand(goal.id);
            }}
            className="p-0.5 hover:bg-gray-200 rounded"
          >
            {isExpanded ? (
              <ChevronDown className="h-3.5 w-3.5 text-gray-500" />
            ) : (
              <ChevronRight className="h-3.5 w-3.5 text-gray-500" />
            )}
          </button>
        ) : (
          <div className="w-4" />
        )}

        <span className={`text-sm truncate flex-1 ${
          level === 0 ? 'font-semibold' : ''
        }`}>
          {goal.goal_number} {goal.title.substring(0, 30)}{goal.title.length > 30 ? '...' : ''}
        </span>

        {hasError && (
          <AlertTriangle className="h-3.5 w-3.5 text-red-500 flex-shrink-0" />
        )}
        {!hasError && hasWarning && (
          <AlertTriangle className="h-3.5 w-3.5 text-yellow-500 flex-shrink-0" />
        )}
      </div>

      {hasChildren && isExpanded && (
        <div>
          {goal.children?.map((child) => (
            <TreeNode
              key={child.id}
              goal={child as HierarchicalGoal}
              level={level + 1}
              selectedId={selectedId}
              onSelect={onSelect}
              expandedIds={expandedIds}
              onToggleExpand={onToggleExpand}
              issues={issues}
            />
          ))}
        </div>
      )}
    </div>
  );
}

export function DataManager() {
  const { slug } = useParams();
  const { data: district } = useDistrict(slug!);
  const { data: goals, isLoading, refetch } = useGoals(district?.id!);
  const { data: allMetrics } = useMetricsByDistrict(district?.id!);
  const updateGoalMutation = useUpdateGoal();
  const deleteGoalMutation = useDeleteGoal();

  const [selectedGoal, setSelectedGoal] = useState<HierarchicalGoal | null>(null);
  const [expandedIds, setExpandedIds] = useState<Set<string>>(new Set());
  const [deleteModal, setDeleteModal] = useState<Goal | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [editedTitle, setEditedTitle] = useState('');
  const [editedDescription, setEditedDescription] = useState('');

  // Tabs and staged data state
  const [activeTab, setActiveTab] = useState<ViewTab>('live');
  const [stagedData, setStagedData] = useState<ParsedImportData | null>(null);
  const [sqlContent, setSqlContent] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Flatten goals for validation
  const flatGoals = useMemo(() => {
    if (!goals) return [];
    const flat: Goal[] = [];
    const flatten = (items: HierarchicalGoal[]) => {
      items.forEach(item => {
        flat.push(item);
        if (item.children) {
          flatten(item.children as HierarchicalGoal[]);
        }
      });
    };
    flatten(goals);
    return flat;
  }, [goals]);

  // Validate data
  const validationIssues = useMemo(() => {
    return validateDistrictData(flatGoals, allMetrics || []);
  }, [flatGoals, allMetrics]);

  const errorCount = validationIssues.filter(i => i.severity === 'error').length;
  const warningCount = validationIssues.filter(i => i.severity === 'warning').length;

  // Compare staged data against live data
  const comparisonResult = useMemo<ComparisonResult | null>(() => {
    if (!stagedData || !flatGoals.length) return null;
    return compareGoals(stagedData.goals, flatGoals);
  }, [stagedData, flatGoals]);

  // Compare staged metrics against live metrics
  const metricComparisonResult = useMemo<MetricComparisonResult | null>(() => {
    if (!stagedData || !allMetrics?.length) return null;
    return compareMetrics(stagedData.metrics, allMetrics);
  }, [stagedData, allMetrics]);

  // Create a map of goal_id to goal_number for display
  const goalIdToNumber = useMemo(() => {
    const map = new Map<string, string>();
    flatGoals.forEach(g => map.set(g.id, g.goal_number));
    stagedData?.goals.forEach(g => map.set(g.id, g.goal_number));
    return map;
  }, [flatGoals, stagedData]);

  // Handle SQL file upload
  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      const content = e.target?.result as string;
      setSqlContent(content);
      const parsed = parseSqlImportFile(content);
      setStagedData(parsed);
      // Auto-switch to compare tab if we have both staged and live data
      if (flatGoals.length > 0) {
        setActiveTab('compare');
      } else {
        setActiveTab('staged');
      }
    };
    reader.readAsText(file);
  };

  // Handle paste SQL
  const handleParseSql = () => {
    if (!sqlContent.trim()) return;
    const parsed = parseSqlImportFile(sqlContent);
    setStagedData(parsed);
    if (flatGoals.length > 0) {
      setActiveTab('compare');
    } else {
      setActiveTab('staged');
    }
  };

  // Auto-expand all objectives on load
  React.useEffect(() => {
    if (goals) {
      const objectiveIds = goals.map(g => g.id);
      setExpandedIds(new Set(objectiveIds));
    }
  }, [goals]);

  const handleToggleExpand = (id: string) => {
    const newExpanded = new Set(expandedIds);
    if (newExpanded.has(id)) {
      newExpanded.delete(id);
    } else {
      newExpanded.add(id);
    }
    setExpandedIds(newExpanded);
  };

  const handleSelect = (goal: HierarchicalGoal) => {
    setSelectedGoal(goal);
    setEditMode(false);
    setEditedTitle(goal.title);
    setEditedDescription(goal.description || '');
  };

  const handleDelete = async () => {
    if (!deleteModal) return;
    setIsDeleting(true);
    try {
      await deleteGoalMutation.mutateAsync(deleteModal.id);
      await refetch();
      setDeleteModal(null);
      setSelectedGoal(null);
    } catch (error) {
      console.error('Delete failed:', error);
      alert('Failed to delete. Please try again.');
    } finally {
      setIsDeleting(false);
    }
  };

  const handleSave = async () => {
    if (!selectedGoal) return;
    try {
      await updateGoalMutation.mutateAsync({
        id: selectedGoal.id,
        updates: {
          title: editedTitle,
          description: editedDescription
        }
      });
      await refetch();
      setEditMode(false);
      // Update local state
      setSelectedGoal({
        ...selectedGoal,
        title: editedTitle,
        description: editedDescription
      });
    } catch (error) {
      console.error('Update failed:', error);
      alert('Failed to save. Please try again.');
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-muted-foreground">Loading data...</div>
      </div>
    );
  }

  const selectedIssues = selectedGoal
    ? validationIssues.filter(i => i.goalId === selectedGoal.id)
    : [];
  const selectedMetrics = selectedGoal
    ? allMetrics?.filter(m => m.goal_id === selectedGoal.id) || []
    : [];
  const selectedChildren = selectedGoal?.children || [];

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
            <Database className="h-6 w-6" />
            Data Manager
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            View, verify, and compare staged vs live strategic plan data
          </p>
        </div>
        <div className="flex items-center gap-2">
          <input
            ref={fileInputRef}
            type="file"
            accept=".sql"
            onChange={handleFileUpload}
            className="hidden"
          />
          <button
            onClick={() => fileInputRef.current?.click()}
            className="flex items-center gap-2 px-3 py-2 text-sm border border-blue-300 text-blue-700 bg-blue-50 rounded-md hover:bg-blue-100 transition-colors"
          >
            <Upload className="h-4 w-4" />
            Load SQL File
          </button>
          <button
            onClick={() => refetch()}
            className="flex items-center gap-2 px-3 py-2 text-sm border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
          >
            <RefreshCw className="h-4 w-4" />
            Refresh
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200">
        <nav className="flex gap-4" aria-label="Tabs">
          <button
            onClick={() => setActiveTab('live')}
            className={`py-2 px-1 border-b-2 text-sm font-medium transition-colors ${
              activeTab === 'live'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            <span className="flex items-center gap-2">
              <Database className="h-4 w-4" />
              Live Data
              {flatGoals.length > 0 && (
                <span className="text-xs bg-gray-100 px-1.5 py-0.5 rounded">
                  {flatGoals.length}
                </span>
              )}
            </span>
          </button>
          <button
            onClick={() => setActiveTab('staged')}
            className={`py-2 px-1 border-b-2 text-sm font-medium transition-colors ${
              activeTab === 'staged'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            <span className="flex items-center gap-2">
              <FileText className="h-4 w-4" />
              Staged Data
              {stagedData && (
                <span className="text-xs bg-gray-100 px-1.5 py-0.5 rounded">
                  {stagedData.goals.length}
                </span>
              )}
            </span>
          </button>
          <button
            onClick={() => setActiveTab('compare')}
            disabled={!stagedData || flatGoals.length === 0}
            className={`py-2 px-1 border-b-2 text-sm font-medium transition-colors ${
              activeTab === 'compare'
                ? 'border-blue-500 text-blue-600'
                : !stagedData || flatGoals.length === 0
                  ? 'border-transparent text-gray-300 cursor-not-allowed'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            <span className="flex items-center gap-2">
              <GitCompare className="h-4 w-4" />
              Compare
              {comparisonResult && (
                <span className="text-xs bg-yellow-100 text-yellow-800 px-1.5 py-0.5 rounded">
                  {comparisonResult.newItems.length + comparisonResult.changedItems.length} changes
                </span>
              )}
            </span>
          </button>
        </nav>
      </div>

      {/* Validation Summary - Only show in Live tab */}
      {activeTab === 'live' && (errorCount > 0 || warningCount > 0) && (
        <div className={`p-3 rounded-lg border ${
          errorCount > 0 ? 'bg-red-50 border-red-200' : 'bg-yellow-50 border-yellow-200'
        }`}>
          <div className="flex items-center gap-2">
            <AlertTriangle className={`h-4 w-4 ${errorCount > 0 ? 'text-red-600' : 'text-yellow-600'}`} />
            <span className="text-sm font-medium">
              {errorCount > 0 && <span className="text-red-700">{errorCount} error{errorCount !== 1 ? 's' : ''}</span>}
              {errorCount > 0 && warningCount > 0 && ' and '}
              {warningCount > 0 && <span className="text-yellow-700">{warningCount} warning{warningCount !== 1 ? 's' : ''}</span>}
              {' found'}
            </span>
          </div>
          {errorCount > 0 && (
            <ul className="mt-2 text-sm text-red-700 space-y-1">
              {validationIssues
                .filter(i => i.severity === 'error')
                .slice(0, 3)
                .map((issue, idx) => (
                  <li key={idx}>• {issue.message}</li>
                ))}
              {validationIssues.filter(i => i.severity === 'error').length > 3 && (
                <li>• ... and {validationIssues.filter(i => i.severity === 'error').length - 3} more</li>
              )}
            </ul>
          )}
        </div>
      )}

      {/* STAGED DATA TAB */}
      {activeTab === 'staged' && (
        <div className="space-y-4">
          {!stagedData ? (
            <div className="bg-white border border-gray-200 rounded-lg p-8 text-center">
              <FileText className="h-12 w-12 mx-auto mb-4 text-gray-300" />
              <h3 className="text-lg font-medium text-gray-700 mb-2">No Staged Data</h3>
              <p className="text-sm text-gray-500 mb-4">
                Upload or paste a SQL import file to preview changes before importing.
              </p>
              <div className="flex flex-col gap-4 max-w-xl mx-auto">
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="flex items-center justify-center gap-2 px-4 py-3 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                >
                  <Upload className="h-5 w-5" />
                  Upload SQL File
                </button>
                <div className="text-gray-400 text-sm">or paste SQL below</div>
                <textarea
                  value={sqlContent}
                  onChange={(e) => setSqlContent(e.target.value)}
                  placeholder="Paste your SQL INSERT statements here..."
                  className="w-full h-40 px-3 py-2 border border-gray-300 rounded-md text-sm font-mono focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <button
                  onClick={handleParseSql}
                  disabled={!sqlContent.trim()}
                  className="flex items-center justify-center gap-2 px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Parse SQL
                </button>
              </div>
            </div>
          ) : (
            <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
              <div className="px-4 py-3 bg-gray-50 border-b border-gray-200 flex items-center justify-between">
                <div>
                  <h3 className="font-medium text-gray-900">Parsed Staged Data</h3>
                  <p className="text-sm text-gray-500">
                    {stagedData.goals.length} goals, {stagedData.metrics.length} metrics, {stagedData.timeSeries.length} time series
                  </p>
                </div>
                <button
                  onClick={() => { setStagedData(null); setSqlContent(''); }}
                  className="text-sm text-gray-500 hover:text-gray-700"
                >
                  Clear
                </button>
              </div>
              <div className="max-h-[calc(100vh-400px)] overflow-auto">
                <table className="w-full text-sm">
                  <thead className="bg-gray-50 sticky top-0">
                    <tr>
                      <th className="text-left px-4 py-2 text-xs font-medium text-gray-500">#</th>
                      <th className="text-left px-4 py-2 text-xs font-medium text-gray-500">Level</th>
                      <th className="text-left px-4 py-2 text-xs font-medium text-gray-500">Title</th>
                      <th className="text-left px-4 py-2 text-xs font-medium text-gray-500">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {stagedData.goals.map((goal) => (
                      <tr key={goal.id} className="border-t border-gray-200 hover:bg-gray-50">
                        <td className="px-4 py-2 font-medium">{goal.goal_number}</td>
                        <td className="px-4 py-2">
                          <span className={`px-2 py-0.5 rounded text-xs ${
                            goal.level === 0 ? 'bg-blue-100 text-blue-800' :
                            goal.level === 1 ? 'bg-green-100 text-green-800' :
                            'bg-gray-100 text-gray-800'
                          }`}>
                            {goal.level === 0 ? 'Objective' : goal.level === 1 ? 'Goal' : 'Sub-goal'}
                          </span>
                        </td>
                        <td className="px-4 py-2 text-gray-600 truncate max-w-md">{goal.title}</td>
                        <td className="px-4 py-2 text-gray-500">{goal.status}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              {stagedData.errors.length > 0 && (
                <div className="px-4 py-3 bg-red-50 border-t border-red-200">
                  <h4 className="font-medium text-red-800 text-sm">Parse Errors</h4>
                  <ul className="text-sm text-red-700 mt-1">
                    {stagedData.errors.map((err, idx) => (
                      <li key={idx}>• {err}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* COMPARE TAB */}
      {activeTab === 'compare' && comparisonResult && (
        <div className="space-y-4">
          {/* Comparison Summary */}
          <div className="grid grid-cols-4 gap-4">
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <div className="flex items-center gap-2">
                <Plus className="h-5 w-5 text-green-600" />
                <span className="text-2xl font-bold text-green-700">{comparisonResult.newItems.length}</span>
              </div>
              <p className="text-sm text-green-600 mt-1">New items</p>
            </div>
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <div className="flex items-center gap-2">
                <ArrowRight className="h-5 w-5 text-yellow-600" />
                <span className="text-2xl font-bold text-yellow-700">{comparisonResult.changedItems.length}</span>
              </div>
              <p className="text-sm text-yellow-600 mt-1">Changed items</p>
            </div>
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <div className="flex items-center gap-2">
                <AlertTriangle className="h-5 w-5 text-red-600" />
                <span className="text-2xl font-bold text-red-700">{comparisonResult.conflicts.length}</span>
              </div>
              <p className="text-sm text-red-600 mt-1">Conflicts</p>
            </div>
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
              <div className="flex items-center gap-2">
                <CheckCircle className="h-5 w-5 text-gray-500" />
                <span className="text-2xl font-bold text-gray-700">{comparisonResult.unchanged.length}</span>
              </div>
              <p className="text-sm text-gray-500 mt-1">Unchanged</p>
            </div>
          </div>

          {/* New Items */}
          {comparisonResult.newItems.length > 0 && (
            <div className="bg-white border border-green-200 rounded-lg overflow-hidden">
              <div className="px-4 py-3 bg-green-50 border-b border-green-200">
                <h3 className="font-medium text-green-800 flex items-center gap-2">
                  <Plus className="h-4 w-4" />
                  New Items ({comparisonResult.newItems.length})
                </h3>
                <p className="text-sm text-green-600">These items will be added to the database</p>
              </div>
              <div className="divide-y divide-gray-200">
                {comparisonResult.newItems.map((item) => (
                  <div key={item.id} className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-green-700">{item.goal_number}</span>
                      <span className="text-gray-600">{item.title}</span>
                    </div>
                    <p className="text-xs text-gray-400 mt-1">ID: {item.id}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Changed Items - Side by Side */}
          {comparisonResult.changedItems.length > 0 && (
            <div className="bg-white border border-yellow-200 rounded-lg overflow-hidden">
              <div className="px-4 py-3 bg-yellow-50 border-b border-yellow-200">
                <h3 className="font-medium text-yellow-800 flex items-center gap-2">
                  <ArrowRight className="h-4 w-4" />
                  Changed Items ({comparisonResult.changedItems.length})
                </h3>
                <p className="text-sm text-yellow-600">These items have differences between staged and live</p>
              </div>
              <div className="divide-y divide-gray-200">
                {comparisonResult.changedItems.map(({ staged, live, changes }) => (
                  <div key={staged.id} className="p-4">
                    <div className="flex items-center gap-2 mb-3">
                      <span className="font-medium">{staged.goal_number}</span>
                      <span className="text-xs bg-yellow-100 text-yellow-700 px-2 py-0.5 rounded">
                        {changes.join(', ')} changed
                      </span>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      {/* Live (Current) */}
                      <div className="bg-red-50/50 border border-red-100 rounded p-3">
                        <h4 className="text-xs font-medium text-red-600 uppercase mb-2 flex items-center gap-1">
                          <Minus className="h-3 w-3" /> Live (Current)
                        </h4>
                        {changes.includes('title') && (
                          <div className="mb-2">
                            <span className="text-xs text-gray-500">Title:</span>
                            <p className="text-sm text-red-700 bg-red-100 px-1 rounded">{live.title}</p>
                          </div>
                        )}
                        {changes.includes('description') && (
                          <div className="mb-2">
                            <span className="text-xs text-gray-500">Description:</span>
                            <p className="text-sm text-red-700 bg-red-100 px-1 rounded line-clamp-2">{live.description || '(empty)'}</p>
                          </div>
                        )}
                        {changes.includes('goal_number') && (
                          <div className="mb-2">
                            <span className="text-xs text-gray-500">Number:</span>
                            <p className="text-sm text-red-700 bg-red-100 px-1 rounded">{live.goal_number}</p>
                          </div>
                        )}
                        {changes.includes('status') && (
                          <div>
                            <span className="text-xs text-gray-500">Status:</span>
                            <p className="text-sm text-red-700 bg-red-100 px-1 rounded">{live.status}</p>
                          </div>
                        )}
                      </div>
                      {/* Staged (New) */}
                      <div className="bg-green-50/50 border border-green-100 rounded p-3">
                        <h4 className="text-xs font-medium text-green-600 uppercase mb-2 flex items-center gap-1">
                          <Plus className="h-3 w-3" /> Staged (New)
                        </h4>
                        {changes.includes('title') && (
                          <div className="mb-2">
                            <span className="text-xs text-gray-500">Title:</span>
                            <p className="text-sm text-green-700 bg-green-100 px-1 rounded">{staged.title}</p>
                          </div>
                        )}
                        {changes.includes('description') && (
                          <div className="mb-2">
                            <span className="text-xs text-gray-500">Description:</span>
                            <p className="text-sm text-green-700 bg-green-100 px-1 rounded line-clamp-2">{staged.description || '(empty)'}</p>
                          </div>
                        )}
                        {changes.includes('goal_number') && (
                          <div className="mb-2">
                            <span className="text-xs text-gray-500">Number:</span>
                            <p className="text-sm text-green-700 bg-green-100 px-1 rounded">{staged.goal_number}</p>
                          </div>
                        )}
                        {changes.includes('status') && (
                          <div>
                            <span className="text-xs text-gray-500">Status:</span>
                            <p className="text-sm text-green-700 bg-green-100 px-1 rounded">{staged.status}</p>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Conflicts */}
          {comparisonResult.conflicts.length > 0 && (
            <div className="bg-white border border-red-200 rounded-lg overflow-hidden">
              <div className="px-4 py-3 bg-red-50 border-b border-red-200">
                <h3 className="font-medium text-red-800 flex items-center gap-2">
                  <AlertTriangle className="h-4 w-4" />
                  Conflicts ({comparisonResult.conflicts.length})
                </h3>
                <p className="text-sm text-red-600">These items have conflicts that need resolution</p>
              </div>
              <div className="divide-y divide-gray-200">
                {comparisonResult.conflicts.map(({ staged, live, reason }) => (
                  <div key={staged.id} className="p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <AlertTriangle className="h-4 w-4 text-red-500" />
                      <span className="font-medium text-red-700">{staged.goal_number}</span>
                      <span className="text-gray-600">{staged.title}</span>
                    </div>
                    <p className="text-sm text-red-600 bg-red-50 px-2 py-1 rounded">{reason}</p>
                    <div className="mt-2 grid grid-cols-2 gap-4 text-xs">
                      <div>
                        <span className="text-gray-500">Staged ID:</span> <code className="bg-gray-100 px-1 rounded">{staged.id}</code>
                      </div>
                      <div>
                        <span className="text-gray-500">Live ID:</span> <code className="bg-gray-100 px-1 rounded">{live.id}</code>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* All unchanged - collapsed */}
          {comparisonResult.unchanged.length > 0 && (
            <details className="bg-white border border-gray-200 rounded-lg overflow-hidden">
              <summary className="px-4 py-3 bg-gray-50 border-b border-gray-200 cursor-pointer hover:bg-gray-100">
                <span className="font-medium text-gray-700">
                  Unchanged Items ({comparisonResult.unchanged.length})
                </span>
              </summary>
              <div className="divide-y divide-gray-200 max-h-64 overflow-auto">
                {comparisonResult.unchanged.map((item) => (
                  <div key={item.id} className="px-4 py-2 text-sm text-gray-600">
                    <span className="font-medium">{item.goal_number}</span> - {item.title}
                  </div>
                ))}
              </div>
            </details>
          )}

          {/* METRICS COMPARISON SECTION */}
          {stagedData && stagedData.metrics.length > 0 && (
            <>
              <div className="border-t-2 border-blue-200 pt-4 mt-6">
                <h2 className="text-lg font-semibold text-blue-800 flex items-center gap-2 mb-4">
                  <Database className="h-5 w-5" />
                  Metrics Comparison
                </h2>
              </div>

              {/* Metrics Summary */}
              <div className="grid grid-cols-4 gap-4">
                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                  <div className="flex items-center gap-2">
                    <Plus className="h-5 w-5 text-green-600" />
                    <span className="text-2xl font-bold text-green-700">{metricComparisonResult?.newItems.length || stagedData.metrics.length}</span>
                  </div>
                  <p className="text-sm text-green-600 mt-1">New metrics</p>
                </div>
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                  <div className="flex items-center gap-2">
                    <ArrowRight className="h-5 w-5 text-yellow-600" />
                    <span className="text-2xl font-bold text-yellow-700">{metricComparisonResult?.changedItems.length || 0}</span>
                  </div>
                  <p className="text-sm text-yellow-600 mt-1">Changed metrics</p>
                </div>
                <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                  <div className="flex items-center gap-2">
                    <AlertTriangle className="h-5 w-5 text-red-600" />
                    <span className="text-2xl font-bold text-red-700">{metricComparisonResult?.conflicts.length || 0}</span>
                  </div>
                  <p className="text-sm text-red-600 mt-1">Conflicts</p>
                </div>
                <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                  <div className="flex items-center gap-2">
                    <CheckCircle className="h-5 w-5 text-gray-500" />
                    <span className="text-2xl font-bold text-gray-700">{metricComparisonResult?.unchanged.length || 0}</span>
                  </div>
                  <p className="text-sm text-gray-500 mt-1">Unchanged</p>
                </div>
              </div>

              {/* New Metrics - Full Detail Table */}
              {(metricComparisonResult?.newItems.length || (!metricComparisonResult && stagedData.metrics.length > 0)) && (
                <div className="bg-white border border-green-200 rounded-lg overflow-hidden">
                  <div className="px-4 py-3 bg-green-50 border-b border-green-200">
                    <h3 className="font-medium text-green-800 flex items-center gap-2">
                      <Plus className="h-4 w-4" />
                      New Metrics ({metricComparisonResult?.newItems.length || stagedData.metrics.length})
                    </h3>
                    <p className="text-sm text-green-600">These metrics will be added to the database</p>
                  </div>
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="text-left px-4 py-2 text-xs font-medium text-gray-500">Goal</th>
                          <th className="text-left px-4 py-2 text-xs font-medium text-gray-500">Metric Name</th>
                          <th className="text-left px-4 py-2 text-xs font-medium text-gray-500">Type</th>
                          <th className="text-right px-4 py-2 text-xs font-medium text-gray-500">Current</th>
                          <th className="text-right px-4 py-2 text-xs font-medium text-gray-500">Target</th>
                          <th className="text-left px-4 py-2 text-xs font-medium text-gray-500">Viz</th>
                        </tr>
                      </thead>
                      <tbody>
                        {(metricComparisonResult?.newItems || stagedData.metrics).map((metric) => (
                          <tr key={metric.id} className="border-t border-gray-200 hover:bg-green-50/50">
                            <td className="px-4 py-2 font-medium text-green-700">
                              {goalIdToNumber.get(metric.goal_id) || metric.goal_id.substring(0, 8)}
                            </td>
                            <td className="px-4 py-2 text-gray-900 max-w-xs truncate">{metric.name}</td>
                            <td className="px-4 py-2">
                              <span className={`px-2 py-0.5 rounded text-xs ${
                                metric.metric_type === 'rating' ? 'bg-purple-100 text-purple-800' :
                                metric.metric_type === 'percent' ? 'bg-blue-100 text-blue-800' :
                                metric.metric_type === 'number' ? 'bg-orange-100 text-orange-800' :
                                'bg-gray-100 text-gray-800'
                              }`}>
                                {metric.metric_type}
                              </span>
                            </td>
                            <td className="px-4 py-2 text-right font-mono">
                              <span className="text-green-700 font-medium">
                                {metric.current_value !== null ? metric.current_value : '-'}
                              </span>
                            </td>
                            <td className="px-4 py-2 text-right font-mono text-gray-500">
                              {metric.target_value !== null ? metric.target_value : '-'}
                            </td>
                            <td className="px-4 py-2">
                              <span className="px-2 py-0.5 bg-indigo-50 text-indigo-700 rounded text-xs">
                                {metric.visualization_type}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* Changed Metrics */}
              {metricComparisonResult && metricComparisonResult.changedItems.length > 0 && (
                <div className="bg-white border border-yellow-200 rounded-lg overflow-hidden">
                  <div className="px-4 py-3 bg-yellow-50 border-b border-yellow-200">
                    <h3 className="font-medium text-yellow-800 flex items-center gap-2">
                      <ArrowRight className="h-4 w-4" />
                      Changed Metrics ({metricComparisonResult.changedItems.length})
                    </h3>
                    <p className="text-sm text-yellow-600">These metrics have differences between staged and live</p>
                  </div>
                  <div className="divide-y divide-gray-200">
                    {metricComparisonResult.changedItems.map(({ staged, live, changes }) => (
                      <div key={staged.id} className="p-4">
                        <div className="flex items-center gap-2 mb-3">
                          <span className="font-medium">{goalIdToNumber.get(staged.goal_id) || staged.goal_id.substring(0, 8)}</span>
                          <span className="text-gray-600">{staged.name}</span>
                          <span className="text-xs bg-yellow-100 text-yellow-700 px-2 py-0.5 rounded">
                            {changes.join(', ')} changed
                          </span>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                          {/* Live (Current) */}
                          <div className="bg-red-50/50 border border-red-100 rounded p-3">
                            <h4 className="text-xs font-medium text-red-600 uppercase mb-2 flex items-center gap-1">
                              <Minus className="h-3 w-3" /> Live (Current)
                            </h4>
                            {changes.includes('current_value') && (
                              <div className="mb-2">
                                <span className="text-xs text-gray-500">Current Value:</span>
                                <p className="text-sm text-red-700 bg-red-100 px-1 rounded font-mono">{live.current_value ?? '-'}</p>
                              </div>
                            )}
                            {changes.includes('target_value') && (
                              <div className="mb-2">
                                <span className="text-xs text-gray-500">Target Value:</span>
                                <p className="text-sm text-red-700 bg-red-100 px-1 rounded font-mono">{live.target_value ?? '-'}</p>
                              </div>
                            )}
                            {changes.includes('metric_type') && (
                              <div className="mb-2">
                                <span className="text-xs text-gray-500">Type:</span>
                                <p className="text-sm text-red-700 bg-red-100 px-1 rounded">{live.metric_type}</p>
                              </div>
                            )}
                            {changes.includes('visualization_type') && (
                              <div>
                                <span className="text-xs text-gray-500">Visualization:</span>
                                <p className="text-sm text-red-700 bg-red-100 px-1 rounded">{live.visualization_type}</p>
                              </div>
                            )}
                          </div>
                          {/* Staged (New) */}
                          <div className="bg-green-50/50 border border-green-100 rounded p-3">
                            <h4 className="text-xs font-medium text-green-600 uppercase mb-2 flex items-center gap-1">
                              <Plus className="h-3 w-3" /> Staged (New)
                            </h4>
                            {changes.includes('current_value') && (
                              <div className="mb-2">
                                <span className="text-xs text-gray-500">Current Value:</span>
                                <p className="text-sm text-green-700 bg-green-100 px-1 rounded font-mono">{staged.current_value ?? '-'}</p>
                              </div>
                            )}
                            {changes.includes('target_value') && (
                              <div className="mb-2">
                                <span className="text-xs text-gray-500">Target Value:</span>
                                <p className="text-sm text-green-700 bg-green-100 px-1 rounded font-mono">{staged.target_value ?? '-'}</p>
                              </div>
                            )}
                            {changes.includes('metric_type') && (
                              <div className="mb-2">
                                <span className="text-xs text-gray-500">Type:</span>
                                <p className="text-sm text-green-700 bg-green-100 px-1 rounded">{staged.metric_type}</p>
                              </div>
                            )}
                            {changes.includes('visualization_type') && (
                              <div>
                                <span className="text-xs text-gray-500">Visualization:</span>
                                <p className="text-sm text-green-700 bg-green-100 px-1 rounded">{staged.visualization_type}</p>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Time Series Preview */}
              {stagedData.timeSeries.length > 0 && (
                <div className="bg-white border border-blue-200 rounded-lg overflow-hidden">
                  <div className="px-4 py-3 bg-blue-50 border-b border-blue-200">
                    <h3 className="font-medium text-blue-800 flex items-center gap-2">
                      <Database className="h-4 w-4" />
                      Time Series Data ({stagedData.timeSeries.length} records)
                    </h3>
                    <p className="text-sm text-blue-600">Historical data points to be imported</p>
                  </div>
                  <div className="overflow-x-auto max-h-64">
                    <table className="w-full text-sm">
                      <thead className="bg-gray-50 sticky top-0">
                        <tr>
                          <th className="text-left px-4 py-2 text-xs font-medium text-gray-500">Metric</th>
                          <th className="text-left px-4 py-2 text-xs font-medium text-gray-500">Period</th>
                          <th className="text-right px-4 py-2 text-xs font-medium text-gray-500">Actual</th>
                          <th className="text-right px-4 py-2 text-xs font-medium text-gray-500">Target</th>
                          <th className="text-left px-4 py-2 text-xs font-medium text-gray-500">Status</th>
                        </tr>
                      </thead>
                      <tbody>
                        {stagedData.timeSeries.map((ts) => {
                          // Find the metric name for this time series
                          const metric = stagedData.metrics.find(m => m.id === ts.metric_id);
                          const goalNum = metric ? goalIdToNumber.get(metric.goal_id) : null;
                          return (
                            <tr key={ts.id} className="border-t border-gray-200 hover:bg-blue-50/30">
                              <td className="px-4 py-2 text-gray-700">
                                <span className="font-medium text-blue-700">{goalNum || '?'}</span>
                                <span className="text-gray-400 mx-1">-</span>
                                <span className="text-xs text-gray-500 truncate max-w-[200px] inline-block align-middle">
                                  {metric?.name.substring(0, 30) || ts.metric_id.substring(0, 8)}
                                </span>
                              </td>
                              <td className="px-4 py-2 font-medium">{ts.period}</td>
                              <td className="px-4 py-2 text-right font-mono">
                                {ts.actual_value !== null ? ts.actual_value : <span className="text-gray-300">-</span>}
                              </td>
                              <td className="px-4 py-2 text-right font-mono text-gray-500">
                                {ts.target_value !== null ? ts.target_value : <span className="text-gray-300">-</span>}
                              </td>
                              <td className="px-4 py-2">
                                <span className={`px-2 py-0.5 rounded text-xs ${
                                  ts.status === 'on-target' ? 'bg-green-100 text-green-800' :
                                  ts.status === 'off-target' ? 'bg-red-100 text-red-800' :
                                  ts.status === 'at-risk' ? 'bg-yellow-100 text-yellow-800' :
                                  ts.status === 'no-data' ? 'bg-gray-100 text-gray-600' :
                                  'bg-gray-100 text-gray-800'
                                }`}>
                                  {ts.status || 'unknown'}
                                </span>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      )}

      {/* LIVE DATA TAB - Main Content - Two Panel Layout */}
      {activeTab === 'live' && (
      <div className="flex gap-4 h-[calc(100vh-280px)] min-h-[400px]">
        {/* Left Panel - Tree */}
        <div className="w-80 bg-white border border-gray-200 rounded-lg overflow-hidden flex flex-col">
          <div className="px-3 py-2 bg-gray-50 border-b border-gray-200">
            <h2 className="text-sm font-semibold text-gray-700">
              Objectives & Goals ({flatGoals.length})
            </h2>
          </div>
          <div className="flex-1 overflow-y-auto p-2">
            {goals?.map((goal) => (
              <TreeNode
                key={goal.id}
                goal={goal}
                level={0}
                selectedId={selectedGoal?.id || null}
                onSelect={handleSelect}
                expandedIds={expandedIds}
                onToggleExpand={handleToggleExpand}
                issues={validationIssues}
              />
            ))}
          </div>
        </div>

        {/* Right Panel - Detail */}
        <div className="flex-1 bg-white border border-gray-200 rounded-lg overflow-hidden flex flex-col">
          {selectedGoal ? (
            <>
              {/* Detail Header */}
              <div className="px-4 py-3 bg-gray-50 border-b border-gray-200 flex items-center justify-between">
                <div>
                  <span className="text-xs font-medium text-gray-500 uppercase">
                    {selectedGoal.level === 0 ? 'Objective' : selectedGoal.level === 1 ? 'Goal' : 'Sub-goal'}
                  </span>
                  <h2 className="text-lg font-semibold text-gray-900">
                    {selectedGoal.goal_number}
                  </h2>
                </div>
                <div className="flex items-center gap-2">
                  {editMode ? (
                    <>
                      <button
                        onClick={() => setEditMode(false)}
                        className="p-2 text-gray-600 hover:bg-gray-100 rounded"
                      >
                        <X className="h-4 w-4" />
                      </button>
                      <button
                        onClick={handleSave}
                        className="flex items-center gap-1 px-3 py-1.5 bg-blue-600 text-white text-sm rounded hover:bg-blue-700"
                      >
                        <Save className="h-3.5 w-3.5" />
                        Save
                      </button>
                    </>
                  ) : (
                    <>
                      <button
                        onClick={() => setEditMode(true)}
                        className="p-2 text-blue-600 hover:bg-blue-50 rounded"
                        title="Edit"
                      >
                        <Edit2 className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => setDeleteModal(selectedGoal)}
                        className="p-2 text-red-600 hover:bg-red-50 rounded"
                        title="Delete"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </>
                  )}
                </div>
              </div>

              {/* Detail Content */}
              <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {/* Issues for this goal */}
                {selectedIssues.length > 0 && (
                  <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                    <h3 className="text-sm font-medium text-red-800 mb-2">Issues</h3>
                    <ul className="text-sm text-red-700 space-y-1">
                      {selectedIssues.map((issue, idx) => (
                        <li key={idx}>• {issue.message}</li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Title */}
                <div>
                  <label className="block text-xs font-medium text-gray-500 uppercase mb-1">
                    Title
                  </label>
                  {editMode ? (
                    <input
                      type="text"
                      value={editedTitle}
                      onChange={(e) => setEditedTitle(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  ) : (
                    <p className="text-gray-900">{selectedGoal.title}</p>
                  )}
                </div>

                {/* Description */}
                <div>
                  <label className="block text-xs font-medium text-gray-500 uppercase mb-1">
                    Description
                  </label>
                  {editMode ? (
                    <textarea
                      value={editedDescription}
                      onChange={(e) => setEditedDescription(e.target.value)}
                      rows={3}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  ) : (
                    <p className="text-gray-600 text-sm">
                      {selectedGoal.description || <span className="italic text-gray-400">No description</span>}
                    </p>
                  )}
                </div>

                {/* ID */}
                <div>
                  <label className="block text-xs font-medium text-gray-500 uppercase mb-1">
                    ID
                  </label>
                  <code className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">
                    {selectedGoal.id}
                  </code>
                </div>

                {/* Status */}
                <div>
                  <label className="block text-xs font-medium text-gray-500 uppercase mb-1">
                    Status
                  </label>
                  <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${
                    selectedGoal.status_detail === 'completed' ? 'bg-green-100 text-green-800' :
                    selectedGoal.status_detail === 'in_progress' ? 'bg-blue-100 text-blue-800' :
                    'bg-gray-100 text-gray-800'
                  }`}>
                    {selectedGoal.status_detail || 'not_started'}
                  </span>
                </div>

                {/* Children */}
                {selectedChildren.length > 0 && (
                  <div>
                    <label className="block text-xs font-medium text-gray-500 uppercase mb-2">
                      {selectedGoal.level === 0 ? 'Goals' : 'Sub-goals'} ({selectedChildren.length})
                    </label>
                    <div className="border border-gray-200 rounded-md overflow-hidden">
                      <table className="w-full text-sm">
                        <thead className="bg-gray-50">
                          <tr>
                            <th className="text-left px-3 py-2 text-xs font-medium text-gray-500">Number</th>
                            <th className="text-left px-3 py-2 text-xs font-medium text-gray-500">Title</th>
                          </tr>
                        </thead>
                        <tbody>
                          {selectedChildren.map((child: any) => (
                            <tr
                              key={child.id}
                              className="border-t border-gray-200 hover:bg-gray-50 cursor-pointer"
                              onClick={() => handleSelect(child)}
                            >
                              <td className="px-3 py-2 font-medium">{child.goal_number}</td>
                              <td className="px-3 py-2 text-gray-600 truncate max-w-xs">{child.title}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}

                {/* Metrics */}
                {selectedMetrics.length > 0 && (
                  <div>
                    <label className="block text-xs font-medium text-gray-500 uppercase mb-2">
                      Metrics ({selectedMetrics.length})
                    </label>
                    <div className="border border-gray-200 rounded-md overflow-hidden">
                      <table className="w-full text-sm">
                        <thead className="bg-gray-50">
                          <tr>
                            <th className="text-left px-3 py-2 text-xs font-medium text-gray-500">Name</th>
                            <th className="text-left px-3 py-2 text-xs font-medium text-gray-500">Current</th>
                            <th className="text-left px-3 py-2 text-xs font-medium text-gray-500">Target</th>
                          </tr>
                        </thead>
                        <tbody>
                          {selectedMetrics.map((metric) => (
                            <tr key={metric.id} className="border-t border-gray-200">
                              <td className="px-3 py-2">{metric.name}</td>
                              <td className="px-3 py-2">{metric.current_value ?? '-'}</td>
                              <td className="px-3 py-2">{metric.target_value ?? '-'}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}
              </div>
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center text-gray-500">
              <div className="text-center">
                <Database className="h-12 w-12 mx-auto mb-3 text-gray-300" />
                <p className="font-medium">Select an item</p>
                <p className="text-sm">Click on an objective or goal to view details</p>
              </div>
            </div>
          )}
        </div>
      </div>
      )}

      {/* Delete Modal */}
      {deleteModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
            <div className="px-6 py-4 border-b border-gray-200">
              <div className="flex items-center gap-2">
                <AlertTriangle className="h-5 w-5 text-red-600" />
                <h2 className="text-lg font-semibold">Delete {deleteModal.level === 0 ? 'Objective' : 'Goal'}</h2>
              </div>
            </div>
            <div className="px-6 py-4 space-y-3">
              <p className="text-gray-600">
                Are you sure you want to delete <strong>{deleteModal.goal_number} {deleteModal.title}</strong>?
              </p>
              <div className="p-3 bg-red-50 border border-red-200 rounded text-sm text-red-700">
                <p className="font-medium">This will permanently delete:</p>
                <ul className="mt-1 list-disc list-inside">
                  <li>This {deleteModal.level === 0 ? 'objective' : 'goal'}</li>
                  <li>All child goals and sub-goals</li>
                  <li>All associated metrics</li>
                </ul>
              </div>
            </div>
            <div className="px-6 py-4 border-t border-gray-200 flex justify-end gap-3">
              <button
                onClick={() => setDeleteModal(null)}
                disabled={isDeleting}
                className="px-4 py-2 text-sm text-gray-700 border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                disabled={isDeleting}
                className="px-4 py-2 text-sm text-white bg-red-600 rounded-md hover:bg-red-700 disabled:opacity-50 flex items-center gap-2"
              >
                {isDeleting ? (
                  <>
                    <RefreshCw className="h-4 w-4 animate-spin" />
                    Deleting...
                  </>
                ) : (
                  <>
                    <Trash2 className="h-4 w-4" />
                    Delete
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
