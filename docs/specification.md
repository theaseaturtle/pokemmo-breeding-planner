## Problem Statement

The user has an existing single-file PokeMMO breeding planner, but the current version mixes UI, data, rules, state, export logic, and heuristics in a way that makes the planner hard to trust and hard to evolve. The current planner can produce useful-looking outputs, but it does not establish a clear boundary between PokeMMO mechanism facts, strategy suggestions, and execution tracking. It also does not reliably explain when a target is impossible because of game rules versus impossible because of the current inventory or incomplete data.

The user needs a rebuilt single HTML planner that can act as a trustworthy execution tool for PokeMMO breeding. It must support the full PokeMMO Pokedex as a unified data layer, expose support status for every Pokemon, plan legal breeding paths according to PokeMMO mechanics, explain when something cannot be planned, track execution safely, and export a reliable long-image mirror of the page. Because the original specification is gone, this spec also serves as the replacement source of truth together with confirmed example cases.

## Solution

Rebuild the planner as a new single HTML application centered around one shared planning engine. The application will treat PokeMMO mechanism facts as the hard boundary, separate mechanism facts from strategy suggestions and execution records, and produce one main legal plan rather than pretending to compute a global optimum. Every result shown in the page and every exported long image will come from the same result model.

The new planner will use a full-Pokedex unified data layer with explicit support states for each Pokemon. Users will be able to search for any Pokedex target as the user target, and the planner will internally map that target to the breeding target and breeding entry point when needed. If a target cannot be planned, the planner will produce a diagnosis instead of a partial plan. If a target can be planned, the planner will first generate a staged resource plan, then generate an execution plan containing only real breeding steps. When the User Final Target is evolved, the UI shows the distinct Breeding Completion Output and states that later evolution is outside the execution-plan scope.

The planner will remain a single offline HTML deliverable, but its internal architecture will be modular: versioned data layer, validation and diagnosis layer, planning engine, execution-state layer, rendering layer, and export layer. Development-time test fixtures and scripts may exist temporarily, but the final shipped artifact remains one HTML file.

## User Stories

1. As a PokeMMO player, I want to open one HTML file offline, so that I can use the planner without extra setup.
2. As a PokeMMO player, I want to search for any Pokemon in the full Pokedex, so that I can start from the final target I actually care about.
3. As a PokeMMO player, I want the planner to accept a final evolved target as my user target, so that I do not need to manually translate it into a breeding entry form.
4. As a PokeMMO player, I want the planner to show both my user target and the breeding target, so that I understand what is bred directly and what must be evolved later.
5. As a PokeMMO player, I want the planner to explain the breeding entry point it selected, so that I understand why the route starts from a different form than the final target.
6. As a PokeMMO player, I want the planner to list alternative legal breeding entry points when they exist, so that I can understand the chosen route in context.
7. As a PokeMMO player, I want to choose target IVs with 31 and 0 support, so that I can plan both standard and mixed breeding outcomes.
8. As a PokeMMO player, I want to set an optional target nature, so that the planner can include nature inheritance where needed.
9. As a PokeMMO player, I want to set an optional final target gender, so that the planner can include gender locking costs and constraints where needed.
10. As a PokeMMO player, I want to leave some target attributes unconstrained, so that the planner does not overfit the route when I do not care about those dimensions.
11. As a PokeMMO player, I want the planner to apply PokeMMO mechanism rules as the hard truth, so that the generated plan is legally executable in-game.
12. As a PokeMMO player, I want the planner to treat unsupported or unknown rules conservatively, so that it never fabricates a plan from guessed mechanics.
13. As a PokeMMO player, I want every Pokemon in the data layer to carry a visible support state, so that I know whether it is fully plannable, only identifiable, non-breedable, rules-unconfirmed, or data-incomplete.
14. As a PokeMMO player, I want the planner to distinguish non-breedable targets from merely unsupported targets, so that I do not confuse game limits with current application limits.
15. As a PokeMMO player, I want the planner to distinguish mechanism-impossible outcomes from inventory-impossible outcomes, so that I know whether to change rules assumptions or just acquire more resources.
16. As a PokeMMO player, I want the planner to block partial fake plans when a route is impossible, so that I do not waste time following an invalid path.
17. As a PokeMMO player, I want a structured diagnosis with reasons and minimum repair suggestions, so that I know how to make a blocked plan valid.
18. As a PokeMMO player, I want the planner to preserve the distinction between mechanism facts and strategy suggestions, so that I can trust the legal part even if I disagree with the recommendation.
19. As a PokeMMO player, I want strategy suggestions to be presented separately from rules, so that I can see what is required versus what is merely recommended.
20. As a PokeMMO player, I want the planner to expose manual market prices and fixed in-game fees separately, so that the budget reflects my server reality.
21. As a PokeMMO player, I want BP and yen costs reported separately, so that the planner does not invent a fake exchange rate.
22. As a PokeMMO player, I want the planner to compute transparent costs, so that I can see why a plan costs what it costs.
23. As a PokeMMO player, I want the planner to give me one main legal plan rather than pretend it solved for global optimality, so that the output stays honest.
24. As a PokeMMO player, I want the planner to explain when a route is a main plan rather than the only legal route, so that I know alternatives may exist.
25. As a PokeMMO player, I want to enter long-term inventory resources with species, sex, IV combination, nature marker, and quantity, so that planning can use what I already own.
26. As a PokeMMO player, I want inventory records to be aggregated by properties rather than by per-mon identity, so that inventory entry stays practical.
27. As a PokeMMO player, I want inventory resources to be limited to known Pokedex entries, so that the planner only reasons over validated data.
28. As a PokeMMO player, I want the planner to use inventory as a mirror of reality rather than a fictional sandbox, so that inventory deductions mean something.
29. As a PokeMMO player, I want planning to avoid mutating inventory immediately, so that exploring routes does not silently consume my resources.
30. As a PokeMMO player, I want a first stage that previews validation and resource allocation, so that I can inspect the resource plan before locking into execution.
31. As a PokeMMO player, I want a second stage that turns the approved resource plan into an execution plan, so that I can follow concrete steps without ambiguity.
32. As a PokeMMO player, I want any edit to key inputs to expire old execution steps, so that I do not keep following stale instructions.
33. As a PokeMMO player, I want execution to follow dependency order, so that later steps cannot be confirmed before their required intermediate outputs exist.
34. As a PokeMMO player, I want step confirmation to represent real execution, so that execution tracking matches what I actually did in game.
35. As a PokeMMO player, I want step confirmation to ask for actual resource consumption before deducting inventory, so that accidental clicks do not corrupt my resource mirror.
36. As a PokeMMO player, I want intermediate breeding outputs to live in a temporary plan resource pool rather than my long-term inventory, so that the execution model stays clean.
37. As a PokeMMO player, I want to manually promote an intermediate output into long-term inventory only when I choose, so that temporary execution artifacts do not pollute my main stock.
38. As a PokeMMO player, I want execution rollback to restore the appropriate inventory and temporary outputs when I undo a recorded step, so that I can correct mistaken confirmations.
39. As a PokeMMO player, I want the execution plan to contain only real breeding steps, so that later evolution is not mistaken for an in-plan action.
40. As a PokeMMO player, I want the User Final Target and Breeding Completion Output shown separately, so that I know which species actually hatches.
41. As a PokeMMO player, I want later evolution explicitly marked outside the execution-plan and breeding-cost scope, so that the budget remains faithful to the stated scope.
42. As a PokeMMO player, I want the page to persist my latest state locally, so that I can reopen the HTML and keep working.
43. As a PokeMMO player, I want the page to warn me that local browser data is the only persisted ledger, so that I understand the recovery limits.
44. As a PokeMMO player, I want the application to remain useful on mobile, so that I can execute plans while playing.
45. As a PokeMMO player, I want the application to remain dense and legible on desktop, so that I can inspect large plans and costs.
46. As a PokeMMO player, I want mobile and desktop layouts to expose the same truth with different density, so that no critical execution data disappears on smaller screens.
47. As a PokeMMO player, I want the long-image export to be a reliable mirror of the current page result, so that I can trust the exported artifact.
48. As a PokeMMO player, I want the long-image export to contain user target, breeding target, breeding completion output, evolution scope note, diagnosis summary, inventory consumption, execution status, and cost audit, so that the export is self-explanatory.
49. As a PokeMMO player, I want the planner to show support-state explanations for unsupported Pokemon, so that the app still feels informative when it cannot solve a target.
50. As a PokeMMO player, I want full-Pokedex search to remain responsive, so that using a complete data layer does not degrade the core experience.
51. As a PokeMMO player, I want common plans with dozens of inventory entries to compute quickly, so that the tool remains practical in real use.
52. As a future maintainer, I want the planner internals separated into data, rules, planning, execution state, rendering, and export responsibilities, so that the single HTML remains evolvable.
53. As a future maintainer, I want rules, support status, and data versions surfaced explicitly, so that updates can be made without silent drift.
54. As a future maintainer, I want confirmed examples to act as regression cases, so that future rule and data updates can be evaluated against known truth.
55. As a future maintainer, I want diagnosis categories to be stable and explicit, so that blocked states remain interpretable even as the planner expands.
56. As a future maintainer, I want the app to render from one result model, so that the page and export cannot diverge.
57. As a future maintainer, I want the planner to avoid promising global optimality, so that future solver changes do not create false regressions.
58. As a future maintainer, I want incomplete or uncertain Pokemon data to be visible at the support-state level, so that coverage expansion can proceed incrementally without misleading users.
59. As a future maintainer, I want strategy guidance to be swappable without altering mechanism validation, so that recommendations can evolve independently.
60. As a future maintainer, I want the final shipped artifact to stay a single HTML file, so that deployment and sharing remain frictionless.
61. As a player breeding a male-only species, I want every step to preserve the target family by pairing its mainline with Ditto, so that the planner does not invent an incompatible ordinary donor route.
62. As a player breeding a male-only species, I want each required multi-IV Ditto combination shown as a warehouse or purchase requirement, so that the planner never pretends lower-IV Ditto can breed into it.
63. As a player, I want every Ditto × Ditto node rejected, so that resource allocation and execution remain faithful to the confirmed game rule.
64. As a player, I want fixed-sex hatch species to have zero sex-selection fee, so that the audit does not charge for a choice the game does not offer.
65. As a player selecting Ditto as the breeding target, I want an explicit mechanism-impossible diagnosis, so that I understand why breeding cannot preserve the Ditto family.

## Implementation Decisions

- The application will be rebuilt around a single high-level planning engine seam. That seam owns validation, diagnosis, route construction, execution-state transitions, and the canonical result model consumed by both page rendering and export.
- The planner will use a versioned full-Pokedex data layer. Every Pokemon entry will exist in the unified data set even if its support state is not yet fully plannable.
- Support state is a first-class domain concept. At minimum, the states are: fully plannable, identifiable only, non-breedable, rules unconfirmed, and data incomplete.
- The planner will distinguish three output layers everywhere they appear: mechanism facts, strategy suggestions, and execution records. These are separate concepts in the model and separate regions in the UI and export.
- The planner will distinguish two impossibility classes in diagnosis: mechanism-impossible and inventory-impossible. These must not collapse into a single failure state.
- User target and breeding target are separate domain concepts. User target reflects the Pokemon the player wants at the end. Breeding target reflects the Pokemon form directly involved in breeding logic.
- The planner must automatically map a searched user target into the required breeding target and breeding entry point when necessary.
- When user target and breeding target differ, the result model must include an explicit evolution relation and the reason for the breeding entry-point choice.
- If multiple legal breeding entry points exist, the planner will produce one main plan and separately disclose alternative legal entry points with explanation.
- The planning engine will not promise global cost optimality. It produces one legal and transparent main plan, possibly accompanied by strategic context, but does not represent itself as a mathematical optimum solver.
- Price inputs are user-controlled market values. Fixed in-game costs remain rule-driven. BP and yen remain separate currencies throughout the model and UI.
- Inventory is modeled as long-term real-world resource mirror data. Planning does not consume it. Only confirmed execution steps mutate the inventory mirror.
- Inventory entries are property-aggregated resources rather than per-mon identity records. The record shape includes at least species, sex, IV combination, nature marker, and quantity.
- Temporary outputs generated during execution are not long-term inventory. They live in a plan-scoped temporary resource pool and may later be explicitly promoted by user action if the design expands to support that workflow.
- The UI flow remains two-stage. Stage one generates validation and resource-allocation preview. Stage two locks that result into an execution plan.
- Any key mutation to target, inventory, price inputs, or route-defining choices invalidates the current execution plan and marks prior execution records stale.
- Execution confirmation means the step has occurred in reality. The application must not use the same confirmation state for planning intent and completed execution.
- Execution state transitions are reversible as record corrections. Undoing a recorded step restores the associated inventory and temporary-resource state for that plan.
- Execution steps are dependency-ordered. The application must not allow later steps to be confirmed before upstream steps make their prerequisites available.
- The execution model contains real breeding steps only. Evolution is not generated as an execution step.
- The result model and export show the Breeding Completion Output separately from the User Final Target and state that later evolution is outside the execution-plan and breeding-cost scope.
- The page and export are two views over the same canonical result model. Export-specific drawing logic must not invent extra planner truth.
- The final deliverable remains one offline HTML file. Development may use temporary auxiliary tests, fixtures, and tooling, but the shipped artifact is single-file.
- The current external Pokedex text file is a bootstrap data source, not an untouchable authority. If live PokeMMO mechanics or confirmed examples contradict it, the planner data may be revised under explicit versioning.
- A male-only Target-Species Mainline pairs its target-family parent with one externally supplied Ditto at each step. Required multi-IV Ditto stages are atomic inventory or purchase inputs, not donor subtrees.
- Ditto × Ditto is globally illegal. Allocation, migration validation, resource planning, and execution validation must never accept such a node.
- A fixed male-only or female-only Hatch Species has no sex-selection fee. Fees for normally sexed donor outputs remain based on their own actual Hatch Species.
- Ditto itself is not a legal Breeding Target: pairing with a non-Ditto preserves the non-Ditto family, while pairing with Ditto is illegal.
- Nidoran-family and Volbeat/Illumise paired-offspring behavior remains rules-unconfirmed until a deterministic family rule is documented and tested.
- Because the original specification is lost, confirmed example cases become part of the functional truth of the system. Image-derived examples may be inferred initially but must be confirmed and refined into structured regression cases.

## Testing Decisions

- Good tests exercise externally visible behavior at the planning-engine seam rather than DOM implementation details. Tests should verify: support-state resolution, diagnosis class, target-to-breeding-target mapping, route legality, step categorization, inventory mutation rules, stale-plan invalidation, and cost outputs.
- The primary test seam is the high-level planning engine that produces the canonical result model. This is the preferred highest seam because it allows validation of rules, planning, diagnosis, execution transitions, and export inputs without coupling to page structure.
- Secondary behavioral verification may exist for the rendered HTML only where necessary to ensure the page surfaces the canonical result model correctly, especially for mobile/desktop density differences and long-image parity.
- The full-Pokedex data layer must be tested for support-state coverage, data completeness gates, and stable mapping between user target and breeding target.
- Diagnosis must be tested with representative mechanism-impossible and inventory-impossible cases.
- Execution-state tests must confirm that planning does not consume inventory, confirmed steps do consume inventory after user confirmation, temporary outputs appear correctly, and rollback restores plan state.
- Cost tests must verify both total cost and key cost decomposition fields, including separation of BP and yen.
- Evolved-target cases must verify that no evolution step appears, that the Breeding Completion Output is the real root Hatch Species, and that the evolution scope note is visible and excluded from breeding-cost totals.
- Because there is no prior automated test suite in the current repository, the spec adopts confirmed example cases as the starting prior art. These examples should be turned into structured regression fixtures as implementation progresses.
- Tests should prefer representative scenario coverage over assertions on internal helper functions. The application is a planner; therefore, scenario truth is the durable testing vocabulary.

## Out of Scope

- Hidden abilities, ball inheritance, egg moves, and other advanced breeding dimensions outside the currently confirmed basic breeding scope.
- Networked market-price fetching, cloud sync, multiplayer collaboration, or any online dependency for planner operation.
- Multi-profile local project management, named save slots, or JSON import/export in the first shipped version.
- Global mathematical optimality claims for route or cost selection.
- Browser-to-browser account synchronization or recovery guarantees beyond the current browser's local persistence.
- Artistic or presentation-first export behavior that diverges from the actual canonical planner result.
- Silent guessing for unsupported rules or incomplete data.

## Further Notes

- This spec replaces the missing prior specification together with confirmed example cases.
- The planner should remain honest about what it knows. If a Pokemon can be searched but not solved, the correct outcome is an explicit support-state explanation rather than a graceful-looking lie.
- The project should prefer expanding support status and example-backed rule coverage over inflating UI surface area.
- Future revisions should treat rule-version updates, confirmed example additions, and Pokedex-data corrections as first-class changes that require regression verification.
