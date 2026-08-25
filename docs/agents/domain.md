# Domain Docs

This is a single-context repository.

## Before exploring

Read:

- `CONTEXT.md`
- Relevant ADRs under `docs/adr/`

If either location does not exist, proceed silently. Domain documentation is created lazily when terminology or decisions are resolved.

## Layout

```text
/
├── CONTEXT.md
├── docs/
│   └── adr/
└── app/
```

## Vocabulary

Use domain concepts exactly as defined in `CONTEXT.md`. Avoid introducing synonyms for established terms.

If a necessary concept is missing, reconsider whether it belongs to the domain vocabulary or record the gap for `/domain-modeling`.

## ADR conflicts

If proposed work contradicts an existing ADR, identify the conflict explicitly instead of silently overriding the decision.
