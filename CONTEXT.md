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

## Same-species Genderless Partner

A genderless parent whose species exactly matches the Genderless Route's Breeding Target. Cross-species shared-egg-group genderless pairing is not a legal candidate.

## Finite-option Combobox

A searchable, accessible control for selecting an existing finite option. It accepts only legal displayed options, supports mouse, Arrow Up, Arrow Down, Enter, and Escape, and restores the last legal value on invalid blur.
