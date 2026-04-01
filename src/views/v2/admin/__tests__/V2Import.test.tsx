import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@/test/setup';

// Mock subdomain context
vi.mock('@/contexts/SubdomainContext', () => ({
  useSubdomain: () => ({ slug: 'test-org', type: 'district', hostname: 'localhost' }),
}));

// Mock district hook
vi.mock('@/hooks/useDistricts', () => ({
  useDistrict: () => ({
    data: { id: 'district-1', name: 'Test District', slug: 'test-org' },
    isLoading: false,
  }),
}));

// Mock plans hook
vi.mock('@/hooks/v2/usePlans', () => ({
  usePlansBySlug: () => ({
    data: [{ id: 'plan-1', name: 'Strategic Plan 2025', slug: 'strategic-plan-2025' }],
    isLoading: false,
  }),
}));

// Mock the import components
vi.mock('@/components/v2/import/FileUploadZone', () => ({
  FileUploadZone: (props: Record<string, unknown>) => {
    const onFileSelect = props.onFileSelect as (file: File) => void;
    const selectedFile = props.selectedFile as File | null;
    return (
      <div data-testid="file-upload-zone">
        <button onClick={() => onFileSelect(new File(['test'], 'test.xlsx'))}>Select File</button>
        {selectedFile && <span>{selectedFile.name}</span>}
      </div>
    );
  },
}));

vi.mock('@/components/v2/import/ImportReviewTable', () => ({
  ImportReviewTable: () => <div data-testid="import-review-table">Review Table</div>,
}));

vi.mock('@/components/v2/import/ImportSummaryCard', () => ({
  ImportSummaryCard: (props: Record<string, unknown>) => {
    const onImportAnother = props.onImportAnother as () => void;
    return (
      <div data-testid="import-summary">
        <button onClick={onImportAnother}>Import Another</button>
      </div>
    );
  },
}));

// Mock services
vi.mock('@/lib/services/excelParser.service', () => ({
  ExcelParserService: {
    parseFile: vi.fn(),
  },
}));

vi.mock('@/lib/services/import.service', () => ({
  ImportService: {
    createSession: vi.fn(),
    stageData: vi.fn(),
    executeImport: vi.fn(),
  },
}));

vi.mock('@/lib/services/goals.service', () => ({
  GoalsService: {
    getByDistrict: vi.fn(),
  },
}));

vi.mock('@/components/Toast', () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
    info: vi.fn(),
  },
}));

import { V2Import } from '../V2Import';

describe('V2Import', () => {
  it('renders Import Data heading', () => {
    render(<V2Import />);

    expect(screen.getByText('Import Data')).toBeInTheDocument();
  });

  it('shows plan selector with plans', () => {
    render(<V2Import />);

    expect(screen.getByLabelText('Select Plan')).toBeInTheDocument();
    expect(screen.getByText('Strategic Plan 2025')).toBeInTheDocument();
  });

  it('renders file upload zone', () => {
    render(<V2Import />);

    expect(screen.getByTestId('file-upload-zone')).toBeInTheDocument();
  });

  it('parse button disabled without file', () => {
    render(<V2Import />);

    const parseBtn = screen.getByText('Parse & Review');
    expect(parseBtn).toBeDisabled();
  });

  it('shows no-plans message when plans empty', async () => {
    // Override usePlansBySlug for this test
    const usePlans = await import('@/hooks/v2/usePlans');
    vi.spyOn(usePlans, 'usePlansBySlug').mockReturnValue({
      data: [],
      isLoading: false,
    } as unknown as ReturnType<typeof usePlans.usePlansBySlug>);

    render(<V2Import />);

    expect(screen.getByText(/No plans found/)).toBeInTheDocument();

    vi.restoreAllMocks();
  });

  it('shows loading state when district loading', async () => {
    const useDistricts = await import('@/hooks/useDistricts');
    vi.spyOn(useDistricts, 'useDistrict').mockReturnValue({
      data: undefined,
      isLoading: true,
    } as ReturnType<typeof useDistricts.useDistrict>);

    render(<V2Import />);

    // Should show loading spinner (Loader2 is an SVG)
    expect(screen.queryByText('Import Data')).not.toBeInTheDocument();

    vi.restoreAllMocks();
  });
});
