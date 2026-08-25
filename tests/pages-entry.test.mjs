import assert from 'node:assert/strict';
import { existsSync, readFileSync } from 'node:fs';
import test from 'node:test';

const repositoryRoot = new URL('../', import.meta.url);
const index = readFileSync(new URL('index.html', repositoryRoot), 'utf8');
const readme = readFileSync(new URL('README.md', repositoryRoot), 'utf8');
const currentRelease = 'app/pokemmo-breeding-planner-v1.0.18-2026-08-25.html';

test('GitHub Pages 根入口跳转到 README 声明的当前稳定版本', () => {
  assert.ok(existsSync(new URL(currentRelease, repositoryRoot)));
  assert.match(readme, new RegExp(`最新离线文件：\\[v1\\.0\\.18\\]\\(${currentRelease}\\)`));
  assert.equal((index.match(new RegExp(currentRelease, 'g')) || []).length, 3);
  assert.doesNotMatch(index, /pokemmo-breeding-planner-v1\.0\.9/);
});
