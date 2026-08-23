import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';
import vm from 'node:vm';

const appPath = new URL('../app/pokemmo-breeding-planner-v1.0.6-2026-08-23.html', import.meta.url);
const html = readFileSync(appPath, 'utf8');
const script = html.match(/<script>([\s\S]*)<\/script>/)?.[1];

assert.ok(script, 'single-file app must contain an inline script');

function declarationCount(name) {
  return [...script.matchAll(new RegExp(`function\\s+${name}\\s*\\(`, 'g'))].length;
}

function loadPlanner() {
  const source = script.replace(
    /init\(\);\s*$/,
    'globalThis.__planner = { APP, POKEDEX_RAW, makeSpecies, createTree, legalSpecies, buildStage2 };',
  );
  const context = vm.createContext({
    console,
    confirm: () => true,
    structuredClone: globalThis.structuredClone,
    setTimeout,
    clearTimeout,
  });
  vm.runInContext(source, context);
  return context.__planner;
}

test('single-file release contains one canonical planning engine', () => {
  for (const name of ['makeSpecies', 'diagnosis', 'createTree', 'buildStage2', 'exportImage', 'bind']) {
    assert.equal(declarationCount(name), 1, `${name} should be declared once`);
  }
});

test('genderless breeding target is plannable through same-species or Ditto partners', () => {
  const planner = loadPlanner();
  planner.APP.catalog = planner.POKEDEX_RAW.map(planner.makeSpecies);
  planner.APP.byName = Object.fromEntries(planner.APP.catalog.map(species => [species.name, species]));

  const magnemite = planner.APP.byName['小磁怪'];
  assert.equal(magnemite.supportState, 'PLANNABLE');

  const tree = planner.createTree(
    magnemite,
    [{ key: 'hp', value: '31' }, { key: 'atk', value: '31' }],
    'None',
  );
  assert.equal(tree.routeType, 'GENDERLESS');

  const pairingLeaf = tree.leaves.find(leaf => leaf.role === 'GENDERLESS_PAIRING_PARENT');
  const candidates = Array.from(
    planner.legalSpecies(pairingLeaf, magnemite),
    species => species.name,
  ).sort();
  assert.deepEqual(candidates, ['小磁怪', '百变怪'].sort());
});
