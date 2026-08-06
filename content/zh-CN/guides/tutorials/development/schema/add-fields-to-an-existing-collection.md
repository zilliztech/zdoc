---
title: "修改 Collection Schema | Cloud"
slug: /add-fields-to-an-existing-collection
sidebar_label: "修改 Collection Schema"
beta: FALSE
added_since: FALSE
last_modified: FALSE
deprecate_since: FALSE
notebook: FALSE
description: "随着 Collection 从开发阶段进入生产阶段，其 Schema 往往也会发生变化。您可能需要添加 `sourceuri` 或 `reviewstatus` 等标量字段，以用于过滤和应用逻辑；添加新的向量字段，以存储应用生成的 Embedding；添加 BM25 Function 及其生成的稀疏向量字段，以便对现有文本执行词法搜索；或者删除不再使用的字段和 Function。修改 Collection Schema 功能允许您就地完成受支持的字段和 Function 变更，无需重新创建 Collection。 | Cloud"
type: origin
token: JU6ZwfYLpilJ6vkncdzcLtFLnjf
sidebar_position: 18
displayed_sidebar: default

---

import Admonition from '@theme/Admonition';


# 修改 Collection Schema

随着 Collection 从开发阶段进入生产阶段，其 Schema 往往也会发生变化。您可能需要添加 `source_uri` 或 `review_status` 等标量字段，以用于过滤和应用逻辑；添加新的向量字段，以存储应用生成的 Embedding；添加 BM25 Function 及其生成的稀疏向量字段，以便对现有文本执行词法搜索；或者删除不再使用的字段和 Function。修改 Collection Schema 功能允许您就地完成受支持的字段和 Function 变更，无需重新创建 Collection。

<Admonition type="info" icon="📘" title="说明">

- 本指南介绍托管 Collection 中用户自定义字段，以及 Function 及其生成的向量字段的 Schema 变更。对于字段属性变更，例如修改 `max_length`（针对 `VARCHAR` 字段）或 `max_capacity`（针对 `ARRAY` 字段），请参阅[修改字段设置](./alter-collection-field)。对于动态字段行为，请参阅[动态字段](./enable-dynamic-field)和[修改 Collection](./modify-collections)。

- 本页介绍如何向托管 Collection 添加字段。若要向外部 Collection 添加字段，请参阅修改外部 Collection Schema。

</Admonition>

## 限制\{#}

**添加用户自定义字段**

- 新增的用户自定义字段必须可为空。请将 `nullable=True` 作为调用 `add_collection_field()` 时的设置。对于现有 Entity，新增字段的值为 `NULL`；但如果添加的是带有 `default_value` 的标量字段，则使用默认值。

- Milvus 2.6.x 及更高版本支持添加用户自定义标量字段。Milvus 2.6.18 及更高版本支持添加用户自定义向量字段。

- 字段名称在 Collection 的所有字段中必须唯一。

**添加 Function 及其生成的向量字段**

- 每次 Schema 更新只能添加一个 Function 和一个生成的向量字段。

- 受支持的 Function 决定生成的向量字段类型：`BM25` 生成 `SPARSE_FLOAT_VECTOR` 字段，`MINHASH` 生成 `BINARY_VECTOR` 字段。

- 生成的向量字段必须是新字段，不能指向 Collection Schema 中已有的字段。

- 生成的向量字段不能可为空。

- Function 使用的输入字段必须已存在于 Collection 中。对于此现有 Collection 工作流，BM25 和 MinHash 的输入字段必须是 `VARCHAR`。使用 `TEXT` 输入的 BM25 Function 必须在创建 Collection 时定义。

**删除用户自定义字段**

- 不能删除主键字段、Partition Key 字段、Clustering Key 字段或 Collection 中的最后一个向量字段。

- 可以删除整个 `ARRAY<STRUCT>` 字段，但不能删除 `ARRAY<STRUCT>` 字段中的单个子字段。

- 不能直接删除用作 Function 输入字段或由 Function 生成的输出字段。若要删除 Function 输出字段，请删除生成该字段的 Function。

**删除 Function 及其生成的向量字段**

- 在此 Schema 变更工作流中，删除 Function 会同时删除该 Function、其生成的向量字段以及关联索引。Function 的输入字段会保留在 Collection Schema 中。

- 如果删除 Function 生成的向量字段会导致 Collection 中不再包含任何向量字段，则删除操作会被拒绝。

<Admonition type="info" icon="📘" title="说明">

对于受支持的添加和删除操作之外的 Schema 变更，请重新创建或迁移 Collection。

</Admonition>

## 向现有 Collection 添加字段和 Function\{#collection-function}

请根据要添加的是用户自定义字段，还是生成向量字段的 Function 来选择工作流：

- [添加用户自定义标量字段](./add-fields-to-an-existing-collection)，适用于需要用于过滤、查询输出或应用逻辑的新 Metadata 的场景。

- [添加用户自定义向量字段](./add-fields-to-an-existing-collection)，适用于应用生成 Embedding，并将向量值写入 Zilliz Cloud 的场景。

- [添加 Function 及其生成的向量字段](./add-fields-to-an-existing-collection#function)，适用于需要由 Zilliz Cloud 根据现有字段生成向量值的场景，例如根据文本生成 BM25 稀疏向量或 MinHash 签名。

在这些情况下，字段总数不能超过 Zilliz Cloud 的字段数量限制。详情请参阅 [Zilliz Cloud 限制](./limits#fields)。

### 添加用户自定义标量字段\{#}

使用 `add_collection_field()` 向现有 Collection 添加用户自定义标量字段。

这与在动态字段中存储任意键不同：Schema 更新生效后，新的标量字段会成为 Collection Schema 的常规组成部分。您可以在 Insert 或 Upsert 时为其写入值；在支持的情况下为其创建索引；在 Query 和 Search 过滤表达式中使用该字段；以及在 Query 或 Search 结果中返回该字段。

由于现有 Entity 是在新字段存在之前插入的，因此新增的每个用户自定义标量字段都必须可为空：

- 如果添加标量字段时设置 `nullable=True`，但不设置 `default_value`，则现有 Entity 的新字段返回 `NULL`。

- 如果添加标量字段时设置 `nullable=True` 和 `default_value`，则现有 Entity 返回默认值，而不是 `NULL`。

标量过滤表达式不会匹配值为 `NULL` 的标量字段。详情请参阅[可空字段](./nullable-fields)。

**示例：添加可空标量字段**

以下示例向名为 `product_catalog` 的现有 Collection 添加一个可空的 `source` 字段。

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

字段添加后，Collection 中原有 Entity 的 `source` 返回 `NULL`。新 Entity 可以在 Insert 或 Upsert 时设置 `source`。

**示例：添加带默认值的标量字段**

如果希望现有 Entity 返回具体值而不是 `NULL`，请在添加字段时指定 `default_value`。以下示例添加 `review_status` 字段，并使用 `&quot;unreviewed&quot;` 作为默认值。

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

字段添加后，Collection 中原有 Entity 的 `review_status` 返回 `&quot;unreviewed&quot;`。新 Entity 可以设置其他值；如果未提供值，则使用默认值。

### 添加 StructArray 字段\{#structarray}

使用 `add_collection_struct_field()` 添加可接收 Struct 数组的 StructArray 字段。添加 StructArray 字段的步骤如下：

1. 创建一个 StructSchema，其中包含所需且数据类型受支持的子字段。适用的数据类型请参阅数据类型支持。

1. 引用上一步创建的 StructSchema，并在 `add_collection_struct_field()` 中设置字段的最大容量。

1. 在请求中将 `nullable` 设置为 `True`。

**示例：添加可空 StructArray 字段**

```python
from pymilvus import DataType, MilvusClient

client = MilvusClient(uri="YOUR_CLUSTER_ENDPOINT")

# Create a struct schema
struct_schema = client.create_struct_field_schema()

# add a scalar field to the struct
struct_schema.add_field("text", DataType.VARCHAR, max_length=65535)
struct_schema.add_field("chapter", DataType.VARCHAR, max_length=512)

# add a vector field to the struct with mmap enabled
struct_schema.add_field("text_vector", DataType.FLOAT_VECTOR, mmap_enabled=True, dim=5)
struct_schema.add_field("chapter_vector", DataType.FLOAT_VECTOR, mmap_enabled=True, dim=5)

# highlight-start
client.add_collection_struct_field(
    collection_name="books",
    field_name="chunks",
    struct_schema=struct_schema,
    max_capacity=1024,
    nullable=True
)
# highlight-end
```

添加 StructArray 字段后，Collection 中原有 Entity 的 `chunks` 及其所有子字段均返回 null。插入新 Entity 时，请确保所有子字段要么均为 null，要么均具有有效值。如果部分子字段设置为 null，而其他子字段具有有效值，插入操作会报错。

### 添加用户自定义向量字段\{#}

当应用生成 Embedding，并将向量值写入 Zilliz Cloud 时，使用 `add_collection_field()` 添加用户自定义向量字段。

新增的每个用户自定义向量字段都必须可为空。在通过 Upsert 或回填工作流写入向量值之前，现有 Entity 的新向量字段值为 `NULL`。新 Entity 可以在 Insert 时包含该向量字段。向量搜索会跳过向量值为 `NULL` 的 Entity。详情请参阅[可空字段](./nullable-fields)。

**示例：添加可空向量字段**

以下示例向现有 Collection 添加一个名为 `embedding_v2` 的可空稠密向量字段。请将 `dim` 设置为应用所生成 Embedding 的维度。

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

添加字段后，请先为新的向量字段创建索引，再使用该字段执行搜索：

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

现有 Entity 的 `embedding_v2` 值为 `NULL`，因此在该字段上搜索时会被跳过。若要让现有 Entity 可通过 `embedding_v2` 搜索，请通过 Upsert 工作流写入非 NULL 向量值。新 Entity 可以在 Insert 时包含 `embedding_v2`。

### 添加 Function 及其生成的向量字段\{#function}

此 Milvus 3.0 Schema 变更工作流目前仅针对 Zilliz Cloud 按量付费 Cluster 提供文档说明。本页不界定首个受支持的 Cloud 补丁版本，也不说明 Serving Cluster 的可用性。

使用此工作流可根据现有 Collection 中已经存储的数据生成新的向量字段。例如，BM25 Function 读取现有 `VARCHAR` 字段，并生成用于词法搜索的 `SPARSE_FLOAT_VECTOR` 字段；MinHash Function 则生成用于近似重复检测的 `BINARY_VECTOR` 字段。此工作流不会添加或替换 Function 的输入字段。

该操作会添加一个 Function 定义、一个新的向量输出字段和一个绑定的索引定义：

- 一个 Function 定义（例如 `text_bm25`），用于读取现有输入字段。

- 一个新的向量输出字段（例如 `text_sparse`），用于存储 Function 输出，以及绑定到该字段的索引定义。

受支持的 Function 决定生成的向量字段类型：

| **Function** | **生成的向量字段类型** | **典型输入字段** |
| --- | --- | --- |
| `BM25` | `SPARSE_FLOAT_VECTOR` | 启用了 Analyzer 的 `VARCHAR` 字段 |
| `MINHASH` | `BINARY_VECTOR` | 一个 `VARCHAR` 字段 |

有关每种 Function 工作方式的详情，请参阅 [BM25 Function](./bm25-function) 和 [MinHash Function](./minhash-function)。

生成的向量字段不能已经存在于 Collection 中，也不能可为空。Function 输入字段必须已经存在。对于此现有 Collection 工作流，请使用 `VARCHAR` 输入字段。使用 `TEXT` 输入字段的 BM25 Function 必须在创建 Collection 时定义；否则，请重新创建或迁移 Collection，并在其 Schema 中包含该 Function。

**示例：添加 BM25 Function 及其生成的稀疏向量字段**

以下示例向现有 Collection 添加名为 `text_bm25` 的 BM25 Function，以及名为 `text_sparse` 的生成稀疏向量字段。该 Collection 必须已经包含一个名为 `text` 且启用了 Analyzer 的 `VARCHAR` 字段。

```python
from pymilvus import DataType, Function, FunctionType, MilvusClient

client = MilvusClient(uri="YOUR_CLUSTER_ENDPOINT")

sparse_field = client.create_field_schema(
    name="text_sparse",
    data_type=DataType.SPARSE_FLOAT_VECTOR,
    desc="BM25-generated sparse vector field",
)

bm25_function = Function(
    name="text_bm25",
    input_field_names=["text"],
    output_field_names=["text_sparse"],
    function_type=FunctionType.BM25,
)

index_params = client.prepare_index_params()

index_params.add_index(
    field_name="text_sparse",
    index_type="SPARSE_INVERTED_INDEX",
    metric_type="BM25",
    params={
        "inverted_index_algo": "DAAT_MAXSCORE",
        "bm25_k1": 1.2,
        "bm25_b": 0.75,
    },
)

# highlight-start
client.add_function_field(
    collection_name="product_catalog",
    field_schema=sparse_field,
    func=bm25_function,
    index_params=index_params,
)
# highlight-end
```

`index_params` 对象必须只包含一个针对新 Function 输出字段的索引定义。Function、其生成的向量字段和绑定的索引定义会在同一次 Schema 变更中提交。调用 `add_function_field()` 后，请勿再单独调用 `create_index()`。

从概念上看，该操作会添加以下 Function、生成的输出字段和绑定的索引定义：

```plaintext
New Function:
  name: "text_bm25"
  type: BM25
  input_field_names: ["text"]
  output_field_names: ["text_sparse"]

New generated output field:
  name: "text_sparse"
  data_type: SPARSE_FLOAT_VECTOR
  nullable: false

Bound index:
  field_name: "text_sparse"
  index_type: SPARSE_INVERTED_INDEX
  metric_type: BM25
```

请求成功后，`describe_collection()` 会在 Collection Schema 中同时返回新的 `text_bm25` Function 和其生成的 `text_sparse` 向量字段。完整的 BM25 Search 工作流请参阅[全文搜索](./full-text-search)。

MinHash Function 及其生成的二进制向量字段支持近似重复检测。MinHash Function 使用 `FunctionType.MINHASH`，并写入新的 `BINARY_VECTOR` 输出字段。配置详情请参阅 [MinHash Function](./minhash-function)。

## 从现有 Collection 中删除字段和 Function\{#collection-function}

当用户自定义字段不再属于 Collection 模型时，可以直接将其删除。若要删除 Function 及其生成的向量字段，请删除该 Function；生成的字段及其索引会在同一次 Schema 变更中一并删除。

### 删除用户自定义字段\{#}

使用 `drop_collection_field()` 删除不再属于 Collection 模型的用户自定义标量字段或向量字段。

删除字段会先改变 Collection Schema 和字段可见性：

- 在 `drop_collection_field()` 成功后，Collection Schema 会更新：`describe_collection()` 不再返回已删除字段，Query 或 Search 也无法再通过 `output_fields` 返回该字段或在表达式中使用该字段。

- 基于已删除字段构建的索引会作为 Schema 更新的一部分被清理。

存储清理与 Schema 清理是分开处理的。详情请参阅删除字段后何时回收存储空间？

**示例：删除用户自定义标量字段**

以下示例假设 `experiment_tag` 是 `product_catalog` 中的用户自定义标量字段，并将其从 Collection 中删除。

```python
from pymilvus import MilvusClient

client = MilvusClient(uri="YOUR_CLUSTER_ENDPOINT")

# highlight-start
client.drop_collection_field(
    collection_name="product_catalog",
    field_name="experiment_tag",
)
# highlight-end
```

删除字段后，可以调用 `describe_collection()` 验证该字段已不再属于 Schema。

**示例：删除 StructArray 字段**

以下示例假设 `chunks` 字段是 `my_collection` 中的 StructArray 字段，并将其从 Collection 中删除。

```python
from pymilvus import MilvusClient

client = MilvusClient(uri="YOUR_CLUSTER_ENDPOINT")

# highlight-start
client.drop_collection_field(
    collection_name="my_collection",
    field_name="chunks",
)
# highlight-end
```

**示例：删除用户自定义向量字段**

可以使用相同的 `drop_collection_field()` 方法删除向量字段，但删除后 Collection 中必须仍保留至少一个向量字段。对于暂时包含多种向量表示、之后再统一为其中一种表示的 Collection，此操作非常有用。

以下示例假设 `image_vector` 是 `hybrid_catalog` 中的用户自定义向量字段，并且该 Collection 仍保留另一个向量字段，例如 `text_vector`。

```python
from pymilvus import MilvusClient

client = MilvusClient(uri="YOUR_CLUSTER_ENDPOINT")

# highlight-start
client.drop_collection_field(
    collection_name="hybrid_catalog",
    field_name="image_vector",
)
# highlight-end
```

如果 `image_vector` 是 Collection 中的最后一个向量字段，删除操作会被拒绝。

### 删除 Function 及其生成的向量字段\{#function}

当不再需要某个 Function 或其生成的向量字段时，请使用此操作，例如删除 BM25 Function 及其生成的稀疏向量字段。

使用 Function 名称调用 `drop_function_field()`。该操作会删除 Function、其生成的向量字段和关联索引，同时保留 Function 的输入字段。

**示例：删除 BM25 Function 及其生成的稀疏向量字段**

以下示例假设 `text_bm25` 是 `product_catalog` 中的 BM25 Function，并生成名为 `text_sparse` 的稀疏向量输出字段。

```python
from pymilvus import MilvusClient

client = MilvusClient(uri="YOUR_CLUSTER_ENDPOINT")

# highlight-start
client.drop_function_field(
    collection_name="product_catalog",
    function_name="text_bm25",
)
# highlight-end
```

操作成功后，`describe_collection()` 不再返回已删除的 Function 或其生成的向量字段。Function 的输入字段仍保留在 Schema 中。

如果删除 Function 输出字段会导致 Collection 中不再包含任何向量字段，则该操作会被拒绝。

## 常见问题\{#}

### 应该使用哪种方法添加字段或 Function？\{#function}

当应用提供用于过滤、查询输出或应用逻辑的标量值时，使用 `add_collection_field()` 添加用户自定义标量字段。

当应用生成 Embedding，并将向量值写入 Zilliz Cloud 时，使用 `add_collection_field()` 添加用户自定义向量字段。

当需要根据现有字段生成向量值时，使用 `add_function_field()`。该方法会在同一次 Schema 变更中添加 Function、其生成的向量字段和绑定的索引定义。本指南展示用于词法搜索的 BM25 路径；MinHash Function 则生成用于近似重复检测的二进制向量字段。

### 为什么新增的用户自定义字段必须可为空？\{#}

现有 Entity 是在新字段存在之前插入的，因此没有该字段的值。设置 `nullable=True` 后，在应用写入值之前，或者对于标量字段，在默认值生效之前，Zilliz Cloud 可以使用 `NULL` 表示缺失值。

此规则适用于通过 `add_collection_field()` 添加的用户自定义标量字段和用户自定义向量字段，但不适用于 Function 生成的向量字段，因为该字段不能可为空。

### 添加用户自定义字段后，现有 Entity 会发生什么变化？\{#entity}

对于用户自定义标量字段，除非设置 `default_value`，否则现有 Entity 返回 `NULL`。如果设置了 `default_value`，现有 Entity 会返回该默认值。

对于用户自定义向量字段，现有 Entity 的新向量字段值为 `NULL`。在新增字段上执行向量搜索时，会跳过向量值为 `NULL` 的 Entity。若要让现有 Entity 可通过新向量字段搜索，请通过 Upsert 或回填工作流写入非 NULL 向量值。新 Entity 可以在 Insert 时包含该向量字段。

### 可以向现有 Collection 添加 BM25 Function 及其生成的稀疏向量字段吗？\{#collection-bm25-function}

可以。如果 Collection 已经包含启用了 Analyzer 的 `VARCHAR` 字段，则可以添加 BM25 Function 及其生成的稀疏向量字段，用于词法搜索。该操作会在同一次 Schema 变更中添加 Function、新的 `SPARSE_FLOAT_VECTOR` 输出字段和绑定的索引定义。在此 Schema 变更工作流中，不能使用现有 `TEXT` 字段作为 BM25 输入。若要使用 `TEXT`，请在创建 Collection 时定义该字段和 BM25 Function；否则，请重新创建或迁移 Collection，并在其 Schema 中包含该 Function。

调用 `add_function_field()` 时，请提供一个 `index_params` 对象，其中针对新的输出字段包含一个指标类型为 `metric_type=&quot;BM25&quot;` 的 `SPARSE_INVERTED_INDEX` 索引。该索引定义会作为同一次 Schema 变更的一部分绑定到生成字段。

### 如何删除 Function 及其生成的向量字段？\{#function}

使用 Function 名称调用 `drop_function_field()`。该操作会一并删除 Function、其生成的向量字段和关联索引，同时保留 Function 的输入字段。

### 修改 Collection Schema 后需要等待吗？\{#collection-schema}

通常无需手动等待。如果后续操作依赖更新后的 Schema，可以先调用 `describe_collection()`，确认 Zilliz Cloud 当前返回的 Schema。

在分布式部署中，Zilliz Cloud 各组件刷新 Collection Metadata 时，可能存在短暂的传播窗口。如果 Schema 变更后的操作立即因 Schema 相关错误而失败，请刷新 Schema 并重试该操作。

### 删除字段后何时回收存储空间？\{#}

删除字段会将其从当前 Schema 以及常规 Query/Search 的可见范围中移除，但对象存储中该字段的历史数据不会立即被物理删除。

之后可通过 Compaction 回收存储空间。Compaction 是一种后台过程，用于将现有数据文件重新组织为更紧凑的新文件。字段删除后，新生成的 Compaction 文件会遵循当前 Schema，并省略已删除字段。Zilliz Cloud 不保证删除字段后会立即回收存储空间，也不保证在固定时间内减少存储占用。

### 如果添加与动态字段键同名的标量字段，会发生什么？\{#}

如果启用了动态字段，可以添加与现有动态字段键同名的标量字段。在常规 Query 输出中，新标量字段会遮蔽该动态字段键，但原始动态数据仍保留在 `$meta` 中。

例如，如果现有 Entity 存储了名为 `source` 的动态键，之后又添加了名为 `source` 的标量字段，则常规输出中的 `source` 指向该标量字段。若要访问原始动态值，请使用 `$meta[&quot;source&quot;]` 等 $meta 路径语法。