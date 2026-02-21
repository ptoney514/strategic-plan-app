import fs from 'node:fs/promises';
import path from 'node:path';
import { chromium, type Page } from 'playwright';

type HttpFailure = {
  url: string;
  status: number;
  method: string;
  resourceType: string;
  fromPage: string;
};

type RequestFailure = {
  url: string;
  method: string;
  errorText: string;
  resourceType: string;
  fromPage: string;
};

type ConsoleError = {
  type: string;
  text: string;
  fromPage: string;
  location?: string;
};

type RouteFinding = {
  url: string;
  finalUrl: string;
  navigationStatus: number | null;
  navigationError: string | null;
  title: string;
  hasDistrictNotFound: boolean;
  hasSomethingWentWrong: boolean;
  isLikelyBlank: boolean;
  httpFailures: HttpFailure[];
  requestFailures: RequestFailure[];
  consoleErrors: ConsoleError[];
  pageErrors: string[];
  screenshotPath: string;
};

type AuditReport = {
  startedAt: string;
  finishedAt: string;
  targetBaseUrl: string;
  loginEmail: string;
  totalVisited: number;
  visitedUrls: string[];
  routeFindings: RouteFinding[];
  summary: {
    criticalRoutes: number;
    routesWithDistrictNotFound: number;
    routesWithAppError: number;
    routesLikelyBlank: number;
    routesWithHttpFailures: number;
    routesWithConsoleErrors: number;
    routesWithNavigationError: number;
  };
};

const TARGET_BASE_URL = process.env.AUDIT_BASE_URL || 'https://westside.stratadash.org';
const ADMIN_LOGIN_CANDIDATES = [
  process.env.AUDIT_ADMIN_LOGIN_URL || 'https://admin.stratadash.org/login',
  'https://admin.stratadash.org',
  'https://stratadash.org/admin',
];

const LOGIN_EMAIL = process.env.AUDIT_EMAIL;
const LOGIN_PASSWORD = process.env.AUDIT_PASSWORD;

const runId = new Date().toISOString().replace(/[:.]/g, '-');
const artifactDir = path.join(process.cwd(), 'test-results', `prod-audit-${runId}`);
const screenshotsDir = path.join(artifactDir, 'screenshots');

const httpFailures: HttpFailure[] = [];
const requestFailures: RequestFailure[] = [];
const consoleErrors: ConsoleError[] = [];
const pageErrors: string[] = [];

function ensureCredentials() {
  if (!LOGIN_EMAIL || !LOGIN_PASSWORD) {
    throw new Error(
      'Missing AUDIT_EMAIL or AUDIT_PASSWORD environment variables.',
    );
  }
}

function normalizeInternalUrl(rawUrl: string, origin: string): string | null {
  try {
    const parsed = new URL(rawUrl);
    if (parsed.origin !== origin) return null;
    parsed.hash = '';
    return parsed.toString();
  } catch {
    return null;
  }
}

async function isVisible(page: Page, selector: string): Promise<boolean> {
  try {
    const el = page.locator(selector).first();
    await el.waitFor({ state: 'visible', timeout: 4000 });
    return true;
  } catch {
    return false;
  }
}

async function login(page: Page) {
  for (const candidate of ADMIN_LOGIN_CANDIDATES) {
    try {
      await page.goto(candidate, { waitUntil: 'domcontentloaded', timeout: 30000 });
      if (await isVisible(page, 'input[type="email"], input[name="email"]')) {
        break;
      }
    } catch {
      // Try next candidate
    }
  }

  if (!(await isVisible(page, 'input[type="email"], input[name="email"]'))) {
    throw new Error('Could not find email input on admin login page.');
  }

  await page.locator('input[type="email"], input[name="email"]').first().fill(LOGIN_EMAIL!);
  await page.locator('input[type="password"], input[name="password"]').first().fill(LOGIN_PASSWORD!);

  const submit = page.locator('button[type="submit"], button:has-text("Sign in"), button:has-text("Login")').first();
  await submit.click();

  // Give auth redirect flow time to settle across subdomains.
  await page.waitForTimeout(3500);

  const currentUrl = page.url();
  if (currentUrl.includes('/login')) {
    const maybeError = await page.locator('[role="alert"], .error, text=/invalid|incorrect|failed/i').first().textContent().catch(() => null);
    throw new Error(`Login appears to have failed. Current URL: ${currentUrl}. ${maybeError || ''}`.trim());
  }
}

async function evaluateBlankPage(page: Page): Promise<boolean> {
  return page.evaluate(() => {
    const body = document.body;
    if (!body) return true;

    const text = (body.innerText || '').trim();
    const hasCanvas = !!document.querySelector('canvas');
    const hasMain = !!document.querySelector('main, [role="main"], #root');
    const hasInteractive = !!document.querySelector(
      'a[href], button, input, select, textarea, [role="button"], [role="link"]',
    );

    if (!hasMain) return true;
    if (hasCanvas) return false;

    return text.length < 30 && !hasInteractive;
  });
}

async function collectInternalLinks(page: Page, targetOrigin: string): Promise<string[]> {
  const hrefs = await page.$$eval('a[href]', (nodes) =>
    nodes
      .map((node) => (node as HTMLAnchorElement).href)
      .filter(Boolean),
  );

  const normalized = new Set<string>();
  for (const href of hrefs) {
    const internal = normalizeInternalUrl(href, targetOrigin);
    if (internal) normalized.add(internal);
  }
  return Array.from(normalized);
}

function shortNameForUrl(url: string): string {
  const parsed = new URL(url);
  const name = `${parsed.hostname}${parsed.pathname === '/' ? '/root' : parsed.pathname}${parsed.search}`.replace(
    /[^a-zA-Z0-9/_-]/g,
    '_',
  );
  return name.slice(0, 140);
}

async function writeReport(report: AuditReport) {
  await fs.mkdir(artifactDir, { recursive: true });
  await fs.mkdir(screenshotsDir, { recursive: true });

  const jsonPath = path.join(artifactDir, 'report.json');
  await fs.writeFile(jsonPath, JSON.stringify(report, null, 2), 'utf8');

  const critical = report.routeFindings.filter(
    (f) =>
      f.hasDistrictNotFound ||
      f.hasSomethingWentWrong ||
      f.navigationError ||
      f.isLikelyBlank ||
      f.httpFailures.length > 0 ||
      f.pageErrors.length > 0,
  );

  const markdown = [
    '# Westside Production Audit',
    '',
    `- Started: ${report.startedAt}`,
    `- Finished: ${report.finishedAt}`,
    `- Base URL: ${report.targetBaseUrl}`,
    `- Visited routes: ${report.totalVisited}`,
    '',
    '## Summary',
    '',
    `- Critical/problematic routes: ${report.summary.criticalRoutes}`,
    `- Routes with "District not found": ${report.summary.routesWithDistrictNotFound}`,
    `- Routes with "Something went wrong": ${report.summary.routesWithAppError}`,
    `- Routes likely blank: ${report.summary.routesLikelyBlank}`,
    `- Routes with HTTP failures: ${report.summary.routesWithHttpFailures}`,
    `- Routes with console errors: ${report.summary.routesWithConsoleErrors}`,
    `- Routes with navigation errors: ${report.summary.routesWithNavigationError}`,
    '',
    '## Findings',
    '',
    ...(critical.length === 0
      ? ['No critical routes detected by this crawl.']
      : critical.flatMap((finding, index) => [
          `### ${index + 1}. ${finding.url}`,
          `- Final URL: ${finding.finalUrl}`,
          `- Title: ${finding.title || '(untitled)'}`,
          `- Navigation status: ${finding.navigationStatus ?? 'n/a'}`,
          `- Navigation error: ${finding.navigationError || 'none'}`,
          `- District not found: ${finding.hasDistrictNotFound}`,
          `- Something went wrong: ${finding.hasSomethingWentWrong}`,
          `- Likely blank page: ${finding.isLikelyBlank}`,
          `- HTTP failures: ${finding.httpFailures.length}`,
          `- Request failures: ${finding.requestFailures.length}`,
          `- Console errors: ${finding.consoleErrors.length}`,
          `- Page errors: ${finding.pageErrors.length}`,
          `- Screenshot: ${finding.screenshotPath}`,
          '',
        ])),
  ].join('\n');

  const mdPath = path.join(artifactDir, 'report.md');
  await fs.writeFile(mdPath, markdown, 'utf8');

  return { jsonPath, mdPath };
}

async function main() {
  ensureCredentials();
  await fs.mkdir(screenshotsDir, { recursive: true });

  const startedAt = new Date().toISOString();
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({ viewport: { width: 1512, height: 982 } });
  const page = await context.newPage();

  page.on('response', (response) => {
    const status = response.status();
    if (status < 400) return;
    const req = response.request();
    httpFailures.push({
      url: response.url(),
      status,
      method: req.method(),
      resourceType: req.resourceType(),
      fromPage: page.url(),
    });
  });

  page.on('requestfailed', (request) => {
    requestFailures.push({
      url: request.url(),
      method: request.method(),
      errorText: request.failure()?.errorText || 'unknown',
      resourceType: request.resourceType(),
      fromPage: page.url(),
    });
  });

  page.on('console', (msg) => {
    if (msg.type() !== 'error') return;
    const loc = msg.location();
    consoleErrors.push({
      type: msg.type(),
      text: msg.text(),
      fromPage: page.url(),
      location: loc.url ? `${loc.url}:${loc.lineNumber}:${loc.columnNumber}` : undefined,
    });
  });

  page.on('pageerror', (err) => {
    pageErrors.push(`${page.url()} :: ${err.message}`);
  });

  await login(page);

  const targetOrigin = new URL(TARGET_BASE_URL).origin;
  const seedUrls = [
    `${targetOrigin}/`,
    `${targetOrigin}/overview`,
    `${targetOrigin}/admin`,
    `${targetOrigin}/admin/plans`,
    `${targetOrigin}/admin/objectives`,
    `${targetOrigin}/admin/users`,
    `${targetOrigin}/admin/appearance`,
    `${targetOrigin}/admin/settings`,
    `${targetOrigin}/goals`,
    `${targetOrigin}/metrics`,
    `${targetOrigin}/landing`,
  ];

  const queue: string[] = Array.from(new Set(seedUrls));
  const visited = new Set<string>();
  const routeFindings: RouteFinding[] = [];

  while (queue.length > 0) {
    const next = queue.shift()!;
    if (visited.has(next)) continue;
    visited.add(next);

    const httpStartIdx = httpFailures.length;
    const requestStartIdx = requestFailures.length;
    const consoleStartIdx = consoleErrors.length;
    const pageErrorStartIdx = pageErrors.length;

    let responseStatus: number | null = null;
    let navigationError: string | null = null;

    try {
      const response = await page.goto(next, { waitUntil: 'domcontentloaded', timeout: 30000 });
      responseStatus = response?.status() ?? null;
      await page.waitForTimeout(1500);
    } catch (error) {
      navigationError = error instanceof Error ? error.message : String(error);
    }

    const finalUrl = page.url();
    const title = await page.title().catch(() => '');
    const bodyText = await page.locator('body').innerText().catch(() => '');
    const hasDistrictNotFound = /district not found/i.test(bodyText);
    const hasSomethingWentWrong = /something went wrong|unexpected error occurred/i.test(bodyText);
    const isLikelyBlank = await evaluateBlankPage(page);

    const screenshotName = `${shortNameForUrl(finalUrl || next)}.png`;
    const screenshotPath = path.join(screenshotsDir, screenshotName);
    await page.screenshot({ path: screenshotPath, fullPage: true }).catch(() => undefined);

    const routeHttpFailures = httpFailures.slice(httpStartIdx).filter((item) => {
      // Keep all same-origin failures plus API failures from app origin.
      return item.url.startsWith(targetOrigin) || item.url.includes('/api/');
    });

    const routeRequestFailures = requestFailures.slice(requestStartIdx).filter((item) => {
      return item.url.startsWith(targetOrigin) || item.url.includes('/api/');
    });

    const routeConsoleErrors = consoleErrors
      .slice(consoleStartIdx)
      .filter((item) => !item.text.includes('widget.userjot.com'));

    const routePageErrors = pageErrors.slice(pageErrorStartIdx);

    routeFindings.push({
      url: next,
      finalUrl,
      navigationStatus: responseStatus,
      navigationError,
      title,
      hasDistrictNotFound,
      hasSomethingWentWrong,
      isLikelyBlank,
      httpFailures: routeHttpFailures,
      requestFailures: routeRequestFailures,
      consoleErrors: routeConsoleErrors,
      pageErrors: routePageErrors,
      screenshotPath,
    });

    const discoveredLinks = await collectInternalLinks(page, targetOrigin);
    for (const link of discoveredLinks) {
      const parsed = new URL(link);
      const isCandidate =
        parsed.pathname === '/' ||
        parsed.pathname.startsWith('/admin') ||
        parsed.pathname.startsWith('/objective') ||
        parsed.pathname.startsWith('/goal') ||
        parsed.pathname.startsWith('/goals') ||
        parsed.pathname.startsWith('/metrics') ||
        parsed.pathname.startsWith('/overview');

      if (isCandidate && !visited.has(link) && !queue.includes(link)) {
        queue.push(link);
      }
    }

    // Keep crawl bounded for safety and speed.
    if (visited.size >= 45) {
      break;
    }
  }

  await context.close();
  await browser.close();

  const report: AuditReport = {
    startedAt,
    finishedAt: new Date().toISOString(),
    targetBaseUrl: TARGET_BASE_URL,
    loginEmail: LOGIN_EMAIL!,
    totalVisited: visited.size,
    visitedUrls: Array.from(visited),
    routeFindings,
    summary: {
      criticalRoutes: routeFindings.filter(
        (f) =>
          f.hasDistrictNotFound ||
          f.hasSomethingWentWrong ||
          f.isLikelyBlank ||
          f.navigationError ||
          f.httpFailures.length > 0 ||
          f.pageErrors.length > 0,
      ).length,
      routesWithDistrictNotFound: routeFindings.filter((f) => f.hasDistrictNotFound).length,
      routesWithAppError: routeFindings.filter((f) => f.hasSomethingWentWrong).length,
      routesLikelyBlank: routeFindings.filter((f) => f.isLikelyBlank).length,
      routesWithHttpFailures: routeFindings.filter((f) => f.httpFailures.length > 0).length,
      routesWithConsoleErrors: routeFindings.filter((f) => f.consoleErrors.length > 0).length,
      routesWithNavigationError: routeFindings.filter((f) => !!f.navigationError).length,
    },
  };

  const outputs = await writeReport(report);
  console.log(`Audit complete.`);
  console.log(`Report JSON: ${outputs.jsonPath}`);
  console.log(`Report Markdown: ${outputs.mdPath}`);
  console.log(`Screenshots: ${screenshotsDir}`);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
