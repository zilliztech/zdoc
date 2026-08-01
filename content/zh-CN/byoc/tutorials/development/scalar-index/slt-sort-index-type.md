---
title: "STL_SORT | BYOC"
slug: /slt-sort-index-type
sidebar_label: "STL_SORT"
beta: FALSE
added_since: FALSE
last_modified: FALSE
deprecate_since: FALSE
notebook: FALSE
description: "在 Zilliz Cloud 中使用 `STLSORT` 索引，可以将如 `INT8` 与 `INT16` 这一类数值类字段，`VARCHAR` 字段或 `TIMESTAMPTZ` 字段的中的值按照既定的方式排列，进而强化在上述字段中进行查询时的性能。 | BYOC"
type: origin
token: EfjMwCJrAiY2M4kyo8vcPhOhn1c
sidebar_position: 5
displayed_sidebar: default

---

import Admonition from '@theme/Admonition';


# STL_SORT

在 Zilliz Cloud 中使用 `STL_SORT` 索引，可以将如 `INT8` 与 `INT16` 这一类数值类字段，`VARCHAR` 字段或 `TIMESTAMPTZ` 字段的中的值按照既定的方式排列，进而强化在上述字段中进行查询时的性能。

如果你频繁需要进行如下查询时，可以考虑使用 `STL_SORT` 索引:

- 使用 `==`、`!=`、`>`、`<`、`>=` 及 `<=` 操作符进行比较操作。

- 使用 `IN` 或 `LIKE` 操作符进行范围过滤。

## 支持的数据类型\{#supported-data-types}

- 数值类型（如 `INT8`、`INT16`、`INT32`、`INT64`、`FLOAT`、`DOUBLE`）。更多详情，可参考[布尔与数值类型](./use-number-field)。

- `VARCHAR` 类型。更多详情，可参考[字符串类型](./use-string-field)。

- `TIMESTAMPETZ` 类型。更多详情，可参考[TIMESTAMPTZ 类型](./use-timestamptz-field)。

## 工作原理\{#how-it-works}

在使用 `STL_SORT` 索引时，Zilliz Cloud 按照如下步骤创建索引和加速查询：

1. 创建索引

    1. 在插入数据时，Zilliz Cloud 从目标字段中获取该字段的所有值。

    1. 然后使用 C++ 中的 [std::sort](https://en.cppreference.com/w/cpp/algorithm/sort.html) 方法对这些值进行排序。

    1. 每个值都与此所在 Entity 的主键一起存入一个已排序数组中。

1. 加速查询

    1. 在查询时，Zilliz Cloud 在上述已排序数组中使用 C++ 的 [std:lower_bound](https://en.cppreference.com/w/cpp/algorithm/lower_bound.html) 和 [std::upper_bound](https://en.cppreference.com/w/cpp/algorithm/upper_bound.html) 方法进行二元查询。

    1. 对于大小比较的场景，Zilliz Cloud 能够快速找到所有匹配的值。

    1. 对于范围比较的场景，Zilliz Cloud 则能迅速定位到范围的起止位置，并返回其间的所有值。

    1. 在该字段中包含匹配值的 Entity 主键将被传递到查询执行器进行最终查询结果的组装。

上述步骤使得查询复杂度由 **O(n)** 降低到了 **O(logn +m)**，其中 m 是指的匹配 Entity 的数量。

## 创建 STL_SORT 索引\{#create-an-stl_sort-index}

您可以在数值、`VARCHAR` 或 `TIMESTAMPTZ` 字段上直接使用 `STL_SORT` 索引，无需额外参数。如下示例演示了如何在 `TIMESTAMPTZ` 字段上使用 `STL_SORT` 索引。

```python
from pymilvus import MilvusClient

client = MilvusClient(uri="YOUR_CLUSTER_ENDPOINT") # Replace with your server address

# Assume you have defined a TIMESTAMPTZ field named "tsz" in your collection schema

# Prepare index parameters
index_params = client.prepare_index_params()

# Add RTREE index on the "tsz" field
# highlight-start
index_params.add_index(
    field_name="tsz",
    index_type="STL_SORT",   # Index for TIMESTAMPTZ
    index_name="tsz_index",  # Optional, name your index
    params={}                # No extra params needed
)
# highlight-end

# Create the index on the collection
client.create_index(
    collection_name="tsz_demo",
    index_params=index_params
)
```

## 删除索引\{#delete-an-index}

您也可以使用 `drop_index()` 从 Collection 中删除指定字段上的索引。

<Admonition type="info" icon="📘" title="说明">

如果您的集群与 Milvus v2.6.x 兼容，您可以删除标量字段上的索引，无须对 Collection 执行 Release 操作。

</Admonition>

```python
client.drop_index(
    collection_name="tsz_demo",   # Name of the collection
    index_name="tsz_index" # Name of the index to drop
)
```

## 注意事项\{#usage-notes}

- **字段类型**：仅支持数值、`VARCHAR` 和 `TIMESTAMPTZ` 类型的字段，更多内容，可查看[布尔与数值类型](./use-number-field)、[字符串类型](./use-string-field)及[TIMESTAMPTZ 类型](./use-timestamptz-field)。

- **参数**：无额外参数。

- **不支持 mmap**：使用 `STL_SORT` 索引的字段不支持卸载到磁盘。

