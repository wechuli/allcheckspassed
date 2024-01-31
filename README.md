# All checks pass action

This action will check that all checks have passed on a given pull request.

## Basic usage

The action works well with the `pull_request` or `pull_request_target` events. You can use it to confirm
that all checks that run on a pull request passed.

```yaml
name: All checks pass
on:
  pull_request:
    types: [ opened, synchronize, reopened, ready_for_review ]
  jobs:
    allchecks:
      runs-on: ubuntu-latest
      steps:
        - uses: wechuli/allcheckspassed@v1

```

With this default configuration, the action will fail if any of the checks on the pull request have failed or if
any of the checks are still in progress, pending or queued when the workflow is complete.

## How it works

When the workflow is triggered, the action will poll the GitHub API every 1 minute (default) for 10 tries (default).
If all the checks are successful, the action will succeed. If any of the checks are still in progress, pending or
queued, the action fails

It will create a job summary of each check along with the details.

## Permissions

The workflow job must be granted read access to `checks` and `contents` for it to work:

```yaml
jobs:
  allchecks:
    runs-on: ubuntu-latest
    permissions:
      checks: read
      contents: read
```

## Examples

### Exclude certain checks from causing a failure

You can exclude certain checks from causing a failure by using the `exclude_checks` input:

```yaml
jobs:
  allchecks:
    runs-on: ubuntu-latest
    permissions:
      checks: read
      contents: read
    steps:
      - uses: wechuli/allcheckspassed@v1
        with:
          exclude_checks: 'CodeQL'
```

You might want to do this to allow certain checks to fail, such as a code quality check, but still require that all
other checks pass.

### Include only certain checks

You can choose to include only specific checks for evaluation and ignore others. This is not the primary use case
for this action, but it is possible. If you want the check to always be included, you might consider using the native
repository rulesets or branch protection rules. You can't provide both `include_checks` and `exclude_checks` at the same
time.

```yaml
jobs:
  allchecks:
    runs-on: ubuntu-latest
    permissions:
      checks: read
      contents: read
    steps:
      - uses: wechuli/allcheckspassed@v1
        with:
          include_checks: 'CodeQL'
```
