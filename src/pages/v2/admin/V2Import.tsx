import { useState, useEffect, useMemo, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Loader2 } from 'lucide-react';
import { useSubdomain } from '../../../contexts/SubdomainContext';
import { useDistrict } from '../../../hooks/useDistricts';
import { usePlansBySlug } from '../../../hooks/v2/usePlans';
import { ExcelParserService } from '../../../lib/services/excelParser.service';
import { ImportService } from '../../../lib/services/import.service';
import { GoalsService } from '../../../lib/services/goals.service';
import { FileUploadZone } from '../../../components/v2/import/FileUploadZone';
import { ImportReviewTable } from '../../../components/v2/import/ImportReviewTable';
import { ImportSummaryCard } from '../../../components/v2/import/ImportSummaryCard';
import { toast } from '../../../components/Toast';
import type { StagedGoal, ImportSummary, AutoFixSuggestion } from '../../../lib/types/import.types';
import type { Goal, HierarchicalGoal } from '../../../lib/types';

type WizardStep = 'upload' | 'review' | 'importing' | 'summary';

function flattenHierarchy(goals: HierarchicalGoal[]): Goal[] {
  const result: Goal[] = [];
  for (const goal of goals) {
    result.push(goal);
    if (goal.children.length > 0) {
      result.push(...flattenHierarchy(goal.children));
    }
  }
  return result;
}

export function V2Import() {
  const navigate = useNavigate();
  const { slug } = useSubdomain();
  const { data: district, isLoading: districtLoading } = useDistrict(slug || '');
  const { data: plans, isLoading: plansLoading } = usePlansBySlug(slug || '');

  const [step, setStep] = useState<WizardStep>('upload');
  const [selectedPlanId, setSelectedPlanId] = useState<string>('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [stagedGoals, setStagedGoals] = useState<StagedGoal[]>([]);
  const [sessionId, setSessionId] = useState<string>('');
  const [importResult, setImportResult] = useState<ImportSummary | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isParsing, setIsParsing] = useState(false);

  // Auto-select plan if only one exists
  useEffect(() => {
    if (plans && plans.length === 1 && !selectedPlanId) {
      setSelectedPlanId(plans[0].id);
    }
  }, [plans, selectedPlanId]);

  const selectedPlan = useMemo(
    () => plans?.find((p) => p.id === selectedPlanId),
    [plans, selectedPlanId]
  );

  const { validCount, fixableCount, errorCount, importableCount } = useMemo(() => {
    const valid = stagedGoals.filter((g) => g.validation_status === 'valid').length;
    const fixable = stagedGoals.filter((g) => g.validation_status === 'fixable').length;
    const err = stagedGoals.filter((g) => g.validation_status === 'error').length;
    const importable = stagedGoals.filter(
      (g) => g.action !== 'skip' && g.validation_status !== 'error'
    ).length;
    return { validCount: valid, fixableCount: fixable, errorCount: err, importableCount: importable };
  }, [stagedGoals]);

  const handleParseAndStage = useCallback(async () => {
    if (!selectedFile || !district) return;
    setError(null);
    setIsParsing(true);
    try {
      const parsed = await ExcelParserService.parseFile(selectedFile);
      const session = await ImportService.createSession(district.id, selectedFile.name, selectedFile.size);
      const hierarchicalGoals = await GoalsService.getByDistrict(district.id);
      const existingGoals = flattenHierarchy(hierarchicalGoals);
      const { stagedGoals: staged } = await ImportService.stageData(
        session.id,
        district.id,
        parsed,
        existingGoals
      );
      setStagedGoals(staged);
      setSessionId(session.id);
      setStep('review');
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to parse file';
      setError(message);
      toast.error(message);
    } finally {
      setIsParsing(false);
    }
  }, [selectedFile, district]);

  const handleToggleImport = useCallback((goalId: string, shouldImport: boolean) => {
    setStagedGoals((prev) =>
      prev.map((g) =>
        g.id === goalId ? { ...g, action: shouldImport ? 'create' : 'skip' } : g
      )
    );
  }, []);

  const handleToggleImportAll = useCallback((shouldImport: boolean) => {
    setStagedGoals((prev) =>
      prev.map((g) => ({ ...g, action: shouldImport ? 'create' : 'skip' }))
    );
  }, []);

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const handleFix = useCallback((goal: StagedGoal, _suggestion: AutoFixSuggestion) => {
    setStagedGoals((prev) =>
      prev.map((g) =>
        g.id === goal.id
          ? { ...g, validation_status: 'valid', validation_messages: [], auto_fix_suggestions: [] }
          : g
      )
    );
  }, []);

  const handleBulkAutoFix = useCallback(() => {
    setStagedGoals((prev) =>
      prev.map((g) =>
        g.validation_status === 'fixable'
          ? { ...g, validation_status: 'valid', validation_messages: [], auto_fix_suggestions: [] }
          : g
      )
    );
  }, []);

  const handleExecuteImport = useCallback(async () => {
    if (!district || !sessionId) return;
    setStep('importing');
    try {
      const result = await ImportService.executeImport(sessionId, district.id);
      setImportResult(result);
      setStep('summary');
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Import failed';
      toast.error(message);
      setStep('review');
    }
  }, [district, sessionId]);

  const handleReset = useCallback(() => {
    setStep('upload');
    setSelectedFile(null);
    setStagedGoals([]);
    setSessionId('');
    setImportResult(null);
    setError(null);
    setSelectedPlanId(plans && plans.length === 1 ? plans[0].id : '');
  }, [plans]);

  // Loading states
  if (districtLoading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-4xl space-y-6 p-6">
      <h1 className="text-2xl font-bold text-gray-900">Import Data</h1>

      {/* Step 1: Upload */}
      {step === 'upload' && (
        <div className="space-y-6">
          {/* Plan selector */}
          {plansLoading ? (
            <p className="text-sm text-gray-500">Loading plans...</p>
          ) : !plans || plans.length === 0 ? (
            <div className="rounded-lg border border-yellow-200 bg-yellow-50 p-4">
              <p className="text-sm text-yellow-800">
                No plans found. Create a plan first.{' '}
                <button
                  onClick={() => navigate(`/${slug}/v2/admin/plans`)}
                  className="font-medium text-blue-600 underline hover:text-blue-800"
                >
                  Go to Plans
                </button>
              </p>
            </div>
          ) : (
            <div>
              <label htmlFor="plan-select" className="mb-1 block text-sm font-medium text-gray-700">
                Select Plan
              </label>
              <select
                id="plan-select"
                value={selectedPlanId}
                onChange={(e) => setSelectedPlanId(e.target.value)}
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
              >
                <option value="">Choose a plan...</option>
                {plans.map((plan) => (
                  <option key={plan.id} value={plan.id}>
                    {plan.name}
                  </option>
                ))}
              </select>
            </div>
          )}

          <FileUploadZone
            onFileSelect={setSelectedFile}
            selectedFile={selectedFile}
            onClear={() => {
              setSelectedFile(null);
              setError(null);
            }}
            error={error}
          />

          <button
            onClick={handleParseAndStage}
            disabled={!selectedFile || !selectedPlanId || isParsing}
            className="flex items-center gap-2 rounded-lg bg-blue-600 px-6 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {isParsing && <Loader2 className="h-4 w-4 animate-spin" />}
            {isParsing ? 'Parsing...' : 'Parse & Review'}
          </button>
        </div>
      )}

      {/* Step 2: Review */}
      {step === 'review' && (
        <div className="space-y-6">
          <ImportReviewTable
            stagedGoals={stagedGoals}
            onToggleImport={handleToggleImport}
            onToggleImportAll={handleToggleImportAll}
            onFix={handleFix}
            onBulkAutoFix={handleBulkAutoFix}
            validCount={validCount}
            fixableCount={fixableCount}
            errorCount={errorCount}
          />

          <div className="flex items-center gap-3">
            <button
              onClick={() => {
                setStep('upload');
                setStagedGoals([]);
                setSessionId('');
              }}
              className="rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
            >
              Back
            </button>
            <button
              onClick={handleExecuteImport}
              disabled={importableCount === 0}
              className="rounded-lg bg-blue-600 px-6 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
            >
              Import {importableCount} Goals
            </button>
          </div>
        </div>
      )}

      {/* Step 3: Importing */}
      {step === 'importing' && (
        <div className="flex min-h-[40vh] flex-col items-center justify-center">
          <Loader2 className="mb-4 h-10 w-10 animate-spin text-blue-600" />
          <p className="text-sm text-gray-600">Importing goals...</p>
        </div>
      )}

      {/* Step 4: Summary */}
      {step === 'summary' && importResult && (
        <ImportSummaryCard
          goalsImported={importResult.goals_created + importResult.goals_updated}
          goalsSkipped={stagedGoals.length - (importResult.goals_created + importResult.goals_updated)}
          planName={selectedPlan?.name || 'Unknown Plan'}
          onViewGoals={() => navigate(`/${slug}/v2/admin/plans`)}
          onImportAnother={handleReset}
        />
      )}
    </div>
  );
}
