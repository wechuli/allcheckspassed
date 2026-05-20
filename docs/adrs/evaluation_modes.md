# Checks Evaluation Modes

This action supports two modes for deciding which check runs on a commit should be evaluated. The mode is controlled by the `ignore_superseded_runs` input, which defaults to `false` to preserve the historical behavior.

| Mode                  | Input                                     | Source APIs              | Extra permissions                             |
| --------------------- | ----------------------------------------- | ------------------------ | --------------------------------------------- |
| Default (raw checks)  | `ignore_superseded_runs: false` (default) | Checks API only          | None beyond `checks: read` / `contents: read` |
| Workflow-run grouping | `ignore_superseded_runs: true`            | Checks API + Actions API | Adds `actions: read`                          |

## Mode 1 — Default (raw checks evaluation)

This is the original and default behavior.

How it works:

1. The action calls `GET /repos/:owner/:repo/commits/:ref/check-runs` to list every check run attached to the commit.
2. After applying `checks_include` / `checks_exclude`, it deduplicates checks by `(check_name, app_id)`, keeping the check run with the highest check run ID (the most recent attempt for that exact name and app).
3. Whatever remains is evaluated against the success / failure rules.

Characteristics:

- Does not look at workflow runs or check suites — it operates on the raw list of check runs on the commit.
- Catches check runs created by any GitHub App, including ones created manually via the Checks API. This is particularly relevant for check runs created via the `GITHUB_TOKEN` from inside a GitHub Actions workflow: those check runs are attached to the GitHub Actions bot's check suite for that workflow run, and if that workflow run is cancelled or superseded, the check runs can appear "hidden" in the Actions UI. They are still returned by the Checks API and are evaluated by this action. (Note: this only applies to the GitHub Actions bot, because GitHub creates a separate check suite per workflow run for it. Any other GitHub App has exactly one check suite per commit SHA, so its check runs always live on that single suite and the "hidden" scenario does not apply.) See [community discussion #14891](https://github.com/orgs/community/discussions/14891) for background.
- The dedup is by `(name, app_id)`. If a re-run of a GitHub Actions workflow produces check runs whose names do **not** exactly match the names from the newer run (for example, jobs in a cancelled run whose matrix template was never expanded, so the name still contains `${{ matrix.foo }}`), both the stale and the fresh check runs survive dedup and are evaluated. A stale failure can then cause this action to report a failure even though the equivalent job passed in the newer run. This is the scenario reported in [#104](https://github.com/wechuli/allcheckspassed/issues/104).

When to use this mode:

- You want the safest default that matches what GitHub returns on the commit.
- You rely on check runs created by integrations or manual API calls that may live in cancelled / superseded check suites, and you do not want them silently dropped.
- You cannot grant the workflow `actions: read`.

## Mode 2 — Workflow-run grouping (`ignore_superseded_runs: true`)

This mode is opt-in and was added to address [#104](https://github.com/wechuli/allcheckspassed/issues/104) via [#105](https://github.com/wechuli/allcheckspassed/pull/105).

How it works:

1. The action calls `GET /repos/:owner/:repo/commits/:ref/check-runs` to list all check runs on the commit (same as Mode 1).
2. It additionally calls `GET /repos/:owner/:repo/actions/runs?head_sha=<sha>` to list every GitHub Actions workflow run for the commit.
3. Workflow runs are grouped by `workflow_id`. For each `workflow_id`, only the run with the highest run `id` (the latest attempt of that workflow) is kept. The check suites belonging to all the other (superseded) runs are marked as stale.
4. Any check run whose `check_suite.id` belongs to a superseded check suite is filtered out before the rest of the evaluation pipeline runs.
5. The remaining checks then go through the same `checks_include` / `checks_exclude` filtering and `(name, app_id)` dedup as Mode 1.

Characteristics:

- Removes the entire set of check runs that belong to a superseded GitHub Actions workflow run, regardless of name. This fixes the case in [#104](https://github.com/wechuli/allcheckspassed/issues/104) where stale check runs (e.g., from a cancelled run with unexpanded matrix templates, or from a previous re-run with expired artifacts) had names that did not match the new run and therefore were not removed by the `(name, app_id)` dedup.
- The filtering only targets the GitHub Actions bot's check suites (one per workflow run). Check suites for other GitHub Apps are not affected, because each non-Actions app has exactly one check suite per commit SHA and that suite is never marked superseded. The trade-off is specifically for check runs created via the `GITHUB_TOKEN` from inside a workflow that ends up superseded — those will be filtered out along with the rest of that workflow run's checks. If you depend on such check runs surviving a superseded run, prefer Mode 1.
- Requires the workflow to have `actions: read` permission. Without it, the call to `GET /repos/:owner/:repo/actions/runs` will fail or return an empty list, defeating the purpose of the mode.

When to use this mode:

- You have workflows that get re-run on the same commit (manual re-runs, concurrency-cancelled runs, etc.) and you want stale check runs from earlier runs to be ignored.
- You only care about check runs that GitHub itself considers part of the latest run of each workflow on the commit.
- You are able to grant `actions: read` to the job.

## Example

```yaml
jobs:
  allchecks:
    runs-on: ubuntu-latest
    permissions:
      checks: read
      contents: read
      actions: read # required only when ignore_superseded_runs is true
    steps:
      - uses: wechuli/allcheckspassed@v2
        with:
          ignore_superseded_runs: true
```

## Summary

- Default mode is conservative: it evaluates every check run the Checks API returns for the commit, and never silently hides any of them.
- `ignore_superseded_runs: true` is the right choice when stale GitHub Actions runs on the same commit are producing false failures, and you are comfortable scoping evaluation to the latest workflow run per workflow. It needs the extra `actions: read` permission.
