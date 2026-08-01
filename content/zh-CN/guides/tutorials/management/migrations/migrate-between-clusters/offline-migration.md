---
title: "离线迁移 | Cloud"
slug: /offline-migration
sidebar_label: "离线迁移"
beta: FALSE
added_since: FALSE
last_modified: FALSE
deprecate_since: FALSE
notebook: FALSE
description: "离线迁移允许您在计划的停机时间内，将现有集群数据从源集群迁移到目标集群。此方法支持在同一组织内或不同组织之间进行迁移，适用于可以接受短暂停机的场景，例如计划维护或小规模数据库迁移。 | Cloud"
type: origin
token: N6tlwTPPvi0FXvkj4fccCgtTnOg
sidebar_position: 1
displayed_sidebar: default

---

import Admonition from '@theme/Admonition';


import Supademo from '@site/src/components/Supademo';

# 离线迁移

**离线迁移**允许您在计划的停机时间内，将现有集群数据从源集群迁移到目标集群。此方法支持在同一组织内或不同组织之间进行迁移，适用于可以接受短暂停机的场景，例如计划维护或小规模数据库迁移。

<Admonition type="info" icon="📘" title="说明">

如果应用程序在切换期间继续向源集群写入数据，目标集群可能会缺少新写入的 Entity，尤其是迁移任务完成后写入的 Entity。为确保目标集群中的数据完整，请规划一个切换窗口，在此期间暂停向源集群写入，等待迁移任务完成，验证目标集群中的数据，然后只在目标集群上恢复写入。

</Admonition>

## 迁移能力\{#migration-capabilities}

### 集群兼容性\{#cluster-compatibility}

下表展示了源集群和目标集群间的兼容性：

<table>
   <tr>
     <th rowspan="2"><p><strong>源集群</strong></p></th>
     <th colspan="3"><p><strong>目标集群</strong></p></th>
   </tr>
   <tr>
     <td><p>Free</p></td>
     <td><p>Serverless</p></td>
     <td><p>Dedicated</p></td>
   </tr>
   <tr>
     <td><p>Free</p></td>
     <td><p>不支持</p></td>
     <td><p>不支持</p><p>（仅支持从 Free 集群升级至 Serverless 集群。具体操作请参考<a href="./manage-cluster#upgrade-deployment-option">管理集群</a>）</p></td>
     <td><p>支持</p><p>（支持从 Free Cluster 升级至 Dedicated 集群。具体操作请参考<a href="./manage-cluster#upgrade-deployment-option">管理集群</a>）</p></td>
   </tr>
   <tr>
     <td><p>Serverless</p></td>
     <td><p>不支持</p></td>
     <td><p>支持</p></td>
     <td><p>支持</p></td>
   </tr>
   <tr>
     <td><p>Dedicated</p></td>
     <td><p>不支持</p></td>
     <td><p>不支持</p></td>
     <td><p>支持</p></td>
   </tr>
</table>

### 迁移范围\{#migration-scope-options}

| 迁移类型 | 描述 | 适用场景 |
| --- | --- | --- |
| 同一项目内迁移 | 相同 Zilliz Cloud 项目中的集群间迁移 | 集群升级、性能优化、数据整合 |
| 跨项目/组织迁移 | 不同 Zilliz Cloud 项目或组织间的集群迁移 | 公司合并、部门移交、多租户 |

### 直接数据迁移\{#direct-data-transfer}

离线迁移在 Zilliz Cloud 集群间执行直接数据复制，具有以下特征：

- Schema 保留：源数据结构原样转移至目标集群

- 字段不可修改：迁移过程中无法重命名字段、修改数据类型或调整字段属性

- 自动索引：目标集群的向量字段将自动创建 `AUTOINDEX`

- 一次性数据复制：离线迁移会在迁移任务运行期间从源集群复制数据。迁移任务完成后，它不会继续让目标集群与源集群上的新增写入保持同步。

## 开始前\{#before-you-start}

开始离线迁移前需满足：

### 通用要求\{#general-requirements}

| 要求项 | 详细说明 |
| --- | --- |
| 用户权限 | 需具备组织管理员或项目管理员角色 |
| 源集群访问 | 源集群必须可通过公网访问 |
| 目标集群容量 | 需预留足够 CU 容纳源数据（使用 [CU 计算器](https://zilliz.com.cn/pricing#calculator)预估容量） |

### 跨项目/组织迁移附加要求\{#cross-project-or-organization-migration-requirements}

| 要求项 | 详细说明 |
| --- | --- |
| 连接凭证 | 需提供源集群的公网 Endpoint、API 密钥或用户名密码 |
| 网络连通性 | 目标组织需能访问源集群网络 |

### 规划切换窗口\{#plan-the-cutover}

在开始离线之前，请选择一个应用程序可以临时停止向源集群写入数据的切换窗口。请按以下流程操作，以避免数据遗漏：

1. 在最终迁移和验证窗口开始前，暂停向源集群写入数据。

1. 运行迁移任务，并等待任务状态变为**成功**。

1. 验证目标集群中的数据，例如检查 Entity 数量，并抽样检查最近写入的 Entity。

1. 将应用程序的读请求和写请求切换到目标集群。

1. 只在目标集群上恢复写入。

请保留源集群，直到确认迁移后的数据完整。

## 操作指南\{#getting-started}

以下演示完整离线迁移流程：

<Supademo id="cmpz7gcz8akutqmy76zc00wpe" title=""  />

<Admonition type="info" icon="📘" title="说明">

迁移后的 Collection 无法立即执行 Search/Query，您必须在 Zilliz Cloud 中手动 Load Collection 以启用相关功能。操作详情见 [Load 和 Release](./load-release-collections)。

</Admonition>

