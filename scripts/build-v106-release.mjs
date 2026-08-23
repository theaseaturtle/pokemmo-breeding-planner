import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const sourceUrl = new URL('../app/pokemmo-breeding-planner-v1.0.5-2026-08-19.html', import.meta.url);
const outputUrl = new URL('../app/pokemmo-breeding-planner-v1.0.6-2026-08-23.html', import.meta.url);

function functionEnd(source, start) {
  const open = source.indexOf('{', start);
  if (open < 0) throw new Error(`找不到函数体：${start}`);

  let depth = 0;
  let quote = null;
  let escaped = false;
  let lineComment = false;
  let blockComment = false;

  for (let index = open; index < source.length; index += 1) {
    const char = source[index];
    const next = source[index + 1];

    if (lineComment) {
      if (char === '\n') lineComment = false;
      continue;
    }
    if (blockComment) {
      if (char === '*' && next === '/') {
        blockComment = false;
        index += 1;
      }
      continue;
    }
    if (quote) {
      if (escaped) {
        escaped = false;
      } else if (char === '\\') {
        escaped = true;
      } else if (char === quote) {
        quote = null;
      }
      continue;
    }
    if (char === '/' && next === '/') {
      lineComment = true;
      index += 1;
      continue;
    }
    if (char === '/' && next === '*') {
      blockComment = true;
      index += 1;
      continue;
    }
    if (char === "'" || char === '"' || char === '`') {
      quote = char;
      continue;
    }
    if (char === '{') depth += 1;
    if (char === '}') {
      depth -= 1;
      if (depth === 0) return index + 1;
    }
  }
  throw new Error(`函数体没有闭合：${start}`);
}

function removeShadowedFunctions(script) {
  const declarations = [...script.matchAll(/^function\s+([A-Za-z_$][\w$]*)\s*\(/gm)]
    .map(match => ({ name: match[1], start: match.index }));
  const occurrences = new Map();
  for (const declaration of declarations) {
    const group = occurrences.get(declaration.name) ?? [];
    group.push(declaration);
    occurrences.set(declaration.name, group);
  }

  const removals = [];
  for (const group of occurrences.values()) {
    for (const declaration of group.slice(0, -1)) {
      removals.push({
        start: declaration.start,
        end: functionEnd(script, declaration.start),
      });
    }
  }

  let output = script;
  for (const range of removals.sort((left, right) => right.start - left.start)) {
    output = output.slice(0, range.start) + output.slice(range.end);
  }
  return output;
}

const html = readFileSync(sourceUrl, 'utf8');
const scriptMatch = html.match(/<script>([\s\S]*)<\/script>/);
if (!scriptMatch) throw new Error('v1.0.5 中没有找到内联脚本');

const cleanedScript = removeShadowedFunctions(scriptMatch[1]);
let candidate = html.replace(scriptMatch[1], cleanedScript);
candidate = candidate
  .replace("APP_VERSION='1.0.5'", "APP_VERSION='1.0.6'")
  .replaceAll('v1.0.5', 'v1.0.6')
  .replaceAll('2026-08-19', '2026-08-23')
  .replaceAll('pokemmo_breeding_planner_v1_0_5', 'pokemmo_breeding_planner_v1_0_6')
  .replace('SCHEMA_VERSION=5', 'SCHEMA_VERSION=6');

mkdirSync(dirname(fileURLToPath(outputUrl)), { recursive: true });
writeFileSync(outputUrl, candidate);
console.log(fileURLToPath(outputUrl));
