---
title: "了解 Collection | Cloud"
slug: /manage-collections
sidebar_key: manage-collections
sidebar_label: "了解 Collection"
added_since: FALSE
last_modified: FALSE
deprecate_since: FALSE
beta: FALSE
notebook: FALSE
description: "在 Zilliz Cloud 集群中，您可以创建多个 Collection 用于管理数据，并将数据记录作为 Entity 插入 Collection 中。Collection 与 Entity 这对概念与关系型数据库中的数据表和数据记录这对概念类似。本小节主要介绍 Zilliz Cloud 集群中与 Collection 及与之相关的一些概念。 | Cloud"
type: origin
token: FhDxwrdHUi6Ienk34rqcDAyHnm7
sidebar_position: 1
keywords: 
  - 向量数据库
  - zilliz
  - milvus
  - 大模型向量数据库
  - 管理
  - data operations
  - collection operations
  - collection 操作

---

import Admonition from '@theme/Admonition';


# 了解 Collection

在 Zilliz Cloud 集群中，您可以创建多个 Collection 用于管理数据，并将数据记录作为 Entity 插入 Collection 中。Collection 与 Entity 这对概念与关系型数据库中的数据表和数据记录这对概念类似。本小节主要介绍 Zilliz Cloud 集群中与 Collection 及与之相关的一些概念。

## Collection\{#collection}

Collection 是一张二维数据表，包含固定列数和可变行数。Collection 数据表中的每 1 列对应 1 个字段，每 1 行表示 1 个 Entity。

下图中的示例 Collection 包含 6 个 Entity 和 8 个字段。

![QxpAb654powT9ux6upScpkEFnAd](https://zdoc-images.oss-cn-hangzhou.aliyuncs.com/QxpAb654powT9ux6upScpkEFnAd.png "QxpAb654powT9ux6upScpkEFnAd")

## Schema 与 Fields\{#schema-and-fields}

通常我们会根据属性（如大小、重量、位置等）描述对象。对象属性类似于 Collection 中的字段。每个字段都具有自己的属性——字段中数据类型和相关限制（如向量维度和相似性类型）。通过定义字段及它们的先后顺序，会为您的 Collection 形成 1 个 数据结构，也就是 Collection 的 Schema。关于在定义 Schema 过程中支持使用的数据类型，可参考 [了解 Schema](./schema-explained) 中的相关介绍。

所有在 Schema 中定义的字段都需要包含在待插入的 Entity 中。如果希望部分字段为可选，可以考虑如下做法：

- 允许其为空或为其设置默认值。

    关于如何允许字段值为空以及为字段设置默认值，可参考[Nullable 和默认值](./nullable-and-default)。

- 启用 Dynamic Field。

    关于如何开启及使用 Dynamic Field，可参考[使用 Dynamic Field](./enable-dynamic-field)。

## 主键与 AutoId\{#primary-key-and-autoid}

与传统关系型数据表类似，Collection 也有一个主键字段用于区别 Entity。每个主键字段的值唯一且不重复。每 1 个主键都可以对应 Collection 中的 1 条 Entity 记录。

如上图所示， 示例 Collection 中的 **id** 字段是主键。第 1 个 ID **0** 对应标题为《The Mortality Rate of Coronavirus is Not Important》的文章。Collection 中的任何其他文章的 ID 都不会为 **0**。

主键字段默认要求手动输入，也可以通过在创建 Collection 时通过开启 AutoId 的方式将其设置为自动分配。在 Collection 的主键为自动分配的情况下，插入数据时应确保插入的 Entity 不包括主键字段。

关于主键和 AutoId 的更多内容，可参考 [主键与 AutoId](./primary-field-auto-id) 中的相关介绍。

## 索引\{#index}

通过对 Collection 中的数据建立索引，可以在搜索时加快搜索速度。因此，您应该为您的业务依赖的所有列创建索引。其中，所有向量列均需建立索引。

与 Milvus 实例不同， Zilliz Cloud 集群中的 Collection 在向量列上仅支持使用 **AUTOINDEX** 索引。更多详情，请阅读 [AUTOINDEX](./autoindex-explained)。

## Entity\{#entities}

Collection 中的 Entity 是指共享相同字段集的数据记录。存储在每个字段中的一条数据组成 1 个 Entity。

您可以向 Collection 中添加任意数量的 Entity。但是，随着 Entity 数量和维度增加，Entity占用的内存大小也会增加，影响 Collection 的搜索性能。

更多内容，可参考本手册 [了解 Schema](./schema-explained) 一节以合理规划您的 Collection。

## Load 和 Release\{#load-and-release}

对 Collection 执行 Load 操作是在 Collection 中进行 Search 和 Query 的前提条件。在加载 Collection 时，Zilliz Cloud 会将所有向量列的索引文件和所有标量列的数据加载到内存，从而快速响应搜索和查询请求。

由于 Search 和 Query 操作会占用较多的内存资源。为了减少资源消耗，您可以对暂时不需要使用的 Collection 执行 Release 操作，将相关数据从内存中释放出来。

更多内容，可参考[Load 和 Release](./load-release-collections)。

## Search 与 Query\{#search-and-query}

在为 Collection 创建索引并将其加载到内存后，您就可以通过输入**查询向量**、选择**相似度类型**的方式对 Collection 中的 Entity 进行相似性搜索。例如，您可以将文本 “Interesting Python demo” 对应的向量表示作为查询向量进行搜索，Zilliz Cloud 会在 Collection 中使用指定的**相似度类型**比对查询向量与 Collection 中向量的相似度，并返回所有标题语义与查询向量相似的 Entity。

在 Search 和 Query 过程中，您也可以使用过滤条件对某些标量字段进行过滤，找到符合指定条件的所有 Entity。在使用过滤条件时，需要注意的是 Search 请求中的过滤条件是可选字段，而 Query 请求中的过滤条件是必选字段。

关于相似度类型的更多内容，可参考[相似度类型](./search-metrics-explained)。

更多关于搜索和查询的内容，可参考[搜索与重排](./search-query-get)中的章节。其中，基本功能包括：

- [基本 ANN Search](./single-vector-search)

- [Filtered Search](./filtered-search)

- [Range Search](./range-search)

- [Grouping Search](./grouping-search)

- [Hybrid Search](./hybrid-search)

- [Search Iterator](./with-iterators)

- [Query](./get-and-scalar-query)

- [全文搜索](./full-text-search)

- [精确文本匹配](./text-match)

Zilliz Cloud 还提供如下优化搜索效率的高级功能，需要您根据实际的业务需求决定是否开启。这些功能包括：

- [使用 Partition Key](./use-partition-key)

- [使用 mmap](./use-mmap)

## Partition\{#partition}

Partition 是从 Collection 中划分而来，是 Collection 的子集。它们和它们所在的 Collection 保持相同的列数，只包含 Collection 的部分 Entity。

通过将 Entity 分别存入不同的 Partition，Zilliz Cloud 实现了对 Entity 的隔离与分组。在按 Partition 进行检索时，由于无须关注 Collection 中其它 Partition 的数据，检索效率得到了较大的提升。

关于 Partition 的更多内容，可以查看[管理 Partition](./manage-partitions)。

## Shard\{#shard}

Shard 是对 Collection 的水平切分，每个 Shard 对应一条数据写入通路。每个 Collection 默认带有一个 Shard，您可以根据希望的写入吐吞速率和待写入的数据量大小在创建 Collection 时来设置合适的 Shard 数量。

关于如何设置 Shard 数量，可以参考[创建 Collection](./manage-collections-sdks)。

## Alias\{#alias}

Zilliz Cloud 还为 Collection 提供了 Alias 管理能力。一个 Collection 可以有多个 Alias。但是多个 Collection 不可共享同一个 Alias。在收到针对某个 Collection 的操作时，Zilliz Cloud 会查找指定的 Collection。如果指定的 Collection 名称不存在，Zilliz Cloud 会将指定的 Collection 名称当做 Alias 继续查找。您可以通过为 Collection 分配 Alias 来提升 Collection 在不同场景下的适应能力。

关于如何管理 Alias，可以查看[管理 Alias](./manage-aliases)。

## Function\{#function}

Zilliz Cloud 还为 Collection 提供了用于派生字段的 Function。您可以要求 Zilliz Cloud 根据指定字段通过 Function 派生出另一个字段。

目前，Zilliz Cloud 支持在全文检索功能中使用自定义 Function 从文本字段派生出对应的稀疏向量字段。关于全文检索功能，可参考[全文搜索](./full-text-search)。

## 一致性水平\{#consistency-level}

在分布式数据库中，一致性水平是指那些保证每个节点或副本都拥有相同数据状态的属性。在创建 Collection 和执行 Search 操作时，可以分别设置一致性水平。Zilliz Cloud 提供了如下几种一致性水平，分别是  Strong、Bounded Staleness 和 Eventually。

关于一致性水平的更多内容，可以参考[一致性水平](./consistency-level)。

## 相关限制\{#limits}

关于 Collection 的相关限制，可参考本手册[使用限制](./limits#collections)一节中的相关描述。

