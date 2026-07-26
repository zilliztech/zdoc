---
title: "从 Elasticsearch 迁移至 Zilliz Cloud | Cloud"
slug: /migrate-from-elasticsearch
sidebar_label: "从 Elasticsearch 迁移至 Zilliz Cloud"
beta: FALSE
added_since: FALSE
last_modified: FALSE
deprecate_since: FALSE
notebook: FALSE
description: "本文档说明从 Elasticsearch 迁移时，Zilliz Cloud 如何处理数据类型映射、Collection 命名规则及注意事项。 | Cloud"
type: origin
token: CJN4wlKiGi1P8Zk4BHKcF04GnLb
sidebar_position: 4
displayed_sidebar: default

---

import Admonition from '@theme/Admonition';


# 从 Elasticsearch 迁移至 Zilliz Cloud

本文档说明从 [Elasticsearch](https://www.elastic.co/elasticsearch) 迁移时，Zilliz Cloud 如何处理数据类型映射、Collection 命名规则及注意事项。

## 开始前\{#before-you-start}

开始离线迁移前需满足：

### Elasticsearch 侧要求\{#elasticsearch-requirements}

| 要求项 | 详细说明 |
| --- | --- |
| 版本兼容性 | Elasticsearch 7.x 或更高版本 |
| 网络访问 | 源集群必须可通过公网访问 |
| API 访问权限 | 需提供有效的集群 Endpoint 或 Cloud ID 及对应凭证 |
| 向量字段要求 | 每个源索引必须包含至少一个稠密向量字段 |

### Zilliz Cloud 侧要求\{#zilliz-cloud-requirements}

| 要求项 | 详细说明 |
| --- | --- |
| 用户权限 | 需具备组织管理员或项目管理员角色 |
| 目标集群容量 | 需预留足够 CU 容纳源数据（使用 [CU 计算器](https://zilliz.com.cn/pricing#calculator)预估容量） |
| 网络连通性 | 如果有网络限制，请确保已将 [Zilliz Cloud IP](./zilliz-cloud-ips) 加入白名单 |

## 数据类型映射\{#data-type-mapping}

下表总结了 Elasticsearch 字段类型如何映射到 Zilliz Cloud 字段类型，并对各类型做了详细说明。

| **Elasticsearch 字段类型** | **Zilliz Cloud 字段类型** | 描述 |
| --- | --- | --- |
| 主键 | 主键 | Elasticsearch 的 ID 字段会自动映射为 Zilliz Cloud 中的主键。<br/>在数据迁移时，您可以选择启用 Auto ID 功能；但请注意，启用后源索引中的原始主键值将会被舍弃。 |
| dense_vector | FLOAT_VECTOR | 向量维度与源索引中的向量字段维度相同。您可以在 **L2** 和 **IP** 之间指定一个度量类型。 |
| text, string, keyword, ip, date, timestamp | VARCHAR | 通过 **Max Length** 指定最大数据长度，有效值为 1 到 65535 之间。如果任何字符串超过了最大长度限制，迁移过程将会报错。 |
| long | INT64 | - |
| integer | INT32 | - |
| short | INT16 | - |
| byte | INT8 | - |
| double | DOUBLE | - |
| float | FLOAT | - |
| boolean | BOOL | - |
| object | JSON | - |
| arrays | ARRAY | - |

## Elasticsearch 特殊处理规则\{#elasticsearch-specific-handling-rules}

### Collection 命名规则\{#collection-naming-rules}

Elasticsearch 索引名称将按以下规则迁移至 Zilliz Cloud：

| 场景 | 影响 | 解决方案 |
| --- | --- | --- |
| 默认命名 | Collection 名称与源索引名称完全一致 | 保留原始名称 |
| 特殊字符 | 含连字符(-)或点号(.)的索引名称将导致迁移任务提交失败 | 手动重命名目标 Collection（使用下划线等合法字符） |
| 名称冲突 | 目标 Database 存在同名 Collection 时无法提交迁移任务 | 删除现有 Collection / 选择其他目标 Database / 迁移配置时重命名 Collection |

## 迁移注意事项\{#migration-considerations}

从 Elasticsearch 迁移时需注意以下事项：

| 限制项 | 影响 | 替代方案 |
| --- | --- | --- |
| 动态字段转固定字段 | 无法将现有动态字段转换为固定类型 | 字段保持原始动态特性 |
| 迁移过程中添加新字段 | 仅迁移 Elasticsearch 已有字段 | 无法在迁移时新增字段 |
| 稀疏向量迁移 | 当前版本不支持迁移稀疏向量 | 考虑使用稠密向量替代方案，或联系支持团队了解路线图 |

