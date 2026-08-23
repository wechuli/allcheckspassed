# All checks pass action

This action will check that all checks have passed on a given pull request.

## V2

### What's Changed

- Upgrade to Node24 runtime
- On GitHub.com, the action can identify its own check via the `job.check_run_id` context and does not require `contents: read`.
- On GitHub Enterprise Server (GHES), `job.check_run_id` may not be available depending on server version. In that case, the action falls back to reading the workflow file and requires `contents: read`.
- Support for [commit statuses](https://docs.github.com/en/rest/commits/statuses?apiVersion=2022-11-28#about-commit-statuses) is implemented in V2 and is disabled by default for backwards compatibility. Enable it with `include_status_commits: true`.

## Basic usage

The action works well with the `pull_request` or `pull_request_target` events. You can use it to confirm that all checks (and optionally commit statuses) that run on a pull request passed.

```yaml
name: All checks pass
on:
  pull_request:
    types: [opened, synchronize, reopened, ready_for_review]

jobs:
  allchecks:
    runs-on: ubuntu-latest
    permissions:
      checks: read
    steps:
      - uses: wechuli/allcheckspassed@v2
```

With this default configuration, the action will fail if any of the checks on the pull request have failed or if
any of the checks are still in progress, pending or queued when the workflow is complete.

The action also created a checks summary with details of each check that was evaluated and their status:

<img width="1542" height="480" alt="allcheckspassed2" src="https://github.com/user-attachments/assets/0f68894c-f590-43ee-93dd-5f6d9ea0f539" />


## How it works

When the workflow is triggered, the action will poll the GitHub API every 1 minute (default) for 10 tries (default) - you can change these to your liking.
If all the checks are successful, the action will succeed. If any of the checks are still in progress, pending or queued, the action fails

It will create a job summary of each check along with the details.

## Permissions

Minimum required permissions on GitHub.com:

```yaml
jobs:
  allchecks:
    runs-on: ubuntu-latest
    permissions:
      checks: read
```

If you run on GHES and `job.check_run_id` is unavailable, add `contents: read` so the action can fall back to reading the workflow file and extract its own check name.

If you additionally want the action to check commit statuses on top of checks, add `statuses: read`:

```yaml
jobs:
  allchecks:
    runs-on: ubuntu-latest
    permissions:
      checks: read
      statuses: read
```

If you enable the `ignore_superseded_runs` option (see [Ignore superseded workflow runs](#ignore-superseded-workflow-runs) below), the action additionally calls the GitHub Actions Runs API, which requires the `actions: read` permission:

```yaml
jobs:
  allchecks:
    runs-on: ubuntu-latest
    permissions:
      checks: read
      actions: read
```

## Examples

### Exclude certain checks from causing a failure

You can exclude certain checks from causing a failure by using the `checks_exclude` input. The input accepts a comma
separated string of values:

```yaml
steps:
  - uses: wechuli/allcheckspassed@v2
    with:
      checks_exclude: "CodeQL,lint,cosmetic"
```

You might want to do this to allow certain checks to fail, such as a code quality check, but still require that all
other checks pass.

The `checks_exclude` and `checks_include` inputs support Regular Expressions. For example, if you want to exclude all
checks have the word `lint` somewhere in the string, you don't have to list them all out, you can use the following:

```yaml
steps:
  - uses: wechuli/allcheckspassed@v2
    with:
      checks_exclude: ".*lint.*"
```

### Include only certain checks

You can choose to include only specific checks for evaluation and ignore others. This is not the primary use case
for this action, but it is possible. If you want the check to always be included, you might consider using the native
repository rulesets or branch protection rules. You can't provide both the `checks_include` and `checks_exclude`inputs.

```yaml
steps:
  - uses: wechuli/allcheckspassed@v2
    with:
      checks_include: "CodeQL"
```

### What should be considered as passing

At the moment, checks with `success`, `neutral` and `skipped` are considered passing by GitHub. This action will
default to this behavior as well but you can change this if you want to.

```yaml
steps:
  - uses: wechuli/allcheckspassed@v2
    with:
      treat_skipped_as_passed: false
      treat_neutral_as_passed: false
```

In the above configuration, the action will fail if any of the checks are skipped or neutral.

### Missing checks

If you define one or more checks in the `checks_include` input, the action will output a warning if any of the checks
are missing. You can choose instead to fail the action if any of the checks are missing:

```yaml
steps:
  - uses: wechuli/allcheckspassed@v2
    with:
      fail_on_missing_checks: true
```

### Time

The default behavior of this action is that is delays its execution for 1 minute (default) and polls the API 10 times (
retries) with a delay
between each poll of 1 minute (default). You can change these values to your liking:

```yaml
steps:
  - uses: wechuli/allcheckspassed@v2
    with:
      delay: "5"
      retries: "3"
      polling_interval: "3"
```

When the step with the action runs, it will wait for 5 minutes before polling the API for the first time. It will then
poll the API 3 times with a delay of 3 minutes between each poll.

You also don't have to poll, you can just run the action once and get the result.

```yaml
steps:
  - uses: wechuli/allcheckspassed@v2
    with:
      poll: false
```

### Fail Fast

By default, the action will fail the step as soon as a check meets the condition for failure. This default behavior can
save some
execution minutes since the action will not wait for all checks to complete before it reports a failure.The fail_fast
flag can be
used to cause this action to report a failure status as soon as one other check has failed. If you instead wish to wait
for all checks to complete before reporting a failure, you can set the fail_fast flag to false.

```yaml
steps:
  - uses: wechuli/allcheckspassed@v2
    with:
      fail_fast: false
```

### Verbose logging

To enable additional logging when the action runs, you may enable the `verbose` mode (defaults to false). The additional
logs will indicate which specific checks are being waited on in each polling iteration. This may be helpful in debugging
what checks are matched by `checks_include` or `checks_exclude`.

```yaml
steps:
  - uses: wechuli/allcheckspassed@v2
    with:
      verbose: true
```

### Job summary

By default, the action will create a job summary with the details of each check that was evaluated and their status. You can disable the job summary by setting the `show_job_summary` input to false. This will prevent the action from creating a job summary at the end of the workflow run.

```yaml
steps:
  - uses: wechuli/allcheckspassed@v2
    with:
      show_job_summary: false
```

### Commit statuses

You can choose to include commit statuses in addition to checks for evaluation. By default, this is disabled. If your CI/CD is only running on GitHub Actions and you are not explicitly calling the commit status API, you can keep the default. If you have an external integration (such as Jenkins) reporting commit statuses instead of checks, set `include_status_commits` to `true`.

```yaml
steps:
  - uses: wechuli/allcheckspassed@v2
    with:
      include_status_commits: true
```

Checks and commit statuses use different APIs and there are important nuances to be aware of. More on this is documented at [./docs/adrs/commit_status.md](./docs/adrs/commit_status.md)

### Ignore superseded workflow runs

By default, the action evaluates every check run that the Checks API returns for the commit and deduplicates by `(check name, app id)`. This means that if a GitHub Actions workflow is re-run on the same commit, stale check runs from the older run may still be evaluated when their names do not exactly match the new run (for example, matrix jobs in a cancelled run whose templates were never expanded). See [#104](https://github.com/wechuli/allcheckspassed/issues/104) for a real-world example.

You can opt in to filtering check runs down to the latest GitHub Actions run per workflow on the commit by setting `ignore_superseded_runs` to `true`:

```yaml
steps:
  - uses: wechuli/allcheckspassed@v2
    with:
      ignore_superseded_runs: true
```

When this is enabled, the action calls `GET /repos/:owner/:repo/actions/runs?head_sha=<sha>` in addition to the Checks API, so the workflow must grant the **`actions: read`** permission:

```yaml
jobs:
  allchecks:
    runs-on: ubuntu-latest
    permissions:
      checks: read
      actions: read
    steps:
      - uses: wechuli/allcheckspassed@v2
        with:
          ignore_superseded_runs: true
```

If you run this mode on GHES and `job.check_run_id` is unavailable, add `contents: read` as well.

This mode and the default raw-checks mode behave differently in some edge cases (notably around manually-created check runs that live in cancelled check suites). The two modes, what each one does, and guidance on when to use which are documented in [./docs/adrs/evaluation_modes.md](./docs/adrs/evaluation_modes.md).

## Setup with environments

This action is essentially a workflow run that will consume your GitHub Actions minutes. You may want to delay the
execution of the action to give enough time for your checks to run. GitHub provides the environments feature
that has a protection rule to allow you to delay the execution of job for a specified amount of time after the job is
triggered:

https://docs.github.com/en/actions/deployment/targeting-different-environments/using-environments-for-deployment#wait-timer

This will save you some minutes if have checks that take a long time to complete and you don't want to poll the API for
a long time.

```yaml
jobs:
  allchecks:
    runs-on: ubuntu-latest
    environment:
      name: delayenv
      deployment: false
    steps:
      - uses: wechuli/allcheckspassed@v2
        with:
          poll: false
```

![Image](https://github.com/wechuli/allcheckspassed/assets/15605874/abb794ff-f008-409f-9760-160c24b6c45c)

Unfortunately, this feature is only available on private/internal repositories for Enterprise plans. All public
repositories
have access to this feature.

## Setup with repository rulesets/branch protection rules

You want to require the check that is created to always pass in your repository rulesets or branch protection rules.
Where possible prefer to configure repository rulesets
to branch protection rules as they are more flexible.

## Contributing

Contributions are welcome. For local setup, validation expectations, and release workflow, see [./Contributing.md](./Contributing.md).

## Updating the Action bundle

Changes to `src/` must include the corresponding generated `dist/` changes. Use the project's pinned Node.js version
and regenerate the bundle with:

```bash
npm ci
rm -rf dist/
npm run build
npm run package
git diff -- dist/
git status --short -- dist/
git add --all -- dist/
```

Commit the updated `dist/` files with your source changes. CI rebuilds the Action and verifies that the committed bundle
is current.

## Limitations

Ultimately this is a temporary workaround for a missing feature, ensure all checks that run pass. GitHub may implement
this as some point, at which point you will not need the action anymore.

- Unfortunately, you'll need to poll the API to get the state of the checks. The action itself is consuming GitHub
  Actions minutes doing this polling
