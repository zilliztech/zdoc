---
title: "从 PostgreSQL 迁移至 Zilliz Cloud | Cloud"
slug: /migrate-from-pgvector
sidebar_key: migrate-from-pgvector
sidebar_label: "从 PostgreSQL 迁移"
added_since: FALSE
last_modified: FALSE
deprecate_since: FALSE
beta: FALSE
notebook: FALSE
description: "本文档说明从 PostgreSQL 迁移时，Zilliz Cloud 如何处理数据类型映射、Collection 命名规则及注意事项。 | Cloud"
type: origin
token: QrBFw5sXmiaaYRk1YpectbZpnzg
sidebar_position: 5
keywords: 
  - 向量数据库
  - zilliz
  - milvus
  - 大模型向量数据库
  - 迁移
  - pgvector

---

import Admonition from '@theme/Admonition';


# 从 PostgreSQL 迁移至 Zilliz Cloud

本文档说明从 [PostgreSQL](https://www.postgresql.org/) 迁移时，Zilliz Cloud 如何处理数据类型映射、Collection 命名规则及注意事项。

## 开始前\{#before-you-start}

开始离线迁移前需满足：

### PostgreSQL 侧要求\{#postgresql-requirements}

<table>
   <tr>
     <th><p>要求项</p></th>
     <th><p>详细说明</p></th>
   </tr>
   <tr>
     <td><p>网络访问</p></td>
     <td><p>源集群必须可通过公网访问</p></td>
   </tr>
   <tr>
     <td><p>数据库权限</p></td>
     <td><p>需提供有效的数据库 Endpoint、用户名及密码（具备必要权限）</p></td>
   </tr>
   <tr>
     <td><p>pgvector 扩展</p></td>
     <td><p>必须启用 pgvector 扩展存储向量数据</p></td>
   </tr>
   <tr>
     <td><p>向量字段要求</p></td>
     <td><p>每个源表需包含至少一个向量字段，且向量字段禁止为空值</p></td>
   </tr>
   <tr>
     <td><p>数据可用性</p></td>
     <td><p>源表必须包含数据，空表无法迁移</p></td>
   </tr>
</table>

### Zilliz Cloud 侧要求\{#zilliz-cloud-requirements}

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
     <td><p>目标集群容量</p></td>
     <td><p>需预留足够 CU 容纳源数据（使用 <a href="https://zilliz.com.cn/pricing#calculator">CU 计算器</a>预估容量）</p></td>
   </tr>
   <tr>
     <td><p>网络连通性</p></td>
     <td><p>如果有网络限制，请确保已将 <a href="./zilliz-cloud-ips">Zilliz Cloud IP</a> 加入白名单</p></td>
   </tr>
</table>

## 数据类型映射\{#data-type-mapping}

下表总结了 PostgreSQL 字段类型如何映射到 Zilliz Cloud 字段类型，并对各类型做了详细说明。

<table>
   <tr>
     <th><p>PostgreSQL <strong>字段类型</strong></p></th>
     <th><p>Zilliz Cloud <strong>字段类型</strong></p></th>
     <th><p>描述</p></th>
   </tr>
   <tr>
     <td><p>主键</p></td>
     <td><p>主键 / Auto ID</p></td>
     <td><ul><li><p><strong>单字段主键</strong>：直接映射为目标 Collection 的主键。</p></li><li><p><strong>无主键</strong>：如果源表没有主键字段，目标 Collection 将启用 Auto ID 功能。</p></li><li><p><strong>复合主键</strong>：默认启用 Auto ID 功能；复合主键将作为普通标量字段处理。</p><p>在数据迁移时，您可以选择启用 Auto ID 功能；但请注意，启用后源表中的原始主键值将会被舍弃。</p></li></ul></td>
   </tr>
   <tr>
     <td><p>vector</p></td>
     <td><p>FLOAT_VECTOR</p></td>
     <td><p>向量维度保持不变。</p></td>
   </tr>
   <tr>
     <td><p>text/varchar/date/time</p></td>
     <td><p>VARCHAR</p></td>
     <td><p>以字符串存储。</p></td>
   </tr>
   <tr>
     <td><p>bigint</p></td>
     <td><p>INT64</p></td>
     <td><p>-</p></td>
   </tr>
   <tr>
     <td><p>integer</p></td>
     <td><p>INT32</p></td>
     <td><p>-</p></td>
   </tr>
   <tr>
     <td><p>smallint</p></td>
     <td><p>INT16</p></td>
     <td><p>-</p></td>
   </tr>
   <tr>
     <td><p>double precision</p></td>
     <td><p>DOUBLE</p></td>
     <td><p>-</p></td>
   </tr>
   <tr>
     <td><p>real</p></td>
     <td><p>FLOAT</p></td>
     <td><p>-</p></td>
   </tr>
   <tr>
     <td><p>boolean</p></td>
     <td><p>BOOL</p></td>
     <td><p>-</p></td>
   </tr>
   <tr>
     <td><p>array</p></td>
     <td><p>ARRAY</p></td>
     <td><p>-</p></td>
   </tr>
   <tr>
     <td><p>json</p></td>
     <td><p>JSON</p></td>
     <td><p>-</p></td>
   </tr>
</table>

## PostgreSQL 特殊处理规则\{#postgresql-specific-handling-rules}

### Collection 命名规则\{#collection-naming-rules}

PostgreSQL 索引名称将按以下规则迁移至 Zilliz Cloud：

<table>
   <tr>
     <th><p>场景</p></th>
     <th><p>影响</p></th>
     <th><p>解决方案</p></th>
   </tr>
   <tr>
     <td><p>默认命名</p></td>
     <td><p>Collection 名称与源索引名称完全一致</p></td>
     <td><p>保留原始名称</p></td>
   </tr>
   <tr>
     <td><p>名称冲突</p></td>
     <td><p>目标 Database 存在同名 Collection 时无法提交迁移任务</p></td>
     <td><p>删除现有 Collection / 选择其他目标 Database / 迁移配置时重命名 Collection</p></td>
   </tr>
   <tr>
     <td><p>名称修改</p></td>
     <td><p>迁移过程支持重命名</p></td>
     <td><p>可在迁移配置阶段修改 Collection 名称</p></td>
   </tr>
</table>

## 迁移注意事项\{#migration-considerations}

从 PostgreSQL 迁移时需注意以下事项：

<table>
   <tr>
     <th><p>限制项</p></th>
     <th><p>影响</p></th>
     <th><p>替代方案</p></th>
   </tr>
   <tr>
     <td><p>动态字段转固定字段</p></td>
     <td><p>无法将现有动态字段转换为固定类型</p></td>
     <td><p>字段保持原始动态特性</p></td>
   </tr>
   <tr>
     <td><p>迁移过程中添加新字段</p></td>
     <td><p>仅迁移 Elasticsearch 已有字段</p></td>
     <td><p>无法在迁移时新增字段</p></td>
   </tr>
</table>

