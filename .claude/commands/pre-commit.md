# Pre-commit Quality Check

Run these checks before committing staged changes.

## Step 1: Stage and Review Changes

```bash
git add .
git diff --cached --stat
git diff --cached
```

## Step 2: Build Verification

```bash
npm run build
```

**BLOCKING**: Build must succeed before committing.

## Step 3: Unit Tests

```bash
npm test -- --run
```

**BLOCKING**: All tests must pass.

## Step 4: ESLint Check (Changed Files Only)

Run lint on staged TypeScript files only:

```bash
npx eslint $(git diff --cached --name-only --diff-filter=ACMR | grep -E '\.(ts|tsx)$' | tr '\n' ' ')
```

**REVIEW**: Flag any NEW errors introduced. Focus on errors, not warnings.

## Step 5: Pattern Checks (CLAUDE.md Compliance)

Review staged changes for:

- [ ] Functional components only (no class components)
- [ ] Files in correct directories (components/, pages/, hooks/, lib/)
- [ ] async/await preferred (not .then() chains)
- [ ] React Query for server state management
- [ ] Components under 200 lines (refactor if larger)
- [ ] Error handling present for async operations
- [ ] TypeScript types defined (avoid `any` unless justified)

## Step 6: Security Check

- [ ] No `.env.local` or credentials in staged files
- [ ] No console.log with sensitive data
- [ ] No service role keys exposed to client
- [ ] No hardcoded API keys or tokens

## Output Format

**READY TO COMMIT** - All checks passed

or

**ISSUES TO ADDRESS**:

1. [file:line] - Description of issue
2. ...

Keep feedback actionable and specific.
