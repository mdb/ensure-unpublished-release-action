# ensure-unpublished-release-action

A GitHub Action that checks if a given GitHub release tag already exists.

## Usage

```yaml
- uses: mdb/ensure-unpublished-release-action
  with:
    # Required; a GitHub release tag (typically, the release name)
    tag:
```

## Example

```yaml
name: Check if release version already exists
on:
  pull_request:

jobs:
  ensure-unpublished-version:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - name: Get package.json version
        run: echo "VERSION=$(jq -r .version package.json)" >> $GITHUB_ENV
      - uses: mdb/ensure-unpublished-release-action
        with:
          tag: ${{ env.VERSION }}
```

## Development

Install dependencies:

```
npm install
```

Format code, lint, compile TypeScript, package code for distribution, and run tests:

```
npm run all
```
