# PokeMMO Breeding Planner Acceptance Cases

This document replaces the missing historical example spec with structured acceptance cases. These cases are the truth source for regression once confirmed.

## How to use this document

- Each case defines a user-visible scenario.
- A case is only considered canonical after the user confirms it.
- Cases should verify mechanism facts, diagnosis behavior, key planning output, post-processing handling, and cost output where relevant.
- Until image-derived details are confirmed, some cases remain marked as `draft-from-context` rather than `confirmed`.

## Shared output expectations

Every confirmed case should eventually be checked against the following result sections:

- `user target`
- `breeding target`
- `support state`
- `diagnosis`
- `main plan`
- `alternative legal entry points`
- `breeding steps`
- `post-processing steps`
- `inventory consumption`
- `temporary outputs`
- `cost breakdown`
- `export parity expectations`

## Case Template

```md
### CASE-XXX - <short title>
status: draft-from-context | confirmed
priority: P0 | P1 | P2
category: happy-path | mechanism-blocked | inventory-blocked | support-state | execution | export

#### Intent
What real-world behavior this case proves.

#### Inputs
- User target:
- Target IVs:
- Target nature:
- Target final gender:
- Brace mode:
- Price inputs:
- Inventory:

#### Expected Support State
- User target support state:
- Breeding target support state:

#### Expected Diagnosis
- Outcome class: plannable | mechanism-impossible | inventory-impossible | unsupported
- Expected explanation:
- Minimum repair suggestion:

#### Expected Planning Output
- Expected breeding target:
- Expected breeding entry point rationale:
- Expected main-plan properties:
- Expected alternative legal entry points:

#### Expected Execution Output
- Expected breeding steps:
- Expected post-processing steps:
- Expected temporary-output behavior:
- Expected inventory-consumption behavior:
- Expected stale-plan behavior after edits:

#### Expected Cost Output
- Expected currency separation:
- Expected key cost drivers:
- Expected total-cost notes:

#### Notes For Confirmation
Questions or unknowns that still need user confirmation.
```

---

### CASE-001 - Full Pokedex searchable final target
status: confirmed
priority: P0
category: support-state

#### Intent
Prove that any searchable Pokedex target is treated as a user target even when breeding must start from a different form.

#### Inputs
- User target: any evolved Pokemon in the supported Pokedex data
- Target IVs: any legal combination
- Target nature: optional
- Target final gender: optional
- Brace mode: either
- Price inputs: any valid set
- Inventory: empty is acceptable

#### Expected Support State
- User target support state: visible
- Breeding target support state: visible

#### Expected Diagnosis
- Outcome class: plannable or blocked depending on target support state
- Expected explanation: must distinguish user target from breeding target if they differ
- Minimum repair suggestion: only if blocked

#### Expected Planning Output
- Expected breeding target: derived automatically from user target when needed
- Expected breeding entry point rationale: required
- Expected main-plan properties: user target and breeding target shown together
- Expected alternative legal entry points: shown if they exist

#### Expected Execution Output
- Expected breeding steps: generated only from breeding target
- Expected post-processing steps: generated if evolution is required to reach user target
- Expected temporary-output behavior: normal
- Expected inventory-consumption behavior: planning does not consume inventory
- Expected stale-plan behavior after edits: route expires if route-defining inputs change

#### Expected Cost Output
- Expected currency separation: yes
- Expected key cost drivers: breeding-only costs separated from post-processing
- Expected total-cost notes: evolution/post-processing not counted as breeding cost

#### Notes For Confirmation
- Need confirmed concrete species examples from the user.

---

### CASE-002 - Unsupported target explains why
status: confirmed
priority: P0
category: support-state

#### Intent
Prove that a searchable target with incomplete rule or data coverage is informative rather than silently broken.

#### Inputs
- User target: a Pokemon whose support state is not fully plannable
- Target IVs: any
- Target nature: optional
- Target final gender: optional
- Brace mode: either
- Price inputs: any valid set
- Inventory: any

#### Expected Support State
- User target support state: one of identifiable-only, non-breedable, rules-unconfirmed, or data-incomplete
- Breeding target support state: visible if derivable

#### Expected Diagnosis
- Outcome class: unsupported or mechanism-impossible depending on state
- Expected explanation: explicit state reason, not generic failure
- Minimum repair suggestion: only if repair is meaningful

#### Expected Planning Output
- Expected breeding target: shown if derivable
- Expected breeding entry point rationale: shown if relevant
- Expected main-plan properties: no fake partial main plan
- Expected alternative legal entry points: only if meaningful

#### Expected Execution Output
- Expected breeding steps: none if unsupported
- Expected post-processing steps: none if unsupported
- Expected temporary-output behavior: none
- Expected inventory-consumption behavior: none
- Expected stale-plan behavior after edits: standard

#### Expected Cost Output
- Expected currency separation: still respected if any visible budgeting context exists
- Expected key cost drivers: no fabricated totals for impossible execution
- Expected total-cost notes: blocked state should not masquerade as a priced plan

#### Notes For Confirmation
- Need examples for each support-state class.

---

### CASE-003 - Mechanism-impossible vs inventory-impossible
status: confirmed
priority: P0
category: mechanism-blocked

#### Intent
Prove that the planner distinguishes game-rule impossibility from current-resource impossibility.

#### Inputs
- User target: two scenarios with same target and different blocking reason
- Target IVs: legal target combination
- Target nature: optional
- Target final gender: optional
- Brace mode: either
- Price inputs: valid set
- Inventory: one scenario lacking resources, one scenario violating mechanism constraints

#### Expected Support State
- User target support state: fully plannable or identifiable depending on scenario
- Breeding target support state: fully plannable if mechanism allows

#### Expected Diagnosis
- Outcome class: mechanism-impossible in one case, inventory-impossible in the other
- Expected explanation: must name the correct blocking layer
- Minimum repair suggestion: mechanism repair differs from inventory repair

#### Expected Planning Output
- Expected breeding target: same logic in both scenarios
- Expected breeding entry point rationale: shown
- Expected main-plan properties: no partial fake route when blocked
- Expected alternative legal entry points: only if valid

#### Expected Execution Output
- Expected breeding steps: absent when blocked
- Expected post-processing steps: absent when blocked
- Expected temporary-output behavior: none
- Expected inventory-consumption behavior: none
- Expected stale-plan behavior after edits: standard

#### Expected Cost Output
- Expected currency separation: yes
- Expected key cost drivers: not used to imply plannability
- Expected total-cost notes: blocked state must not look executable

#### Notes For Confirmation
- Need one concrete example of each blocked class from real gameplay context.

---

### CASE-004 - Nature inheritance chain remains legal
status: draft-from-context
priority: P0
category: happy-path

#### Intent
Prove that a target requiring nature inheritance generates a legal route with explicit nature handling and no loss of mechanism correctness.

#### Inputs
- User target: any breedable target with optional evolution mapping
- Target IVs: multi-step IV target
- Target nature: specified
- Target final gender: specified or random depending scenario
- Brace mode: either
- Price inputs: valid set
- Inventory: may include or omit matching nature base

#### Expected Support State
- User target support state: fully plannable
- Breeding target support state: fully plannable

#### Expected Diagnosis
- Outcome class: plannable
- Expected explanation: nature handling visible
- Minimum repair suggestion: only if no legal nature route exists with provided constraints

#### Expected Planning Output
- Expected breeding target: shown
- Expected breeding entry point rationale: shown if target and breeding target differ
- Expected main-plan properties: nature inheritance explicitly represented
- Expected alternative legal entry points: optional

#### Expected Execution Output
- Expected breeding steps: include nature-carrying path
- Expected post-processing steps: include evolution if needed
- Expected temporary-output behavior: intermediate products used in dependency order
- Expected inventory-consumption behavior: inventory untouched until confirmed execution
- Expected stale-plan behavior after edits: changing nature expires the route

#### Expected Cost Output
- Expected currency separation: yes
- Expected key cost drivers: everstone and relevant gender costs visible
- Expected total-cost notes: nature-specific costs explainable

#### Notes For Confirmation
- Need concrete confirmed example from user's image set.

---

### CASE-005 - Genderless special handling
status: draft-from-context
priority: P0
category: happy-path

#### Intent
Prove that a genderless target is validated and planned under the correct PokeMMO-specific special handling.

#### Inputs
- User target: a genderless target in the Pokedex
- Target IVs: any legal target combination
- Target nature: optional
- Target final gender: none / not applicable
- Brace mode: either
- Price inputs: valid set
- Inventory: scenario with and without required matching resources

#### Expected Support State
- User target support state: fully plannable if supported
- Breeding target support state: fully plannable if supported

#### Expected Diagnosis
- Outcome class: plannable or mechanism-impossible depending rule fit
- Expected explanation: must mention special genderless breeding handling
- Minimum repair suggestion: rule-appropriate if blocked

#### Expected Planning Output
- Expected breeding target: shown
- Expected breeding entry point rationale: shown
- Expected main-plan properties: no fake male/female assumptions
- Expected alternative legal entry points: optional

#### Expected Execution Output
- Expected breeding steps: use correct special handling
- Expected post-processing steps: as needed
- Expected temporary-output behavior: standard
- Expected inventory-consumption behavior: standard
- Expected stale-plan behavior after edits: standard

#### Expected Cost Output
- Expected currency separation: yes
- Expected key cost drivers: no invented sex-lock fees where not applicable
- Expected total-cost notes: genderless-specific fee logic must be explainable

#### Notes For Confirmation
- Need exact confirmed example and expected route from image set or user text.

---

### CASE-006 - Male-only special handling
status: draft-from-context
priority: P0
category: happy-path

#### Intent
Prove that a male-only target is handled according to PokeMMO mechanics without pretending standard breeding assumptions apply.

#### Inputs
- User target: a male-only target or final target mapped to male-only breeding constraints
- Target IVs: any legal target combination
- Target nature: optional
- Target final gender: male or unconstrained depending case
- Brace mode: either
- Price inputs: valid set
- Inventory: scenario with and without special breeding resources

#### Expected Support State
- User target support state: fully plannable or blocked depending coverage
- Breeding target support state: visible

#### Expected Diagnosis
- Outcome class: plannable or mechanism-impossible depending constraints
- Expected explanation: must call out male-only handling
- Minimum repair suggestion: rule-appropriate if blocked

#### Expected Planning Output
- Expected breeding target: shown
- Expected breeding entry point rationale: shown
- Expected main-plan properties: no fake standard maternal inheritance assumptions
- Expected alternative legal entry points: optional

#### Expected Execution Output
- Expected breeding steps: follow special handling path
- Expected post-processing steps: as needed
- Expected temporary-output behavior: standard
- Expected inventory-consumption behavior: standard
- Expected stale-plan behavior after edits: standard

#### Expected Cost Output
- Expected currency separation: yes
- Expected key cost drivers: special path costs visible
- Expected total-cost notes: must remain explainable and separated

#### Notes For Confirmation
- Need exact confirmed example and expected route from image set or user text.

---

### CASE-007 - Inventory planning does not mutate stock
status: confirmed
priority: P0
category: execution

#### Intent
Prove that planning is exploratory and does not consume long-term inventory until execution is confirmed.

#### Inputs
- User target: any plannable target
- Target IVs: any
- Target nature: optional
- Target final gender: optional
- Brace mode: either
- Price inputs: valid set
- Inventory: at least one usable inventory resource

#### Expected Support State
- User target support state: fully plannable
- Breeding target support state: fully plannable

#### Expected Diagnosis
- Outcome class: plannable
- Expected explanation: none beyond normal
- Minimum repair suggestion: none

#### Expected Planning Output
- Expected breeding target: shown
- Expected breeding entry point rationale: shown if relevant
- Expected main-plan properties: inventory may be referenced as available resource
- Expected alternative legal entry points: optional

#### Expected Execution Output
- Expected breeding steps: generated
- Expected post-processing steps: as needed
- Expected temporary-output behavior: standard
- Expected inventory-consumption behavior: no inventory mutation before explicit step confirmation
- Expected stale-plan behavior after edits: standard

#### Expected Cost Output
- Expected currency separation: yes
- Expected key cost drivers: purchased vs inventory-provided resources distinguishable
- Expected total-cost notes: inventory use should reduce visible purchase burden without consuming stock yet

#### Notes For Confirmation
- Confirm exact inventory-display wording later.

---

### CASE-008 - Confirmed execution consumes inventory and creates temporary outputs
status: confirmed
priority: P0
category: execution

#### Intent
Prove that step confirmation mutates long-term inventory only after explicit confirmation and adds the expected temporary outputs for downstream steps.

#### Inputs
- User target: any multi-step plannable target
- Target IVs: multi-step target
- Target nature: optional
- Target final gender: optional
- Brace mode: either
- Price inputs: valid set
- Inventory: includes at least one long-term resource consumed in the first confirmed step

#### Expected Support State
- User target support state: fully plannable
- Breeding target support state: fully plannable

#### Expected Diagnosis
- Outcome class: plannable
- Expected explanation: normal
- Minimum repair suggestion: none

#### Expected Planning Output
- Expected breeding target: shown
- Expected breeding entry point rationale: shown if relevant
- Expected main-plan properties: dependency-ordered execution plan
- Expected alternative legal entry points: optional

#### Expected Execution Output
- Expected breeding steps: confirmable only in dependency order
- Expected post-processing steps: as needed
- Expected temporary-output behavior: a confirmed step adds its child output to the temporary pool
- Expected inventory-consumption behavior: a confirmed step deducts only the confirmed long-term resources after confirmation
- Expected stale-plan behavior after edits: route expires if route-defining state changes

#### Expected Cost Output
- Expected currency separation: yes
- Expected key cost drivers: unchanged by mere planning, only reflected as execution trace if shown
- Expected total-cost notes: planning budget remains route budget rather than wallet ledger

#### Notes For Confirmation
- Need exact execution-confirmation UX wording later.

---

### CASE-009 - Rollback restores plan state
status: confirmed
priority: P0
category: execution

#### Intent
Prove that undoing a recorded execution step behaves like correcting the log entry rather than pretending in-game breeding is reversible.

#### Inputs
- User target: any plannable multi-step target
- Target IVs: multi-step target
- Target nature: optional
- Target final gender: optional
- Brace mode: either
- Price inputs: valid set
- Inventory: enough to confirm at least one step

#### Expected Support State
- User target support state: fully plannable
- Breeding target support state: fully plannable

#### Expected Diagnosis
- Outcome class: plannable
- Expected explanation: normal
- Minimum repair suggestion: none

#### Expected Planning Output
- Expected breeding target: shown
- Expected breeding entry point rationale: shown if relevant
- Expected main-plan properties: dependency-aware
- Expected alternative legal entry points: optional

#### Expected Execution Output
- Expected breeding steps: at least one confirmed then undone
- Expected post-processing steps: as needed
- Expected temporary-output behavior: undo removes or invalidates downstream temporary outputs as needed
- Expected inventory-consumption behavior: undo restores long-term inventory to the appropriate prior snapshot
- Expected stale-plan behavior after edits: standard

#### Expected Cost Output
- Expected currency separation: yes
- Expected key cost drivers: route budget unchanged
- Expected total-cost notes: rollback affects execution record, not theoretical route budget

#### Notes For Confirmation
- Need exact dependency invalidation behavior confirmed in implementation review.

---

### CASE-010 - Export mirrors page truth
status: confirmed
priority: P0
category: export

#### Intent
Prove that the long-image export is a trustworthy mirror of the page result rather than a separate narrative.

#### Inputs
- User target: any confirmed plannable target
- Target IVs: any
- Target nature: optional
- Target final gender: optional
- Brace mode: either
- Price inputs: valid set
- Inventory: any

#### Expected Support State
- User target support state: visible in page context
- Breeding target support state: visible in page context

#### Expected Diagnosis
- Outcome class: same as page
- Expected explanation: same as page
- Minimum repair suggestion: same as page if blocked

#### Expected Planning Output
- Expected breeding target: same as page
- Expected breeding entry point rationale: same as page
- Expected main-plan properties: same as page
- Expected alternative legal entry points: same as page if present

#### Expected Execution Output
- Expected breeding steps: same as page
- Expected post-processing steps: same as page
- Expected temporary-output behavior: summarized consistently if represented
- Expected inventory-consumption behavior: summarized consistently if represented
- Expected stale-plan behavior after edits: export should reflect current state only

#### Expected Cost Output
- Expected currency separation: same as page
- Expected key cost drivers: same as page
- Expected total-cost notes: same as page

#### Notes For Confirmation
- Confirm final export density and truncation rules later.

---

### CASE-011 - Batch inventory and cross-species donor subtree
status: confirmed
priority: P0
category: execution

#### Intent
Prove that multiple inventory entries can be recorded before planning and that a donor-building subtree uses compatible cross-species parents while preserving the final target species.

#### Inputs
- User target: 妙蛙种子
- Target IVs: 物攻 31、速度 31
- Target nature: 固执
- Target final gender: 雌性
- Active Donor Egg Group: 植物
- Inventory: 走路草（雌性、物攻 31）、喇叭芽（雄性、速度 31）

#### Expected Support State
- User target support state: fully plannable
- Breeding target support state: fully plannable

#### Expected Diagnosis
- Outcome class: plannable after the Active Donor Egg Group is selected
- Expected explanation: a dual-Egg-Group target must explicitly select one donor Egg Group
- Minimum repair suggestion: select 怪兽 or 植物 when no group is selected

#### Expected Planning Output
- Adding or removing inventory does not generate a Resource Plan automatically
- 走路草 and 喇叭芽 are allocated inside the Donor-Building Subtree
- The 2V male donor output species is 走路草
- The final output species remains 妙蛙种子
- Ordinary Strict Parent Matches are allocated before Ditto
- Wasteful Parent Matches require a manual override

#### Expected Execution Output
- The execution step shows 走路草（雌性）+ 喇叭芽（雄性）→ 走路草（雄性、物攻 31 + 速度 31）
- A later target-mainline step consumes that male donor to produce 妙蛙种子
- If inventory changes after generation, the old Resource Plan stays visible, becomes stale, and cannot be locked
- Ditto can replace either donor side; automatic allocation repairs Ditto × Ditto with a legal non-Ditto purchase source, while manual allocation rejects the conflicting second Ditto

#### Expected Cost Output
- Gender-selection fees use each real intermediate species
- Currency separation remains unchanged

#### Notes For Confirmation
- Confirmed through the v1.0.7 design interview, automated tests, and browser scenario.

---

### CASE-012 - Concise parent labels and bounded purchase-source allocation
status: confirmed
priority: P0
category: usability

#### Intent
Prove that resource and execution labels remain scannable while explicit Purchase Source Allocations replace, rather than duplicate, Automatic Purchase Fallback slots.

#### Inputs
- User target: 妙蛙种子
- Target nature: 固执
- Active Donor Egg Group: 植物
- A donor resource group with two unfilled purchased-parent slots

#### Expected Support State
- User target support state: fully plannable
- Breeding target support state: fully plannable

#### Expected Diagnosis
- Outcome class: plannable
- Expected explanation: unchanged from the legal breeding route
- Minimum repair suggestion: none

#### Expected Planning Output
- Resource titles contain only IV, value, and biological sex, such as `物攻 31 · 雄性`
- Role chips show `目标物种` or the Active Donor Egg Group, such as `植物蛋组`
- Adding one explicit species produces one Manual Purchase Source Allocation and leaves one Automatic Purchase Fallback
- Adding a second explicit species consumes the final fallback slot
- A third allocation is rejected because all purchase slots are assigned
- Removing an explicit allocation restores Automatic Purchase Fallback coverage
- Automatic fallback rows cannot be removed
- A manual allocation that would form Ditto × Ditto is rejected before it changes the plan

#### Expected Execution Output
- Steps appear in dependency order as `第 1 步`, `第 2 步`, and so on, with the real output species, IVs, and nature in each title
- No execution card uses planning-role or tree-layer labels such as mainline, donor, parent A/B, or pure-IV layer
- Each parent uses its real species as the heading and shows Biological Sex, Acquisition Source, IVs, nature, and held item
- Acquisition Source is `仓库`, `市场`, or `上一步产物`; it does not use `待购` inside a locked execution plan
- Each breeding step shows `本次锁公`, `本次锁母`, `本次不锁性别`, or `无需锁性别` once between the two Parent Loadouts
- A nature-only route displays `携带：无` on the parent that needs no inheritance item
- The former repeated output box is absent

#### Expected Cost Output
- Purchase-source allocation changes species distribution but not the number of required parents
- Currency separation remains unchanged

#### Notes For Confirmation
- Confirmed through the v1.0.8 design interview and red-green tests.

---

### CASE-013 - Confirmed purchases reduce remaining purchase quantity
status: confirmed
priority: P0
category: execution

#### Intent
Prove that choosing a planned purchase species and actually acquiring it remain separate facts, while every Confirmed Purchase visibly reduces the Remaining Purchase Quantity.

#### Expected Planning Output
- A parent resource card shows Requirement, Long-Term Inventory, Remaining Purchase Quantity, and Confirmed Purchase Quantity.
- Purchase Source Allocation does not reduce the Purchase Requirement or Remaining Purchase Quantity.
- Confirming an acquired quantity reduces Remaining Purchase Quantity and increases Confirmed Purchase Quantity by the same amount.
- Each planned species shows its planned, confirmed, and remaining quantities.
- A confirmed purchase uses a two-line record: purchase facts first, then lower-emphasis actions; Edit Actual Price and Transfer to Inventory are neutral actions while Undo remains visually dangerous.
- Multiple purchases are summarized by species or item and expose their individual batches through collapsed progressive disclosure.
- Editing Actual Purchase Price and its optional note happens inline without a native browser prompt.
- A parent purchase form keeps quantity, actual unit price, optional note, and confirmation legible without squeezing record actions into the same row.
- Item acquisition cards use three columns at wide content widths, two columns at medium widths, and one column below 600px; each card stacks its inputs above a full-width confirmation action.
- Below 320px card width, record actions become three equal touch targets with at least 40px height.

#### Expected Execution Output
- Confirmed Purchases enter the Plan Acquisition Pool rather than Long-Term Inventory.
- An execution step with an unfulfilled purchased parent or item displays `等待采购` and cannot be confirmed.
- Execution consumes plan acquisitions only after explicit step confirmation; undo restores the acquisition record.
- Unconsumed acquisitions can be explicitly transferred to Long-Term Inventory.

#### Expected Cost Output
- Reference Plan Cost stays stable.
- Actual Purchase Spend uses the recorded actual unit price.
- Remaining Estimated Spend uses current reference prices and remaining quantities.
- Completion Forecast equals Actual Purchase Spend plus Remaining Estimated Spend.

#### Notes For Confirmation
- Confirmed through the v1.0.9 design interview and automated model tests.
