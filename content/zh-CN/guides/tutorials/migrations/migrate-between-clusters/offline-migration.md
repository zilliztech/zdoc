---
title: "离线迁移 | Cloud"
slug: /offline-migration
sidebar_key: offline-migration
sidebar_label: "离线迁移"
added_since: FALSE
last_modified: FALSE
deprecate_since: FALSE
beta: FALSE
notebook: FALSE
description: "离线迁移允许您在计划的停机时间内，将现有集群数据从源集群迁移到目标集群。此方法支持在同一组织内或不同组织之间进行迁移，适用于可以接受短暂停机的场景，例如计划维护或小规模数据库迁移。 | Cloud"
type: origin
token: N6tlwTPPvi0FXvkj4fccCgtTnOg
sidebar_position: 1
keywords: 
  - 向量数据库
  - zilliz
  - milvus
  - 大模型向量数据库
  - 迁移
  - 集群
  - 离线

---

import Admonition from '@theme/Admonition';


import Supademo from '@site/src/components/Supademo';

# 离线迁移

**离线迁移**允许您在计划的停机时间内，将现有集群数据从源集群迁移到目标集群。此方法支持在同一组织内或不同组织之间进行迁移，适用于可以接受短暂停机的场景，例如计划维护或小规模数据库迁移。

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

<table>
   <tr>
     <th><p>迁移类型</p></th>
     <th><p>描述</p></th>
     <th><p>适用场景</p></th>
   </tr>
   <tr>
     <td><p>同一项目内迁移</p></td>
     <td><p>相同 Zilliz Cloud 项目中的集群间迁移</p></td>
     <td><p>集群升级、性能优化、数据整合</p></td>
   </tr>
   <tr>
     <td><p>跨项目/组织迁移</p></td>
     <td><p>不同 Zilliz Cloud 项目或组织间的集群迁移</p></td>
     <td><p>公司合并、部门移交、多租户</p></td>
   </tr>
</table>

### 直接数据迁移\{#direct-data-transfer}

离线迁移在 Zilliz Cloud 集群间执行直接数据复制，具有以下特征：

- Schema 保留：源数据结构原样转移至目标集群

- 字段不可修改：迁移过程中无法重命名字段、修改数据类型或调整字段属性

- 自动索引：目标集群的向量字段将自动创建 `AUTOINDEX`

## 开始前\{#before-you-start}

开始离线迁移前需满足：

### 通用要求\{#general-requirements}

<table>
   <tr>
     <th><p>要求项</p></th>
     <th><p>详细说明</p></th>
   </tr>
   <tr>
     <td><p>用户权限</p></td>
     <td><p>需具备组织管理员或项目管理员角色</p></td>
   </tr>
   <tr>
     <td><p>源集群访问</p></td>
     <td><p>源集群必须可通过公网访问</p></td>
   </tr>
   <tr>
     <td><p>目标集群容量</p></td>
     <td><p>需预留足够 CU 容纳源数据（使用 <a href="https://zilliz.com.cn/pricing#calculator">CU 计算器</a>预估容量）</p></td>
   </tr>
</table>

### 跨项目/组织迁移附加要求\{#cross-project-or-organization-migration-requirements}

<table>
   <tr>
     <th><p>要求项</p></th>
     <th><p>详细说明</p></th>
   </tr>
   <tr>
     <td><p>连接凭证</p></td>
     <td><p>需提供源集群的公网 Endpoint、API 密钥或用户名密码</p></td>
   </tr>
   <tr>
     <td><p>网络连通性</p></td>
     <td><p>目标组织需能访问源集群网络</p></td>
   </tr>
</table>

## 操作指南\{#getting-started}

以下演示完整离线迁移流程：

<Supademo id="cmb91ow5v0me4sn1rzlbzqi8x" title="Zilliz Cloud - 离线迁移 Demo" />

<Admonition type="info" icon="📘" title="说明">

迁移后的 Collection 无法立即执行 Search/Query，您必须在 Zilliz Cloud 中手动 Load Collection 以启用相关功能。操作详情见 [Load 和 Release](./load-release-collections)。

</Admonition>

