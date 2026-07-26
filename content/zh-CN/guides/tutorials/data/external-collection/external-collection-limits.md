---
title: "External Collection 限制 | Cloud"
slug: /external-collection-limits
sidebar_key: external-collection-limits
sidebar_label: "限制"
added_since: FALSE
last_modified: FALSE
deprecate_since: FALSE
beta: PUBLIC
notebook: FALSE
description: "因为 Zilliz Cloud 不会为 External Collection 存储原始数据，而只维护元数据以及到外部数据源的映射关系，因此 External Collection 是只读的。您无法从 Zilliz Cloud 侧执行写入或维护操作，包括 `insert`、`upsert`、`delete`、`import`、`flush` 和 `compact`。 | Cloud"
type: origin
token: HjpBwVmBiiyz1tkcLxCcyXbvn7g
sidebar_position: 4
keywords: 
  - 向量数据库
  - zilliz
  - milvus
  - 大模型向量数据库
  - 管理
  - external collection
  - collections

---

import Admonition from '@theme/Admonition';


# External Collection 限制

因为 Zilliz Cloud 不会为 External Collection 存储原始数据，而只维护元数据以及到外部数据源的映射关系，因此 External Collection 是只读的。您无法从 Zilliz Cloud 侧执行写入或维护操作，包括 `insert`、`upsert`、`delete`、`import`、`flush` 和 `compact`。

 与 Managed Collection 相比，External Collection 具有以下限制：

- 您需要使用 API 密钥访问 External Collection。

- Zilliz Cloud 不会强制校验主键唯一性，且您无法配置主键或 AutoID。

- 您无法启用 Dynamic field。

- 您不能使用 Partition，因此也不支持 Partition Key 和 。

- 您无法在 Schema 中定义 Functions。

- External Collection 创建后，您无法修改其 Schema。

- 您无法使用基于 BM25 的 Text Match。

- 要使外部数据可用于查询，您必须先创建索引，然后手动触发 `RefreshExternalCollection`，以便 Zilliz Cloud 为数据构建元数据和索引。

- External Collection 当前不支持备份恢复和数据迁移。

下表详细比较了 External Collection 和 Managed Collection 所支持的操作。

<table>
   <tr>
     <th colspan="2"></th>
     <th><p><strong>Managed Collection</strong></p><p>(Serving 集群)</p></th>
     <th><p><strong>External Collection</strong></p><p>(Serving 集群 or 按需计算场景下的 Database)</p></th>
     <th><p><strong>Managed Collection</strong></p><p>(按需计算场景下的 Database)</p></th>
   </tr>
   <tr>
     <td rowspan="13"><p><strong>Collection 管理</strong></p></td>
     <td><p><strong>CreateCollection</strong></p></td>
     <td><p>✅</p></td>
     <td><p>✅</p></td>
     <td><p>✅</p></td>
   </tr>
   <tr>
     <td><p><strong>DropCollection</strong></p></td>
     <td><p>✅</p></td>
     <td><p>✅</p></td>
     <td><p>✅</p></td>
   </tr>
   <tr>
     <td><p><strong>DescribeCollection</strong></p></td>
     <td><p>✅</p></td>
     <td><p>✅</p></td>
     <td><p>✅</p></td>
   </tr>
   <tr>
     <td><p><strong>RenameCollection</strong></p></td>
     <td><p>✅</p></td>
     <td><p>✅</p></td>
     <td><p>✅</p></td>
   </tr>
   <tr>
     <td><p><strong>Dynamic Field</strong></p></td>
     <td><p>✅</p></td>
     <td><p>❌</p></td>
     <td><p>✅</p></td>
   </tr>
   <tr>
     <td><p><strong>Primary Key</strong></p></td>
     <td><p>✅</p></td>
     <td><p>❌</p></td>
     <td><p>✅</p></td>
   </tr>
   <tr>
     <td><p><strong>Auto ID</strong></p></td>
     <td><p>✅</p></td>
     <td><p>❌</p></td>
     <td><p>✅</p></td>
   </tr>
   <tr>
     <td><p><strong>TTL</strong></p></td>
     <td><p>✅</p></td>
     <td><p>❌</p></td>
     <td><p>❌</p></td>
   </tr>
   <tr>
     <td><p><strong>Nullable/Default Value</strong></p></td>
     <td><p>✅</p></td>
     <td><p>✅</p></td>
     <td><p>✅</p></td>
   </tr>
   <tr>
     <td><p><strong>Loaded Entities</strong></p></td>
     <td><p>✅</p></td>
     <td><p>✅</p></td>
     <td><p>✅</p></td>
   </tr>
   <tr>
     <td><p><strong>Allow Insert Auto ID</strong></p></td>
     <td><p>✅</p></td>
     <td><p>❌</p></td>
     <td><p>✅</p></td>
   </tr>
   <tr>
     <td><p><strong>MMAP</strong></p></td>
     <td><p>✅</p></td>
     <td><p>✅</p></td>
     <td><p>✅</p></td>
   </tr>
   <tr>
     <td><p><strong>Timezone</strong></p></td>
     <td><p>✅</p></td>
     <td><p>✅</p></td>
     <td><p>✅</p></td>
   </tr>
   <tr>
     <td rowspan="2"><p><strong>Schema</strong></p></td>
     <td><p><strong>AddField</strong></p></td>
     <td><p>✅</p></td>
     <td><p>❌</p></td>
     <td><p>✅</p></td>
   </tr>
   <tr>
     <td><p><strong>AlterField</strong></p></td>
     <td><p>✅</p></td>
     <td><p>❌</p></td>
     <td><p>✅</p></td>
   </tr>
   <tr>
     <td rowspan="3"><p><strong>Partition</strong></p></td>
     <td><p><strong>CreatePartition</strong></p></td>
     <td><p>✅</p></td>
     <td><p>❌</p></td>
     <td><p>✅</p></td>
   </tr>
   <tr>
     <td><p><strong>DropPartition</strong></p></td>
     <td><p>✅</p></td>
     <td><p>❌</p></td>
     <td><p>✅</p></td>
   </tr>
   <tr>
     <td><p><strong>Partition Key</strong></p></td>
     <td><p>✅</p></td>
     <td><p>❌</p></td>
     <td><p>✅</p></td>
   </tr>
   <tr>
     <td rowspan="7"><p><strong>数据写入</strong></p></td>
     <td><p><strong>Insert</strong></p></td>
     <td><p>✅</p></td>
     <td><p>❌</p></td>
     <td><p>❌</p></td>
   </tr>
   <tr>
     <td><p><strong>Delete</strong></p></td>
     <td><p>✅</p></td>
     <td><p>❌</p></td>
     <td><p>❌</p></td>
   </tr>
   <tr>
     <td><p><strong>Upsert</strong></p></td>
     <td><p>✅</p></td>
     <td><p>❌</p></td>
     <td><p>❌</p></td>
   </tr>
   <tr>
     <td><p><strong>BulkInsert / Import</strong></p></td>
     <td><p>✅</p></td>
     <td><p>❌</p></td>
     <td><p>✅</p></td>
   </tr>
   <tr>
     <td><p><strong>Flush</strong></p></td>
     <td><p>✅</p></td>
     <td><p>❌</p></td>
     <td><p>❌</p></td>
   </tr>
   <tr>
     <td><p><strong>Shard</strong></p></td>
     <td><p>✅</p></td>
     <td><p>❌</p></td>
     <td><p>✅</p></td>
   </tr>
   <tr>
     <td><p><strong>Truncate</strong></p></td>
     <td><p>✅</p></td>
     <td><p>❌</p></td>
     <td><p>✅</p></td>
   </tr>
   <tr>
     <td rowspan="3"><p><strong>数据同步</strong></p></td>
     <td><p><strong>RefreshExternalCollection</strong></p></td>
     <td><p>—</p></td>
     <td><p>✅</p></td>
     <td><p>—</p></td>
   </tr>
   <tr>
     <td><p><strong>GetRefreshProgress</strong></p></td>
     <td><p>—</p></td>
     <td><p>✅</p></td>
     <td><p>—</p></td>
   </tr>
   <tr>
     <td><p><strong>ListRefreshJobs</strong></p></td>
     <td><p>—</p></td>
     <td><p>✅</p></td>
     <td><p>—</p></td>
   </tr>
   <tr>
     <td rowspan="3"><p><strong>Index</strong></p></td>
     <td><p><strong>CreateIndex</strong></p></td>
     <td><p>✅</p></td>
     <td><p>✅</p></td>
     <td><p>✅</p></td>
   </tr>
   <tr>
     <td><p><strong>DropIndex</strong></p></td>
     <td><p>✅</p></td>
     <td><p>❌</p></td>
     <td><p>❌</p></td>
   </tr>
   <tr>
     <td><p><strong>DescribeIndex</strong></p></td>
     <td><p>✅</p></td>
     <td><p>✅</p></td>
     <td><p>✅</p></td>
   </tr>
   <tr>
     <td rowspan="2"><p><strong>Load/Release</strong></p></td>
     <td><p><strong>LoadCollection</strong></p></td>
     <td><p>✅</p></td>
     <td><p>✅</p></td>
     <td><p>✅</p></td>
   </tr>
   <tr>
     <td><p><strong>ReleaseCollection</strong></p></td>
     <td><p>✅</p></td>
     <td><p>✅</p></td>
     <td><p>✅</p></td>
   </tr>
   <tr>
     <td rowspan="5"><p><strong>Search/Query</strong></p></td>
     <td><p><strong>Search</strong></p></td>
     <td><p>✅</p></td>
     <td><p>✅</p></td>
     <td><p>✅</p></td>
   </tr>
   <tr>
     <td><p><strong>Query</strong></p></td>
     <td><p>✅</p></td>
     <td><p>✅</p></td>
     <td><p>✅</p></td>
   </tr>
   <tr>
     <td><p><strong>HybridSearch</strong></p></td>
     <td><p>✅</p></td>
     <td><p>✅</p></td>
     <td><p>✅</p></td>
   </tr>
   <tr>
     <td><p><strong>Functions</strong></p></td>
     <td><p>✅</p></td>
     <td><p>❌</p></td>
     <td><p>✅</p></td>
   </tr>
   <tr>
     <td><p><strong>Full-text Search/Text Match</strong></p></td>
     <td><p>✅</p></td>
     <td><p>❌</p></td>
     <td><p>✅</p></td>
   </tr>
   <tr>
     <td rowspan="4"><p><strong>运维</strong></p></td>
     <td><p><strong>Manual Compaction</strong></p></td>
     <td><p>✅</p></td>
     <td><p>❌</p></td>
     <td><p>✅</p></td>
   </tr>
   <tr>
     <td><p><strong>Clustering Key</strong></p></td>
     <td><p>✅</p></td>
     <td><p>❌</p></td>
     <td><p>✅</p></td>
   </tr>
   <tr>
     <td><p><strong>Backup & restore</strong></p></td>
     <td><p>✅</p></td>
     <td><p>❌</p></td>
     <td><p>❌</p></td>
   </tr>
   <tr>
     <td><p><strong>Migration</strong></p></td>
     <td><p>✅</p></td>
     <td><p>❌</p></td>
     <td><p>❌</p></td>
   </tr>
</table>

