# GitHub action show version

This action comments a PR with the next released version based on semantic release (feat, fix).

## Inputs

### `GITHUB_TOKEN`

**Required** A GitHub token.

## Example usage

```
uses: actions/github-action-show-version@v1.0
name: Comment new version
id: hello
with:
  GITHUB_TOKEN: ${{secrets.GITHUB_TOKEN}}
```
