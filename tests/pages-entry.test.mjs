import assert from 'node:assert/strict';
import { existsSync, readFileSync } from 'node:fs';
import test from 'node:test';

const repositoryRoot = new URL('../', import.meta.url);
const index = readFileSync(new URL('index.html', repositoryRoot), 'utf8');
const readme = readFileSync(new URL('README.md', repositoryRoot), 'utf8');
const currentDeclaration = readme.match(/最新离线文件：\[(v\d+\.\d+\.\d+)\]\((app\/pokemmo-breeding-planner-[^)]+\.html)\)/);

test('GitHub Pages 根入口跳转到 README 声明的当前稳定版本', () => {
  assert.ok(currentDeclaration, 'README 必须声明最新离线版本及其 app/ 文件');
  const [, currentVersion, currentRelease] = currentDeclaration;
  assert.ok(existsSync(new URL(currentRelease, repositoryRoot)));
  assert.equal((index.match(new RegExp(currentRelease, 'g')) || []).length, 3);
  assert.match(index, new RegExp(`配种执行规划器 ${currentVersion.replaceAll('.', '\\.')}`));
});
