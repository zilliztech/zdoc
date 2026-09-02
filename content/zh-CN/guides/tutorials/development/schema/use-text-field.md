---
title: "Text 类型 | Cloud"
slug: /use-text-field
sidebar_label: "Text 类型"
beta: FALSE
added_since: FALSE
last_modified: FALSE
deprecate_since: FALSE
notebook: FALSE
description: "在 AI 搜索应用中，向量搜索可帮助您找到语义相似的 Entity，但应用通常还需要获取每个匹配项背后的原始文本。LLM 或 Agent 可将这些文本用作上下文，以便读取、引用、总结结果，或将结果加入 Prompt。 | Cloud"
type: origin
token: QD5jwHBpaiZECQkWZs3ciYemnHb
sidebar_position: 7
displayed_sidebar: default

---

import Admonition from '@theme/Admonition';


# Text 类型

在 AI 搜索应用中，向量搜索可帮助您找到语义相似的 Entity，但应用通常还需要获取每个匹配项背后的原始文本。LLM 或 Agent 可将这些文本用作上下文，以便读取、引用、总结结果，或将结果加入 Prompt。

Zilliz Cloud 提供 `TEXT` 标量字段类型，用于随 Entity 直接存储较长的源文本。典型值包括段落、长文档、文章正文、工单和日志。与需要固定 `max_length` 的 `VARCHAR` 不同，`TEXT` 无需在 Collection Schema 中设置最大字节长度。

要在 Collection Schema 中定义 `TEXT` 字段，请将 `datatype` 设置为 `DataType.TEXT`。

```python
schema.add_field(
    field_name="content",
    # highlight-next-line
    datatype=DataType.TEXT,
)
```

定义字段后，每个 Entity 都可以在该字段中包含字符串值。您可以像插入其他标量字段一样插入该值，并通过在 `output_fields` 中列出该字段，从 Query 或 Search 结果中返回它。

<Admonition type="info" icon="📘" title="说明">

TEXT 字段支持空值。要启用此功能，请将 nullable 设置为 True。详情请参阅[Nullable 属性](./nullable-fields)。

</Admonition>

## 限制\{#limits}

- 一个 `TEXT` 字段不能用作主字段。主字段支持 `INT64` 和 `VARCHAR`。

- `TEXT` 字段不支持 `PHRASE_MATCH`。

- `TEXT` 字段不支持默认值。

- `TEXT` 字段不支持标量索引。

- `TEXT` 不适用于常规元数据过滤。如果您需要过滤短字符串元数据，且字段值未超过 `VARCHAR` 长度限制，请使用 `VARCHAR`。

- `TEXT` 字段不支持外部 Collection。

## 选择 TEXT 还是 VARCHAR\{#choose-text-or-varchar}

`TEXT` 和 `VARCHAR` 都用于存储字符串值，但适用于不同的应用需求。对于用于标识、分类或过滤 Entity 的短小且长度有界的元数据，请使用 `VARCHAR`。对于可为 LLM 或 Agent 提供足够上下文以读取、引用、总结或构建 Prompt 的较长源内容，请使用 `TEXT`。

| **对比项** | **VARCHAR** | **TEXT** |
| --- | --- | --- |
| 适用场景 | 用于标识、分类或过滤 Entity 的短元数据，例如 `title`、`tag`、`category`、`external_id`。 | LLM 或 Agent 工作流使用的较长源内容，例如 `content`、`passage`、`article_body`、`log_message`。 |
| 长度设置 | 必须设置 `max_length`，用于定义字段可存储的最大字节数。最大值为 65,535 字节。如果值可能超过此限制，请使用 `TEXT`。 | 无需设置 `max_length`，因此 Schema 无需为文本值设置固定的字节上限。 |
| 存储行为 | 每个值都存储在字段配置的 `max_length` 范围内。 | 对较大的文本值自动选择存储方式。。 |
| 主字段支持 | 可用作主字段。 | 不能用作主字段。 |
| 过滤 | 适用于需要出现在过滤表达式中的短字符串元数据，例如 `category == "news"` 或 `tag in ["ai", "database"]`。 | 不适用于常规元数据过滤。 |

有关 `VARCHAR` 字段的详细信息，请参阅 [VARCHAR 类型](./use-string-field)。

`TEXT` 的常见用途之一是基于 BM25 的全文搜索。在此模式下，`TEXT` 字段存储原始源内容，BM25 分析文本并生成稀疏向量，用于对基于关键词的匹配结果进行排序。随后，Search 结果可返回匹配的 `TEXT` 值，作为 LLM 或 Agent 工作流的上下文。以下示例展示如何将 `TEXT` 字段用作 BM25 的输入字段。如需了解全文搜索的概念和 Query 选项，请参阅[全文搜索](./full-text-search)。

## 步骤 1：创建包含 TEXT 字段的 Collection\{#step 1-create-a-collection-with-a-text-field}

以下示例创建一个 Collection，其中包含用于存储源内容的 `TEXT` 字段，以及用于存储 BM25 生成的稀疏向量的稀疏向量字段。BM25 Function 将 `content` 中经过分词的文本转换为稀疏向量，并存储在 `sparse` 中。

对于 BM25 全文搜索，输入 `TEXT` 字段必须设置 `enable_analyzer=True`。

```python
from pymilvus import DataType, Function, FunctionType, MilvusClient

client = MilvusClient(uri="YOUR_CLUSTER_ENDPOINT")
COLLECTION_NAME = "text_bm25_collection"

if client.has_collection(COLLECTION_NAME):
    client.drop_collection(COLLECTION_NAME)

schema = client.create_schema(auto_id=False, enable_dynamic_field=False)
schema.add_field(field_name="id", datatype=DataType.INT64, is_primary=True)
# highlight-start
schema.add_field(
    field_name="content",
    datatype=DataType.TEXT,
    enable_analyzer=True,
)
# highlight-end
schema.add_field(field_name="sparse", datatype=DataType.SPARSE_FLOAT_VECTOR)

# highlight-start
bm25_function = Function(
    name="content_bm25",
    input_field_names=["content"],
    output_field_names=["sparse"],
    function_type=FunctionType.BM25,
)
schema.add_function(bm25_function)
# highlight-end
```

## 步骤 2：创建稀疏向量索引\{#step-2-create-a-sparse-vector-index}

为 BM25 Function 生成的稀疏向量字段创建索引。Metric Type 必须设置为 `BM25`。

```python
index_params = client.prepare_index_params()
# highlight-start
index_params.add_index(
    field_name="sparse",
    index_type="SPARSE_INVERTED_INDEX",
    metric_type="BM25",
    params={
        "inverted_index_algo": "DAAT_MAXSCORE",
        "bm25_k1": 1.2,
        "bm25_b": 0.75,
    },
)
# highlight-end

client.create_collection(
    collection_name=COLLECTION_NAME,
    schema=schema,
    index_params=index_params,
)
```

## 步骤 3：插入 TEXT 数据\{#step-3-insert-text-data}

直接向 `TEXT` 字段插入文本。不要为 `sparse` 字段提供值。Milvus 会在内部对 `content` 应用 BM25 Function 以生成稀疏向量。

```python
data = [
    {
        "id": 1,
        "content": "Milvus stores vector embeddings and scalar fields in collections. It supports vector search, full text search, and metadata filtering for retrieval applications.",
    },
    {
        "id": 2,
        "content": "Long documents are often split into passages before embedding. Store each passage in a TEXT field so search results can return the source text.",
    },
    {
        "id": 3,
        "content": "Operational logs and support tickets often contain long natural-language text. TEXT fields can store these values without a fixed max_length setting.",
    },
]

client.insert(collection_name=COLLECTION_NAME, data=data)
client.load_collection(collection_name=COLLECTION_NAME)
```

## 步骤 4：执行 BM25 全文搜索\{#step-4-perform-bm25-full-text-search}

使用原始 Query 文本作为 Search 数据，并在稀疏向量字段上执行搜索。Milvus 将 Query 文本转换为稀疏向量，使用 BM25 对匹配结果排序，并返回 `output_fields` 中请求的 `TEXT` 字段。

```python
results = client.search(
    collection_name=COLLECTION_NAME,
    # highlight-start
    data=["how does Milvus store source text for retrieval"],
    anns_field="sparse",
    limit=2,
    output_fields=["content"],
    # highlight-end
)
```

## 步骤 5：读取返回的 TEXT 值\{#step-5-read-the-returned-text-values}

每个 Search 命中都包含 BM25 分数和原始 `TEXT` 值。

```python
for hit in results[0]:
    print(f"id: {hit['id']}, score: {hit['distance']}")
    print(hit["entity"]["content"])
```

有关 BM25 Function、稀疏向量索引和全文搜索 Query 语法的更多信息，请参阅[全文搜索](./full-text-search)。