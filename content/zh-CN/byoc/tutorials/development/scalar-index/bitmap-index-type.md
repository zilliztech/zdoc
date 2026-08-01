---
title: "BITMAP | BYOC"
slug: /bitmap-index-type
sidebar_label: "BITMAP"
beta: FALSE
added_since: FALSE
last_modified: FALSE
deprecate_since: FALSE
notebook: FALSE
description: "Bitmap 索引是一种用于优化低基数标量字段（非主键列）查询性能的索引类型。基数（Cardinality）是指字段中不同值的数量。低基数字段通常包含有限的不同值。例如，`color` 字段若只包含 `red`、`green`、`blue` 三种值，即认为是低基数字段。 | BYOC"
type: origin
token: XvR4wXgb2iGBZ3kuUgVcRLWmnEd
sidebar_position: 1
displayed_sidebar: default

---

import Admonition from '@theme/Admonition';


# BITMAP

Bitmap 索引是一种用于优化低基数标量字段（非主键列）查询性能的索引类型。基数（Cardinality）是指字段中不同值的数量。低基数字段通常包含有限的不同值。例如，`color` 字段若只包含 `red`、`green`、`blue` 三种值，即认为是低基数字段。

相较于其他类型的索引，Bitmap 索引在处理低基数字段时，能够提供更高的空间效率和更快的查询速度。其工作原理是将字段值转换为紧凑的二进制格式（即 0 和 1）。通过对这些二进制数据执行高效的位运算，能够显著减少标量查询的检索时间。

## 概述\{#}

Bitmap 名称由 "Bit" 和 "Map" 两部分组成。"Bit" 指的是计算机中最小的数据单位，只能存储 0 或 1 两种值；而 "Map" 则表示将数据转换和组织为 0 和 1 序列的过程。

Bitmap 索引主要由键值（Key）和对应的 Bitmap 两部分构成。键值代表了索引字段中的唯一值，而每个键值都对应着一个 Bitmap。这个 Bitmap 实际上是一个二进制数组，比如 [0, 1, 1, 1, 0]，数组长度等于 Collection 中的记录总数。如果某条记录的索引字段值与特定的键值相匹配，那么在对应的 Bitmap 中，这条记录对应的 Bit 就会被设置为 1；否则，它将为 0。

假设有一个文档集合，其中包含**类别**和**是否公开**两个字段。我们需要检索属于**科技**类别并且**公开**的文档。在这种情况下，我们 Bitmap 索引的键值就是**科技**和**公开**。

![H1tVwJSQrh7VwmbrXNYcgi2Sn4e](https://zdoc-images.oss-cn-hangzhou.aliyuncs.com/H1tVwJSQrh7VwmbrXNYcgi2Sn4e.png)

如上图，对于**科技**和**公开**字段值的 Bitmap 索引如下：

- **科技**：[1, 0, 1, 0, 0]，表示只有第 1 和第 3 个文档属于**科技**类别。

- **公开**：[1, 0, 0, 1, 0]，表示只有第 1 和第 4 个文档为**公开**文档。

要找到同时满足这两个条件的文档，我们基于这两个 Bitmap 索引执行 AND 操作。结果为 [1, 0, 0, 0, 0]，表明只有第一个文档（ID为 1）同时满足两个条件。通过使用 Bitmap 索引和高效的位运算，我们能够快速缩小搜索范围，避免了全表扫描。

## 创建 Bitmap 索引\{#bitmap}

要创建 Bitmap 索引，可以使用 `create_index()` 方法，将 `index_type` 参数设置为 `BITMAP` 。

```python
# 准备一个空的IndexParams对象，无需指定任何索引参数
index_params = client.create_index_params()

index_params.add_index(
    field_name="category",  # 要索引的标量字段名称
    index_type="BITMAP",    # 要创建的索引类型
    index_name="category_bitmap_index"  # 要创建的索引名称
)

client.create_index(
    collection_name="my_collection",  # 指定 Collection 名称
    index_params=index_params
)
```

在以上示例中，我们在名为 `my_collection` 的 Collection 的 `category` 字段上创建了 Bitmap 索引。`add_index()` 方法用于指定字段名称、索引类型和索引名称。

创建 Bitmap 索引后，您可以在搜索查询中使用 `filter` 参数来基于索引字段执行标量过滤。这样可以利用 Bitmap 索引高效地缩小搜索结果范围。关于更多详细信息，请参考[过滤表达式概览](./filtering-overview)。

<Admonition type="info" icon="📘" title="说明">

在标量过滤中，Bitmap 索引可能无法加速某些二元算术运算，如 `A % 10 == 1` 或 `A - 100 > 10`。此类条件表达式需要逐行扫描数据，因此在这种情况下，Bitmap 索引的性能可能不会优于未索引字段的查询。

</Admonition>

## 删除索引\{#drop-an-index}

您也可以使用 `drop_index()` 从 Collection 中删除指定字段上的索引。

<Admonition type="info" icon="📘" title="说明">

如果您的集群与 Milvus v2.6.x 兼容，您可以删除标量字段上的索引，无须对 Collection 执行 Release 操作。

</Admonition>

```python
client.drop_index(
    collection_name="my_collection",   # Name of the collection
    index_name="category_bitmap_index" # Name of the index to drop
)
```

## 注意事项\{#}

- 仅支持为非主键的标量字段创建 Bitmap 索引。

- Bitmap 索引支持的字段数据类型包括：

    - `BOOL`, `INT8`, `INT16`, `INT32`, `INT64`, `VARCHAR`

    - `ARRAY`（Array 中的元素类型必须是以下之一：`BOOL`, `INT8`, `INT16`, `INT32`, `INT64`, `VARCHAR`）

- Bitmap 索引不支持以下数据类型：

    - `FLOAT`, `DOUBLE`：由于精度和操作复杂性等原因，这些数据类型不支持创建 Bitmap 索引。

    - `JSON`：JSON 数据类型结构复杂，无法通过 Bitmap 索引有效表示。

- Bitmap 索引不适用于高基数字段（即具有大量不同值的字段）。

    - 一般来说，当字段的基数小于 500 时，Bitmap 索引最为有效。

    - 当基数超过这个阈值时，Bitmap 索引的性能优势会逐渐减弱，同时存储开销会显著增加。

    - 对于高基数字段，建议考虑使用其他索引技术，如倒排索引。具体选择应根据您的特定用例和查询需求来决定。

- 如果查询输出字段包含 Bitmap 列并且输出行数较大，可能会导致延时增加并导致超时。可以通过 `alter_index` 方法或在 Milvus 配置文件中启用 `indexOffsetCache` 参数来减少延时，但请注意启用该缓存会增加内存使用。关于如何获取配置文件，请参考配置 Milvus。

