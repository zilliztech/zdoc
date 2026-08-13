---
title: "修改外部 Collection Schema | Cloud"
slug: /alter-external-collection-schema
sidebar_label: "修改外部 Collection Schema"
beta: PUBLIC
added_since: FALSE
last_modified: FALSE
deprecate_since: FALSE
notebook: FALSE
description: "创建外部 Collection 后，外部数据源通常还会继续演进。例如，已经存储 Embedding 的 Lakehouse 表之后可能会新增 score、category 或 timestamp 等标量字段，而你可能希望在查询结果中返回这些字段，或在过滤表达式中使用它们。 | Cloud"
type: origin
token: Jr3ew8nk2i5u0SkXWmJcyyLfnMh
sidebar_position: 19
displayed_sidebar: default

---

import Admonition from '@theme/Admonition';


# 修改外部 Collection Schema

创建外部 Collection 后，外部数据源通常还会继续演进。例如，已经存储 Embedding 的 Lakehouse 表之后可能会新增 score、category 或 timestamp 等标量字段，而你可能希望在查询结果中返回这些字段，或在过滤表达式中使用它们。

无需重新创建外部 Collection，也无需将源数据复制到 Zilliz Cloud。你可以添加一个 Zilliz Cloud 字段，并将其映射到外部数据源中已有的字段。添加字段后，刷新外部 Collection，即可在查询和搜索中使用新字段。

## 限制\{#limits}

- 外部 Collection 目前支持在创建后添加字段。其他 Schema 修改（例如删除字段、重命名字段、更改字段数据类型、更改向量维度或重新映射 `external_field`）均不受支持。

- 只能添加外部数据源中已经存在的字段。此操作会将现有外部字段映射到 Zilliz Cloud 字段，不会在外部数据源中创建新字段，也不会回填源数据。

- 不支持向现有外部 Collection 添加 `SPARSE_FLOAT_VECTOR` 字段。

- 不支持向现有外部 Collection 添加 StructArray 字段。如果外部 Collection 需要 StructArray 字段，请在创建 Collection 时在 Collection Schema 中定义该字段。

## 添加字段\{#add-a-field}

向外部 Collection 添加字段之前，请确认该字段已经存在于外部数据源中。然后调用 `add_collection_field()`，将 `external_field` 设置为外部数据源中的字段名称，以便在 Zilliz Cloud 中公开该字段。将 `data_type` 设置为与外部数据源中该字段匹配的 Zilliz Cloud 数据类型。例如，如果映射字段存储双精度值，请使用 `DataType.DOUBLE`。

与托管 Collection 不同，刷新外部 Collection 后，新增字段的值会从外部数据源中读取。

### 添加标量字段\{#add-a-scalar-field}

如果希望在查询结果中返回某个标量字段或在过滤表达式中使用该字段，请使用 `add_collection_field()` 添加该字段。以下示例添加了一个 `score` 字段，并将其映射到外部数据源中的 `score` 字段。

```python
from pymilvus import DataType, MilvusClient

client = MilvusClient(
    uri="YOUR_CLUSTER_ENDPOINT",
    token="YOUR_CLUSTER_TOKEN",
)

client.add_collection_field(
    collection_name="product_embeddings",
    field_name="score",
    data_type=DataType.DOUBLE,
    nullable=True,
    # highlight-next-line
    external_field="score",
)
```

在此示例中，`score` 是 Zilliz Cloud 字段名称，`external_field="score"` 会将其映射到外部数据源中的 `score` 字段。由于该字段是在 Collection 创建后添加的，因此请设置 `nullable=True`。

### 添加向量字段\{#add-a-vector-field}

如果外部数据源中已经包含向量值，也可以添加向量字段。请将向量的 `data_type` 和 `dim` 设置为与外部数据源中的向量字段一致。

以下示例添加了一个名为 `image_embedding_v2` 的稠密向量字段。

```python
from pymilvus import DataType, MilvusClient

client = MilvusClient(
    uri="YOUR_CLUSTER_ENDPOINT",
    token="YOUR_CLUSTER_TOKEN",
)

client.add_collection_field(
    collection_name="product_embeddings",
    field_name="image_embedding_v2",
    data_type=DataType.FLOAT_VECTOR,
    dim=768,
    nullable=True,
    # highlight-next-line
    external_field="image_embedding_v2",
)
```

如果计划在新增的向量字段上执行向量搜索，请在刷新外部 Collection 之前为该字段创建索引。

```python
index_params = client.prepare_index_params()

index_params.add_index(
    field_name="image_embedding_v2",
    index_type="AUTOINDEX",
    metric_type="COSINE",
)

client.create_index(
    collection_name="product_embeddings",
    index_params=index_params,
)
```

## 刷新外部 Collection\{#refresh-the-external-collection}

修改外部 Collection Schema 后，请刷新外部 Collection，使 Zilliz Cloud 更新外部 Collection 的元数据，并让 Schema 修改在查询、搜索和过滤结果中生效。

```python
client.refresh_external_collection(
    collection_name="product_embeddings"
)
```
