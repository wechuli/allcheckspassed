# Contributing

Thanks for helping improve allcheckspassed.

## Prerequisites

- Node.js 24.4.0 (see .node-version)
- npm

## Local setup

1. Fork and clone the repository.
2. Install dependencies:

```bash
npm ci
```

## Development workflow

1. Make code changes in src/.
2. Add or update tests in __tests__/.
3. Run validation locally:

```bash
npm run all
```

This runs:

- npm run build
- npm run test
- npm run package

If you only need a subset while iterating:

```bash
npm run build
npm run test
npm run package
```

## Action bundle requirements

Changes in src/ must include updated generated files in dist/.

A typical regeneration flow is:

```bash
rm -rf dist/
npm run build
npm run package
git diff -- dist/
git status --short -- dist/
```

Commit both source and dist changes together.

## Documentation expectations

When behavior changes, update README and relevant ADRs in docs/adrs/.

Permission guidance must stay accurate:

- GitHub.com minimum is checks: read.
- GHES may require contents: read when job.check_run_id is unavailable and the action falls back to reading workflow files.
- statuses: read is required only when include_status_commits is enabled.
- actions: read is required only when ignore_superseded_runs is enabled.

## Pull request checklist

- Tests added or updated for behavior changes.
- npm run all passes locally.
- dist/ updated when src/ changes.
- README/docs updated when user-visible behavior changes.
- PR description explains what changed and why.

## Security

Do not open public issues for vulnerabilities. Follow SECURITY.md for private reporting instructions.
