import * as XLSX from 'xlsx';
import type { ParsedExcelData, ParsedGoal, ParsedMetric, TimeSeriesEntry } from '../types/import.types';

/**
 * Excel Parser Service
 * Parses uploaded Excel files containing strategic plan goal data
 *
 * Expected format:
 * - Column 1: Hierarchy marker (e.g., "|1.1.1|")
 * - Column 2: Goal Name
 * - Column 3: Owner name
 * - Column 4: Measure description
 * - Remaining columns: Time-series data (dates as headers, values in cells)
 */
export class ExcelParserService {

  /**
   * Parse Excel file from File object
   */
  static async parseFile(file: File): Promise<ParsedExcelData> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();

      reader.onload = (e) => {
        try {
          const data = e.target?.result;
          if (!data) {
            throw new Error('Failed to read file');
          }

          const workbook = XLSX.read(data, { type: 'array', cellDates: true });
          const result = this.parseWorkbook(workbook);
          resolve(result);
        } catch (error) {
          reject(error);
        }
      };

      reader.onerror = () => reject(new Error('Failed to read file'));
      reader.readAsArrayBuffer(file);
    });
  }

  /**
   * Parse workbook into structured data
   */
  private static parseWorkbook(workbook: XLSX.WorkBook): ParsedExcelData {
    // Get first sheet
    const sheetName = workbook.SheetNames[0];
    const sheet = workbook.Sheets[sheetName];

    // Convert to JSON with header row
    const rawData: any[] = XLSX.utils.sheet_to_json(sheet, {
      header: 1, // Return array of arrays
      defval: '', // Default value for empty cells
      raw: false // Format values as strings
    });

    if (rawData.length === 0) {
      throw new Error('Excel file is empty');
    }

    const headers = rawData[0] as string[];
    const dataRows = rawData.slice(1);

    const goals = this.parseRows(headers, dataRows);

    return {
      goals,
      sheetName,
      rowCount: dataRows.length
    };
  }

  /**
   * Parse rows into structured goal data
   */
  private static parseRows(headers: string[], rows: any[][]): ParsedGoal[] {
    const goals: ParsedGoal[] = [];
    let currentGoal: ParsedGoal | null = null;

    rows.forEach((row, index) => {
      const rowNumber = index + 2; // +2 because: 0-indexed + header row

      // Skip completely empty rows
      if (this.isEmptyRow(row)) {
        return;
      }

      const rawData = this.rowToObject(headers, row);
      const hierarchy = this.extractHierarchy(row[0]);

      // If this row has a hierarchy marker, it's a new goal
      if (hierarchy) {
        const goalNumber = this.parseGoalNumber(hierarchy);
        const level = this.determineLevel(goalNumber);

        currentGoal = {
          row_number: rowNumber,
          raw_data: rawData,
          hierarchy,
          goal_number: goalNumber,
          title: String(row[1] || '').trim(),
          description: '', // Can be extracted if needed
          level,
          owner_name: String(row[2] || '').trim() || undefined,
          metrics: []
        };

        goals.push(currentGoal);
      }

      // If we have a current goal and this row has a measure, it's a metric
      if (currentGoal && row[3]) {
        const metric = this.parseMetric(headers, row);
        currentGoal.metrics.push(metric);
      }
    });

    return goals;
  }

  /**
   * Extract hierarchy from cell (e.g., "|1.1.1|" → "1.1.1")
   */
  private static extractHierarchy(cell: any): string | null {
    const str = String(cell || '').trim();
    const match = str.match(/\|([^|]+)\|/);
    return match ? match[1] : null;
  }

  /**
   * Parse goal number from hierarchy (e.g., "1.1.1" → "1.1.1")
   */
  private static parseGoalNumber(hierarchy: string): string {
    return hierarchy.trim();
  }

  /**
   * Determine goal level from goal number
   * "1" → 0, "1.1" → 1, "1.1.1" → 2
   */
  private static determineLevel(goalNumber: string): 0 | 1 | 2 {
    const parts = goalNumber.split('.');
    const level = parts.length - 1;
    return Math.min(Math.max(level, 0), 2) as 0 | 1 | 2;
  }

  /**
   * Parse a metric row
   */
  private static parseMetric(headers: string[], row: any[]): ParsedMetric {
    const measureCol = row[3] || '';
    const startValueCol = row[4];
    const symbolCol = row[22]; // Column "Symbol"
    const frequencyCol = row[23]; // Column "Frequency"

    // Extract time series from remaining columns (dates as headers)
    const timeSeries: TimeSeriesEntry[] = [];

    // Look for date-like headers and corresponding values
    for (let i = 5; i < headers.length; i++) {
      const header = headers[i];
      const value = row[i];

      // Skip empty values or non-numeric headers
      if (!value || !header) continue;

      // Try to parse as date or detect patterns like "21-22 Target", "FY22/23 Target"
      const period = this.parseTimePeriod(header);
      if (period) {
        const numericValue = this.parseNumericValue(value);
        if (numericValue !== null) {
          timeSeries.push({
            period: period.period,
            label: period.label,
            target: numericValue
          });
        }
      }
    }

    return {
      name: String(measureCol).trim(),
      measure_description: String(measureCol).trim(),
      baseline_value: this.parseNumericValue(startValueCol) || undefined,
      symbol: String(symbolCol || '').trim() || undefined,
      frequency: String(frequencyCol || '').trim() || undefined,
      time_series: timeSeries
    };
  }

  /**
   * Parse time period from header
   * Examples: "2022-06-01", "21-22 Target", "FY22/23 Target", "Sept 2023"
   */
  private static parseTimePeriod(header: string): { period: string; label: string } | null {
    const str = String(header).trim();

    // Try date formats first
    const dateMatch = str.match(/(\d{4})-(\d{1,2})-(\d{1,2})/);
    if (dateMatch) {
      const [, year, month] = dateMatch;
      return {
        period: `${year}-${month.padStart(2, '0')}`,
        label: str
      };
    }

    // Try fiscal year formats: "FY22/23 Target" → "2022-2023"
    const fyMatch = str.match(/FY(\d{2})\/(\d{2})/i);
    if (fyMatch) {
      const [, year1, year2] = fyMatch;
      return {
        period: `20${year1}-20${year2}`,
        label: str
      };
    }

    // Try "21-22 Target" format
    const yyMatch = str.match(/(\d{2})-(\d{2})/);
    if (yyMatch) {
      const [, year1, year2] = yyMatch;
      return {
        period: `20${year1}-20${year2}`,
        label: str
      };
    }

    // Try "Sept 2023", "January 2024"
    const monthYearMatch = str.match(/([A-Za-z]+)\s+(\d{4})/);
    if (monthYearMatch) {
      const [, month, year] = monthYearMatch;
      const monthNum = this.parseMonthName(month);
      if (monthNum) {
        return {
          period: `${year}-${monthNum.padStart(2, '0')}`,
          label: str
        };
      }
    }

    return null;
  }

  /**
   * Parse month name to number
   */
  private static parseMonthName(month: string): string | null {
    const months: Record<string, string> = {
      'january': '01', 'jan': '01',
      'february': '02', 'feb': '02',
      'march': '03', 'mar': '03',
      'april': '04', 'apr': '04',
      'may': '05',
      'june': '06', 'jun': '06',
      'july': '07', 'jul': '07',
      'august': '08', 'aug': '08',
      'september': '09', 'sept': '09', 'sep': '09',
      'october': '10', 'oct': '10',
      'november': '11', 'nov': '11',
      'december': '12', 'dec': '12'
    };

    return months[month.toLowerCase()] || null;
  }

  /**
   * Parse numeric value from cell (handle percentages, decimals, etc.)
   */
  private static parseNumericValue(value: any): number | null {
    if (value === null || value === undefined || value === '') {
      return null;
    }

    const str = String(value).trim();

    // Handle percentages (remove % sign)
    const cleanStr = str.replace(/%/g, '');

    // Handle ratios like "0.7/1" or ".8/1"
    const ratioMatch = cleanStr.match(/^([\d.]+)\s*\/\s*([\d.]+)$/);
    if (ratioMatch) {
      const [, numerator, denominator] = ratioMatch;
      return parseFloat(numerator) / parseFloat(denominator);
    }

    const num = parseFloat(cleanStr);
    return isNaN(num) ? null : num;
  }

  /**
   * Convert row array to object using headers
   */
  private static rowToObject(headers: string[], row: any[]): Record<string, any> {
    const obj: Record<string, any> = {};
    headers.forEach((header, index) => {
      obj[header] = row[index];
    });
    return obj;
  }

  /**
   * Check if row is completely empty
   */
  private static isEmptyRow(row: any[]): boolean {
    return row.every(cell => {
      const str = String(cell || '').trim();
      return str === '' || str === 'undefined' || str === 'null';
    });
  }

  /**
   * Validate parsed data
   */
  static validateParsedData(data: ParsedExcelData): { isValid: boolean; errors: string[] } {
    const errors: string[] = [];

    if (data.goals.length === 0) {
      errors.push('No goals found in Excel file');
    }

    data.goals.forEach((goal, index) => {
      if (!goal.title) {
        errors.push(`Goal at row ${goal.row_number}: Missing title`);
      }

      if (!goal.goal_number) {
        errors.push(`Goal at row ${goal.row_number}: Missing goal number`);
      }

      if (goal.level === undefined) {
        errors.push(`Goal at row ${goal.row_number}: Invalid level`);
      }
    });

    return {
      isValid: errors.length === 0,
      errors
    };
  }
}
