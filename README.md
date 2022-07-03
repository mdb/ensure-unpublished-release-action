[![build-and-test](https://github.com/mdb/ensure-unpublished-release-action/actions/workflows/test.yml/badge.svg)](https://github.com/mdb/ensure-unpublished-release-action/actions/workflows/test.yml)

# ensure-unpublished-release-action

A GitHub Action that checks if a given GitHub release tag already exists.

`ensure-unpublished-release-action` succeeds if the provided release tag
is unique and does not already exist, and fails if the tag has already
been published as a GitHub release.

## Usage

```yaml
- uses: mdb/ensure-unpublished-release-action
  with:
    # Required; a GitHub release tag (typically the release name)
    tag:

    # Required; a GitHub access token (typically `secrets.GITHUB_TOKEN`)
    token:
```

## Example

```yaml
name: Check that release version does not already exist
on:
  pull_request:

jobs:
  ensure-unpublished-version:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2

      - name: Get package.json version
        run: echo "PACKAGE_VERSION=$(jq -r .version package.json)" >> $GITHUB_ENV

      # Fail the build if package.json's 'version' property specifies
      # a value associated with an already-existing release:
      - uses: mdb/ensure-unpublished-release-action@main
        with:
          tag: ${{ env.PACKAGE_VERSION }}
          token: ${{ secrets.GITHUB_TOKEN }}
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
