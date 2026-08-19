# Security Policy

## Supported versions

Security updates are provided for the latest major version of All Checks Passed.
Users should reference the `v2` tag to receive compatible fixes automatically or
pin the most recent `v2.x.x` release if their security policy requires an exact
version.

| Version | Supported |
| ------- | --------- |
| 2.x     | Yes       |
| 1.x     | No        |

## Reporting a vulnerability

Please do not report suspected vulnerabilities in a public issue, discussion, or
pull request.

Report them privately through [GitHub's private vulnerability reporting
form](https://github.com/wechuli/allcheckspassed/security/advisories/new). Include
as much of the following information as possible:

- The affected version or commit
- A description of the vulnerability and its impact
- Steps or a minimal example that reproduces the issue
- Any known mitigations or workarounds
- Whether the vulnerability has been disclosed elsewhere

You can expect an acknowledgement within seven days. We will investigate the
report, keep you informed of material progress, and coordinate disclosure and
credit with you where appropriate. Remediation timelines depend on severity and
complexity; please allow us a reasonable opportunity to release a fix before
publishing details.

## Scope

Reports are especially helpful when they demonstrate a security impact caused by
this action, such as unintended access to repository data or credentials,
permission escalation, code execution, or a bypass that incorrectly treats a
failing required check as passing.

Configuration questions, expected behavior, and bugs without a security impact
can be reported through the public [issue
tracker](https://github.com/wechuli/allcheckspassed/issues). Vulnerabilities in
GitHub itself or in another third-party service should be reported to that
project's security team.

This project does not currently offer a bug bounty or guarantee compensation for
reports.
