# An action to check if a given JIRA ticket is in the right status category.

## Example workflow

If your repository's PRs always match a JIRA ticket and you'd like to only allow merge if that JIRA ticket is in a given status category (e.g. done) this is the right action.

## Inputs

### `task-id`

**Optional** The JIRA task id. e.g. ADB-123. If not provided, the action will look for it as the first element on the PR title, like so: "ADB-123: My Super PR".

### `category-id`

**Required** The status category id to check against.

### `jira-host`

**Required** The JIRA host, defaults to `jira.atlassian.com`.

### `jira-username`

**Required** The Basic authentication username to use. Please use Secrets to store this and not on the workflow file in clear text.

### `jira-password`

**Required** The Basic authentication password to use. Please use Secrets to store this and not on the workflow file in clear text.

## Example usage

```yaml
name: Check JIRA

on:
  pull_request:
    branches: ["main"]
    types: [opened, edited, synchronize, reopened]

jobs:
  check-jira:
    runs-on: ubuntu-latest

    steps:
      - name: Check if the JIRA task is Done
        uses: fbernardo/jira-check-status-category@v1.0.0
        with:
          category-id: 3
          jira-host: myhost.atlassian.net
          jira-username: ${{ secrets.JIRA_USERNAME }}
          jira-password: ${{ secrets.JIRA_PASSWORD }}
```
