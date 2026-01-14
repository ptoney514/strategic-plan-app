import React, { useState, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Upload,
  FileSpreadsheet,
  CheckCircle,
  ArrowRight,
  ArrowLeft,
  Download,
  Loader2
} from 'lucide-react';
import { useDistrict } from '../../../hooks/useDistricts';
import { ExcelParserService } from '../../../lib/services/excelParser.service';
import { ExcelTemplateService } from '../../../lib/services/excelTemplate.service';
import { ImportService } from '../../../lib/services/import.service';
import { AutoFixService } from '../../../lib/services/autoFix.service';
import { GoalsService } from '../../../lib/services/goals.service';
import { Button } from '../../../components/ui/Button';
import { Progress } from '../../../components/ui/Progress';
import { Alert } from '../../../components/ui/Alert';
import { StagedDataTable } from '../../../components/import/StagedDataTable';
import { AutoFixModal } from '../../../components/import/AutoFixModal';
import type {
  ImportSession,
  ParsedExcelData,
  StagedGoal,
  StagedMetric,
  ImportProgress as ImportProgressType,
  AutoFixSuggestion
} from '../../../lib/types/import.types';

type WizardStep = 'upload' | 'review' | 'import' | 'summary';

export function ImportWizard() {
  const { slug } = useParams();
  const navigate = useNavigate();
  const { data: district } = useDistrict(slug!);

  // Wizard state
  const [currentStep, setCurrentStep] = useState<WizardStep>('upload');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [parsedData, setParsedData] = useState<ParsedExcelData | null>(null);
  const [importSession, setImportSession] = useState<ImportSession | null>(null);
  const [stagedGoals, setStagedGoals] = useState<StagedGoal[]>([]);
  const [stagedMetrics, setStagedMetrics] = useState<StagedMetric[]>([]);
  const [importProgress, setImportProgress] = useState<ImportProgressType | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  // Auto-fix state
  const [showAutoFixModal, setShowAutoFixModal] = useState(false);
  const [currentFixSuggestion, setCurrentFixSuggestion] = useState<AutoFixSuggestion | null>(null);
  const [_currentFixGoal, setCurrentFixGoal] = useState<StagedGoal | null>(null);

  // Handle template download
  const handleDownloadTemplate = useCallback(() => {
    ExcelTemplateService.downloadTemplate(district?.name || 'Your District');
  }, [district]);

  // Step 1: Handle file upload
  const handleFileSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Validate file type
      if (!file.name.endsWith('.xlsx') && !file.name.endsWith('.xls')) {
        setError('Please select a valid Excel file (.xlsx or .xls)');
        return;
      }

      // Validate file size (max 10MB)
      const maxSize = 10 * 1024 * 1024; // 10MB in bytes
      if (file.size > maxSize) {
        setError(`File size exceeds 10MB limit. Please use a smaller file. Current size: ${(file.size / 1024 / 1024).toFixed(2)}MB`);
        return;
      }

      setSelectedFile(file);
      setError(null);
    }
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (file) {
      // Validate file type
      if (!file.name.endsWith('.xlsx') && !file.name.endsWith('.xls')) {
        setError('Please select a valid Excel file (.xlsx or .xls)');
        return;
      }

      // Validate file size (max 10MB)
      const maxSize = 10 * 1024 * 1024; // 10MB in bytes
      if (file.size > maxSize) {
        setError(`File size exceeds 10MB limit. Please use a smaller file. Current size: ${(file.size / 1024 / 1024).toFixed(2)}MB`);
        return;
      }

      setSelectedFile(file);
      setError(null);
    }
  }, []);

  // Step 2: Parse and stage data
  const handleParseAndStage = async () => {
    if (!selectedFile || !district) return;

    setIsProcessing(true);
    setError(null);

    try {
      // Parse Excel file
      console.log('Starting Excel file parsing...');
      const parsed = await ExcelParserService.parseFile(selectedFile);
      console.log('Parsed data:', parsed);
      setParsedData(parsed);

      // Validate
      console.log('Validating parsed data...');
      const validation = ExcelParserService.validateParsedData(parsed);
      console.log('Validation result:', validation);
      if (!validation.isValid) {
        setError(`Validation errors: ${validation.errors.join(', ')}`);
        setIsProcessing(false);
        return;
      }

      // Create import session
      console.log('Creating import session...');
      const session = await ImportService.createSession(
        district.id,
        selectedFile.name,
        selectedFile.size,
        'admin' // TODO: Get actual user
      );
      console.log('Session created:', session);
      setImportSession(session);

      // Fetch existing goals for validation
      console.log('Fetching existing goals for validation...');
      let existingGoals: any[] = [];
      try {
        existingGoals = await GoalsService.getByDistrict(district.id);
        console.log('Existing goals:', existingGoals);
      } catch (error) {
        console.warn('Could not fetch existing goals:', error);
        // Continue with empty array - import can still proceed
      }

      // Stage data
      console.log('Staging data...');
      const { stagedGoals: goals, stagedMetrics: metrics} = await ImportService.stageData(
        session.id,
        district.id,
        parsed,
        existingGoals || []
      );
      console.log('Staged goals:', goals);
      console.log('Staged metrics:', metrics);

      setStagedGoals(goals);
      setStagedMetrics(metrics);
      setCurrentStep('review');
    } catch (err) {
      console.error('Error parsing and staging:', err);
      // Log full error details for debugging
      if (err instanceof Error) {
        console.error('Error name:', err.name);
        console.error('Error message:', err.message);
        console.error('Error stack:', err.stack);
      }
      setError(err instanceof Error ? err.message : 'Failed to parse Excel file');
    } finally {
      setIsProcessing(false);
    }
  };

  // Step 3: Execute import
  const handleExecuteImport = async () => {
    if (!importSession || !district) return;

    setIsProcessing(true);
    setError(null);
    setCurrentStep('import');

    try {
      await ImportService.executeImport(
        importSession.id,
        district.id,
        (progress) => {
          setImportProgress(progress);
        }
      );

      // Move to summary step
      setCurrentStep('summary');
    } catch (err) {
      console.error('Error executing import:', err);
      setError(err instanceof Error ? err.message : 'Failed to import data');
    } finally {
      setIsProcessing(false);
    }
  };

  // Auto-fix handlers
  const handleFixSingle = (goal: StagedGoal, suggestion: AutoFixSuggestion) => {
    setCurrentFixGoal(goal);
    setCurrentFixSuggestion(suggestion);
    setShowAutoFixModal(true);
  };

  const handleBulkAutoFix = () => {
    if (!importSession) return;

    const fixableGoals = stagedGoals.filter(g => g.validation_status === 'fixable');
    const allSuggestions = fixableGoals
      .flatMap(g => g.auto_fix_suggestions || [])
      .filter((s, index, self) =>
        index === self.findIndex(t => t.missingGoalNumber === s.missingGoalNumber)
      );

    if (allSuggestions.length > 0) {
      setCurrentFixSuggestion(null);
      setCurrentFixGoal(null);
      setShowAutoFixModal(true);
    }
  };

  const handleApplyAutoFix = async (
    suggestion: AutoFixSuggestion,
    customTitle?: string,
    customOwner?: string
  ) => {
    if (!importSession) return;

    try {
      await AutoFixService.applyAutoFix(
        importSession.id,
        suggestion,
        customTitle,
        customOwner
      );

      // Refresh staged goals
      const { goals } = await ImportService.getStagedData(importSession.id);
      setStagedGoals(goals);
      setShowAutoFixModal(false);
    } catch (error) {
      console.error('Error applying auto-fix:', error);
      setError(error instanceof Error ? error.message : 'Failed to apply auto-fix');
    }
  };

  const handleBulkApplyAutoFix = async (suggestions: AutoFixSuggestion[]) => {
    if (!importSession) return;

    try {
      await AutoFixService.bulkAutoFix(importSession.id, suggestions);

      // Refresh staged goals
      const { goals } = await ImportService.getStagedData(importSession.id);
      setStagedGoals(goals);
      setShowAutoFixModal(false);
    } catch (error) {
      console.error('Error applying bulk auto-fix:', error);
      setError(error instanceof Error ? error.message : 'Failed to apply bulk auto-fix');
    }
  };

  // Render current step
  const renderStep = () => {
    switch (currentStep) {
      case 'upload':
        return (
          <div className="space-y-6">
            <div className="text-center mb-8">
              <h2 className="text-2xl font-bold text-foreground mb-2">
                Upload Strategic Plan Data
              </h2>
              <p className="text-muted-foreground">
                Import goals and metrics from an Excel spreadsheet
              </p>
            </div>

            {/* File Drop Zone */}
            <div
              onDrop={handleDrop}
              onDragOver={(e) => e.preventDefault()}
              className="border-2 border-dashed border-border rounded-lg p-12 text-center hover:border-primary transition-colors cursor-pointer"
            >
              <input
                type="file"
                accept=".xlsx,.xls"
                onChange={handleFileSelect}
                className="hidden"
                id="file-upload"
              />
              <label htmlFor="file-upload" className="cursor-pointer">
                <div className="flex flex-col items-center">
                  {selectedFile ? (
                    <>
                      <FileSpreadsheet className="h-16 w-16 text-green-500 mb-4" />
                      <p className="text-lg font-medium text-foreground mb-2">
                        {selectedFile.name}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {(selectedFile.size / 1024).toFixed(2)} KB
                      </p>
                      <Button
                        variant="outline"
                        size="sm"
                        className="mt-4"
                        onClick={(e) => {
                          e.preventDefault();
                          setSelectedFile(null);
                        }}
                      >
                        Choose Different File
                      </Button>
                    </>
                  ) : (
                    <>
                      <Upload className="h-16 w-16 text-muted-foreground mb-4" />
                      <p className="text-lg font-medium text-foreground mb-2">
                        Drop your Excel file here
                      </p>
                      <p className="text-sm text-muted-foreground mb-4">
                        or click to browse
                      </p>
                      <p className="text-xs text-muted-foreground">
                        Supports .xlsx and .xls files
                      </p>
                    </>
                  )}
                </div>
              </label>
            </div>

            {error && (
              <Alert variant="error" title="Error">
                {error}
              </Alert>
            )}

            {/* Download Template Button */}
            <div className="bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
              <div className="flex items-start gap-4">
                <div className="flex-shrink-0">
                  <FileSpreadsheet className="h-10 w-10 text-blue-600 dark:text-blue-400" />
                </div>
                <div className="flex-1">
                  <h3 className="text-sm font-semibold text-foreground mb-1">
                    Need a template?
                  </h3>
                  <p className="text-sm text-muted-foreground mb-3">
                    Download our pre-formatted Excel template with example data and instructions to get started quickly.
                  </p>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleDownloadTemplate}
                    className="bg-white dark:bg-slate-900"
                  >
                    <Download className="h-4 w-4 mr-2" />
                    Download Template
                  </Button>
                </div>
              </div>
            </div>

            {/* Expected Format Info */}
            <Alert variant="info" title="Expected Format">
              <ul className="list-disc list-inside space-y-1 text-sm">
                <li>Column 1: Goal hierarchy (e.g., |1.1.1|)</li>
                <li>Column 2: Goal name/title</li>
                <li>Column 3: Owner name</li>
                <li>Column 4: Measure/metric description</li>
                <li>Remaining columns: Time-series data with dates as headers</li>
              </ul>
            </Alert>

            <div className="flex justify-end">
              <Button
                onClick={handleParseAndStage}
                disabled={!selectedFile || isProcessing}
              >
                {isProcessing ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Processing...
                  </>
                ) : (
                  <>
                    Next: Review Data
                    <ArrowRight className="h-4 w-4 ml-2" />
                  </>
                )}
              </Button>
            </div>
          </div>
        );

      case 'review':
        const errorCount = stagedGoals.filter(g => g.validation_status === 'error').length;
        const canImport = errorCount === 0;

        return (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold text-foreground mb-2">
                  Review & Validate Data
                </h2>
                <p className="text-muted-foreground">
                  Review parsed data and fix any issues before importing
                </p>
              </div>
              {parsedData && (
                <div className="text-right">
                  <p className="text-sm text-muted-foreground">
                    File: {importSession?.filename}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {parsedData.goals.length} goals, {stagedMetrics.length} metrics
                  </p>
                </div>
              )}
            </div>

            {!canImport && (
              <Alert variant="error" title="Errors Found">
                You have {errorCount} rows with errors. Please fix them before importing.
              </Alert>
            )}

            {canImport && (
              <Alert variant="success" title="Ready to Import">
                All data is valid and ready to be imported!
              </Alert>
            )}

            <StagedDataTable
              data={stagedGoals}
              onToggleImport={async (goalId, shouldImport) => {
                try {
                  const newAction = shouldImport ? 'create' : 'skip';
                  await ImportService.updateStagedGoal(goalId, { action: newAction });

                  // Update local state
                  setStagedGoals(prev =>
                    prev.map(g => g.id === goalId ? { ...g, action: newAction } : g)
                  );
                } catch (error) {
                  console.error('Error toggling import:', error);
                }
              }}
              onToggleImportAll={async (shouldImport) => {
                try {
                  const newAction = shouldImport ? 'create' : 'skip';

                  // Update all goals in parallel
                  await Promise.all(
                    stagedGoals.map(goal =>
                      ImportService.updateStagedGoal(goal.id, { action: newAction })
                    )
                  );

                  // Update local state
                  setStagedGoals(prev =>
                    prev.map(g => ({ ...g, action: newAction }))
                  );
                } catch (error) {
                  console.error('Error toggling import all:', error);
                }
              }}
              onFix={handleFixSingle}
              onBulkAutoFix={handleBulkAutoFix}
            />

            <div className="flex items-center justify-between">
              <Button
                variant="outline"
                onClick={() => setCurrentStep('upload')}
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back
              </Button>
              <Button
                onClick={handleExecuteImport}
                disabled={!canImport || isProcessing}
              >
                {isProcessing ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Importing...
                  </>
                ) : (
                  <>
                    Import to Database
                    <ArrowRight className="h-4 w-4 ml-2" />
                  </>
                )}
              </Button>
            </div>
          </div>
        );

      case 'import':
        return (
          <div className="space-y-6 max-w-2xl mx-auto text-center py-12">
            <div className="flex justify-center mb-6">
              <Loader2 className="h-16 w-16 text-primary animate-spin" />
            </div>

            <h2 className="text-2xl font-bold text-foreground">
              Importing Your Data...
            </h2>

            {importProgress && (
              <>
                <div className="space-y-2">
                  <Progress
                    value={importProgress.currentItem}
                    max={importProgress.totalItems}
                    showLabel
                    size="lg"
                  />
                  <p className="text-sm text-muted-foreground">
                    {importProgress.message}
                  </p>
                </div>
              </>
            )}

            <p className="text-muted-foreground">
              Please wait while we import your goals and metrics into the database.
              This may take a few moments.
            </p>
          </div>
        );

      case 'summary':
        return (
          <div className="space-y-6 max-w-2xl mx-auto text-center py-12">
            <div className="flex justify-center mb-6">
              <div className="rounded-full bg-green-100 p-6">
                <CheckCircle className="h-16 w-16 text-green-600" />
              </div>
            </div>

            <h2 className="text-3xl font-bold text-foreground">
              Import Complete!
            </h2>

            <p className="text-lg text-muted-foreground">
              Your strategic plan data has been successfully imported.
            </p>

            {importSession?.import_summary && (
              <div className="grid grid-cols-2 gap-4 mt-8">
                <div className="bg-card border border-border rounded-lg p-4">
                  <p className="text-2xl font-bold text-foreground">
                    {importSession.import_summary.goals_created}
                  </p>
                  <p className="text-sm text-muted-foreground">Goals Created</p>
                </div>
                <div className="bg-card border border-border rounded-lg p-4">
                  <p className="text-2xl font-bold text-foreground">
                    {importSession.import_summary.metrics_created}
                  </p>
                  <p className="text-sm text-muted-foreground">Metrics Created</p>
                </div>
              </div>
            )}

            <div className="flex items-center justify-center gap-4 mt-8">
              <Button
                variant="outline"
                onClick={() => navigate(`/${slug}/admin/goals`)}
              >
                View Goals
              </Button>
              <Button onClick={() => window.location.reload()}>
                Import Another File
              </Button>
            </div>
          </div>
        );
    }
  };

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Progress Steps */}
      <div className="flex items-center justify-center space-x-4 mb-8">
        {[
          { id: 'upload', label: 'Upload' },
          { id: 'review', label: 'Review' },
          { id: 'import', label: 'Import' },
          { id: 'summary', label: 'Complete' }
        ].map((step, index) => {
          const isCurrent = currentStep === step.id;
          const isCompleted = ['upload', 'review', 'import', 'summary'].indexOf(currentStep) >
                             ['upload', 'review', 'import', 'summary'].indexOf(step.id);

          return (
            <React.Fragment key={step.id}>
              <div className="flex flex-col items-center">
                <div
                  className={`
                    w-10 h-10 rounded-full flex items-center justify-center font-medium text-sm
                    ${isCurrent ? 'bg-primary text-white' : ''}
                    ${isCompleted ? 'bg-green-500 text-white' : ''}
                    ${!isCurrent && !isCompleted ? 'bg-muted text-muted-foreground' : ''}
                  `}
                >
                  {isCompleted ? <CheckCircle className="h-5 w-5" /> : index + 1}
                </div>
                <p className="text-xs mt-2 text-muted-foreground">{step.label}</p>
              </div>
              {index < 3 && (
                <div className={`h-0.5 w-16 ${isCompleted ? 'bg-green-500' : 'bg-muted'}`} />
              )}
            </React.Fragment>
          );
        })}
      </div>

      {/* Step Content */}
      <div className="bg-white rounded-xl border border-border p-8">
        {renderStep()}
      </div>

      {/* Auto-Fix Modal */}
      <AutoFixModal
        isOpen={showAutoFixModal}
        onClose={() => setShowAutoFixModal(false)}
        suggestion={currentFixSuggestion}
        suggestions={currentFixSuggestion ? undefined : stagedGoals
          .filter(g => g.validation_status === 'fixable')
          .flatMap(g => g.auto_fix_suggestions || [])
          .filter((s, index, self) =>
            index === self.findIndex(t => t.missingGoalNumber === s.missingGoalNumber)
          )}
        onApply={handleApplyAutoFix}
        onBulkApply={handleBulkApplyAutoFix}
        isBulk={!currentFixSuggestion}
      />
    </div>
  );
}
