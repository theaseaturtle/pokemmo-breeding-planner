# PokeMMO Breeding Planner Glossary

## Breeding Target

The species whose breeding route and intermediate outputs are being planned. It can differ from the User Final Target when a confirmed post-processing relation exists.

## Biological Sex

The factual sex domain of a species or inventory individual: female, male, genderless, or a normal sex distribution. It is distinct from a final-target sex preference. A UI control can be locked when a species has only one factual value.

## Final-target Sex Preference

A requested sex for the root output of a normally sexed route. It is not an inventory fact and does not alter the base-parent count.

## Genderless Route

A route for a genderless Breeding Target. Its left input is the genderless target-species main line and its right input is a genderless target-species partner or Ditto. It must not use female/male parent labels or sex-selection fees.

## Ditto Partner

A genderless pairing resource permitted on a Genderless Route. It may occupy the right pairing role; a Ditto target is also permitted to use Ditto or itself under the current rule boundary.

## Ditto Donor Substitute

A Ditto used on either side of a Donor-Building Subtree. The output follows the non-Ditto parent's species; two Ditto cannot form a pair, and a Ditto Donor Substitute does not replace the Target-Species Mainline.

## Same-species Genderless Partner

A genderless parent whose species exactly matches the Genderless Route's Breeding Target. Cross-species shared-egg-group genderless pairing is not a legal candidate.

## Target-Species Mainline

The lineage whose outputs must preserve the Breeding Target species through to the final result. A normally gendered route preserves that species through its female parent, except when breeding the target species with Ditto.

## Donor-Building Subtree

A subtree whose root output is a donor for another breeding node rather than the final target-species output. Its intermediate species may differ from the Breeding Target when every pairing is compatible and the real output species is tracked.

## Active Donor Egg Group

The single Egg Group selected for all non-Ditto parents and outputs in a plan's Donor-Building Subtrees. A Breeding Target with one Egg Group fixes this value; a target with multiple Egg Groups requires one explicit choice.

## Stale Resource Plan

A retained Resource Plan whose target, inventory, pricing, or item inputs have changed since generation. It remains visible for comparison but cannot be locked for execution until regenerated.

## Strict Parent Match

An inventory parent that satisfies its assigned role and carries the required IV without another target IV that would be discarded at that position. Automatic allocation prefers ordinary Strict Parent Matches and preserves Ditto as a fallback.

## Wasteful Parent Match

A legal inventory parent that carries additional target IVs which the assigned tree position would discard. It is excluded from automatic allocation but may be selected through an explicit manual override.

## Purchase Source Allocation

The user's explicit distribution of a resource group's unfilled parent slots among legal purchasable species. It occupies Automatic Purchase Fallback slots, cannot exceed the group's purchase requirement, and must not create a Ditto × Ditto pairing.

## Purchase Requirement

The number of parents in a resource group that are not supplied by Long-Term Inventory and therefore must be acquired for the plan. Specifying a purchase species does not satisfy a Purchase Requirement; only a Confirmed Purchase does.

## Confirmed Purchase

A record that the user has actually acquired one or more planned parents, including their assigned species, quantity, actual unit price, and optional note. It is distinct from a Purchase Source Allocation and reduces Remaining Purchase Quantity.

## Plan Acquisition Pool

The plan-scoped collection of Confirmed Purchases that have not yet been consumed by execution or transferred to Long-Term Inventory. It is kept separate from Long-Term Inventory so planned acquisitions do not silently become reusable stock.

## Remaining Purchase Quantity

The unsatisfied portion of a Purchase Requirement after Confirmed Purchases are counted. It changes with purchase confirmation and reversal, while the original Purchase Requirement remains stable for route auditing.

## Actual Purchase Spend

The sum of actual unit price multiplied by quantity across Confirmed Purchases. Historical actual prices remain fixed when market reference prices change.

## Automatic Purchase Fallback

The legal default species used only to fill purchased-parent slots not covered by a Purchase Source Allocation. Removing an explicit allocation restores fallback coverage so the total purchased-parent count remains equal to the requirement.

## Acquisition Source

The origin from which a parent is available at the moment an execution step is performed: Inventory, Market, or Previous-Step Output. It describes provenance rather than whether a purchase is still pending.

## Parent Loadout

The execution-ready identity of one breeding input: its real species, Biological Sex, Acquisition Source, IVs, nature, and held item. Planning roles such as mainline or donor are not part of a Parent Loadout.

## Finite-option Combobox

A searchable, accessible control for selecting an existing finite option. It accepts only legal displayed options, supports mouse, Arrow Up, Arrow Down, Enter, and Escape, and restores the last legal value on invalid blur.
