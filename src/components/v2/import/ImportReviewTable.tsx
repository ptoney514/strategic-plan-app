import { CheckCircle, AlertTriangle, AlertCircle, Wrench } from 'lucide-react';
import { StagedDataTable } from '../../import/StagedDataTable';
import type { StagedGoal, AutoFixSuggestion } from '../../../lib/types/import.types';

interface ImportReviewTableProps {
  stagedGoals: StagedGoal[];
  onToggleImport: (goalId: string, shouldImport: boolean) => void;
  onToggleImportAll: (shouldImport: boolean) => void;
  onFix: (goal: StagedGoal, suggestion: AutoFixSuggestion) => void;
  onBulkAutoFix: () => void;
  validCount: number;
  fixableCount: number;
  errorCount: number;
}

export function ImportReviewTable({
  stagedGoals,
  onToggleImport,
  onToggleImportAll,
  onFix,
  onBulkAutoFix,
  validCount,
  fixableCount,
  errorCount,
}: ImportReviewTableProps) {
  return (
    <div className="space-y-4">
      {/* Validation summary */}
      <div data-testid="validation-summary" className="flex flex-wrap items-center gap-3">
        <div className="flex items-center gap-1.5 rounded-full bg-green-100 px-3 py-1 text-sm font-medium text-green-700">
          <CheckCircle className="h-4 w-4" />
          {validCount} valid
        </div>
        {fixableCount > 0 && (
          <div className="flex items-center gap-1.5 rounded-full bg-blue-100 px-3 py-1 text-sm font-medium text-blue-700">
            <Wrench className="h-4 w-4" />
            {fixableCount} fixable
          </div>
        )}
        {errorCount > 0 && (
          <div className="flex items-center gap-1.5 rounded-full bg-red-100 px-3 py-1 text-sm font-medium text-red-700">
            <AlertCircle className="h-4 w-4" />
            {errorCount} errors
          </div>
        )}
        {fixableCount === 0 && errorCount === 0 && (
          <div className="flex items-center gap-1.5 rounded-full bg-yellow-100 px-3 py-1 text-sm font-medium text-yellow-700">
            <AlertTriangle className="h-4 w-4" />
            0 issues
          </div>
        )}
      </div>

      {/* Auto-fix all button */}
      {fixableCount > 0 && (
        <button
          data-testid="auto-fix-all-btn"
          onClick={onBulkAutoFix}
          className="flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
        >
          <Wrench className="h-4 w-4" />
          Auto-fix all ({fixableCount})
        </button>
      )}

      {/* Staged data table */}
      <StagedDataTable
        data={stagedGoals}
        onToggleImport={onToggleImport}
        onToggleImportAll={onToggleImportAll}
        onFix={onFix}
        onBulkAutoFix={onBulkAutoFix}
      />
    </div>
  );
}
