---
title: "API 异同 | Cloud"
slug: /api-comparison
sidebar_label: "API 异同"
beta: FALSE
added_since: FALSE
last_modified: FALSE
deprecate_since: FALSE
notebook: FALSE
description: "为了提供更好的用户体验，Zilliz Cloud 的运行方式与 Milvus 略有不同。本文将介绍 Zilliz Cloud 和 Milvus 在 API 操作方面的差异。 | Cloud"
type: origin
token: KOD2wN5jDimhSOk1GshcUbn2nJe
sidebar_position: 1
displayed_sidebar: default

---

import Admonition from '@theme/Admonition';


# API 异同

为了提供更好的用户体验，Zilliz Cloud 的运行方式与 Milvus 略有不同。本文将介绍 Zilliz Cloud 和 Milvus 在 API 操作方面的差异。

如果您计划从 Milvus 迁移到 Zilliz Cloud，可能需要对历史代码进行一些必要的修改。

## 特定场景权限\{#scenario-specific-privileges}

下表比较了各业务场景下 API 各接口的可用性。注意，BYOC 场景下 API 可用性与企业版基本一致，仅有少许例外。更多详情，可查看[使用限制](./limits)。

<table>
   <tr>
     <th></th>
     <th><p><strong>API</strong></p></th>
     <th><p><strong>GUI 操作</strong></p></th>
     <th><p><strong>企业版/BYOC</strong></p></th>
   </tr>
   <tr>
     <td rowspan="5"><p>别名</p></td>
     <td><p>alterAlias()</p></td>
     <td><p>✘</p></td>
     <td><p>✘</p></td>
   </tr>
   <tr>
     <td><p>createAlias()</p></td>
     <td><p>✘</p></td>
     <td><p>✔︎</p></td>
   </tr>
   <tr>
     <td><p>dropAlias()</p></td>
     <td><p>✘</p></td>
     <td><p>✔︎</p></td>
   </tr>
   <tr>
     <td><p>describeAlias()</p></td>
     <td><p>✘</p></td>
     <td><p>✔︎</p></td>
   </tr>
   <tr>
     <td><p>listAliases()</p></td>
     <td><p>✘</p></td>
     <td><p>✔︎</p></td>
   </tr>
   <tr>
     <td rowspan="4"><p>认证</p></td>
     <td><p>createCredential()</p></td>
     <td><p>✔︎</p></td>
     <td><p>✘</p></td>
   </tr>
   <tr>
     <td><p>deleteCredential()</p></td>
     <td><p>✔︎</p></td>
     <td><p>✘</p></td>
   </tr>
   <tr>
     <td><p>listCredUsers()</p></td>
     <td><p>✔︎</p></td>
     <td><p>✘</p></td>
   </tr>
   <tr>
     <td><p>updateCredential()</p></td>
     <td><p>✔︎</p></td>
     <td><p>✘</p></td>
   </tr>
   <tr>
     <td rowspan="3"><p>批量插入</p></td>
     <td><p>bulkInsert()</p></td>
     <td><p>✔︎</p></td>
     <td><p>✘</p></td>
   </tr>
   <tr>
     <td><p>getBulkInsertState()</p></td>
     <td><p>✔︎</p></td>
     <td><p>✔︎</p></td>
   </tr>
   <tr>
     <td><p>listBulkInsertTasks()</p></td>
     <td><p>✔︎</p></td>
     <td><p>✔︎</p></td>
   </tr>
   <tr>
     <td rowspan="16"><p>Collection</p></td>
     <td><p>getCollectionStatistics()</p></td>
     <td><p>✘</p></td>
     <td><p>✔︎</p></td>
   </tr>
   <tr>
     <td><p>createCollection()</p></td>
     <td><p>✔︎</p></td>
     <td><p>✔︎</p></td>
   </tr>
   <tr>
     <td><p>describeCollection()</p></td>
     <td><p>✔︎</p></td>
     <td><p>✔︎</p></td>
   </tr>
   <tr>
     <td><p>dropCollection()</p></td>
     <td><p>✔︎</p></td>
     <td><p>✔︎</p></td>
   </tr>
   <tr>
     <td><p>alterCollection()</p></td>
     <td><p>✘</p></td>
     <td><p>✔︎</p></td>
   </tr>
   <tr>
     <td><p>getLoadingProgress()</p></td>
     <td><p>✔︎</p></td>
     <td><p>✔︎</p></td>
   </tr>
   <tr>
     <td><p>getPersistentSgementInfo()</p></td>
     <td><p>✘</p></td>
     <td><p>✘</p></td>
   </tr>
   <tr>
     <td><p>getQuerySegmentInfo()</p></td>
     <td><p>✘</p></td>
     <td><p>✘</p></td>
   </tr>
   <tr>
     <td><p>getReplicas()</p></td>
     <td><p>✘</p></td>
     <td><p>✘</p></td>
   </tr>
   <tr>
     <td><p>insert()</p></td>
     <td><p>✘</p></td>
     <td><p>✔︎</p></td>
   </tr>
   <tr>
     <td><p>loadCollection()</p></td>
     <td><p>✔︎</p></td>
     <td><p>✔︎</p></td>
   </tr>
   <tr>
     <td><p>releaseCollection()</p></td>
     <td><p>✔︎</p></td>
     <td><p>✔︎</p></td>
   </tr>
   <tr>
     <td><p>showCollections()</p></td>
     <td><p>✔︎</p></td>
     <td><p>✔︎</p></td>
   </tr>
   <tr>
     <td><p>getLoadState()</p></td>
     <td><p>✔︎</p></td>
     <td><p>✔︎</p></td>
   </tr>
   <tr>
     <td><p>renameCollection()</p></td>
     <td><p>✔︎</p></td>
     <td><p>✔︎</p></td>
   </tr>
   <tr>
     <td><p>upsert()</p></td>
     <td><p>✘</p></td>
     <td><p>✔︎</p></td>
   </tr>
   <tr>
     <td rowspan="3"><p>数据库</p></td>
     <td><p>ListDatabases</p></td>
     <td><p>✘</p></td>
     <td><p>✔︎</p></td>
   </tr>
   <tr>
     <td><p>DropDatabase</p></td>
     <td><p>✘</p></td>
     <td><p>✔︎</p></td>
   </tr>
   <tr>
     <td><p>CreateDatabase</p></td>
     <td><p>✘</p></td>
     <td><p>✔︎</p></td>
   </tr>
   <tr>
     <td rowspan="5"><p>索引</p></td>
     <td><p>createIndex()</p></td>
     <td><p>✔︎</p></td>
     <td><p>✔︎</p></td>
   </tr>
   <tr>
     <td><p>describeIndex()</p></td>
     <td><p>✔︎</p></td>
     <td><p>✔︎</p></td>
   </tr>
   <tr>
     <td><p>dropIndex()</p></td>
     <td><p>✔︎</p></td>
     <td><p>✔︎</p></td>
   </tr>
   <tr>
     <td><p>getIndexBuildProgress()</p></td>
     <td><p>✔︎</p></td>
     <td><p>✔︎</p></td>
   </tr>
   <tr>
     <td><p>getIndexState()</p></td>
     <td><p>✔︎</p></td>
     <td><p>✔︎</p></td>
   </tr>
   <tr>
     <td rowspan="6"><p>管理</p></td>
     <td><p>getCompactionState()</p></td>
     <td><p>✘</p></td>
     <td><p>✔︎</p></td>
   </tr>
   <tr>
     <td><p>getCompactionStateWithPlan()</p></td>
     <td><p>✘</p></td>
     <td><p>✔︎</p></td>
   </tr>
   <tr>
     <td><p>getFlushState()</p></td>
     <td><p>✘</p></td>
     <td><p>✘</p></td>
   </tr>
   <tr>
     <td><p>getMetrics()</p></td>
     <td><p>✘</p></td>
     <td><p>✘</p></td>
   </tr>
   <tr>
     <td><p>loadBalance()</p></td>
     <td><p>✘</p></td>
     <td><p>✘</p></td>
   </tr>
   <tr>
     <td><p>manualCompact()</p></td>
     <td><p>✘</p></td>
     <td><p>✔︎</p></td>
   </tr>
   <tr>
     <td rowspan="7"><p>分区</p></td>
     <td><p>createPartition()</p></td>
     <td><p>✘</p></td>
     <td><p>✔︎</p></td>
   </tr>
   <tr>
     <td><p>dropPartition()</p></td>
     <td><p>✘</p></td>
     <td><p>✔︎</p></td>
   </tr>
   <tr>
     <td><p>getPartitionStatistics()</p></td>
     <td><p>✘</p></td>
     <td><p>✔︎</p></td>
   </tr>
   <tr>
     <td><p>hasPartiotion()</p></td>
     <td><p>✘</p></td>
     <td><p>✔︎</p></td>
   </tr>
   <tr>
     <td><p>loadPartitions()</p></td>
     <td><p>✘</p></td>
     <td><p>✔︎</p></td>
   </tr>
   <tr>
     <td><p>releasePartitions()</p></td>
     <td><p>✘</p></td>
     <td><p>✔︎</p></td>
   </tr>
   <tr>
     <td><p>showPartitions()</p></td>
     <td><p>✘</p></td>
     <td><p>✔︎</p></td>
   </tr>
   <tr>
     <td rowspan="2"><p>搜索 & 查询</p></td>
     <td><p>search()</p></td>
     <td><p>✔︎</p></td>
     <td><p>✔︎</p></td>
   </tr>
   <tr>
     <td><p>query()</p></td>
     <td><p>✘</p></td>
     <td><p>✔︎</p></td>
   </tr>
   <tr>
     <td rowspan="12"><p>访问控制（RBAC）</p></td>
     <td><p>addUserToRole()</p></td>
     <td><p>✔︎</p></td>
     <td><p>✔︎</p></td>
   </tr>
   <tr>
     <td><p>createRole()</p></td>
     <td><p>✘</p></td>
     <td><p>✔︎</p></td>
   </tr>
   <tr>
     <td><p>dropRole()</p></td>
     <td><p>✘</p></td>
     <td><p>✔︎</p></td>
   </tr>
   <tr>
     <td><p>grantRolePrivilege()</p></td>
     <td><p>✘</p></td>
     <td><p>✘</p></td>
   </tr>
   <tr>
     <td><p>removeUserFromRole()</p></td>
     <td><p>✔︎</p></td>
     <td><p>✔︎</p></td>
   </tr>
   <tr>
     <td><p>revokeRolePrivilege()</p></td>
     <td><p>✘</p></td>
     <td><p>✘</p></td>
   </tr>
   <tr>
     <td><p>selectGrantForRole()</p></td>
     <td><p>✘</p></td>
     <td><p>✔︎</p></td>
   </tr>
   <tr>
     <td><p>selectGrantForRoleAndObject()</p></td>
     <td><p>✘</p></td>
     <td><p>✔︎</p></td>
   </tr>
   <tr>
     <td><p>selectRole()</p></td>
     <td><p>✘</p></td>
     <td><p>✔︎</p></td>
   </tr>
   <tr>
     <td><p>selectUser()</p></td>
     <td><p>✘</p></td>
     <td><p>✔︎</p></td>
   </tr>
   <tr>
     <td><p>grantPrivilegeV2()</p></td>
     <td><p>✘</p></td>
     <td><p>✔︎</p></td>
   </tr>
   <tr>
     <td><p>revokePrivilegeV2()</p></td>
     <td><p>✘</p></td>
     <td><p>✔︎</p></td>
   </tr>
   <tr>
     <td rowspan="2"><p>系统</p></td>
     <td><p>getVersion()</p></td>
     <td><p>✔︎</p></td>
     <td><p>✔︎</p></td>
   </tr>
   <tr>
     <td><p>checkHealth()</p></td>
     <td><p>✘</p></td>
     <td><p>✔︎</p></td>
   </tr>
</table>

