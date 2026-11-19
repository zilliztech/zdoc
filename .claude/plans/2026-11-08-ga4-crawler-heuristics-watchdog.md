# P2：GA4 流量异动启发式并入 watchdog 日报（v3：CI 脚本产出 artifact，日报按启发式标注）

日期：2026-11-08 ｜ 状态：**已闭环——PR #1158 合并（02965ab8c，评审 approve-worthy 后 P1 修复 29b9ac781）+实弹验收 run 42493882536（China v/u 1.20 锚精确复现）+基线文件+digest prompt 全落；首个启发式流量节=2026-11-10 周二日报** ｜ worktree：已清理（分支 feat/ga4-engagement-traffic-section 随合并删除）

> 版本演进：v1 浏览器读取 → v2 本地脚本+本地 SA key → **v3（现行）**：用户两点定论——①生产通道是脚本自动化，UI 只供探索；②**不在本地提供 service account JSON**。结合 #1156 已把 GA4 认证抽取为 `scripts/lib/ga4-auth.js`：GA4 访问全部发生在持有 secret 的 CI 侧，扩展**现有**周报脚本让 artifact 自带流量数据，日报消化 artifact 时按基线启发式标注——回归原始命题「ga4-engagement 周报的 artifact 进日报时按启发式自动标注」，且零新 Action、零本地凭据。

## 0. 结论（先读）

1. 缺口（v1 已证）：ga4-engagement 周报 artifact 只有埋点事件计数（`eventName × eventCount/keyEvents`），没有 country / views / users——启发式无对象可标。
2. 方案：**repo 侧扩展 `scripts/ga4-engagement-report.js`**（认证已由 #1156 抽到 `scripts/lib/ga4-auth.js`，脚本现消费它），在同一个周报 artifact 的 `report.json`/`note.md` 增加 traffic 节（country×views/users + pagePath×views/users，当前/对比双周窗，hostname 过滤 docs.zilliz.com）。日报侧只改基线文件 + automation prompt：按三件套标注疑似爬虫桶、流量指标默认剔 (not set)。
3. 浏览器探索产物保留为：查询设计依据、阈值标定、人工复核参照面（保存探索三个 tab 已整理好）。

## 1. 探索结论（查询设计与阈值依据，实测 2026-11-08）

- property = **259046762**（`GA4_PROPERTY_ID_EN` repo var；UI URL `a142992812p259046762` 中 142992812 是账号 ID，勿混用）。`GA4_PROPERTY_ID_ZH_CN` 未配置，本期只做 en。
- Data API 口径与 UI 探索一一对应：维度 `country` / `pagePath`，指标 `screenPageViews` / `totalUsers`，过滤 `hostName` EXACT `docs.zilliz.com`；`views per active user` 自行计算（views/users）。
- 凭据：CI secret `GA4_SERVICE_ACCOUNT_JSON`（2026-10-14 起 engagement/404/remediation 三脚本同链在用）；**本机零凭据**（用户定论；gcloud invalid_grant 不可用也已实测，无关紧要）。

三件套标定（UI 探索实测，Nov 1-7 vs Oct 24-30）：

| 国家 | views | users | v/u | 上周 views/users | 判读 |
|---|---|---|---|---|---|
| United States | 9,326 | 3,631 | 2.57 | 4,656 / 2,819 (1.65) | views +100% users 仅 +29% → 疑似爬虫 |
| Singapore | 2,255 | 759 | 2.97 | 1,455 / 671 (2.17) | 疑似爬虫 |
| China | 1,209 | 1,010 | **1.2** | 1,404 / 870 (1.61) | 真人锚（持平/微降） |
| United Kingdom | 626 | 178 | 3.52 | 308 / 179 (1.72) | 疑似爬虫 |

- 真人段 v/u ≈ 1.2，爬虫桶 2.6~4.6 → **v/u > 3 疑似线**（2~3 观察级）
- (not set) 国家桶未进本期 top10（11-07 所见 19,515 events/0 users 属 10-24~30 窗口）→ 判据条件化「若出现」
- **爬虫潮 11-01~07 仍在持续**（total 14,317 vs 8,729，+64%）——功能落地后首个流量节就会标出
- 人工复核参照面：保存探索 "Cloud docs pages"（直链 `…/analysis/a142992812p259046762/edit/8yYbqANTQNG1KmzhUalkDg`；Tab1=404 残余 / Tab2=页面流量+users 列 / Tab3="Country" 视图，均已整理）

## 2. 改动清单

### 改动 1（repo PR → master）：`scripts/ga4-engagement-report.js` 增加 traffic 节

- 新增两个请求构造器（复用 `./lib/ga4-auth.js` 认证与 `RUN_REPORT_URL`）：
  - `buildTrafficCountryRequest({days})`：dimensions `[country]`，metrics `[screenPageViews, totalUsers]`，`dateRanges` = 当前窗（`${days-1}daysAgo..today`）+ 对比窗（`${2*days-1}daysAgo..${days}daysAgo`），`dimensionFilter` = hostName EXACT `docs.zilliz.com`，orderBys views desc，limit 50
  - `buildTrafficPagesRequest({days})`：同形，dimensions `[pagePath]`，limit 500
  - 多 dateRange 响应语义：GA4 在行尾追加 `dateRange` 维度（`date_range_0/1`），解析按 (维度值, dateRange) 折叠成 `{views, users, compare_views, compare_users}`——**单测锁这个形状**
- `sites[]` 增加 `traffic` 节：`{country: [...], pages: [...]}`（行含双周数值）；`SCHEMA_VERSION` 1→2（`siteReportsToMarkdown` 的校验同步升）
- `note.md` 增加两节：「Traffic by country (7d vs prior 7d)」国家表（含 v/u 与 Δ）、「Top pages by views」前 N 行（含 v/u）——人工/卡片可读
- 埋点事件查询与 FUNNELS 逻辑**不动**；workflow yml 不动（调度、artifact 名、凭据门全部沿用）
- `runbook/analytics.md`（#1156 新建）补 traffic 节语义一段
- 测试：`scripts/ga4-engagement-report.test.js` 扩请求形状/行折叠/schema 校验/markdown 节；`pnpm test:for-change -- scripts/ga4-engagement-report.js scripts/ga4-engagement-report.test.js`（矩阵行已存在，预计零 gap；若 workflow 测试断言 schema 也需同步）

### 改动 2（gitignored 本地）：`.zcode/watchdog-digest-baseline.md`

在 `## ga4-engagement-report.yml(周一 04:17 UTC)` 节下新增「流量异动启发式（爬虫识别）」：

- **三件套判据**：① country=(not set) 且 views>0 且 users=0 → 疑似爬虫桶；② pagePath v/u>3（users≥1）→ 疑似爬虫页，2~3 观察级；③ China |Δviews|≤15% → 真人锚持平（反证项，超出如实报告）
- **输出硬规则**：日报引用任何流量总量/趋势**默认剔 (not set) 桶并注明口径**；疑似爬虫桶逐个标注（桶名 + views/users/v/u + 周环比）
- **读法**：下载 `ga4-engagement-report-<run_id>` artifact，读 `report.json` 的 `sites[].traffic`（report-card note 也可读但没有 JSON 全量）
- **标定锚**：§1 表 + 11-07 定案（W2→W4 序列）
- **降级**：traffic 节缺失（PR 未合并期/旧 artifact）→ 日报写「本期无流量数据（traffic 节未上线）」，需要时人工走保存探索直链复核；run 降级 no-op（凭据门）同现状处理

### 改动 3（automation 存储）：automation-94889097 prompt（CronUpdate）

第 7 项 ga4-engagement 追加：周二消化周报时读 artifact `report.json` 的 `sites[].traffic`，**按基线三件套标注疑似爬虫桶、流量指标默认剔 (not set)**；traffic 节缺失或 run 降级如实报告；非周二写「非流量检查日」。只读边界保持「只用 gh CLI 和本地读取」——**无需放宽**（数据全经 artifact，比 v2 更干净）。

### 时序

1. master PR（tooling 路径，union 绿）→ 合并 → bot sync 落 dev（工作流跑在默认分支，不受 sync 时序影响）
2. 合并后可 `gh workflow run`（workflow_dispatch 既有）实弹生成含 traffic 节的 artifact 提前验收，不必等下周一
3. 周二日报首次按启发式标注

## 3. 验收

1. **数值交叉验证**：dispatch run 的 `traffic.country` 与 UI 探索标定对齐——注意脚本用滚动 7d 窗（`6daysAgo..today`），与固定 Nov 1-7 不逐字相等，验证口径 = 比值锚（China v/u≈1.2、爬虫桶 >2.6）与量级一致；要逐字对齐就在周一 run 后次日核对（窗口恰好=上一自然周）
2. digest 流量节出现：桶级标注表 + 剔 (not set) 后总量，结论与手算一致
3. 次周复核周环比与窗口推进正确
4. 人工复核通路可用：保存探索直链能对上 artifact 数值

## 4. 风险与开放点

- GA4 多 dateRange 的 `dateRange` 维度语义（行尾追加）是本改动唯一新解析面——单测固定
- SCHEMA bump 消费方盘点：`report.json` 唯一读者 = 日报（按基线升级）；`note.md` 同脚本自洽；无其他 JSON 消费方
- v/u>3 阈值基于 11-08 单周标定，跑 2-3 周按基线回看微调
- traffic 节上线前后的日报窗口期（PR 合并前）按降级路径报「无流量数据」，属预期
- 页面级 (not set)/unknown 路径噪声：pages 行不做正则清洗（保持 artifact 原始），由日报的 not-set 规则统一处置
- 本计划不涉及 `scripts/redirects/`（#1156 的 404 修复域）；流量查询与 `pipeline.js` 的 country+activeUsers 聚合仅共享认证模块与代码风格先例

## 5. 探索期间已顺手完成（已生效）

- 保存探索 "Cloud docs pages"：Tab 2 补 users 两列、Tab 3 改造为 Country 视图并重命名（人工复核参照面）
- worktree `.claude/worktrees/p2-ga4-crawler-heuristics` 已 ff 到 `fe042ec6f`；本计划存主 checkout `.claude/plans/`（惯例+存活于 worktree 清理）
