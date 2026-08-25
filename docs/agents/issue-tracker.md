# Issue tracker: GitHub

Issues and specs for this repo live as GitHub issues. Use the `gh` CLI for all operations.

## Repository

`theaseaturtle/pokemmo-breeding-planner`

Infer the repository from `git remote -v`; `gh` does this automatically inside the clone.

## Conventions

- Create: `gh issue create --title "..." --body "..."`
- Read: `gh issue view <number> --comments`
- List: `gh issue list --state open --json number,title,body,labels,comments`
- Comment: `gh issue comment <number> --body "..."`
- Add label: `gh issue edit <number> --add-label "..."`
- Remove label: `gh issue edit <number> --remove-label "..."`
- Close: `gh issue close <number> --comment "..."`

## Pull requests as a triage surface

**PRs as a request surface: no.**

GitHub Issues are the request surface. External pull requests are not automatically sent through the issue triage workflow.

## Skill operations

- “Publish to the issue tracker”: create a GitHub issue.
- “Fetch the relevant ticket”: run `gh issue view <number> --comments`.
- A bare `#42` may refer to an issue or pull request; resolve it before acting.

## Wayfinding operations

A wayfinder map is one GitHub issue with linked child issues.

- Map label: `wayfinder:map`
- Child labels: `wayfinder:research`, `wayfinder:prototype`, `wayfinder:grilling`, or `wayfinder:task`
- Use GitHub sub-issues and native issue dependencies when available.
- If dependencies are unavailable, place `Blocked by: #<number>` at the top of the child issue.
- An issue is ready when every blocker is closed and it has no assignee.
- Claim work using `gh issue edit <number> --add-assignee @me`.
