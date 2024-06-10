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

The action also created a checks summary with details of each check that was evaluated and their status:

![Screenshot 2024-02-06 at 15 37 43](https://github.com/wechuli/allcheckspassed/assets/15605874/de9a3a20-02ff-4d96-8da5-0c8300d429e7)

## How it works

When the workflow is triggered, the action will poll the GitHub API every 1 minute (default) for 10 tries (default) -
you can change these to your liking.
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

You can exclude certain checks from causing a failure by using the `checks_exclude` input. The input accepts a comma
separated string of values:

```yaml
    steps:
      - uses: wechuli/allcheckspassed@v1
        with:
          checks_exclude: 'CodeQL,lint,cosmetic'
```

You might want to do this to allow certain checks to fail, such as a code quality check, but still require that all
other checks pass.

The `checks_exclude` and `checks_include` inputs support Regular Expressions. For example, if you want to exclude all
checks have the word `lint` somewhere in the string, you don't have to list them all out, you can use the following:

```yaml
    steps:
      - uses: wechuli/allcheckspassed@v1
        with:
          checks_exclude: '.*lint.*'
```

### Include only certain checks

You can choose to include only specific checks for evaluation and ignore others. This is not the primary use case
for this action, but it is possible. If you want the check to always be included, you might consider using the native
repository rulesets or branch protection rules. You can't provide both the `checks_include` and `checks_exclude`inputs.

```yaml
    steps:
      - uses: wechuli/allcheckspassed@v1
        with:
          checks_include: 'CodeQL'
```

### What should be considered as passing

At the moment, checks with `success`, `neutral` and `skipped` are considered passing by GitHub. This action will
default to this behavior as well but you can change this if you want to.

```yaml
steps:
  - uses: wechuli/allcheckspassed@v1
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
      - uses: wechuli/allcheckspassed@v1
        with:
          fail_on_missing_checks: true
```

### Time

The default behavior of this action is that is delays its execution for 1 minute (default) and polls the API 10 times (
retries) with a delay
between each poll of 1 minute (default). You can change these values to your liking:

```yaml
    steps:
      - uses: wechuli/allcheckspassed@v1
        with:
          delay: '5'
          retries: '3'
          polling_interval: '3'

```

When the step with the action runs, it will wait for 5 minutes before polling the API for the first time. It will then
poll the API 3 times with a delay of 3 minutes between each poll.

You also don't have to poll, you can just run the action once and get the result.

```yaml
    steps:
      - uses: wechuli/allcheckspassed@v1
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
      - uses: wechuli/allcheckspassed@v1
        with:
          fail_fast: false

```

### Verbose logging

To enable additional logging when the action runs, you may enable the `verbose` mode (defaults to false). The additional
logs will indicate which specific checks are being waited on in each polling iteration. This may be helpful in debugging
what checks are matched by `checks_include` or `checks_exclude`.

```yaml
    steps:
      - uses: wechuli/allcheckspassed@v1
        with:
          verbose: true
```


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
    environment: delayenv
    steps:
      - uses: wechuli/allcheckspassed@v1
        with:
          poll: false
```

![Image](https://github.com/wechuli/allcheckspassed/assets/15605874/abb794ff-f008-409f-9760-160c24b6c45c)

Unfortunately, this feature is only available on private/internal repositories for Enterprise plans. All public
repositories
have access to this feature.

A downside of using environments is that it creates deployments which will show up on your pull request's timeline,
these
can sometimes be confusing, there is no way to prevent that.

## Setup with repository rulesets/branch protection rules

You want to require the check that is created to always pass in your repository rulesets or branch protection rules.
Where possible prefer to configure repository rulesets
to branch protection rules as they are more flexible.

## Limitations

Ultimately this is a temporary workaround for a missing feature, ensure all checks that run pass. GitHub may implement
this as some point, at which point you will not need the action anymore.

- The action is not checking for commit statuses, which uses a different API. If you need this, please open an issue.
- Unfortunately, you'll need to poll the API to get the state of the checks. The action itself is consuming GitHub
  Actions minutes doing this polling
