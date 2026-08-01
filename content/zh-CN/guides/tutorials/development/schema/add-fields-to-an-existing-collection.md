---
title: "修改 Collection Schema | Cloud"
slug: /add-fields-to-an-existing-collection
sidebar_label: "修改 Collection Schema"
beta: FALSE
added_since: FALSE
last_modified: FALSE
deprecate_since: FALSE
notebook: FALSE
description: "随着 Collection 从开发阶段进入生产阶段，每个实体周围的字段通常会发生变化。您可能会添加 `sourceuri` 或 `reviewstatus` 等标量字段，用于过滤和应用逻辑；添加由应用生成 Embedding 的新向量字段。Alter Collection Schema 让您可以在原 Collection 上完成受支持的字段变更，而无需重新创建 Collection。 | Cloud"
type: origin
token: JU6ZwfYLpilJ6vkncdzcLtFLnjf
sidebar_position: 18
displayed_sidebar: default

---

import Admonition from '@theme/Admonition';


# 修改 Collection Schema

随着 Collection 从开发阶段进入生产阶段，每个实体周围的字段通常会发生变化。您可能会添加 `source_uri` 或 `review_status` 等标量字段，用于过滤和应用逻辑；添加由应用生成 Embedding 的新向量字段。Alter Collection Schema 让您可以在原 Collection 上完成受支持的字段变更，而无需重新创建 Collection。

<Admonition type="info" icon="📘" title="说明">

本指南介绍现有 Collection 中字段级别的 Schema 变更。对于字段属性变更，例如修改 `VARCHAR` 字段的 `max_length` 或 `ARRAY` 字段的 `max_capacity`，请参阅 [修改字段设置](./alter-collection-field)。对于动态字段行为，请参阅 [Dynamic Field](./enable-dynamic-field) 和 [修改 Collection](./modify-collections)。

</Admonition>

## 限制\{#limits}

- 新增的用户自定义字段必须可为空。调用 `add_collection_field()` 时需设置 `nullable=True`。对于已有实体，新增字段为 `NULL`，除非您添加的是带有 `default_value` 的标量字段。

- Milvus 2.6.x 及以上版本支持添加用户自定义标量字段。Milvus 2.6.18 及以上版本支持添加用户自定义向量字段。

- 字段名在 Collection 的所有字段中必须唯一。

<Admonition type="info" icon="📘" title="说明">

对于受支持的添加和删除操作之外的 Schema 变更，请重新创建或迁移 Collection。

</Admonition>

## 向现有 Collection 添加字段\{#add-fields-to-an-existing-collection}

请根据字段值的生成方式选择添加字段的路径：

- 当需要用于过滤、查询输出或应用逻辑的新 Metadata 时，请参阅[添加用户自定义标量字段](./add-fields-to-an-existing-collection#add-user-defined-scalar-fields)。

- 当应用生成 Embedding 并将向量值写入 Zilliz Cloud 时，请参阅[添加用户自定义向量字段](./add-fields-to-an-existing-collection#add-user-defined-vector-fields)。

在这些场景中，字段总数不能超过 Zilliz Cloud 的字段数量限制。详情请参阅[使用限制](./limits)。

### 添加用户自定义标量字段\{#add-user-defined-scalar-fields}

使用 `add_collection_field()` 向现有 Collection 添加用户自定义标量字段。

这与在动态字段中存储任意 Key 不同：Schema 更新可用后，新标量字段会成为 Collection Schema 的常规组成部分。您可以向其中 Insert 或 Upsert 值，在受支持的情况下为其创建索引，在 Query 和 Search Filter 中使用它，并在 Query 或 Search 输出中返回它。

由于已有实体是在新字段存在之前插入的，因此每个新增的用户自定义标量字段都必须可为空：

- 如果添加标量字段时设置 `nullable=True` 且没有设置 `default_value`，已有实体会为新字段返回 `NULL`。

- 如果添加标量字段时设置 `nullable=True` 且设置了 `default_value`，已有实体会返回默认值，而不是 `NULL`。

标量过滤表达式不会匹配 `NULL` 标量值。详情请参阅 [Nullable 属性](./nullable-fields)。

**示例：添加可为空的标量字段**

以下示例向名为 `product_catalog` 的现有 Collection 添加可为空的 `source` 字段。

```python
from pymilvus import DataType, MilvusClient

client = MilvusClient(uri="YOUR_CLUSTER_ENDPOINT")

# highlight-start
client.add_collection_field(
    collection_name="product_catalog",
    field_name="source",
    data_type=DataType.VARCHAR,
    max_length=128,
    nullable=True,
)
# highlight-end
```

字段添加后，Collection 中已存在的实体会为 `source` 返回 `NULL`。新实体可以在 Insert 或 Upsert 时设置 `source`。

**示例：添加带默认值的标量字段**

如果已有实体应返回具体值而不是 `NULL`，请在添加字段时指定 `default_value`。以下示例添加 `review_status` 字段，并使用 `"unreviewed"` 作为默认值。

```python
from pymilvus import DataType, MilvusClient

client = MilvusClient(uri="YOUR_CLUSTER_ENDPOINT")

# highlight-start
client.add_collection_field(
    collection_name="product_catalog",
    field_name="review_status",
    data_type=DataType.VARCHAR,
    max_length=32,
    nullable=True,
    default_value="unreviewed",
)
# highlight-end
```

字段添加后，Collection 中已存在的实体会为 `review_status` 返回 `"unreviewed"`。新实体可以设置不同的值，也可以在未提供值时使用默认值。

### 添加用户自定义向量字段\{#add-user-defined-vector-fields}

当应用生成 Embedding 并将向量值写入 Zilliz Cloud 时，请使用 `add_collection_field()` 添加用户自定义向量字段。

每个新增的用户自定义向量字段都必须可为空。已有实体的新向量字段值为 `NULL`，直到您通过 Upsert 或 Backfill 工作流写入向量值。新实体可以在 Insert 时包含该向量字段。向量搜索会跳过向量值为 `NULL` 的实体。详情请参阅 [Nullable 属性](./nullable-fields)。

**示例：添加可为空的向量字段**

以下示例向现有 Collection 添加名为 `embedding_v2` 的可为空 Dense Vector 字段。请将 `dim` 设置为应用生成的 Embedding 维度。

```python
from pymilvus import DataType, MilvusClient

client = MilvusClient(uri="YOUR_CLUSTER_ENDPOINT")

# highlight-start
client.add_collection_field(
    collection_name="product_catalog",
    field_name="embedding_v2",
    data_type=DataType.FLOAT_VECTOR,
    dim=768,
    nullable=True,
)
# highlight-end
```

字段添加后，请先在新向量字段上创建索引，然后再搜索该字段：

```python
index_params = client.prepare_index_params()

index_params.add_index(
    field_name="embedding_v2",
    index_type="AUTOINDEX",
    metric_type="COSINE",
)

client.create_index(
    collection_name="product_catalog",
    index_params=index_params,
)
```

已有实体的 `embedding_v2` 为 `NULL`，在该字段上搜索时会被跳过。要让已有实体可通过 `embedding_v2` 搜索，请通过 Upsert 工作流写入非 `NULL` 向量值。新实体可以在 Insert 时包含 `embedding_v2`。

## **FAQ\{#faq}**

### **为什么新增的用户自定义字段必须可为空？\{#why-must-added-user-defined-fields-be-nullable}**

已有实体是在新字段存在之前插入的，因此这些实体没有该字段的值。设置 `nullable=True` 可让 Zilliz Cloud 将缺失值表示为 `NULL`，直到应用写入值，或者对于标量字段，直到默认值生效。

此规则适用于通过 `add_collection_field()` 添加的用户自定义标量字段和用户自定义向量字段。它不适用于由 Function 生成的向量字段，因为这类字段不能可为空。

### **添加用户自定义字段后，已有实体会怎样？\{#what-happens-to-existing-entities-after-i-add-a-user-defined-field}**

对于用户自定义标量字段，已有实体会返回 `NULL`，除非您设置了 `default_value`。如果设置了 `default_value`，已有实体会返回该默认值。

对于用户自定义向量字段，已有实体的新向量字段值为 `NULL`。在新增字段上执行向量搜索时，会跳过向量值为 `NULL` 的实体。要让已有实体可通过新向量字段搜索，请通过 Upsert 或 Backfill 工作流写入非 `NULL` 向量值。新实体可以在 Insert 时包含新向量字段。

### **修改 Collection Schema 后是否需要等待？\{#do-i-need-to-wait-after-altering-a-collection-schema}**

通常不需要手动等待。如果下一步操作依赖更新后的 Schema，可以先调用 `describe_collection()`，确认 Zilliz Cloud 当前返回的 Schema。

在分布式部署中，Zilliz Cloud 组件刷新 Collection Metadata 时，可能会有短暂的传播窗口。如果 Schema 变更后的立即操作因 Schema 相关错误失败，请刷新 Schema 并重试该操作。

### **如果添加的标量字段与 Dynamic Field Key 同名，会发生什么？\{#what-happens-if-i-add-a-scalar-field-with-the-same-name-as-a-dynamic-field-key}**

如果启用了 Dynamic Field，可以添加与现有 Dynamic Field Key 同名的标量字段。新标量字段会在常规查询输出中遮蔽 Dynamic Field Key，但原始动态数据会保留在 `$meta` 中。

例如，如果已有实体存储了名为 `source` 的 Dynamic Key，而之后又添加了名为 `source` 的标量字段，则 `source` 的常规输出指向该标量字段。要访问原始动态值，请使用 $meta path 语法，例如 `$meta["source"]`。