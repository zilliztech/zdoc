---
title: "ANN 搜索 | BYOC"
slug: /ann-search-explained
sidebar_label: "ANN 搜索"
beta: FALSE
added_since: FALSE
last_modified: FALSE
deprecate_since: FALSE
notebook: FALSE
description: "通过 k-最近邻（kNN）搜索可以找到一个查询向量的 k 个最近向量。kNN 算法将查询向量与向量空间中的每个向量进行比较，直到出现 k 个完全匹配的结果。尽管 kNN 搜索可以确保准确性，但十分耗时。尤其是数据量大，向量维度高时，耗时更久。 | BYOC"
type: origin
token: E4Ggw2FU3iXekOklaytcDy47nRg
sidebar_position: 2
keywords: 
  - 向量数据库
  - zilliz
  - milvus
  - 大模型向量数据库
  - ann search

---

import Admonition from '@theme/Admonition';


# ANN 搜索

通过 k-最近邻（kNN）搜索可以找到一个查询向量的 k 个最近向量。kNN 算法将查询向量与向量空间中的每个向量进行比较，直到出现 k 个完全匹配的结果。尽管 kNN 搜索可以确保准确性，但十分耗时。尤其是数据量大，向量维度高时，耗时更久。

相比之下，近似最近邻（ANN）搜索耗时更短。ANN 算法会预先构建索引。选择不同的索引算法会影响搜索速度、内存使用情况和准确性。各种类型的 ANN 索引算法主要分为 2 种思路：缩小搜索范围和将高维向量空间分解为低维子空间。

缩小搜索范围是指仅在可能性较高的候选项子集中对比查询向量，从而缩短搜索时间。但是可能结果不可避免地会返回不相关的向量。为确定一个向量是否在子集中，需要构建索引结构来对向量进行排序。

通常，有 3 种索引结构：图索引、树索引、哈希索引。

## HNSW：图索引算法\{#hnsw-a-graph-based-indexing-algorithm}

Hierarchical Navigable Small World（HNSW）算法通过创建多层接近图（Proximity graph）来索引向量空间。HNSW 算法在每 1 层中，都会在向量（或顶点）之间绘制连接相邻点的边，以形成单层Proximity graph，并最终形成多层图。底层包含所有向量及边。越上面的层，包含的向量和边越少。

创建分层 Proximity graph 后，搜索步骤如下：

1. 在顶层找到一个向量作为入口点。

1. 沿着可用的边逐渐移动到最近的向量。

1. 一旦确定了顶层的最近向量，使用较低层的相同向量作为入口点，在该层中找到其最近邻。

1. 重复上述步骤，直到找到底层的最近向量。

    ![Dkj8bpJswoXHzPxBz3hcOHSDnRg](https://zdoc-images.oss-cn-hangzhou.aliyuncs.com/Dkj8bpJswoXHzPxBz3hcOHSDnRg.png)

## LSH：哈希索引算法\{#lsh-a-hash-based-ann-indexing-algorithm}

局部敏感哈希（LSH）算法的基本思想为空间域转换。LSH 算法通过使用各种哈希函数将任意长度的数据映射为固定长度的值作为哈希，将这些哈希收集到哈希桶中，并将已经哈希到相同值的向量标记为候选对。

![RRMybZeKQoGgQRx6kSNcvwxsnre](https://zdoc-images.oss-cn-hangzhou.aliyuncs.com/RRMybZeKQoGgQRx6kSNcvwxsnre.png)

## DiskANN：基于 Vamana 图的磁盘索引算法\{#diskann-ann-search-on-disk-based-on-vamana-graphs}

不同于 HNSW 算法构建分层图，Vamana 索引过程相对简单：

1. 初始化随机图；

1. 先定位全局质心并确定最近点来找到导航点。使用全局比较以最小化平均搜索半径。

1. 使用初始化的随机近邻图和从步骤2开始的搜索起点执行近似最近邻搜索。使用搜索路径上的所有点作为候选近邻集，并采用 alpha = 1 的边缘修剪策略以减少搜索半径。

1. 将 alpha 值调整为 alpha> 1（文献推荐将数值设置为 1.2）后，重复步骤 3 以优化图质量和召回率。

索引准备就绪后，搜索步骤如下：

1. 加载相关数据，包括查询数据集、PQ 中心点数据、Codebook 数据、搜索起点和索引元数据。

1. 使用索引数据集执行 `cached_beam_search`，计算每个点的访问次数，并缓存具有最高访问频率的 `num_nodes_to_cache` 个点。

1. 默认情况下执行 `WARMUP` 操作，使用示例数据集执行 `cached_beam_search`。

1. 对于给定参数 `L`，使用查询集执行 `cached_beam_search`，并输出召回率和QPS等统计信息。查询时间不包括预热和热点数据统计信息。

更多详情，请阅读 《[DiskANN： 十亿规模数据集上高召回高 QPS 的 ANNS 单机方案](https://milvus.io/blog/2021-09-24-diskann.md)》。

