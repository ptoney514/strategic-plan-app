# Commit, Push, and Create PR

## Pre-computed Context

**Current branch:**
```bash
git branch --show-current
```

**Base branch status:**
```bash
git fetch origin main --quiet 2>/dev/null; git rev-list --count HEAD..origin/main 2>/dev/null || echo "0"
```

**Staged changes:**
```bash
git diff --cached --stat
```

**Unstaged changes:**
```bash
git status --short
```

**Recent commits on this branch:**
```bash
git log origin/main..HEAD --oneline 2>/dev/null || git log -3 --oneline
```

**Full staged diff:**
```bash
git diff --cached
```

---

## Instructions

Assume `/pre-commit` checks have passed. Based on the staged changes above:

1. **If nothing is staged**: Run `git add -A` first, then show me what will be committed

2. **Write a conventional commit message** following project conventions:
   - Format: `type: description` (e.g., `feat: add recipe timer component`)
   - Types: `feat:`, `fix:`, `docs:`, `refactor:`, `test:`, `chore:`
   - Keep subject line under 72 characters
   - Add body if changes are complex

3. **Show me the commit message and ask for confirmation** before executing

4. **After confirmation**:
   - Commit with the approved message
   - Push to origin (create remote branch if needed)
   - Create a PR targeting `main` with:
     - Clear title matching the commit
     - Body summarizing what changed and why
     - Reference any relevant context from the diff

5. **If branch is behind main**: Warn me before proceeding - I may need to rebase first

$ARGUMENTS
