# 版本档案

每个发布版本都是独立、可离线打开的单文件 HTML。每版使用独立的应用、规则、数据和浏览器本地存储版本，因此请不要用新版文件覆盖旧版本文件。

Git 标签保留各版本发布当时的目录结构；下表描述的是当前 `main` 分支中的归档位置。

| 版本 | 日期 | 主要变化 | 文件 |
| --- | --- | --- | --- |
| `0.1.0-alpha` | 原型阶段 | 初始交互原型 | [原型档案](../archive/prototypes/) |
| `v1.0.0` | 2026-08-19 | 首个可信执行账本版本 | [HTML](../releases/pokemmo-breeding-planner-v1.0.0-2026-08-19.html) |
| `v1.0.1` | 2026-08-19 | 目标性格承载不额外增加基础素材 | [HTML](../releases/pokemmo-breeding-planner-v1.0.1-2026-08-19.html) |
| `v1.0.2` | 2026-08-19 | 明确雌性主线与雄性捐赠亲本语义 | [HTML](../releases/pokemmo-breeding-planner-v1.0.2-2026-08-19.html) |
| `v1.0.3` | 2026-08-19 | 确定性树、资源分组、蛋组资格和道具账本 | [HTML](../releases/pokemmo-breeding-planner-v1.0.3-2026-08-19.html) |
| `v1.0.4` | 2026-08-19 | 生物性别锁定与统一可访问组合框 | [HTML](../releases/pokemmo-breeding-planner-v1.0.4-2026-08-19.html) |
| `v1.0.5` | 2026-08-19 | 无性别同种/百变怪路线与组合框菜单修复 | [当前 HTML](../app/pokemmo-breeding-planner-v1.0.5-2026-08-19.html) |

## 如何选择版本

- 想直接使用规划器：使用当前的 [`v1.0.5`](../app/pokemmo-breeding-planner-v1.0.5-2026-08-19.html)。
- 想比较功能如何演变：选择对应 Git 标签，然后查看该标签下的发布文件。
- 想保留某次执行账本：继续使用同一个版本和同一个浏览器配置；不同版本不会共享本地存储。
