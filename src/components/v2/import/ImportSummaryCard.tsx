import { CheckCircle } from 'lucide-react';

interface ImportSummaryCardProps {
  goalsImported: number;
  goalsSkipped: number;
  planName: string;
  onViewGoals: () => void;
  onImportAnother: () => void;
}

export function ImportSummaryCard({
  goalsImported,
  goalsSkipped,
  planName,
  onViewGoals,
  onImportAnother,
}: ImportSummaryCardProps) {
  return (
    <div
      data-testid="import-summary"
      className="mx-auto max-w-md rounded-lg border border-gray-200 bg-white p-8 text-center shadow-xs"
    >
      <CheckCircle className="mx-auto mb-4 h-12 w-12 text-green-500" />
      <h2 className="mb-4 text-xl font-semibold text-gray-900">Import Complete</h2>

      <div className="mb-6 space-y-1 text-sm text-gray-600">
        <p>{goalsImported} goals imported</p>
        <p>{goalsSkipped} goals skipped</p>
        <p>
          into <span className="font-medium text-gray-900">{planName}</span>
        </p>
      </div>

      <div className="flex flex-col gap-3 sm:flex-row sm:justify-center">
        <button
          onClick={onViewGoals}
          className="rounded-lg bg-blue-600 px-6 py-2 text-sm font-medium text-white hover:bg-blue-700"
        >
          View Goals
        </button>
        <button
          onClick={onImportAnother}
          className="rounded-lg border border-gray-300 bg-white px-6 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
        >
          Import Another
        </button>
      </div>
    </div>
  );
}
