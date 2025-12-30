First, stage all changes by running `git add .`. Then review staged changes with `git diff --cached`.

Check against CLAUDE.md patterns:
- Code in correct directories (components/, pages/, hooks/, lib/)
- Follows established conventions (functional components, async/await, React Query for data)
- No obvious bugs or missing error handling
- Consistent with existing code style
- No hardcoded secrets or .env values

Be concise. Only flag actual problems, not style preferences.
Skip lint errors for now—many files are pending refactor.

Output format:
- Ready to commit - if no issues found
- Issues to address - list specific problems with file:line references

Keep feedback actionable and brief.
