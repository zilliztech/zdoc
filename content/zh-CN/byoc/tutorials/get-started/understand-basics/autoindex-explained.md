---
title: "AUTOINDEX | BYOC"
slug: /autoindex-explained
sidebar_label: "AUTOINDEX"
beta: FALSE
added_since: FALSE
last_modified: FALSE
deprecate_since: FALSE
notebook: FALSE
description: "为满足用户不同需求，Zilliz Cloud 提供 2 种类型的集群 CU——性能型和容量型。但是，为不同类型 CU 集群中的 Collection 创建索引时，通常需要根据所选择的 CU 类型调整索引参数。为了方便您创建索引，免去调节参数的麻烦，Zilliz Cloud 使用 AUTOINDEX 的索引类型。 | BYOC"
type: origin
token: YUETwzDssiTUs9kCSn4cgUYLnrd
sidebar_position: 1
keywords: 
  - 向量数据库
  - zilliz
  - milvus
  - 大模型向量数据库
  - autoindex

---

import Admonition from '@theme/Admonition';


# AUTOINDEX

为满足用户不同需求，Zilliz Cloud 提供 2 种类型的集群 CU——性能型和容量型。但是，为不同类型 CU 集群中的 Collection 创建索引时，通常需要根据所选择的 CU 类型调整索引参数。为了方便您创建索引，免去调节参数的麻烦，Zilliz Cloud 使用 **AUTOINDEX** 的索引类型。

**AUTOINDEX** 是Zilliz Cloud 独有的索引类型，可以帮助您获取最佳搜索性能。当您在 Zilliz Cloud 上为 Collection 中的向量字段创建索引时，会自动应用 **AUTOINDEX** 索引。

## 特性与收益\{#features-and-benefits}

相对于开源的 Milvus 提供的能力而言，AUTOINDEX 有着显著的性能优势。根据一项基准测试结果，在特定的数据集上，AUTOINDEX 的 QPS 是其它索引类型的 3 倍。

AUTOINDEX 可以在如下场景中提供较高性能：

- 使用单指令流多数据流（SIMD）的方式加速查询和存储，从而进一步提升服务器性能。

- 优化数据图和裁切策略，显著降低检索时需要访问的数据点。

- 实现动态量化策略，减少距离计算开销。

### 同样成本，更高收益\{#cost-efficiency}

根据用户对存储容量和检索性能的不同需求，AUTOINDEX 支持纯内存检索、磁盘混合检索及内存映射检索等多种检索模式。在纯内存检索模式下，AUTOINDEX 使用动态量化技术显著降低内存使用。在磁盘混合检索模式下，AUTOINDEX 动态缓存数据，并使用算法减少 I/O 操作，从而保持高性能。

### 自动调优\{#autonomous-tuning}

近似最近邻（ANN）算法要求在召回率和性能之间做出取舍。查询参数的设置对检索结果影响巨大。如果检索参数确定召回范围过小，可能会导致极低的召回率，达不到业务要求。反之而言，如果检索参数确定的召回范围过大，查询性能则会极速降低。

选择合适的查询参数需要掌握相关领域的知识，对用户来说，学习曲线过高。为了降低用户的学习曲线，AUTOINDEX 实现了一套智能算法，通过在建立索引时分析用户数据的分布情况，使用机器学习模型自动选择检索参数，实现召回率和检索性能间的平衡。这样一来，用户就无需手动设置检索参数了。

<Admonition type="info" icon="📘" title="说明">

<p>在将您的 Milvus 代码迁移到云上后，无须手动修改代码中使用的索引类型。Zilliz Cloud 会在创建索引时使用 AUTOINDEX。 </p>

</Admonition>

## 创建索引和向量搜索\{#index-building-and-search-settings}

创建索引是指将 Collection 中的 Entity 按照特定顺序进行排序，以提高搜索效率。

在 Zilliz Cloud 上为向量字段创建索引十分简单。您只需将索引类型设置为 **AUTOINDEX**，然后选择相似度类型即可。Zilliz Cloud 将自动为您选择最合适配置。因此，您只需要考虑相似度类型，选择如何测量向量间距离。

在 Milvus 和 Zilliz Cloud 上创建索引时的参数设置区别如下所示：

```python
# For index-building
# On Milvus
index_params = {
    # Another option is IP.
    "metric_type": "L2", 
    # There are six more options available there.
    "index_type": "IVF_FLAT",
    # This varies with the specified index type.
    "params": {
        # This is the parameter required for IVF_FLAT to work.
        "nlist": 1024
    }
}

# On Zilliz Cloud
index_params = {
    # Always set this to AUTOINDEX
    "index_type": "AUTOINDEX", 
    # This is the only parameter you should think about.
    "metric_type": "L2"
}
```

在 Milvus 和 Zilliz Cloud 上进行检索时的参数设置区别如下所示：

```python
# For searches
# On Milvus
search_params = {
    # Applicable tuning parameters vary with the index type
    "params": {
        "nprobe": 10
    }
}

# On Zilliz Cloud
search_params = {
    # highlight-next-line
    "params": { 
        "level": 1 # The default value applies when left unspecified
    }
}
```

### 关于检索精度控制参数`level`\{#about-the-level-parameter}

检索调优要求根据不同的索引类型调整不同的参数。以  HNSW  为例，对基于该索引的检索调优，需要调整 `ef` 参数，而对基于 IVF 类型的索引，需要调整的参数则是 `nprobe`。为了更好的在召回率和检索效率之间找到平衡，需要不断尝试对这些参数进行调整。

Zilliz Cloud 使用一个统一的检索精度控制参数 `level`，简化了检索参数调优的过程。

该参数默认值为`1`，最大值为`5`。随着参数值的增加，召回率会得到提高，相对应的，检索性能会有所下降。通常情况下，默认的检索精度可以支撑 90% 左右的召回率，基本满足大多数场景需求。如需更高的召回率，可以尝试调升该参数。

## 总结\{#conclusion}

希望您能通过阅读本教程，了解什么是 **AUTOINDEX**，以及如何使用 **AUTOINDEX** 简化在 Zilliz Cloud 上创建索引和搜索向量的流程。选择 **AUTOINDEX** 后，您无需根据集群 CU 类型考虑选择何种索引类型。Zilliz Cloud 为自动为您选择最优的搜索和索引配置，帮助您节省时间和精力。如对 **AUTOINDEX** 有任何疑问，欢迎通过 [support@zilliz.com](mailto:support@zilliz.com) 联系我们。