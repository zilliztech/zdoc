---
title: "FAQ：Collection | BYOC"
slug: /faq-collection
sidebar_label: "FAQ：Collection"
beta: FALSE
notebook: FALSE
description: "本文列举了在使用 Zilliz Cloud Collection 时可能遇到的常见问题及对应解决方法。 | BYOC"
type: origin
token: YVAzwqHdti7uHSkZL6icsY7hnpe
sidebar_position: 3
displayed_sidebar: default

---

# FAQ：Collection

本文列举了在使用 Zilliz Cloud Collection 时可能遇到的常见问题及对应解决方法。

## Contents

- [1 个集群中最多可创建多少个 Collection？](#how-many-collections-are-allowed-in-a-single-cluster)
- [如果创建 Collection 时未开启动态列，Collection 创建成功后是否还能开启动态列？](#if-dynamic-schema-was-disabled-when-the-collection-was-created-can-i-enable-it-later)
- [Zilliz Cloud 支持哪些相似度类型？](#what-are-the-indexing-metric-types-supported-by-zilliz-cloud)
- [Collection 加载为何失败，如何解决？](#why-do-i-fail-to-load-collections-what-can-i-do)
- [Collection 加载请求的并发是多少？如何增加并发请求的数量？](#what-is-the-concurrency-for-collection-loading-requests-how-can-i-increase-the-number-of-concurrent-requests)
- [如何为创建的 Collection 设置存留时间（TTL）属性？](#how-to-set-the-ttl-time-to-live-property-of-a-created-collection)
- [1 个 Collection 中最多可以添加多少个字段？](#is-there-any-limit-to-the-number-of-fields-i-can-add-in-a-collection)
- [我可以修改 Collection 的 Shard 数量吗？](#can-i-modify-the-number-of-shards-in-a-collection)
- [Partition 的命名是否有规则限制？](#is-there-any-rules-for-partition-names)

## FAQs




### 1 个集群中最多可创建多少个 Collection？\{#how-many-collections-are-allowed-in-a-single-cluster}

集群可创建的 Collection 数量受集群的类型和 CU 数量影响。

更多详情，请参加[使用限制](./limits#collections)。

如达到集群可创建 Collection 数量上限，请尝试以下方法：

1. 为集群[扩容](./manage-cluster)。

1. [删除](./manage-cluster#drop-cluster)未使用的 Collection。

1. [使用 Partition Key](./use-partition-key) 创建 Partition。

### 如果创建 Collection 时未开启动态列，Collection 创建成功后是否还能开启动态列？\{#if-dynamic-schema-was-disabled-when-the-collection-was-created-can-i-enable-it-later}

可以。如果您在创建时未开启动态列功能，您可以后续开启该功能。更多详情，请阅读[修改 Collection](./modify-collections)。

### Zilliz Cloud 支持哪些相似度类型？\{#what-are-the-indexing-metric-types-supported-by-zilliz-cloud}

Zilliz Cloud支持以下几种相似度类型。

1. 欧氏距离（Euclidean / L2）计算两条向量间的欧式距离。计算结果越小，两个向量越相似。

1. 内积（Inner Product / IP）将两条向量相乘。计算结果为正数，两个向量越相似。

1. 余弦距离（Cosine）计算计算两个向量之间的余弦夹角大小。计算结果在 [-1, 1] 的区间内，结果越大，向量越相似。

1. 杰卡德距离（Jaccard）衡量 2 个集合差异性的指标，是 Jaccard 相似系数（similarity coefficient）的补集，被定义为 1 减去 Jaccard 相似系数。

1. 汉明距离（Hamming）测量两个字符串对应位置的不同字符的个数。

更多详情，请参考[相似度类型](./search-metrics-explained)。

### Collection 加载为何失败，如何解决？\{#why-do-i-fail-to-load-collections-what-can-i-do}

Collection 加载失败由集群内存不足引起。我们建议您扩展集群 CU 大小。

### Collection 加载请求的并发是多少？如何增加并发请求的数量？\{#what-is-the-concurrency-for-collection-loading-requests-how-can-i-increase-the-number-of-concurrent-requests}

当前，Zilliz Cloud 加载 Collection 请求的速率限制为每秒 1 个。该建议数值仅针对 1 CU 的集群。如需增加并发请求的数量，请[提交工单](https://support.zilliz.com.cn/hc/zh-cn)。

### 如何为创建的 Collection 设置存留时间（TTL）属性？\{#how-to-set-the-ttl-time-to-live-property-of-a-created-collection}

您可以使用我们的PyMilvus SDK通过提供参数collection.ttl.seconds的值来设置集合的TTL。

以下示例将TTL设置为1800秒。

```python
collection.set_properties(properties={"collection.ttl.seconds": 1800})
```

### 1 个 Collection 中最多可以添加多少个字段？\{#is-there-any-limit-to-the-number-of-fields-i-can-add-in-a-collection}

1 个 Collection 中最多可以添加 64 个字段。

### 我可以修改 Collection 的 Shard 数量吗？\{#can-i-modify-the-number-of-shards-in-a-collection}
 可以。若需修改 Shard 数量，请使用[复制 Collection](./manage-collections-console#create-collection)功能：

1. 进入目标 Collection 的**详情**页面。

1. 在**操作**下拉菜单中选择**复制**。

1. 在弹窗中：

    - 输入新的 Collection 名称

    - 将**复制范围**设置为 **Collection Schema 和数据**

    - 展开**设置**，指定所需的 Shard 数量

    - 点击**复制**

1. 复制的 Collection 创建完成后，请在您的应用代码中切换使用新的 Collection。

### Partition 的命名是否有规则限制？\{#is-there-any-rules-for-partition-names}

是。Partition 名称只能包含字母、数字、下划线（“_”）和连字符（“-”），且不能以连数字或连字符开头。
