# 跨集群 External Collection 文案基线(唯一事实源,所有修订 agent 必读)

配套总计划:`2026-11-06-external-collection-docs-revision-plan.md`(§1 实测结论 / §9 扫描清单 / §10 编辑源分类)。本文件提供**必须逐字一致的措辞块**(en+zh)与硬约束。日期:2026-11-06。

## 0. 硬约束(所有文档通用;⚠️ 2026-11-06 深夜评审修订版,覆盖此前口径)

- **不暴露 Snapshot(收紧)**:不文档化 snapshot_name/snapshot_id/桶/路径/凭证,**连"平台在后台管理快照/用户无需感知快照"这类提及也全部删除**——refresh 语义只写"重新绑定源并同步最新数据"。
- **版本术语(新)**:统一用 **"a cluster compatible with Milvus v3.0.x"**(zh:「兼容 Milvus v3.0.x 的集群」);**禁用 "Milvus 3.0 cluster" 写法**。
- **不提 useLoonFFI/StorageV3**。
- **内部问题不进公开文档**。
- **术语**:on-demand compute / database for on-demand search(zh:按需搜索);VectorLake 严禁;external collection / Collection 不翻译。
- **云厂商矩阵(分家,新)**:Global(en 站)= **"Cloud providers: AWS regions are supported."**(严禁出现 Alibaba/Tencent coming soon——那是另一个产品);China(zh 站)= 「云厂商:阿里云、腾讯云即将支持。」(不写 AWS/Azure)。GCP 不写。**⚠️ 2026-11-11 产品澄清:跨集群 `milvus://` 源仅支持 AWS 地域(原口径 AWS+Azure 收敛为 AWS)**——en 站四处 providers 句(create 页 / limits 页 / quickstart / 新页 Note)同步改;zh 站厂商句按分家规则**不动**(中国区产品口径待产品确认)。
- **源集群档位(新,2026-11-11 产品澄清:Free/Serverless 不支持)**:跨集群 `milvus://` 的**源集群必须是 Dedicated 档集群**;源集群表述一律用 **"a dedicated cluster"**(禁 "serving cluster"——站内 "serving cluster" 是总称,含 Free/Serverless/Dedicated 三档,见 connect-to-serving-cluster 页);en 正文用 "dedicated cluster",zh 拟用「Dedicated 集群」。
- **SaaS-only(新;⚠️ 适用面=guides 面)**:跨集群(milvus://)相关内容 **BYOC 站不可见**——飞书侧用 `<include target="saas"></include>` 包裹;**列表项(li)必须用块级标签段方式**(整项前后各一个只含标签的段落;行内整项包裹会在 BYOC 残留空 `- ` 项)。**SDK/CLI/REST 参考面不适用**:参考只有单份 target=zilliz 发布(无 BYOC 副本),saas include 在 zilliz target 下会删内容,严禁使用;新页等整页 SaaS-only 的优先用 Base 行 Targets 收敛(去掉 Zilliz.PaaS)而非页内包裹。
- **milvus-table 双轨语义(2026-11-06 澄清)**:`format: milvus-table` **OSS 与云都支持,但用法不同**——OSS = external_source 指向 **Milvus snapshot metadata JSON 路径**(如 `s3://bucket/snapshots/{collection_id}/metadata/{snapshot_id}.json`,用户自管快照);Zilliz Cloud = **仅经 `milvus://` scheme**(云不暴露自管快照路径)。措辞禁写"format also accepts milvus-table (on Zilliz Cloud)"这类暗示云侧新增的句子;云侧写 scheme 用法限定。milvus.io 侧按拍板补 OSS 文档(format 列表加 milvus-table + snapshot 路径一句)。
- **web-content 范围(新)**:milvus.io 文档**只收 OSS 普遍有效内容**——严禁 milvus:// scheme、"On Zilliz Cloud" 句式、云侧专属规则;Zilliz 专属内容只活在飞书侧(zilliz include span)。OSS 有效:source 称谓 URI、真实状态枚举、状态流转句、refresh 成对规则(同传同省+省略复用,不举 scheme 例)、milvus-table(snapshot 路径语义)。
- **NextChannel 闸门(新;2026-11-06 用户拍板:仅 SDK/CLI 参考页)**:飞书参考页上的云侧专属新增(milvus:// scheme/云侧 refresh 规则/milvus-table 默认句)用 `<NextChannel>` 标签包裹,随 NEXT 渠道亮相;OSS 有效修正不包立即生效。~~guides 公开页跨集群块**不套用**(维持照发拍板)~~ **(2026-11-08 拍板推翻:发一版不带跨集群需求的文档 → guides 家族全部打闸)**:quickstart en/zh 两节、create en/zh 全部跨集群 saas 块(5+4 span+斜杠 callout+API key 行内短语)、limits en/zh 跨集群 bullets、console en/zh Note——统一模式 = 既有 saas 包裹**内层**再包 `<NextChannel action="include">`(BYOC 隔离维持,fetch 解析 paas/milvus 视图时整块随 saas span 剔除;CURRENT 渠道亦隐藏,NEXT 亮相)。六页 CURRENT 模拟 milvus://=0 断言全过。既有内容(indev 段/limits 对比表 Serving Cluster 列/console on-demand bullets)核实非跨集群,不打闸。
- **Preparation 单列表(新)**:create 页前置条件**不按来源分组**,统一为一个列表;来源专属条件在条目内联表述("For data-file sources via an external volume, …"/"For a collection from another cluster, …")。
- **Refresh 段落结构(新)**:状态流转句("A refresh job transitions from RefreshInProgress to RefreshCompleted or RefreshFailed.")**独立成段**;并发拒绝句**不带错误消息原文**("A second refresh submitted while one is in progress is rejected.")——错误原文只存在于 Troubleshooting 表。
- **飞书编辑**:全部 `--as user`;zh h2 的 {#anchor} 勿删;synced block 内标题/keyword 不可见;列表项子块用原生 docx API;只动指定 token。
- **旧页退休 = 软退休**(不变)。

## 1. URI 语法块(逐字)

**EN**(⚠️ 2026-11-11 已按"源须 dedicated"口径更新;线上 en 已落地):
> On Zilliz Cloud, `external_source` accepts two schemes: `volume://<volume_name>/<path>` and `milvus://<instance_id>/<db_name>/<collection_name>`. The `milvus://` scheme points to a collection on another dedicated cluster compatible with Milvus v3.0.x in the same project and region. The scheme must be lowercase, all three segments are required (including `default` as the database name), and a single trailing slash is tolerated.

**ZH**(⚠️ 2026-11-11 拟定稿,**zh 待产品确认后再落地**):
> 在 Zilliz Cloud 上,`external_source` 支持两种格式:`volume://<volume_name>/<path>` 与 `milvus://<instance_id>/<db_name>/<collection_name>`。`milvus://` 指向与目标集群同项目、同地域的另一 Dedicated 集群(兼容 Milvus v3.0.x)上的集合。前缀必须小写;三段(实例/数据库/集合)缺一不可,数据库为 `default` 时也须写明;末尾允许多一个 `/`。

## 2. Refresh 语义块(逐字;~~V9/V7/V8/V11~~ **V9 已作废,见 §18**)

> ⚠️⚠️ **2026-11-11 语义翻转(覆盖 2026-11-06 全部 V9 口径):"refresh 必须传 external_source"限制已被上游移除。** milvus:// 源与 volume:// 源语义**统一**为成对规则:externalSource/externalSpec 同提供(原子改绑新源)或同省略(复用持久化源,**同样同步最新数据**)。上游代码实证:proxy `internal/proxy/impl.go:7456-7515`(成对规则+双省略=一等复用路径,仅持久化对为空时提前拒绝)、datacoord `internal/datacoord/externalrefresh/manager.go:785`(空 externalSource 显式回退持久化值)、上游 E2E `tests/go_client/testcases/external_table_refresh_test.go` 四处省略式 refresh+数据验证。11-06 V9"省略=受理但不生效(hook 不处理)"是当时云侧 hook 层临时限制,已移除。**历史落点中所有"必须传/不生效"表述一律按下述新块改写。**

**EN**(两段;不得提及 snapshot):
> A refresh re-binds the external collection to the `external_source` passed in the request and syncs the latest data. Omitting `external_source` reuses the persisted source, and the refresh still syncs the latest data from it.
>
> A refresh job transitions from `RefreshInProgress` to `RefreshCompleted` or `RefreshFailed`. A second refresh submitted while one is in progress is rejected. Refresh waits for index building to finish, so its duration scales with data size — from seconds to hours for large collections.

**ZH**(两段;不得提及快照;落地时半角标点转全角):
> refresh 的本质是将外部 Collection 重新绑定到本次请求传入的 `external_source` 并同步最新数据。省略 `external_source` 时将复用已持久化的源,refresh 同样会同步最新数据。
>
> 任务状态从 `RefreshInProgress` 变为 `RefreshCompleted` 或 `RefreshFailed`。若已有刷新任务进行中,新请求会被拒绝。Zilliz Cloud 上的 refresh 需等待索引构建完成,耗时随数据量增长——从秒级到小时级。

**limits 页变体(逐字)**:
- EN: `For external collections created from a collection on another dedicated cluster (`milvus://`), a refresh that omits `external_source` reuses the persisted source and still syncs the latest data; a second refresh while one is in progress is rejected.`
- ZH: 「对于以 `milvus://`(跨集群)源创建的 Collection:refresh 省略 `external_source` 时将复用已持久化的源,同样会同步最新数据;若已有刷新任务进行中,重复提交会被拒绝。」

**SDK/CLI 参考变体(逐字;替换原 milvus:// 必传句)**:
- EN: `For a `milvus://` source, the same rule applies — omitting it reuses the persisted source, and the refresh still syncs the latest data.`
- ZH: 「对于 `milvus://` 源,适用同样的规则——省略时将复用已持久化的源,refresh 同样会同步最新数据。」

## 3. describe 契约块(V6 收敛口径)

**EN**:
> `describe_collection` returns the `external_source` URI exactly as you passed it. The `external_spec` contains `format` (`milvus-table`) and the source binding — the source instance, database, and collection. Field IDs are preserved from the source collection (`preserve_field_ids=true`). No credentials are returned.

**ZH**:
> `describe_collection` 原样返回传入的 `external_source` URI;`external_spec` 包含 `format`(`milvus-table`)与源绑定信息——源实例、数据库与集合。字段 ID 与源集合保持一致(`preserve_field_ids=true`)。不返回任何凭证。

## 4. 前置条件清单(跨集群源)

**EN**(单列表,不分组;create 页用,来源专属条件内联;⚠️ 2026-11-11 已按 dedicated/AWS 口径更新并落地):
- You have obtained an **API key** with sufficient permissions (read/write on the target and read on the source for cross-cluster sources). Username:password tokens are not accepted.
- For data-file sources (parquet, iceberg-table, lance-table, vortex), you have integrated your object storage bucket and created an external volume containing the target data files.
- For a collection from another dedicated cluster, the source is a regular collection (not another external collection) on **a dedicated cluster compatible with Milvus v3.0.x** in the **same project and region** as the target, and the target is a database for on-demand search accessed through the project endpoint with a query cluster.
- Cross-cluster sources (`milvus://`) are available through SDKs and the RESTful API only in the current release — the console does not support this source type. Cloud providers: **AWS regions are supported.**

**ZH**(单列表;zh 站厂商句只列中国产品云;⚠️ 2026-11-11 拟定稿,**zh 待产品确认后再落地**):
- 已获取具有足够权限的 **API key**(跨集群源:对目标读写、对源只读);不支持"用户名:密码"。
- 数据文件类源(parquet、iceberg-table、lance-table、vortex):已完成对象存储集成,并基于存储桶创建了包含目标数据文件的外部卷。
- 跨集群源:源为与目标**同项目、同地域**的另一 Dedicated 集群(**兼容 Milvus v3.0.x**)上的普通集合(不能是另一张外表);目标为按需搜索数据库,经项目端点 + 查询集群访问。
- 跨集群源(`milvus://`)当前仅支持 SDK 与 RESTful API,控制台不支持此源类型。云厂商:**阿里云、腾讯云即将支持。**

## 5. 公开错误对照表(仅此五条进文档;错误原文逐字)

| 场景 | 错误原文 | 应对 |
|---|---|---|
| URI 格式错误/缺段 | `invalid external_source: external_source must be milvus://<instance_id>/<db_name>/<collection_name>` | 修正三段式 URI |
| 源实例不存在或无读权限 | `Source cluster <id> does not exist or you do not have permission to read it.` | 核对实例 ID 与 API key 权限 |
| 源集合不存在 | `Source collection <name> on cluster <id> is unavailable: ... collection not found ...` | 核对库名/集合名 |
| format 冲突 | `external_spec.format must be "milvus-table" (or omitted) for a milvus:// source, got "parquet"` | 省略 external_spec 或用 milvus-table |
| 并发刷新 | `Refresh job <id> is already in progress for collection <name>; wait for it to complete before refreshing again.` | 等当前任务完成 |

(内核级失败签名 2.6/manifest/跨 org 一律不进文档。)

## 6. 新页身份(两 agent 共用;⚠️ 2026-11-06 深夜用户对齐版,覆盖原身份)

- slug(⚠️ 2026-11-11 en 已改为 `use-collection-from-a-dedicated-cluster-as-data-source`;**zh 仍为旧 slug**,两站 slug 暂时不一致——两页在各自生产渠道均未发布,故无 301 负担;zh 确认口径时同步改 zh title+slug):
  - en slug: `use-collection-from-a-dedicated-cluster-as-data-source`
  - zh slug(待确认): `use-collection-from-a-serving-cluster-as-data-source`
- en title(2026-11-11 已改): **Use a Collection from a Dedicated Cluster as Data Source**
- zh title(待确认): **将 Serving 集群的 Collection 用作数据源**;zh sidebar label: `Collection 用作数据源`
- 术语(2026-11-11 产品澄清后覆盖"源集群表述带 serving"的旧口径):源集群一律 **dedicated cluster**(zh「Dedicated 集群」);"serving cluster" 保留给"外表也可建在 serving 集群"等非跨集群语境(zh 指代集合对象仍用 **Collection**(不译),en 正文 collection 小写)
- frontmatter:`beta: ON REQUEST`(GA 时翻 PUBLIC),`type: origin`;**Progress=WIP(未发布闸门;注意 Draft 属可发布状态,会被定时 Fetch 发布)**——GA 发布动作 = Progress→Draft + Beta→PUBLIC(2026-11-11 en 行已 Progress=Draft + Beta=PUBLIC + Release Channel=CURRENT)
- zh 正文标点用全角(zh 站惯例,基线 ZH 块的半角须转换;en 禁用词扫描:VectorLake/snapshot_name/snapshot_id/useLoonFFI/GCP 零命中)
- 结构:intro(基线§1+§3 精神)→ Before you start(§4)→ Create(external_field 映射+externalSpec 可省+SDK cURL 示例)→ Verify with describe(§3)→ Refresh(指 create-external-collection 页 Step 5,§2 摘要一句)
- SDK 连接示例必须带 `option={"cluster_id": "<query cluster id>"}`(Python);先核实 en guides 是否已有 `connect-for-on-demand-search` 页(Base 有此行,token BTrNwoEfYi…),有则互链,无则自带 cluster_id 连接小节

## 7. 旧页退休文案(en only,zh 无此页)

页首横幅(EN):
> **[Retired]** This feature is available on request only and is not publicly available. This page is retired. To create an external collection from a supported source, see [Create an External Collection](create-external-collection 链接)。

Base 行(Development 表):`use-milvus-snapshot-as-data-source` 行 Release Channel → `RETIRE-IN-NEXT`(行/文档均不删)。

## 8. REST 片段(05-collection-operations-v2.json)四处+枚举

1. `components.schemas.CollectionSchema.properties.externalSource.description`:现为 `(e.g., "mysql")` → 改为基线 §1 EN 首句(scheme 定义);zilliz 专属内容用 `<include target="zilliz">…</include>` 包裹(milvus 侧保留 volume/s3 语义,参考同文件 describe externalSource 现有 include 写法)。x-i18n zh/ja 同步。
2. ~~`RefreshExternalCollectionRequest.externalSource/.externalSpec` description:删"omitted … reused"语义 → 改为"必须提供"~~ **(2026-11-11 作废,方向反转)** → 操作级 description 与 `RefreshExternalCollectionRequest.externalSource` 的 zilliz include 内 "For a `milvus://` source, you must pass `externalSource` in every refresh request; omitting it leaves the refresh ineffective…" 异常句**整句删除**(en/zh/ja x-i18n 三语;通用成对句 "must be both provided or both omitted; when both are omitted, … reused" 现对两种 scheme 均成立,无需例外);`volume://` 句保留;`externalSpec` 无病灶(仅 format 规则,不动)。zh 版「仅适用于 Iceberg 表」保持已删状态。
3. `ExternalSetupCollection.schema.required`:移除 `externalSpec`(可省,默认 milvus-table);保留 externalSource。
4. describe 响应 examples/schema:externalSource 示例补一条 `milvus://in01-xxxx/default/orders`;externalSpec 示例含 `"format":"milvus-table"` + 源绑定字段(**不含 snapshot_name/snapshot_id**)。
5. job describe/list 的 state 描述:按实测流转 `RefreshInProgress → RefreshCompleted | RefreshFailed` 校准描述文字;枚举值保留实现值。

## 9. 关键标识符速查

- en Base `Ac7xbs2k1ad7bjsCXr0ccHe9nMh`(Development=tblWv7PjNDsexddH;Get Started=tbl9BeCMjBmalJVb);en wiki 空间 `Tg6mwbRGDitPQ3kLUQzc44I7nth`
- zh Base `I6YUb1M0JajHrqsJGcLcZNh7neP`(开发指南=tblYpqCgevikMomb;从这里开始=tblsw6S3J0ekcgNB);zh wiki 空间 `XyeFwdx6kiK9A6kq3yIcLNdEnDd`
- en 源:RsGAwmgAYiE6fgkOiokcijsBnEg(create)、P9HuwHZyXilwRTkVoDBcjAMlnrb(limits)、JfJvwdGz0iD9LpkrCMccZ2ypn0g(旧 snapshot 页)、XC1ow3jGBi7hVvkINtBcXhQ6n8g(snapshots)
- zh 源:Ksgpw0XJqibTvnkMlPwcHtKinBc(create)、HjpBwVmBiiyz1tkcLxCcyXbvn7g(limits)、Km9nwfLWti2GZNkLtbnc8fcVnId(snapshots)、Xq0owDgEpiD2aDkfYBGcxt1ZnNe(manage-snapshots)、EWblwBycHiR65UkifyDcJaCwnye(console)
- web-content:`milvus-io/web-content`,路径 `API_Reference/{pymilvus,milvus-sdk-java,milvus-sdk-go,milvus-sdk-node,milvus-sdk-cpp}/v3.0.x/…`
- SDK 飞书 Drive 目录(v3.0.x):python=Hk05b5eI6aXXSSsd6j9cqwwMn5a、java=AOFDbSmwma9XrNsLa8KcQgt9ngc、go=KQT5bV62QaioKisKZT0crwZDnke、node=LlrPbysPZau2dGsSVuicHmvCn0e、cpp=QdLkbfmnFatl4TsThKDc5Dobn5g(各页 docx token 见 origin/dev 各页 frontmatter)

## 10. 2026-11-11 产品口径澄清轮(执行总账)

**产品澄清(涂文家,11-11)**:①云厂商口径 "AWS and Azure regions" → **仅 AWS regions**(作用于 Before you start 的 Note);②源集群档位:"serving cluster" → **dedicated cluster**(Free/Serverless 不支持)。

**已落地(en 站,飞书源直改)**:
- 口径:新页 / create / limits / quickstart / console 五页共 13 处 "serving cluster"→"dedicated cluster";providers 句四处 "AWS and Azure are supported."→"AWS regions are supported."(新页为 "supported only in **AWS regions.**")。**刻意不动**:create 页 "External collections are available in both the serving cluster and the databases for on-demand computing"(indev 段,非跨集群)、quickstart "connect to a serving cluster, import the data into it"(导入场景)、limits 对比表表头 "Managed Collection (Serving Cluster)"、两页 "external collections in serving Dedicated clusters is coming soon"(讲目标落位)。
- 去闸(EN):guides 4 页(create 5 对块级 + 1 处行内、limits 1、console 1、quickstart 1)+ SDK/CLI 参考 12 页(cpp/go×2/java×3/node×2/python×3/cli)全部移除 `<NextChannel action="include">` 包裹(保留正文);**`action="exclude"` 块按晋升规则删除正文**(python/go CollectionSchema 页的 volume:// 旧措辞)。**未动**:集群管理/volume 等无关特性的 NextChannel 页(byoc create-cluster、free-and-serverless-clusters、on-demand-compute、managed-volume、dedicated-cluster create/manage)。
- 新页 GA:docx title → "Use a Collection from a Dedicated Cluster as Data Source"(wiki 节点标题自动同步);Base 行 reczz28WMex1Nyk4 = Slug→`use-collection-from-a-dedicated-cluster-as-data-source` + Docs 链接文案同步 + **Release Channel NEXT→CURRENT**(Progress=Draft、Beta=PUBLIC、Targets=Zilliz.SaaS 未动)。旧 slug 从未进生产渠道(仅 NEXT 预览)→ **无需 301**;仓库内无旧 slug 引用(仅本基线文件)。
- feature-availability(en):Private preview 段 "External Collections and External Volumes in Azure regions." → "External Volumes in Azure regions."(**判断项:Azure 下 External Collections 是否仍以 volume:// 形态存在,需产品确认**;若存在则应改为区分 scheme 的措辞)。
- changelogs(en):"Next releases" 网格新增一条跨集群上线条目(+ Last updated 改 Nov 11, 2026)——**措辞待产品复核**。

**上游核查(11-11)**:web-content 唯一相关 PR **#1269 仍 OPEN**(我方 11-06 提出,上游零 review),其 diff 内**无任何云厂商/档位措辞**;milvus-docs 无新的 extcoll PR(最近相关 10-08 #3677、8-06 #3611);OSS 侧无云厂商与 Free/Serverless/Dedicated 概念 → **本次澄清对上游零影响,不需新增上游 PR**。

**zh 状态**:按用户指示**暂不放开**(zh 新页行仍 Release Channel=NEXT;zh 五页口径/闸门全部保持原样)。zh 确认后需一并落地:五页术语与厂商句、新页 title+slug(改 zh Base 行 Slug 与 Docs 文案)、zh 去闸。

**机制发现(2026-11-11 实测,与旧记忆相反)**:
1. **cite 标题在目标改名后自动刷新**——改 docx title block 后,wiki 节点标题与引用页 `<cite title="...">` 缓存**均自动更新**(create + quickstart 两处已验证),**无需 11-06 记忆里的"整段重建 mention"**;旧记忆只适用于"在 UI 改 wiki 标题"的场景。
2. `docs +update str_replace` 的 pattern 匹配**跨 run 的纯文本**(可跨 `<code>` 元素边界),故 "AWS and Azure " 这类跨 run 片段可一次替换成功;但**删除 `<NextChannel>` 标签必须用转义写法**(`&lt;NextChannel action="include"&gt;`),裸写会被 XML 吞。
3. 晋升(exclude→include)时,块级标签段用 `block_delete` 删整段(不留空段落);行内标签用 str_replace 删标签文本;**exclude 块必须连正文一起删**,否则 CURRENT 会出现新旧措辞并存。
4. Base 行 `Slug` 与 `Docs` 链接文案是**页面 slug 与 frontmatter title 的权威源**(fetch 端 `__doc_title` / `record.fields.Slug`);docx title block 只决定正文 H1 → 三处必须同步改。

---

## 11. refresh 省略 external_source 语义翻转轮(2026-11-11)

**产品事实(用户 11-11 告知)**:红框限制(refresh 必须传 external_source)已去除。§2/§8 已按新语义重写,本节为执行台账。

**上游证据(2026-11-11 核查,GitHub master)**:
- proxy `internal/proxy/impl.go:7456-7467`(成对规则)、`:7498-7515`(双省略=一等复用,持久化对为空才拒绝);
- datacoord `internal/datacoord/externalrefresh/manager.go:785-786`(空源回退持久化值);
- E2E `tests/go_client/testcases/external_table_refresh_test.go`(370/651/801/938 四处省略式 refresh+行数验证);
- 无任何"milvus:// 必传"分支;REST 片段 milvus(target=milvus)侧描述本就是 omit-reuse 语义。

**受影响落点(16 处文案 + REST 片段)**:
- guides en 4:create Step5 首条 bullet / 新页 Refresh 节 / limits 跨集群 bullet / quickstart 跨集群节;
- guides zh 4:同构;
- SDK 飞书 en 5 页(python/java/go/nodejs/cpp refresh_external_collection,"For a milvus:// source, you must pass…"句;nodejs 页同段前半已有 reuse 句,删异常句后自洽);
- CLI trigger en+zh 2 页("--external-source … Required for a milvus:// source; if you omit it, the refresh does not take effect…");describe/list 无病灶;
- REST 片段 master 2 处×3 语(操作级 description + RefreshExternalCollectionRequest.externalSource 的 zilliz include 异常句,zh/ja x-i18n 同步);zh/ja REST mdx 为生成物禁手改;
- **不动**:create 页 Step5 各语言代码示例(省略式——旧语义下属"静默无效"反例,新语义下正确)、quickstart 显式传源示例、console 页 Refresh 节(volume 源)、Troubleshooting 表(仅并发行)、web-content #1269(OPEN,diff 全查仅 OSS 成对句,零 milvus:// 限制句,不受影响)、milvus-docs 上游(零提及)、retire 页/snapshots 页。

**管线自愈面**:guides ja=i18n 生成;REST zh/ja=spec 生成;SDK zh/ja=翻译/i18n 管线(zh SDK 参考页当前已镜像旧句,随 en 修复自愈)。

**UAT 实测(2026-11-11 20:53 完成,PASS)**:QTP task 17149(源集群 in01-a423c193df572d6,dbVersion=v3.0.6-969c0a9b1-6339=镜像 3.0.6-20261110-969c0a9b1-d6cf8ee)+ task 17150(查询集群 in07-cb32cd865f0f886,project proj-6728be640b8fb0da89e7a7,aws-us-west-2 UAT3)。两阶段:①带源 refresh→RefreshCompleted;②源补 5 行→**省略 external_source refresh→受理+RefreshCompleted+全新 snapshot_id+target 50→55 行**。省略语义=复用持久化 URI+新建快照+同步最新数据,与 §2 新表述逐字吻合。脚本 `.zcode/scripts/extcoll_omit_refresh_test.py`。
**实测附带发现(不进公开文档)**:①QTP 建 UAT 集群默认 `common.storage.useLoonFFI=false`,须先用 ModifyParams override(任务 17151)+重启,再写源数据(V4b 错误签名才会消失);②快照 schema 校验拒绝 QTP 显式写 enable_match/enable_analyzer 参数的源集合(definition mismatch),用 pymilvus 纯净 schema 建源即可;③target 字段勿设 is_primary(平台从源 schema 派生,设了报 definition mismatch);④外表建索引(AUTOINDEX)后才能 query;⑤refresh RefreshCompleted 后数据可见性有分钟级延迟,勿即刻计数;⑥该镜像实测出现 RefreshPending 态,V7"Pending 不存在"结论在新镜像不成立(SDK 页枚举保留 Pending 是对的)。
