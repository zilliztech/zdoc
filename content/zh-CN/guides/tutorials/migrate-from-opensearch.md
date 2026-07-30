---
title: "从 OpenSearch 迁移至 Zilliz Cloud | Cloud"
slug: /migrate-from-opensearch
sidebar_label: "从 OpenSearch 迁移至 Zilliz Cloud"
beta: FALSE
added_since: FALSE
last_modified: FALSE
deprecate_since: FALSE
notebook: FALSE
description: "本文档说明从 OpenSearch 迁移时，Zilliz Cloud 如何处理数据类型映射、Collection 命名规则及注意事项。 | Cloud"
type: origin
token: Cf89wr8V3iGmr3kKiqAcP4D1nPb
sidebar_position: 7
displayed_sidebar: default

---

import Admonition from '@theme/Admonition';


# 从 OpenSearch 迁移至 Zilliz Cloud

本文档说明从 [OpenSearch](https://opensearch.org/) 迁移时，Zilliz Cloud 如何处理数据类型映射、Collection 命名规则及注意事项。

## 开始前\{#before-you-start}

开始离线迁移前需满足：

### OpenSearch 侧要求\{#opensearch-requirements}

| 要求项 | 详细说明 |
| --- | --- |
| 网络访问 | 源集群必须可通过公网访问 |
| 认证权限 | 需提供有效的集群 Endpoint、用户名及密码（具备必要权限） |
| 向量字段要求 | 每个源索引必须包含至少一个 k-NN 向量字段 |
| 数据可用性 | 源索引必须包含数据，空索引无法迁移 |

### Zilliz Cloud 侧要求\{#zilliz-cloud-requirements}

| 要求项 | 详细说明 |
| --- | --- |
| 用户权限 | 需具备组织管理员或项目管理员角色 |
| 目标集群容量 | 需预留足够 CU 容纳源数据（使用 [CU 计算器](https://zilliz.com.cn/pricing#calculator)预估容量） |
| 网络连通性 | 如果有网络限制，请确保已将 [Zilliz Cloud IP](./zilliz-cloud-ips) 加入白名单 |

## 数据类型映射\{#data-type-mapping}

下表总结了 OpenSearch 字段类型如何映射到 Zilliz Cloud 字段类型，并对各类型做了详细说明。

| **OpenSearch 字段类型** | **Zilliz Cloud 字段类型** | **描述** |
| --- | --- | --- |
| 主键（[_id](https://opensearch.org/docs/latest/field-types/metadata-fields/id/)） | 主键 | OpenSearch 的 ID 字段将自动映射为 Zilliz Cloud 的主键字段。 |
| [k-NN vector](https://opensearch.org/docs/latest/field-types/supported-field-types/knn-vector/) | `FLOAT_VECTOR` | OpenSearch 中的 `float` 向量类型映射到 Zilliz Cloud 上的 `FLOAT_VECTOR`。OpenSearch 的 Byte/Binary 向量不支持迁移。<br/>向量维度保持不变。 |
| [Alias](https://opensearch.org/docs/latest/field-types/supported-field-types/alias/) | Not supported | 暂不支持映射该字段。 |
| [Binary](https://opensearch.org/docs/latest/field-types/supported-field-types/binary/) | `VARCHAR` | Binary 数据在 Zilliz Cloud 中以字符串形式存储。 |
| [Numeric](https://opensearch.org/docs/latest/field-types/supported-field-types/numeric/) |  |  |
| `byte` | `INT8` | 直接映射。 |
| `double` | `DOUBLE` | 直接映射。 |
| `float` | `FLOAT` | 直接映射。 |
| `half_float` | `FLOAT` | 映射为 `FLOAT` 数据类型。 |
| `integer` | `INT32` | 直接映射。 |
| `long` | `INT64` | 直接映射。 |
| `short` | `INT16` | 直接映射。 |
| `unsigned_long` | 不支持 | 暂不支持映射该字段。 |
| `scaled_float` | 不支持 | 暂不支持映射该字段。 |
| [Boolean](https://opensearch.org/docs/latest/field-types/supported-field-types/boolean/) | `BOOL` | 存储 `true` 或 `false`。 |
| [Date](https://opensearch.org/docs/latest/field-types/supported-field-types/dates/) | `VARCHAR` | 存储为字符串。 |
| [IP address](https://opensearch.org/docs/latest/field-types/supported-field-types/ip/) | `VARCHAR` | 存储为字符串。 |
| [Range](https://opensearch.org/docs/latest/field-types/supported-field-types/range/) | `JSON` | 序列化为 JSON 格式。 |
| [Object](https://opensearch.org/docs/latest/field-types/supported-field-types/object-fields/) |  |  |
| `object` | JSON | 序列化为 JSON 格式。 |
| `nested` | JSON | 序列化为 JSON 格式。 |
| `flat_object` | JSON | 序列化为 JSON 格式。 |
| `join` | VARCHAR | 存储为字符串。 |
| [String](https://opensearch.org/docs/latest/field-types/supported-field-types/string/) |  |  |
| `keyword` | `VARCHAR` | 存储为字符串。 |
| `text` | `VARCHAR` | 映射到 Milvus 2.5 或更早版本中的 VARCHAR。 |
| `match_only_text` | `VARCHAR` | 存储为字符串。 |
| `token_count` | `INT32` | 存储为 INT32。 |
| `wildcard` | 不支持 | 暂不支持映射该字段。 |
| [Autocomplete](https://opensearch.org/docs/latest/field-types/supported-field-types/autocomplete/) | `VARCHAR` | 存储为字符串。 |
| [Geographic](https://opensearch.org/docs/latest/field-types/supported-field-types/geographic/) | `VARCHAR` | 存储为字符串。 |
| [Rank](https://opensearch.org/docs/latest/field-types/supported-field-types/rank/) | `VARCHAR` | 存储为字符串。 |
| [Percolator](https://opensearch.org/docs/latest/field-types/supported-field-types/percolator/) | `VARCHAR` | 存储为字符串。 |
| [Derived](https://opensearch.org/docs/latest/field-types/supported-field-types/derived/) | 不支持 | 暂不支持映射该字段。 |
| [Star-tree](https://opensearch.org/docs/latest/field-types/supported-field-types/star-tree/) | 不支持 | 暂不支持映射该字段。 |
| [Arrays](https://docs.opensearch.org/docs/latest/field-types/supported-field-types/index/#arrays) | 不支持 | 暂不支持映射该字段。 |
| [Multifields](https://docs.opensearch.org/docs/latest/field-types/supported-field-types/index/#multifields) | 不支持 | 暂不支持映射该字段。 |

## OpenSearch 特殊处理规则\{#opensearch-specific-handling-rules}

### Collection 命名规则\{#collection-naming-rules}

OpenSearch 索引名称将按以下规则迁移至 Zilliz Cloud：

| 场景 | 影响 | 解决方案 |
| --- | --- | --- |
| 默认命名 | Collection 名称与源索引名称完全一致 | 保留原始名称 |
| 特殊字符 | 含连字符(-)或点号(.)的索引名称将导致迁移任务提交失败 | 手动重命名目标 Collection（使用下划线等合法字符） |
| 名称冲突 | 目标 Database 存在同名 Collection 时无法提交迁移任务 | 删除现有 Collection / 选择其他目标 Database / 迁移配置时重命名 Collection |

## 迁移注意事项\{#migration-considerations}

从 OpenSearch 迁移时需注意以下事项：

| 限制项 | 影响 | 替代方案 |
| --- | --- | --- |
| 动态字段转固定字段 | 无法将现有动态字段转换为固定类型 | 字段保持原始动态特性 |
| 迁移过程中添加新字段 | 仅迁移 Elasticsearch 已有字段 | 无法在迁移时新增字段 |
| 稀疏向量迁移 | 当前版本不支持迁移稀疏向量 | 考虑使用稠密向量替代方案，或联系支持团队了解路线图 |

