---
title: "从 Qdrant 迁移至 Zilliz Cloud | Cloud"
slug: /migrate-from-qdrant
sidebar_key: migrate-from-qdrant
sidebar_label: "从 Qdrant 迁移"
added_since: FALSE
last_modified: FALSE
deprecate_since: FALSE
beta: FALSE
notebook: FALSE
description: "本文档介绍从 Qdrant 迁移时，Zilliz Cloud 如何处理数据类型映射、Payload 字段转换及 Collection 命名规则。 | Cloud"
type: origin
token: Ii6EwCswKihb6LkI0MmcNVZZnIf
sidebar_position: 3
keywords: 
  - 向量数据库
  - zilliz
  - milvus
  - 大模型向量数据库
  - 数据迁移
  - qdrant

---

import Admonition from '@theme/Admonition';


# 从 Qdrant 迁移至 Zilliz Cloud

本文档介绍从 [Qdrant](https://qdrant.tech/) 迁移时，Zilliz Cloud 如何处理数据类型映射、Payload 字段转换及 Collection 命名规则。

## 开始前\{#before-you-start}

开始离线迁移前需满足：

### Qdrant 侧要求\{#qdrant-requirements}

<table>
   <tr>
     <th><p>要求项</p></th>
     <th><p>详细说明</p></th>
   </tr>
   <tr>
     <td><p>网络连通性</p></td>
     <td><p>源 Qdrant 集群必须可通过公网访问</p></td>
   </tr>
   <tr>
     <td><p>API 访问权限</p></td>
     <td><p>需提供 Qdrant Endpoint 及具备访问权限的 API 密钥</p></td>
   </tr>
   <tr>
     <td><p>数据可用性</p></td>
     <td><p>源 Collection 必须包含数据，空 Collection 法迁移</p></td>
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

下表总结了 Qdrant 字段类型如何映射到 Zilliz Cloud 字段类型，并对各类型做了详细说明。

<table>
   <tr>
     <th><p>Qdrant 字段类型</p></th>
     <th><p>Zilliz Cloud 字段类型</p></th>
     <th><p>描述</p></th>
   </tr>
   <tr>
     <td><p>主键</p></td>
     <td><p>主键</p></td>
     <td><p>Qdrant 中的主键会自动映射为 Zilliz Cloud 中的主键。</p><p>在数据迁移时，您可以选择启用 Auto ID 功能；但请注意，启用后源 Collection 中的原始主键值将会被舍弃。</p></td>
   </tr>
   <tr>
     <td><p>稠密向量</p></td>
     <td><p>FLOAT_VECTOR</p></td>
     <td><p>稠密向量字段会直接转换为 FLOAT_VECTOR，无需进行任何修改。</p></td>
   </tr>
   <tr>
     <td><p>稀疏向量</p></td>
     <td><p>SPARSE_FLOAT_VECTOR</p></td>
     <td><p>如果样本行中的稀疏向量字段不为空，则默认进行字段映射；否则，在 Schema 映射中将不会选择稀疏向量字段。</p></td>
   </tr>
   <tr>
     <td><p>Payload</p></td>
     <td><p>Dynamic field</p></td>
     <td><p>默认情况下，Qdrant 的 Payload 会映射为 Zilliz Cloud 中的 Dynamic Field。有关详细信息，请参阅 <a href="./enable-dynamic-field">Dynamic Field</a>。</p><p>在迁移数据时，如果您希望对某些动态字段使用固定数据类型并优化索引配置，建议将动态字段转换为固定字段。</p></td>
   </tr>
</table>

## Payload 字段转换规则\{#payload-field-conversion}

<Admonition type="info" icon="📘" title="说明">

Zilliz Cloud 采样 100 行数据检测 Payload 数据结构，必要时可手动添加字段。

</Admonition>

Qdrant Payload 默认映射为 Dynamic Field 以实现最大灵活性，转换为固定字段可带来：

- 强数据类型校验：强制字段类型约束

- 优化查询性能：建立专用索引

- 结构化数据管理：统一数据规范

<table>
   <tr>
     <th><p>Payload 字段类型</p></th>
     <th><p>Zilliz Cloud 固定字段类型</p></th>
     <th><p>描述</p></th>
   </tr>
   <tr>
     <td><p>Integer</p></td>
     <td><p>INT64</p></td>
     <td><p>如果 Payload 中的字段类型为 Integer，当转换为固定字段后，该字段将变为 INT64 类型。</p></td>
   </tr>
   <tr>
     <td><p>Float</p></td>
     <td><p>DOUBLE</p></td>
     <td><p>如果 Payload 中的字段类型为 Float，当转换为固定字段后，该字段将变为 DOUBLE 类型。</p></td>
   </tr>
   <tr>
     <td><p>Bool</p></td>
     <td><p>BOOL</p></td>
     <td><p>如果 Payload 中的字段类型为 Bool，当转换为固定字段后，该字段将变为 BOOL 类型。</p></td>
   </tr>
   <tr>
     <td><p>Keyword</p></td>
     <td><p>VARCHAR</p></td>
     <td><p>如果 Payload 中的字段类型为 Keyword，当转换为固定字段后，该字段将变为 VARCHAR 类型。</p><p><strong>注意：</strong>该字段的最大长度固定为 65,535 字节且不可修改，容量计算以实际字段长度为准。</p></td>
   </tr>
   <tr>
     <td><p>Geo</p></td>
     <td><p>JSON</p></td>
     <td><p>如果 Payload 中的字段类型为 Geo，当转换为固定字段后，该字段将变为 JSON 类型。</p></td>
   </tr>
   <tr>
     <td><p>Datetime</p></td>
     <td><p>VARCHAR</p></td>
     <td><p>如果 Payload 中的字段类型为 Datetime，当转换为固定字段后，该字段将变为 VARCHAR 类型。</p><p><strong>注意：</strong>该字段的最大长度固定为 65,535 字节且不可修改，容量计算以实际字段长度为准。</p></td>
   </tr>
   <tr>
     <td><p>UUID</p></td>
     <td><p>VARCHAR</p></td>
     <td><p>如果 Payload 中的字段类型为 UUID，当转换为固定字段后，该字段将变为 VARCHAR 类型。</p><p><strong>注意：</strong>该字段的最大长度固定为 65,535 字节且不可修改，容量计算以实际字段长度为准。</p></td>
   </tr>
</table>

## Array 类型支持\{#array-type-support}

<table>
   <tr>
     <th><p>Qdrant Array 类型</p></th>
     <th><p>Zilliz Cloud Array 类型</p></th>
     <th><p>是否支持手动添加</p></th>
   </tr>
   <tr>
     <td><p>Array&lt;Integer&gt;</p></td>
     <td><p>ARRAY&lt;INT64&gt;</p></td>
     <td><p>支持添加为新的固定字段（不能从动态字段转换）。</p></td>
   </tr>
   <tr>
     <td><p>Array&lt;Float&gt;</p></td>
     <td><p>ARRAY&lt;DOUBLE&gt;</p></td>
     <td><p>支持添加为新的固定字段（不能从动态字段转换）。</p></td>
   </tr>
   <tr>
     <td><p>Array&lt;Bool&gt;</p></td>
     <td><p>ARRAY&lt;BOOL&gt;</p></td>
     <td><p>支持添加为新的固定字段（不能从动态字段转换）。</p></td>
   </tr>
   <tr>
     <td><p>Array&lt;Keyword&gt;</p></td>
     <td><p>ARRAY&lt;VARCHAR&gt;</p></td>
     <td><p>支持添加为新的固定字段（不能从动态字段转换）。</p></td>
   </tr>
   <tr>
     <td><p>Array&lt;Geo&gt;</p></td>
     <td><p>不支持</p></td>
     <td><p>Array 中的元素类型为 Geo 时暂不支持映射。</p></td>
   </tr>
   <tr>
     <td><p>Array&lt;Datetime&gt;</p></td>
     <td><p>ARRAY&lt;VARCHAR&gt;</p></td>
     <td><p>支持添加为新的固定字段（不能从动态字段转换）。</p></td>
   </tr>
   <tr>
     <td><p>Array&lt;UUID&gt;</p></td>
     <td><p>ARRAY&lt;VARCHAR&gt;</p></td>
     <td><p>支持添加为新的固定字段（不能从动态字段转换）。</p></td>
   </tr>
</table>

转换为固定字段后，可配置以下属性：

- **Nullable**：决定字段是否接受空值（默认启用），详见 [Nullable 属性](./nullable-and-default)。

- **默认值**：设置数据缺失时的回退值，详见[默认值](./nullable-and-default)。

- **Partition Key**：可将 INT64/VARCHAR 字段指定为 Partition Key（注意：每个 Collection 支持一个 Partition Key，且该字段不可为空），详见 [使用 Partition Key](./use-partition-key)。

## Qdrant 特殊处理规则\{#qdrant-specific-handling-rules}

### Collection 命名规则\{#collection-naming-rules}

Qdrant Collection 名称将按以下规则迁移至 Zilliz Cloud：

<table>
   <tr>
     <th><p>场景</p></th>
     <th><p>影响</p></th>
     <th><p>解决方案</p></th>
   </tr>
   <tr>
     <td><p>名称冲突</p></td>
     <td><p>目标 Database 存在同名 Collection 时无法提交迁移任务</p></td>
     <td><p>删除现有 Collection / 选择其他目标 Database / 迁移配置时重命名 Collection</p></td>
   </tr>
   <tr>
     <td><p>特殊字符</p></td>
     <td><p>名称按 Qdrant 原始格式保留</p></td>
     <td><p>请确保名称符合 Zilliz Cloud 命名规范</p></td>
   </tr>
</table>
