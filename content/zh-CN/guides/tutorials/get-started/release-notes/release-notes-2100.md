---
title: "版本说明书（2024/09/12） | Cloud"
slug: /release-notes-2100
sidebar_key: release-notes-2100
sidebar_label: "2024/09/12"
added_since: FALSE
last_modified: FALSE
deprecate_since: FALSE
beta: FALSE
notebook: FALSE
description: "该版本为 Zilliz Cloud 带来了几项关键更新，首先是 Zilliz Cloud Serverless 的 GA，它提供自动扩展功能，可节省高达 50 倍的成本。Milvus 2.4 功能现已实现 GA，引入了 Sparse Vector、多向量 Hybrid Search和带有模糊匹配的倒排索引等功能。该版本还包括公开预览版中的多副本功能，允许用户通过在多个可用区（AZ）的副本间分配工作负载来提高查询吞吐量和可用性。此外，Zilliz Cloud 的新迁移服务支持从开源 Milvus、pgvector 和 Elasticsearch 迁移，并可在 Zilliz Cloud 内实现组织内和跨组织数据迁移。用于备份、恢复、迁移和作业管理的扩展 RESTful API 使用户能够构建自动化操作工作流。进一步增强的功能包括支持项目只读角色以及重命名群集和快照的功能。 | Cloud"
type: origin
token: R8XCwgfEGiPOrLkI03WcdDVAnMg
sidebar_position: 16
keywords: 
  - 向量数据库
  - zilliz
  - milvus
  - 大模型向量数据库
  - 版本说明书

---

import Admonition from '@theme/Admonition';


# 版本说明书（2024/09/12）

该版本为 Zilliz Cloud 带来了几项关键更新，首先是 Zilliz Cloud Serverless 的 GA，它提供自动扩展功能，可节省高达 50 倍的成本。Milvus 2.4 功能现已实现 GA，引入了 Sparse Vector、多向量 Hybrid Search和带有模糊匹配的倒排索引等功能。该版本还包括公开预览版中的多副本功能，允许用户通过在多个可用区（AZ）的副本间分配工作负载来提高查询吞吐量和可用性。此外，Zilliz Cloud 的新迁移服务支持从开源 Milvus、pgvector 和 Elasticsearch 迁移，并可在 Zilliz Cloud 内实现组织内和跨组织数据迁移。用于备份、恢复、迁移和作业管理的扩展 RESTful API 使用户能够构建自动化操作工作流。进一步增强的功能包括支持项目只读角色以及重命名群集和快照的功能。

## Milvus 兼容性\{#milvus-compatibility}

本次发布后创建的所有集群均兼容 **Milvus v2.4.x**。

## Serverless GA\{#serverless-ga}

经过一年的改进，Zilliz Cloud Serverless 现已全面推出。作为面向 GenAI 应用程序的无服务器向量数据库，Zilliz Cloud Serverless 可根据应用程序的需求进行自动扩展，最高可节省 50 倍的成本。其成本效益得益于分层存储系统，该系统可优化 DRAM、SSD 和对象存储之间的数据放置，确保快速访问活动数据，同时降低不常用数据的成本--所有这一切都无需人工干预。

与 Dedicated 集群不同，Serverless 集群可确保您只需为所使用的服务付费，从而消除了闲置服务器的成本。借助便捷的迁移功能，您可以轻松地将数据从开源 Milvus 转移到 Zilliz Cloud Serverless，或从 Serverless 转移到 Dedicated 集群，以适应不断变化的需求。

如需了解更多或试用，可单击[此处](https://zilliz.com.cn/serverless)开始。

## Zilliz Cloud 上的 Milvus 2.4.x 新功能\{#milvus-v24x-new-features-on-zilliz-cloud}

Milvus 2.4 为 RAG 和多模态数据搜索提供了许多非常实用的功能。如果您想尝试这些新功能，可以将您的集群更新到公开预览版。由于 Milvus 2.4 尚未达到稳定版本，因此请谨慎在生产环境中使用 Milvus 2.4 的这些功能。

### Sparse Vector\{#sparse-vector}

Sparse Vector 不同于 Dense Vector，因为 Sparse Vector 的维数往往比 Dense Vector 高出数倍，只有少数几个维数是非零的。由于其基于项的性质，这一特征具有更好的可解释性，在某些领域可能更有效。事实证明，SPLADEv2/BGE-M3 等学习的 Sparse Vector 对于常见的第一阶段排名任务非常有用。这项新功能的主要用例是允许对 SPLADEv2/BGE-M3 等神经模型和 BM25 算法等统计模型生成的 Sparse Vector 进行高效的近似语义近邻搜索。Zilliz Cloud 现在支持 Sparse Vector 的高效和高性能存储、索引和搜索（MIPS，最大内积搜索）。

示例代码请参见 [hello_sparse.py](https://github.com/milvus-io/pymilvus/blob/2.4/examples/hello_sparse.py)。

### 多向量 Hybrid Search\{#multi-vector-hybrid-search}

多向量支持是需要多模型数据处理或混合 Dense Vector 和 Sparse Vector 的应用的基石。有了多向量支持，您现在可以

- 存储从多个模型中为非结构化文本、图像或音频样本生成的向量嵌入。

- 进行包含来自每个 Entity 的多个向量字段的 ANN 搜索。

- 通过为不同的嵌入模型分配权重来定制搜索策略。

- 尝试使用各种嵌入模型，以找到最佳模型组合。

多向量支持允许在一个集合中对不同类型的多个向量字段（如 FLOAT_VECTOR 和 SPARSE_FLOAT_VECTOR）进行存储、索引和应用重排策略。目前有两种重排策略可供选择： Reciprocal Rank Fusion（RRF）和 Average Weighted Scoring。这两种策略都是将针对不同向量字段的搜索结果合并成一个统一的结果集。RRF 考虑了项目在原始排名中的位置，对在多个列表中排名靠前的项目给予更高的重视，并优先考虑在不同向量字段中持续出现的 Entity。Average Weighted Scoring 则对每个向量字段的搜索结果进行加权，以确定它们在最终结果集中的重要性。

示例代码请参见 [hybrid_search.py](https://github.com/milvus-io/pymilvus/blob/2.4/examples/hybrid_search.py)。

### 增强的元数据过滤和子串匹配\{#improved-metadata-filtering-and-substring-matching}

在此版本中，我们对元数据过滤进行了两项重要改进。首先，我们通过引入新的标量反转索引，提高了过滤标量数据类型的性能。其次，我们在元数据过滤过程中扩大了对子串匹配的支持。

在 Milvus 以前的版本中，元数据过滤是通过基于内存的二进制搜索索引和 Marisa Trie 索引实现的。这些方法都是内存密集型的。最新发布的 Zilliz Cloud 现在采用了基于 Tantivy 的反转索引，它可应用于所有数字和字符串数据类型。这种新索引将字符串的标量查询性能提高了 10 倍。通过在内部索引结构上应用数据压缩和内存映射存储（MMap）机制，它还能减少内存消耗。示例代码见 [inverted_index_example.py](https://github.com/milvus-io/pymilvus/blob/2.4/examples/inverted_index_example.py)。

此版本还增加了对更灵活的字符串匹配的支持，包括前缀、后缀、后缀和通配符模式。

### Grouping Search\{#grouping-search}

现在，您可以根据特定标量字段中的值汇总搜索结果。在 RAG 中，这对于检索文档块以及返回与搜索查询相关的唯一文档 ID 非常有用。考虑到文档集合中的每个文档都被分割成若干块，每个块都由一个向量嵌入表示，您可以在 **search()** 操作中使用 group_by_field 参数按文档 ID 对搜索结果进行分组，这样您就可以在搜索语义相关的块时找到相关文档列表。

示例代码见 [example_group_by.py](https://github.com/milvus-io/pymilvus/blob/2.4/examples/example_group_by.py)。

### Float16 和 BFloat 向量字段支持\{#float16-and-bfloat-vector-datatype}

机器学习和神经网络经常使用半精度数据类型，如 Float16 和 BFloat。这些数据类型可以提高查询效率，减少内存使用量，但代价是精度降低。随着这一版本的发布，Zilliz Cloud 现在支持矢量字段的这些数据类型。

示例代码可在 [float16_example.py](https://github.com/milvus-io/pymilvus/blob/2.4/examples/float16_example.py) 和 [bfloat16_example.py](https://github.com/milvus-io/pymilvus/blob/2.4/examples/bfloat16_example.py) 中找到。

## 多 Replica 支持\{#multi-replica}

Zilliz Cloud现在提供多 Replica 能力，可实现集群级复制，从而提高查询吞吐量和可用性。

- **提高查询性能**： 对于要求每秒高查询量（QPS）的用户，多 Replica 允许将查询工作负载分布到各个 Replica 中。这种并行处理提高了整体吞吐量，减少了延迟，并提高了查询密集型应用的效率。在大多数情况下，随着 Replica 数量的增加，整体 QPS 可以线性提高。

- **增强可用性**： 多 Replica 通过将 Replica 分布在多个可用区（AZ）来增强可用性。即使在可用区中断的情况下，这种设置也能确保对数据的持续访问，从而为关键任务应用提供更高的可靠性。

目前，多 Replica 功能处于公开预览阶段，在企业计划中可用。要了解更多信息，请阅读[管理 Replica](./manage-replica)。

## 迁移服务\{#migration-service}

Zilliz Cloud 现在提供全面的迁移服务，使用户能够轻松完成迁移任务。目前支持三种类型的迁移：

- 从开源的 Milvus 迁移到 Zilliz Cloud。迁移目标可以是免费实例、Serverless 实例或 Dedicated 集群。有关详情，请参阅[从 Milvus 迁移至 Zilliz Cloud](./migrate-from-milvus)。

- 从其他开源数据库迁移到 Zilliz Cloud，当前支持从 pgvector 和 Elasticsearch 迁移。迁移目标可以是免费实例、Serverless 实例或 Dedicated 集群。有关详情，请参阅[从 Elasticsearch 迁移至 Zilliz Cloud](./migrate-from-elasticsearch) 和[从 pgvector 迁移至 Zilliz Cloud](./migrate-from-pgvector)。

- 在 Zilliz Cloud 各集群间迁移数据，支持组织内和跨组织数据迁移。有关详情，请参阅[Zilliz Cloud 跨集群迁移](./offline-migration)。

## 备份、恢复、迁移、任务管理 API 上线\{#backup-restore-migration-jobs-restful-api}

通过此次更新，Zilliz Cloud 扩展了控制平面 API，引入了支持备份、还原、迁移和任务管理的新功能。

这些 RESTful API 允许用户构建自己的自动化操作工作流，从而为其数据管理和维护流程提供更大的灵活性和控制力。

[了解更多有关 API 的详细信息](/reference/restful)。

## 其它增强\{#other-enhancements}

该版本还包括一系列增强功能：

- 支持[项目级只读角色](./project-users)。

- 支持重命名群集和快照。

