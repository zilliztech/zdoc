---
title: "从 Qdrant 迁移至 Zilliz Cloud | Cloud"
slug: /migrate-from-qdrant
sidebar_label: "从 Qdrant 迁移至 Zilliz Cloud"
beta: FALSE
added_since: FALSE
last_modified: FALSE
deprecate_since: FALSE
notebook: FALSE
description: "本文档介绍从 Qdrant 迁移时，Zilliz Cloud 如何处理数据类型映射、Payload 字段转换及 Collection 命名规则。 | Cloud"
type: origin
token: Ii6EwCswKihb6LkI0MmcNVZZnIf
sidebar_position: 3
displayed_sidebar: default

---

import Admonition from '@theme/Admonition';


# 从 Qdrant 迁移至 Zilliz Cloud

本文档介绍从 [Qdrant](https://qdrant.tech/) 迁移时，Zilliz Cloud 如何处理数据类型映射、Payload 字段转换及 Collection 命名规则。

## 开始前\{#before-you-start}

开始离线迁移前需满足：

### Qdrant 侧要求\{#qdrant-requirements}

| 要求项 | 详细说明 |
| --- | --- |
| 网络连通性 | 源 Qdrant 集群必须可通过公网访问 |
| API 访问权限 | 需提供 Qdrant Endpoint 及具备访问权限的 API 密钥 |
| 数据可用性 | 源 Collection 必须包含数据，空 Collection 法迁移 |

### Zilliz Cloud 侧要求\{#zilliz-cloud-requirements}

| 要求项 | 详细说明 |
| --- | --- |
| 用户权限 | 需具备组织管理员或项目管理员角色 |
| 目标集群容量 | 需预留足够 CU 容纳源数据（使用 [CU 计算器](https://zilliz.com.cn/pricing#calculator)预估容量） |
| 网络连通性 | 如果有网络限制，请确保已将 [Zilliz Cloud IP](./zilliz-cloud-ips) 加入白名单 |

## 数据类型映射\{#data-type-mapping}

下表总结了 Qdrant 字段类型如何映射到 Zilliz Cloud 字段类型，并对各类型做了详细说明。

| Qdrant 字段类型 | Zilliz Cloud 字段类型 | 描述 |
| --- | --- | --- |
| 主键 | 主键 | Qdrant 中的主键会自动映射为 Zilliz Cloud 中的主键。<br/>在数据迁移时，您可以选择启用 Auto ID 功能；但请注意，启用后源 Collection 中的原始主键值将会被舍弃。 |
| 稠密向量 | FLOAT_VECTOR | 稠密向量字段会直接转换为 FLOAT_VECTOR，无需进行任何修改。 |
| 稀疏向量 | SPARSE_FLOAT_VECTOR | 如果样本行中的稀疏向量字段不为空，则默认进行字段映射；否则，在 Schema 映射中将不会选择稀疏向量字段。 |
| Payload | Dynamic field | 默认情况下，Qdrant 的 Payload 会映射为 Zilliz Cloud 中的 Dynamic Field。有关详细信息，请参阅 [Dynamic Field](./enable-dynamic-field)。<br/>在迁移数据时，如果您希望对某些动态字段使用固定数据类型并优化索引配置，建议将动态字段转换为固定字段。 |

## Payload 字段转换规则\{#payload-field-conversion}

<Admonition type="info" icon="📘" title="说明">

Zilliz Cloud 采样 100 行数据检测 Payload 数据结构，必要时可手动添加字段。

</Admonition>

Qdrant Payload 默认映射为 Dynamic Field 以实现最大灵活性，转换为固定字段可带来：

- 强数据类型校验：强制字段类型约束

- 优化查询性能：建立专用索引

- 结构化数据管理：统一数据规范

| Payload 字段类型 | Zilliz Cloud 固定字段类型 | 描述 |
| --- | --- | --- |
| Integer | INT64 | 如果 Payload 中的字段类型为 Integer，当转换为固定字段后，该字段将变为 INT64 类型。 |
| Float | DOUBLE | 如果 Payload 中的字段类型为 Float，当转换为固定字段后，该字段将变为 DOUBLE 类型。 |
| Bool | BOOL | 如果 Payload 中的字段类型为 Bool，当转换为固定字段后，该字段将变为 BOOL 类型。 |
| Keyword | VARCHAR | 如果 Payload 中的字段类型为 Keyword，当转换为固定字段后，该字段将变为 VARCHAR 类型。<br/>**注意：**该字段的最大长度固定为 65,535 字节且不可修改，容量计算以实际字段长度为准。 |
| Geo | JSON | 如果 Payload 中的字段类型为 Geo，当转换为固定字段后，该字段将变为 JSON 类型。 |
| Datetime | VARCHAR | 如果 Payload 中的字段类型为 Datetime，当转换为固定字段后，该字段将变为 VARCHAR 类型。<br/>**注意：**该字段的最大长度固定为 65,535 字节且不可修改，容量计算以实际字段长度为准。 |
| UUID | VARCHAR | 如果 Payload 中的字段类型为 UUID，当转换为固定字段后，该字段将变为 VARCHAR 类型。<br/>**注意：**该字段的最大长度固定为 65,535 字节且不可修改，容量计算以实际字段长度为准。 |

## Array 类型支持\{#array-type-support}

| Qdrant Array 类型 | Zilliz Cloud Array 类型 | 是否支持手动添加 |
| --- | --- | --- |
| Array&lt;Integer&gt; | ARRAY&lt;INT64&gt; | 支持添加为新的固定字段（不能从动态字段转换）。 |
| Array&lt;Float&gt; | ARRAY&lt;DOUBLE&gt; | 支持添加为新的固定字段（不能从动态字段转换）。 |
| Array&lt;Bool&gt; | ARRAY&lt;BOOL&gt; | 支持添加为新的固定字段（不能从动态字段转换）。 |
| Array&lt;Keyword&gt; | ARRAY&lt;VARCHAR&gt; | 支持添加为新的固定字段（不能从动态字段转换）。 |
| Array&lt;Geo&gt; | 不支持 | Array 中的元素类型为 Geo 时暂不支持映射。 |
| Array&lt;Datetime&gt; | ARRAY&lt;VARCHAR&gt; | 支持添加为新的固定字段（不能从动态字段转换）。 |
| Array&lt;UUID&gt; | ARRAY&lt;VARCHAR&gt; | 支持添加为新的固定字段（不能从动态字段转换）。 |

转换为固定字段后，可配置以下属性：

- **Nullable**：决定字段是否接受空值（默认启用），详见 [Nullable 属性](./nullable-fields)。

- **默认值**：设置数据缺失时的回退值，详见[默认值](./nullable-fields)。

- **Partition Key**：可将 INT64/VARCHAR 字段指定为 Partition Key（注意：每个 Collection 支持一个 Partition Key，且该字段不可为空），详见 [使用 Partition Key](./use-partition-key)。

## Qdrant 特殊处理规则\{#qdrant-specific-handling-rules}

### Collection 命名规则\{#collection-naming-rules}

Qdrant Collection 名称将按以下规则迁移至 Zilliz Cloud：

| 场景 | 影响 | 解决方案 |
| --- | --- | --- |
| 名称冲突 | 目标 Database 存在同名 Collection 时无法提交迁移任务 | 删除现有 Collection / 选择其他目标 Database / 迁移配置时重命名 Collection |
| 特殊字符 | 名称按 Qdrant 原始格式保留 | 请确保名称符合 Zilliz Cloud 命名规范 |
