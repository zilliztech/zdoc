---
title: "调整索引构建级别 | Cloud"
slug: /tune-index-build-level
sidebar_label: "调整索引构建级别"
beta: FALSE
added_since: FALSE
last_modified: FALSE
deprecate_since: FALSE
notebook: FALSE
description: "Zilliz Cloud 引入了一个名为 `buildlevel` 的参数，该参数允许用户为目标 Collection 平衡存储容量和搜索召回率。对于不常使用或需要更多存储空间的 Collection，您可以牺牲 2% 的召回率，以换取 30% 至 40% 的存储容量增加，反之亦然。本指南介绍了可用选项以及如何使用它们为 Collection 构建索引。 | Cloud"
type: origin
token: KCIawSSnKiuwBWk0PJ9ci5TYnBS
sidebar_position: 3
displayed_sidebar: default

---

import Admonition from '@theme/Admonition';


import Supademo from '@site/src/components/Supademo';

# 调整索引构建级别

Zilliz Cloud 引入了一个名为 `build_level` 的参数，该参数允许用户为目标 Collection 平衡存储容量和搜索召回率。对于不常使用或需要更多存储空间的 Collection，您可以牺牲 **2%** 的召回率，以换取 **30%** 至 **40%** 的存储容量增加，反之亦然。本指南介绍了可用选项以及如何使用它们为 Collection 构建索引。

<Admonition type="info" icon="📘" title="注释">

此功能为**公测版**特性，仅在满足以下情况下适用于 Dedicated 集群：

- 集群类型为 **性能型** 或 **容量型**，并且

- 集群与 **Milvus v2.6.x** 兼容。

您可以升级集群来测试此功能。如果您遇到任何需要进一步说明的问题，[请联系我们](https://support.zilliz.com/hc/en-us/requests/new)。

</Admonition>

## 概述\{#overview}

不同类型的 Zilliz Cloud 集群在其宣称的存储容量方面存在显著差异。如果性能型集群中的某个 Collection 使用频率不高或需要额外存储容量，在为 Collection 中浮点向量类型（如 **FLOAT_VECTOR**、**FLOAT16_VECTOR** 或 **BFLOAT16_VECTOR**）的向量字段创建索引时，考虑将 `build_level` 设置为高容量选项。虽然这可能会略微降低召回率，但可以将存储容量提高 **30%** 至 **40%**。

`build_level` 参数有三个选项：**高召回率** (2)、**平衡型** (1)和**高容量** (0)。

- **平衡型** (1)

    这是默认选项，在大多数场景下平衡搜索精度和存储容量。

- **精度优先** (2)

    此选项优先考虑搜索性能和高召回率，适用于需要高精度的集合。

- **容量优先** (0)

    此选项强调存储容量，非常适合需要额外存储空间的收藏。

内部基准测试显示，默认选项可增加所有集群的存储容量，无论其类型如何。对于性能型集群，默认选项甚至可使存储容量提升 **60%**，性能（QPS）提升 **17%**。

### 性能型集群\{#performance-optimized-clusters}

下表比较了性能型集群在引入 `build_level` 前后的容量、QPS 和召回率。可以看到，默认选项在保持召回率的同时，提高了 QPS 和存储容量。

| 构建级别选项 | 容量 | QPS | 召回率 |
| --- | --- | --- | --- |
| 引入 Build Level 之前（基线） | 150万个768维向量 | &#126; 3,000 | 91% - 97% |
| 容量优先(0) | **210万个768维向量（↑250%）** | &#126; 3,000 | 90% - 95% |
| **平衡型(1)** | **150万个768维向量（↑ 60%）** | **&#126; 3,500 (↑ 17%)** | 91% - 97% |
| 精度优先 (2) | 100万个768维向量 | &#126; 2,850 (↓ &#126;5%) | **92% - 98% (↑)** |

### 容量型集群\{#capacity-optimized-clusters}

下表比较了容量型集群在引入 `build_level` 前后的容量、QPS 和召回率。可以看到，默认选项在保持召回率的同时，提高了 QPS 和存储容量。

| 构建级别选项 | 容量 | QPS | 召回率 |
| --- | --- | --- | --- |
| 引入 Build Level 之前（基线） | 500万个768维向量 | &#126; 340 | 93% - 98% |
| 容量优先(0) | **700万个768维向量（↑ 100%）** | &#126; 300 | 89% - 97% |
| **平衡型(1)** | **500万个768维向量（↑ 50%）** | **&#126; 350 (↑ 3%)** | 92% - 97% |
| 精度优先 (2) | 300万个768维向量 | &#126; 345 | **94% - 98% (↑)** |

## 约束与限制\{#limits}

在开始操作之前，请了解以下限制条件：

- 在对 Collection 进行索引时，您需要在浮点向量类型的向量字段上设置此参数，可用的向量类型包括**FLOAT_VECTOR**、**FLOAT16_VECTOR** 和 **BFLOAT16_VECTOR**。

- 一旦设置，此参数将无法修改。不过，如果有必要，您可以删除该索引并使用所需设置创建另一个索引。

- 迁移或备份将移除 `build_level` 设置。迁移或恢复完成后，如果需要，您可以删除该索引并使用所需设置创建另一个集合。

## 操作步骤\{#procedure}

在大多数情况下，您不需要设置 `build_level`。默认设置可帮助您在搜索性能、精度和存储容量之间取得平衡。

Zilliz Cloud 允许您以编程方式或在Zilliz Cloud控制台中设置 `build_level`。

### 以编程方式设置 build_level\{#set-build_level-programmatically}

要设置 `build_level`，你需要在[为浮点类型的向量字段创建索引](./undefined#index-a-collection)时进行，例如 **FLOAT_VECTOR**、**FLOAT16_VECTOR** 和 **BFLOAT16_VECTOR**。

以下示例假设您已完成[准备工作](./undefined#preparations)中的步骤。将 `build_level` 设置为 `1` 表示使用**平衡型**选项。

```python
# 4. Set up index
# 4.1. Set up the index parameters
index_params = MilvusClient.prepare_index_params()

# 4.2. Add an index on the vector field.
index_params.add_index(
    field_name="vector",
    metric_type="COSINE",
    index_type="AUTOINDEX",
    index_name="vector_index",
    # highlight-next-line
    build_level=1
)

# 4.4. Create an index file
client.create_index(
    collection_name="customized_setup",
    index_params=index_params
)

# 5. Describe index
res = client.list_indexes(
    collection_name="customized_setup"
)
```

### 在 Zilliz Cloud 控制台设置 build_level\{#set-build_level-one-the-zilliz-cloud-console}

除了以编程方式设置 `build_level` 之外，您还可以在创建 Collection 时在 Zilliz Cloud 控制台中设置它。

<Supademo id="cmfkua8whed1839ozdau9fzqp?utm_source=link" title=""  />

1. 点击 **+ Collection** 在目标集群的集合选项卡上。

1. 在**创建 Collection** 页面上设置模式。

    确保向量字段的数据类型是有效选项之一：**FLOAT_VECTOR**、**FLOAT16_VECTOR** 或 **BFLOAT16_VECTOR**。

1. 在**创建索引**部分，点击**编辑索引**。

1. 在提示的编辑向量索引字段中，您可以设置**度量类型**和**索引构建级别**。

