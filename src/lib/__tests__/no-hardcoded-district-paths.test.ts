import { describe, it, expect } from 'vitest';
import { readFileSync, readdirSync, statSync } from 'node:fs';
import { join, relative } from 'node:path';

const ROOT = join(__dirname, '..', '..');
const SCANNED_DIRS = [
  join(ROOT, 'views', 'v2', 'public'),
  join(ROOT, 'components', 'v2', 'layout'),
  join(ROOT, 'components', 'v2', 'public'),
];

const FORBIDDEN_PATTERNS = [
  {
    pattern: /[`'"]\/district\/\$?\{?/,
    label: 'hardcoded /district/ path literal (template, single, or double-quoted)',
  },
  {
    pattern: /=\s*[`'"]\/district\//,
    label: 'variable assigned a /district/ string literal',
  },
];

function walk(dir: string): string[] {
  const out: string[] = [];
  for (const entry of readdirSync(dir)) {
    const full = join(dir, entry);
    const s = statSync(full);
    if (s.isDirectory()) {
      if (entry === '__tests__') continue;
      out.push(...walk(full));
    } else if (
      s.isFile() &&
      (entry.endsWith('.ts') || entry.endsWith('.tsx'))
    ) {
      out.push(full);
    }
  }
  return out;
}

describe('no hardcoded /district/ paths in public views/layouts', () => {
  it('all files use useDistrictLink() instead of template-literal /district/${slug} paths', () => {
    const files = SCANNED_DIRS.flatMap(walk);
    const offenders: Array<{ file: string; line: number; pattern: string }> = [];

    for (const file of files) {
      const content = readFileSync(file, 'utf8');
      const lines = content.split('\n');
      lines.forEach((line, idx) => {
        for (const { pattern, label } of FORBIDDEN_PATTERNS) {
          if (pattern.test(line)) {
            offenders.push({
              file: relative(ROOT, file),
              line: idx + 1,
              pattern: label,
            });
          }
        }
      });
    }

    if (offenders.length > 0) {
      const msg = offenders
        .map((o) => `  ${o.file}:${o.line} — ${o.pattern}`)
        .join('\n');
      throw new Error(
        `Hardcoded /district/ path literals found. Use useDistrictLink() from src/contexts/SubdomainContext.tsx instead:\n${msg}`,
      );
    }

    expect(offenders).toEqual([]);
  });
});
