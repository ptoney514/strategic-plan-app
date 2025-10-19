import * as XLSX from 'xlsx';

/**
 * Excel Template Service
 * Generates downloadable Excel templates for data import
 */
export class ExcelTemplateService {
  /**
   * Generate a strategic plan import template
   * @param districtName - Name of the district for personalization
   * @returns Blob containing the Excel file
   */
  static generateImportTemplate(districtName: string = 'Your District'): Blob {
    // Create sample data demonstrating the expected format
    const sampleData = [
      // Header row
      [
        'Goal Hierarchy',
        'Goal Name/Title',
        'Owner Name',
        'Measure/Metric Description',
        '2024-Q1',
        '2024-Q2',
        '2024-Q3',
        '2024-Q4',
        '2025-Q1',
        '2025-Q2'
      ],
      // Example: Top-level objective (level 0)
      [
        '|1|',
        'Improve Student Achievement',
        'Dr. Smith',
        'Overall reading proficiency rate',
        65,
        68,
        70,
        72,
        75,
        78
      ],
      // Example: Goal under objective (level 1)
      [
        '|1.1|',
        'Increase Reading Proficiency K-5',
        'Ms. Johnson',
        'K-5 reading assessment scores',
        60,
        63,
        66,
        69,
        72,
        75
      ],
      // Example: Sub-goal (level 2)
      [
        '|1.1.1|',
        'Implement phonics program',
        'Ms. Davis',
        'Students meeting phonics benchmarks',
        55,
        60,
        65,
        70,
        75,
        80
      ],
      // Another level 1 goal
      [
        '|1.2|',
        'Enhance Math Performance',
        'Mr. Brown',
        'Math proficiency rate grades 3-8',
        58,
        62,
        65,
        68,
        72,
        75
      ],
      // Second top-level objective
      [
        '|2|',
        'Strengthen Community Engagement',
        'Ms. Garcia',
        'Parent participation rate',
        45,
        50,
        55,
        60,
        65,
        70
      ],
      [
        '|2.1|',
        'Expand family workshop programs',
        'Mr. Wilson',
        'Workshop attendance numbers',
        25,
        30,
        35,
        40,
        45,
        50
      ]
    ];

    // Create worksheet from data
    const worksheet = XLSX.utils.aoa_to_sheet(sampleData);

    // Set column widths for better readability
    worksheet['!cols'] = [
      { wch: 18 },  // Goal Hierarchy
      { wch: 40 },  // Goal Name/Title
      { wch: 20 },  // Owner Name
      { wch: 45 },  // Measure/Metric Description
      { wch: 12 },  // Q1
      { wch: 12 },  // Q2
      { wch: 12 },  // Q3
      { wch: 12 },  // Q4
      { wch: 12 },  // Q1 (next year)
      { wch: 12 }   // Q2 (next year)
    ];

    // Style the header row (row 1)
    const range = XLSX.utils.decode_range(worksheet['!ref'] || 'A1');
    for (let col = range.s.c; col <= range.e.c; col++) {
      const cellAddress = XLSX.utils.encode_cell({ r: 0, c: col });
      if (!worksheet[cellAddress]) continue;

      worksheet[cellAddress].s = {
        font: { bold: true, color: { rgb: 'FFFFFF' } },
        fill: { fgColor: { rgb: '4F46E5' } },
        alignment: { horizontal: 'center', vertical: 'center' }
      };
    }

    // Add instructions sheet
    const instructionsData = [
      ['Strategic Plan Import Template Instructions'],
      [''],
      [`Welcome to ${districtName}!`],
      [''],
      ['This template helps you import your strategic plan goals and metrics.'],
      [''],
      ['COLUMN DESCRIPTIONS:'],
      [''],
      ['1. Goal Hierarchy:'],
      ['   Format: |1|, |1.1|, |1.1.1|'],
      ['   - |1| = Top-level objective (Level 0)'],
      ['   - |1.1| = Goal under objective (Level 1)'],
      ['   - |1.1.1| = Sub-goal (Level 2)'],
      ['   Examples: |1|, |2|, |1.1|, |1.2|, |1.1.1|, |2.1.1|'],
      [''],
      ['2. Goal Name/Title:'],
      ['   A clear, concise name for the goal (2-10 words recommended)'],
      [''],
      ['3. Owner Name:'],
      ['   Person or role responsible for this goal'],
      [''],
      ['4. Measure/Metric Description:'],
      ['   What you\'re measuring (e.g., "Reading proficiency rate")'],
      [''],
      ['5. Time-Series Data Columns:'],
      ['   - Use dates as column headers (e.g., 2024-Q1, 2024-Q2)'],
      ['   - Enter numeric values for each period'],
      ['   - First value becomes baseline, last becomes target'],
      [''],
      ['TIPS:'],
      ['- Keep hierarchy consistent (don\'t skip levels)'],
      ['- Each goal should have at least one metric'],
      ['- Use quarterly or monthly periods'],
      ['- Delete example rows before importing your data'],
      [''],
      ['NEXT STEPS:'],
      ['1. Delete the example data on the "Data" sheet'],
      ['2. Add your own goals and metrics'],
      ['3. Save the file'],
      ['4. Upload to the import wizard'],
      ['5. Review and confirm the import']
    ];

    const instructionsSheet = XLSX.utils.aoa_to_sheet(instructionsData);

    // Style instructions
    instructionsSheet['!cols'] = [{ wch: 80 }];
    if (instructionsSheet['A1']) {
      instructionsSheet['A1'].s = {
        font: { bold: true, sz: 16, color: { rgb: '4F46E5' } },
        alignment: { horizontal: 'left' }
      };
    }

    // Create workbook with both sheets
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, instructionsSheet, 'Instructions');
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Data');

    // Convert to binary and create blob
    const excelBuffer = XLSX.write(workbook, {
      bookType: 'xlsx',
      type: 'array',
      cellStyles: true
    });

    return new Blob([excelBuffer], {
      type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    });
  }

  /**
   * Trigger download of the template
   * @param districtName - Name of the district for personalization
   */
  static downloadTemplate(districtName: string = 'Your District'): void {
    const blob = this.generateImportTemplate(districtName);
    const url = URL.createObjectURL(blob);

    // Create filename with current date
    const date = new Date().toISOString().split('T')[0]; // YYYY-MM-DD
    const filename = `strategic-plan-template-${date}.xlsx`;

    // Trigger download
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();

    // Cleanup
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }
}
