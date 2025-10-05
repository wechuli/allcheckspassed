## Filtering by Commit Status

There are important nuances to consider when filtering by commit statuses versus checks using this action. For more details on the differences between checks and commit statuses, refer to the [GitHub documentation on status checks](https://docs.github.com/en/enterprise-cloud@latest/pull-requests/collaborating-with-pull-requests/collaborating-on-repositories-with-code-quality-features/about-status-checks).

This action supports specifying the app that should report a check by defining the `checks_include` value:

```yaml
checks_include:
  description: "A comma-separated list of checks to include in the evaluation. By default, all checks are included. You can provide a list of objects with app_id and check_name to include only checks from a specific app or with a specific name. Supports regex"
  required: false
  default: "-1"
```

You can provide an array of objects as shown below:

```yaml
steps:
  - uses: wechuli/allcheckspassed@v2
    with:
      checks_include:
        [
          { "app_id": 12345, "check_name": "build" },
          { "app_id": 67890, "check_name": "lint" },
        ]
```

This allows you to evaluate only checks coming from a specific app. This works well with checks because the Checks API exposes the app ID of the GitHub App that creates the check (only GitHub App identities can create checks).

This approach works well if you are not using commit statuses. However, if you are using commit statuses, you need to update the `app_id` value to use the database ID of the identity creating the commit status. This is necessary because when a GitHub App creates a commit status, the GitHub API does not expose the app ID (as it does for checks). Instead, it exposes the database ID of the GitHub App identity, which is different from the app ID. User accounts can also create commit statuses, and since they are not apps, they would not have an app ID. In these cases, you should use the database ID of the identity you want to filter by, and the filtering will work with that ID.

Note that `checks_include` is most useful when you have many checks that you want to target using regular expressions. If you only have a few checks (such as the two examples shown above), you would likely be better served by using GitHub's native branch protection rules or rulesets to mark those checks as required status checks.
