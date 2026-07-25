---
title: "版本说明书（2024/07/05） | Cloud"
slug: /release-notes-290
sidebar_key: release-notes-290
sidebar_label: "2024/07/05"
added_since: FALSE
last_modified: FALSE
deprecate_since: FALSE
beta: FALSE
notebook: FALSE
description: "在本次发布中，Zilliz Cloud 带来了一系列 Milvus 2.4 的新功能，包括稀疏向量支持、增强的多向量和混合搜索、倒排索引、模糊匹配以及文档级召回的分组检索能力。同时，此次发布还引入了 Float16 和 BFloat16 数据类型，以提高检索效率。此外，Pipelines 功能现在会在每次数据摄取和搜索请求时返回令牌使用统计信息。您可以在发票页面上找到详细的统计数据。 | Cloud"
type: origin
token: XP0BwhWFFiazrikwL94cJIsSnYb
sidebar_position: 18
keywords: 
  - 向量数据库
  - zilliz
  - milvus
  - 大模型向量数据库
  - 版本说明书

---

import Admonition from '@theme/Admonition';


# 版本说明书（2024/07/05）

在本次发布中，Zilliz Cloud 带来了一系列 Milvus 2.4 的新功能，包括稀疏向量支持、增强的多向量和混合搜索、倒排索引、模糊匹配以及文档级召回的分组检索能力。同时，此次发布还引入了 Float16 和 BFloat16 数据类型，以提高检索效率。此外，Pipelines 功能现在会在每次数据摄取和搜索请求时返回令牌使用统计信息。您可以在发票页面上找到详细的统计数据。

## Milvus 兼容性\{#milvus-compatibility}

本次发布后创建的所有集群均兼容 **Milvus v2.3.x**。

如果您选择将您的集群升级到 BETA，可以试用 **Milvus 2.4.x** 的相关功能。

## Milvus 2.4.x 功能上新\{#milvus-24x-new-features-available-on-zilliz-cloud}

Milvus 2.4 为 RAG 应用和多模型检索场景提供了众多新功能。如果你需要试用这些功能，可以将您的集群升级到 BETA。

<Admonition type="info" icon="📘" title="说明">

Milvus 2.4 稳定版尚未发布。请谨慎在生产环境中使用 Milvus 2.4 版本的新功能。

</Admonition>

### 稀疏向量\{#sparse-vector}

稀疏向量与它们的密集向量不同，它们往往具有数量级更高的维度，但只有少数几个非零值。基于这种特质，稀疏向量可以提供了更好的可解释性，并在某些领域可能更有效。诸如 SPLADEv2/BGE-M3 这种通过机器学习训练的稀疏向量模型，已被证明对常见的第一阶段排名任务很有用。这项新功能的主要用途是允许通过神经模型（如 SPLADEv2/BGE-M3）生成的稀疏向量以及统计模型（如 BM25 算法）进行高效的近似语义最近邻搜索。Zilliz Cloud 现在支持稀疏向量的高效且高性能的存储、索引和搜索（MIPS，最大内积搜索）。

如需了解更多，可查看[稀疏向量](./use-sparse-vector)一文及运行 [hello_sparse.py](https://github.com/milvus-io/pymilvus/blob/2.4/examples/hello_sparse.py) 中的示例代码。在运行示例代码前，须将代码中的连接信息指向您的 Zilliz Cloud 集群。

### 多向量混合查询\{#multi-embedding-and-hybrid-search}

多向量支持可在需要使用多模型数据或混合密集和稀疏向量的应用中使用。有了多向量支持，现在您可以：

- 存储非结构化文本、图像或音频样本的多模型向量表示。

- 对每个 Entity 携带多个向量的集合进行近似最近邻（ANN）搜索。

- 通过为不同的嵌入模型分配权重来定制搜索策略。

- 尝试不同的嵌入模型，以找到最优的模型组合。

多向量支持允许在集合中存储、索引并应用重新排名策略到不同类型的多个向量字段，如 **FLOAT_VECTOR** 和 **SPARSE_FLOAT_VECTOR**。目前，有两种重新排名策略可用：互反排名融合（**Reciprocal Rank Fusion**）和平均加权评分 (**Average Weighted Scoring**)。这两种策略都将来自不同向量字段的搜索结果组合成一个统一的结果集。第一种策略优先考虑在不同向量字段的搜索结果中一致出现的实体，而另一种策略则为每个向量字段的搜索结果分配权重，以确定它们在最终结果集中的重要性。

如需了解更多，可查阅[批量检索（Bulk-vector Search）](./single-vector-search)和 [Hybrid Search](./hybrid-search) 等内容及运行 [hybrid_search.py](https://github.com/milvus-io/pymilvus/blob/2.4/examples/hybrid_search.py) 中的示例代码。在运行示例代码前，须将代码中的连接信息指向您的 Zilliz Cloud 集群。

### 倒排索引和模糊查询\{#inverted-index-and-fuzzy-match}

在 Milvus 的早期版本中，标量字段索引使用了基于内存的二分搜索索引和 Marisa Trie 索引。然而，这些方法非常消耗内存。Zilliz Cloud 的最新版本现在采用了自动索引（auto-index）来优化这些机制，它可以应用于所有数值和字符串数据类型。这种新的索引显著提高了标量查询的性能，将字符串中的关键词查询速度提高了十倍。此外，倒排索引由于数据压缩和内部索引结构的内存映射存储（MMap）机制的额外优化，消耗的内存更少。

此版本还支持在标量过滤中使用前缀、内缀和后缀进行模糊匹配。

如需了解更多，可查阅[Binary 向量](./use-binary-vector), [创建 Scalar Index](./index-scalar-fields) 以及[使用 ](./basic-filtering-operators)[`like`](./basic-filtering-operators)[ 操作符](./basic-filtering-operators) 等内容。您还可以运行 [inverted_index_example.py](https://github.com/milvus-io/pymilvus/blob/2.4/examples/inverted_index_example.py) 和 [fuzzy_match.py](https://github.com/milvus-io/pymilvus/blob/2.4/examples/fuzzy_match.py) 中的示例代码深入了解相关概念。在运行示例代码前，须将代码中的连接信息指向您的 Zilliz Cloud 集群。

### 分组检索\{#grouping-search}

现在，您可以根据特定标量字段中的值对搜索结果进行聚合。这有助于 RAG（Retrieval-Augmented Generation，检索增强生成）应用实现文档级别的召回。设想一个文档集合，每个文档被分割成不同的段落。每个段落由一个向量嵌入表示，并且属于一个文档。为了找到最相关的文档而不是分散的段落，您可以在 search() 操作中包含 group_by_field 参数，按文档 ID 对结果进行分组。

如需了解更多，可查阅 [Grouping Search](./grouping-search) 等内容及运行 [hybrid_search.py](https://github.com/milvus-io/pymilvus/blob/2.4/examples/hybrid_search.py) 中的示例代码。在运行示例代码前，须将代码中的连接信息指向您的 Zilliz Cloud 集群。

### Float16 和 BFloat16 支持\{#float16-and-bfloat-vector-datatype}

机器学习和神经网络经常使用半精度数据类型，如 Float16 和 BFloat16。虽然这些数据类型可以提高查询效率并减少内存使用，但它们以牺牲精度为代价。在这次发布中，Zilliz Cloud 现在支持向量字段使用这些数据类型。

如需了解更多，可查阅[支持的数据类型](./schema-data-fields)并运行 [float16_example.py](https://github.com/milvus-io/pymilvus/blob/2.4/examples/datatypes/float16_example.py) 及 [bfloat16_example.py](https://github.com/milvus-io/pymilvus/blob/2.4/examples/datatypes/bfloat16_example.py) 中的示例代码。在运行示例代码前，须将代码中的连接信息指向您的 Zilliz Cloud 集群。

## Pipelines\{#pipelines}

Zilliz Cloud 现在可实时返回您的 Pipelines 请求的资源使用情况，详情可以在费用页面及每个 API 请求的响应中查看。当前，此功能仅统计费用情况，不产生实际费用。

图像嵌入模型已从之前的 **clip-vit-base-patch16** 升级到 **clip-vit-base-patch32**，以满足更广泛的需求范围。此外，计划不久后实现对多语言文本嵌入的支持。

## 其它增强\{#enhancements}

本次发布还包括一系列增强功能：

- 现在，您可以以自助服务的方式将您的 Dedicated 集群大小扩展到 256 CU。您也可以联系我们，以获得更大容量的集群。

