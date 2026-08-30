# PokeMMO 幼年体与熏炉研究

> 资料核查日期：2026-08-29（Asia/Shanghai）
>
> 本文只记录调查结果，不修改应用代码。由于 PokeMMO 的完整服务器规则与数据文件并未公开，本表将官方论坛资料与次级资料分开标注；实现前应以游戏内配种员预览再次验证。

## 结论摘要

PokeMMO 中，幼年体不能直接作为配种亲本；需要先进化到可繁殖的进化形态。对于下表中的熏炉幼体，必须让对应的母方亲本携带对应熏炉，才能把通常会孵化出的进化形态改为幼年体。熏炉本身会随配种消耗，且 PokeMMO 配种会消耗两只亲本。

官方论坛管理员对 Azurill 明确确认：只有母方携带 Sea Incense 才会得到 Azurill，父方携带不会生效。[官方论坛：No Azurill?](https://forums.pokemmo.com/index.php?%2Ftopic%2F54288-no-azurill%2F=&comment=1074032&do=findComment)

## 物种清单

### 不需要熏炉的幼年体

这些物种属于幼年体，但在 PokeMMO 中的“无需熏炉”结论目前主要来自 PokeMMO 社区整理的完整配种清单，尚未找到官方逐项数据表。它们仍不能直接作为配种亲本。

| 全国图鉴 | 幼年体 | 通常相关的可繁殖进化形态 | 熏炉 |
|---:|---|---|---|
| 172 | Pichu | Pikachu | 无 |
| 173 | Cleffa | Clefairy | 无 |
| 174 | Igglybuff | Jigglypuff | 无 |
| 175 | Togepi | Togetic / Togekiss | 无 |
| 236 | Tyrogue | Hitmonlee / Hitmonchan / Hitmontop | 无 |
| 238 | Smoochum | Jynx | 无 |
| 239 | Elekid | Electabuzz / Electivire | 无 |
| 240 | Magby | Magmar / Magmortar | 无 |

### 需要熏炉的幼年体

“母方携带”是 PokeMMO 规则；“父方携带不生效”有官方管理员对 Azurill 的直接确认。其他行的物种—熏炉映射由 PokeMMO 社区清单和主系列资料交叉核对，PokeMMO 逐项官方确认仍待补充。

| 全国图鉴 | 幼年体 | 母方亲本（可用于产出幼体） | 对应熏炉 |
|---:|---|---|---|
| 298 | 露力丽 | 玛力露 / 玛力露丽 | 海潮熏香（Sea Incense） |
| 360 | 小果然 | 果然翁 | 悠闲熏香（Lax Incense） |
| 406 | 含羞苞 | 毒蔷薇 / 罗丝雷朵 | 玫瑰熏香（Rose Incense） |
| 433 | 铃铛响 | 风铃铃 | 洁净熏香（Pure Incense） |
| 438 | 爱哭树 | 树才怪 | 岩石熏香（Rock Incense） |
| 439 | 魔尼尼 | 魔墙人偶 | 怪异熏香（Odd Incense） |
| 440 | 小福蛋 | 吉利蛋 / 幸福蛋 | 幸运熏香（Luck Incense） |
| 446 | 小卡比兽 | 卡比兽 | 饱腹熏香（Full Incense） |
| 458 | 小球飞鱼 | 巨翅飞鱼 | 涟漪熏香（Wave Incense） |

## 规则边界

1. 幼年体不能与其他宝可梦配种，也不能与 Ditto 配种；“幼年体”在配种规划中应视为不可用亲本，直到进化。
2. 对熏炉幼体，应建模为“目标幼年体 → 对应成年/进化亲本 + 母方携带熏炉”，而不是把熏炉当成普通 IV/性格道具。
3. 若母方没有对应熏炉，结果会是通常的进化形态（例如 Marill，而非 Azurill）。父方携带熏炉不能替代母方携带。
4. PokeMMO 配种是把两只亲本交给配种员换取一枚蛋；亲本不会返还。旧版官方论坛指南明确记录了这一点。[官方论坛：The ultimate Breeding guide](https://forums.pokemmo.com/index.php?%2Ftopic%2F132652-the-ultimate-breeding-guide%2F=)
5. 本文没有把 Phione、Riolu、Toxel 等特殊或不可由常规配种获得的物种列为 PokeMMO 熏炉幼体；它们需要独立确认，不应套用本表。

## 来源与证据等级

### 一手来源

- [PokeMMO 官方论坛：No Azurill?](https://forums.pokemmo.com/index.php?%2Ftopic%2F54288-no-azurill%2F=&comment=1074032&do=findComment) — 官方管理员 Rache 明确说明母方必须携带 Sea Incense；父方携带不会得到 Azurill。
- [PokeMMO 官方论坛：The ultimate Breeding guide](https://forums.pokemmo.com/index.php?%2Ftopic%2F132652-the-ultimate-breeding-guide%2F=) — 社区发布在官方论坛的配种机制说明，记录配种消耗两只亲本及配种道具用途；作者并非官方工作人员，因此只作论坛社区资料。
- [PokeMMO 官方论坛：My Breeding Guide (Revised Nov. 2022)](https://forums.pokemmo.com/index.php?%2Ftopic%2F142087-my-breeding-guide-revised-nov-2022%2F) — 官方论坛社区指南，提到配种时应避开会孵化成幼体的宝可梦，并指出幼体需进化后才能再次配种；非官方工作人员，作次级资料。

### 次级来源

- [PokeMMO Wiki：Breeding](https://pokemmo.shoutwiki.com/wiki/Breeding) — PokeMMO 社区 Wiki；用于核对 PokeMMO 配种的总体框架，未找到完整、逐项的幼体熏炉表。
- [PokeMMO breeding guide（视频说明）](https://www.youtube.com/watch?v=23O4t70vt4A) — 2024-04-19 发布；明确列出 9 个熏炉幼体与对应熏炉，作为本表映射的次级交叉来源。
- [Bulbapedia：Incense](https://bulbapedia.bulbagarden.net/wiki/Incense) — 主系列机制的参考资料，用于核对物种—熏炉配对；不能单独证明 PokeMMO 的母方限定规则。
- [Bulbapedia：Pokémon breeding](https://bulbapedia.bulbagarden.net/wiki/Pok%C3%A9mon_breeding) — 主系列的幼体、熏炉与不可繁殖背景参考；不能单独证明 PokeMMO 实现。

## 待确认项

- 从当前可检索的官方资料中，没有发现 PokeMMO 官方维护的完整 baby/Incense 数据表或公开源码；需要通过最新客户端/游戏内配种员逐项确认。
- 需确认 8 个“无需熏炉”物种在当前版本是否全部按表产出，以及它们的母方判定是否存在特殊例外。
- 需确认 PokeMMO 当前版本中 Mr. Rime 是否与 Mr. Mime 共享 Mime Jr. 熏炉规则，以及 Mantine、Snorlax 等亲本的母方限制在所有配种组合中是否一致。
- 需确认熏炉名称在项目现有中文术语表中的标准译名；本文同时保留英文名以避免歧义。
- 需确认游戏内是否将某些可野外获得的幼年体仍标记为“幼年体不可繁殖”，不要把“可获得方式”与“可作为亲本”混为一谈。
