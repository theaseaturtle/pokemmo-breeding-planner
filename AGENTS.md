## Agent skills

### Issue tracker

Issues and specs are tracked in GitHub Issues for `theaseaturtle/pokemmo-breeding-planner`. See `docs/agents/issue-tracker.md`.

### Triage labels

The repository uses the five default engineering triage labels. See `docs/agents/triage-labels.md`.

### Domain docs

This is a single-context repository using the root `CONTEXT.md` and `docs/adr/`. See `docs/agents/domain.md`.

## Release publishing

When publishing a new stable planner version, update all release surfaces in the same change:

- add the versioned HTML under `app/`;
- point all three root `index.html` redirects/links at that HTML;
- update the current-version links in `README.md`;
- append the version to `docs/releases.md`;
- run the complete test suite, including `tests/pages-entry.test.mjs`;
- after pushing, verify the GitHub Pages root URL resolves to the new app version.

Do not report a release as published until the root GitHub Pages entry has been verified online.
