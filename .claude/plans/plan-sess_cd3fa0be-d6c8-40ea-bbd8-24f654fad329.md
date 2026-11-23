# 重定向规则批量修正 + SPA 兜底同源化

## Context

GA 报告(Oct 3–30)证实 Page Not Found 占全站 5.02%(798 views),头部 70% 是 `/ja-JP/` 路径。已验证根因:
1. **en conf 有 ~907 条 301,jan 镜像只有 76 条**;ja 内容页全部存在(200),纯规则缺口;
2. **SPA 站内点击兜底只有 6 条手维护规则**(`packages/site-config/src/sites/en.ts:101`),与 nginx 表完全脱节,#954 修好形状后覆盖率仍≈0;
3. en conf 自身有错目标(`/reference/api/go/Vector/Insert()` → `v2-Vector-Query`,应为 Insert)和 GA 有量的单段 SDK 路径无规则(`/reference/go/v2-Vector-Query` 等,真实路由是双段 `<sdk>/<sdk>/...`)。

现状关键事实(探索已确认):
- `deploy/{en,zh-CN}/nginx.conf` **手工维护、无生成器**;目标合法性由 `deploy/contracts/container.test.mjs:326-421` 对 sitemap 快照(`en-redirect-target-routes.json`,2029 条路由)lint,jan 目标剥前缀后按 en 快照校验;新规则须配 assertion(既有模式)。
- SPA 链路:`createDocusaurusConfig.ts:103 redirectPlugin(profile)` → `spa-redirect-map` 插件(config 期查环/查重,postBuild 校验 target 是站点真实路由)→ 404 页 `usePluginData().rules` 精确匹配。
- Docker 构建 `COPY . .`(deploy/en/Dockerfile),容器内 docusaurus 构建可读 `deploy/`;`repositoryPath()` 助手已存在(createDocusaurusConfig.ts:27)。
- deploy/ 归 **master** 所有 → master PR,经 sync 到 dev,Jenkins 从 dev SHA 构建镜像生效。

设计定案:**nginx.conf 成为唯一规则源**。SPA map 在 config 期从 conf 派生(彻底消除两源脱节);ja 镜像批量生成 + 用 drift 测试锁住"未来 en 新规则必须带 ja 镜像或登记豁免"。

## 改动

### A. 基建:SPA map 从 nginx conf 派生(apps/docs)

1. **新模块 `apps/docs/src/config/nginxRedirectRules.ts`**(纯函数,可注入 conf 文本便于测试):
   - `extractExact301Pairs(conf)`:只取 `location = X { ... return 301 Y; }` 精确块(块内多个 return 的跳过);剥掉 target 的 `#fragment`(与 container lint 一致);跳过 `http(s)://` 与含 `$` 的 target;不含 locale 前缀假设。
   - `resolveChains(pairs)`:from→to 迭代走链到最终 target(环检测,发现即 throw),保证 SPA postBuild 校验的是真实路由而非链中转站。
2. **改 `redirectPlugin`**(createDocusaurusConfig.ts):
   - 用 `repositoryPath('deploy/<site>/nginx.conf')` 读 conf(site → en/zh-CN 映射;读取失败 **fail-closed throw**,不静默降级);
   - 派生规则 ∪ profile 手维护 6 条(按 from 去重,两边 target 冲突即 throw——都是手维护,分叉即漂移);
   - 派生全集只喂 `spa-redirect-map`;`@docusaurus/plugin-client-redirects` **保持现状**(profile 6 条,nginx 301 已覆盖整页加载,避免生成 ~900 个静态 HTML stub)。
3. 测试:新 parser 单测(精确定位/多 return 跳过/外链与 $var 剥除/链解析/环 throw);`createDocusaurusConfig.test.ts` 更新插件注册断言(fixture conf 注入,不读真实 deploy 文件)。

### B. 规则:批量 ja 镜像 + 错目标修复 + en 补规则(deploy)

4. **一次性生成脚本(tmp/ 内,不入库)**处理 `deploy/en/nginx.conf`:
   - 候选 = 非 `/ja-JP/` 前缀的精确 301 规则,排除已有 ja 孪生(76 条);
   - **对每个候选源 HEAD 探测生产 `/ja-JP/<X>`**:200 → 该源仍在 ja 存活,**不镜像**(镜像会遮蔽活页,f4dca0d14f 教训),登记豁免;404 → 生成 `location = /ja-JP/X { return 301 /ja-JP/Y; }`(Y 为外链则原样,含 `$` 则跳过并豁免);
   - 生成块按源排序,以带注释的分节插入 conf 尾部(标注生成日期与豁免位置)。
5. **豁免清单**:`container.test.mjs` 内联常量(既有 GA pins 同款模式,免新增矩阵路径),每条带 reason("live ja page — mirroring would shadow it")。
6. **修错目标**:`/reference/api/go/Vector/Insert()` → `/reference/go/go/v2-Vector-Insert`(先验证目标 200);同法脚本化审查全部 `/reference/api/<sdk>/...` 旧式规则的 from/to 动词错位(Insert/Delete/Query…),逐条人工确认后修。
7. **en 补 GA 有量路径**(实施时逐个验证目标 200 再写):`/reference/go/v2-Vector-{Query,Search,Insert,Delete}` → 双段真页;`/reference/python/{Vector-GroupBy,Rerankers}` → 对齐既有 python/python 规则的目标;`/reference/node/{Collections,Client,Authentication}`、`/reference/go/v1-*`、CLI 退役页 → 按既有退役模式指向活着的 section 根;这些同时获得 ja 孪生(ja 同样 404)。`/docs/Y2xvdWQtcH`(机器人垃圾,0 users)不处理。
8. **新 drift 测试**(container.test.mjs):从 en conf 派生候选集,断言"每条候选要么有 ja 孪生、要么在豁免清单"——锁住未来不回流。

### C. 文档与矩阵

9. `README.md:585` 404 处置段落:补充镜像不变量与 SPA 自动派生说明;`.claude/specs/2026-08-31-...matrix.md` release-channel-gating 行的 requirement 句补镜像完整性描述。

## 验证

1. `pnpm test:for-change -- deploy/en/nginx.conf deploy/contracts/container.test.mjs packages/site-config/src/sites/en.ts apps/docs/src/config/createDocusaurusConfig.ts apps/docs/src/config/nginxRedirectRules.ts apps/docs/plugins/spa-redirect-map/index.js` 取 union 全跑(应含 `test:containers`、`test:chat-agent-config`、`test:retirement`、`test:profiles`、createDocusaurusConfig/spa-redirect-map/NotFound vitest 集)。
2. **本地真实 `build:en`**:postBuild 将对派生全集(~900 条)做路由校验,任何失效 target 直接炸构建(fail-closed,预期正是我们要的闸);即使后续 provenance 阶段因未跟踪 ja 输入挂掉(已知 master 本地现象),docusaurus 构建完成即证明 postBuild 通过。build:zh-CN 同理单独跑。
3. `pnpm typecheck`、`pnpm test:workflow-matrix`、`git diff --check`。
4. Docker 可用则跑 `deploy/contracts/smoke.sh` 冒烟;不可用则说明跳过。
5. 交付报告:`git status`、镜像规则条数/豁免条数、生产 HEAD 探测样本;上线走 master PR → sync → Jenkins,下一期 GA 窗口验证回落。

## 明确不做(scope 外)

- zh-CN(.cn)conf 的批量镜像(zh conf 本就是 en 的裸路径近拷贝,798 条;SPA 派生自动覆盖 zh 站)——只顺带跑一次 6 的错位审查,发现问题单独报。
- plugin-client-redirects 改造、customFields.redirects 清理、`/zh-CN/` 域内路由(docs.zilliz.com 不服务该前缀)。