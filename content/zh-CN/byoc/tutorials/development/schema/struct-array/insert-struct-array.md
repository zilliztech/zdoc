---
title: "向 StructArray Field 插入数据 | BYOC"
slug: /insert-struct-array
sidebar_label: "向 StructArray Field 插入数据"
beta: PUBLIC
added_since: FALSE
last_modified: FALSE
deprecate_since: FALSE
notebook: FALSE
description: "当每个 Entity 包含有序的结构化元素列表时，可以向 StructArray Field 插入数据。在 insert payload 中，StructArray Field 表示为对象数组。每个对象表示一个 Struct 元素，并使用 Collection Schema 中定义的 Struct subfield 名称。 | BYOC"
type: origin
token: SPMqwISYJiwJuMkxRbecyyw8nee
sidebar_position: 4
displayed_sidebar: default

---

import Admonition from '@theme/Admonition';


# 向 StructArray Field 插入数据

当每个 Entity 包含有序的结构化元素列表时，可以向 StructArray Field 插入数据。在 insert payload 中，StructArray Field 表示为对象数组。每个对象表示一个 Struct 元素，并使用 Collection Schema 中定义的 Struct subfield 名称。

本文使用 [创建 StructArray Field](./create-struct-array) 中的 `tech_articles` Collection。每个 Entity 是一篇技术文章，`chunks` Field 将文章片段存为 Struct 元素。

## 开始之前 \{#before-you-begin}

确保 Collection Schema 已包含 `chunks` StructArray Field。

| Field | 类型 | 插入值 |
| --- | --- | --- |
| `doc_id` | `INT64` | 文章 ID。 |
| `title` | `VARCHAR` | 文章标题。 |
| `category` | `VARCHAR` | 文章分类。 |
| `title_vector` | `FLOAT_VECTOR` | 文章级 embedding。 |
| `chunks` | `ARRAY<STRUCT>` | 片段对象列表。 |

`chunks` 中的每个对象都必须遵循 Struct Schema。

| Subfield | 类型 | 插入值 |
| --- | --- | --- |
| `text` | `VARCHAR` | 片段文本。 |
| `section` | `VARCHAR` | 章节名称，例如 `index`、`search` 或 `filter`。 |
| `page` | `INT64` | 页码或逻辑位置。 |
| `quality_score` | `FLOAT` | 片段级评分。 |
| `has_code` | `BOOL` | 片段是否包含代码。 |
| `emb_list_vector` | `FLOAT_VECTOR` | 为 EmbeddingList Search 写入的 Vector。 |
| `emb` | `FLOAT_VECTOR` | 为 Element-level Search 写入的 Vector。 |

<Admonition type="info" icon="📘" title="说明">

在 insert payload 中，`chunks` 是一个常规 Field，其值是 Struct 对象数组。每个对象内部使用 `text` 和 `emb` 等 subfield 名称。只有在插入之后，当你创建 Index、运行 Search、构建 Filter 或指定 Output Field 时，才使用 `chunks[text]` 或 `chunks[emb]` 这样的路径语法。

</Admonition>

## 理解 insert payload 结构 \{#understand-the-insert-payload-shape}

`chunks` value 是 Struct 元素数组。每个元素都是一个对象，其 key 为 subfield 名称。

```json
{
  "doc_id": 1,
  "title": "StructArray indexing patterns",
  "category": "index",
  "title_vector": [0.12, 0.08, 0.32, 0.48],
  "chunks": [
    {
      "text": "Create one index for each vector subfield.",
      "section": "index",
      "page": 1,
      "quality_score": 0.96,
      "has_code": false,
      "emb_list_vector": [0.10, 0.20, 0.30, 0.40],
      "emb": [0.10, 0.20, 0.30, 0.40]
    },
    {
      "text": "Use MAX_SIM metrics for EmbeddingList search.",
      "section": "index",
      "page": 2,
      "quality_score": 0.91,
      "has_code": true,
      "emb_list_vector": [0.16, 0.24, 0.35, 0.45],
      "emb": [0.16, 0.24, 0.35, 0.45]
    }
  ]
}
```

`emb_list_vector` 和 `emb` 是独立的 Vector subfield，因为它们支持不同的搜索模式。EmbeddingList Search 会将 StructArray Field 中的所有 Vector 视为一个 EmbeddingList，并使用 `MAX_SIM*` metric 返回 Entity 级结果。Element-level Search 会独立搜索每个 Struct 元素，并且可以返回匹配元素的偏移量。为了简化示例，这里两个 Field 存储相同的 Vector 值。在生产应用中，如果两种搜索模式使用同一个片段 embedding，可以把相同 embedding 存入两个 subfield；如果两种搜索模式使用不同表示，则可以存入不同 embedding。

## 插入行 \{#insert-rows}

使用 `client.insert()` 插入包含 StructArray value 的行。

```python
from pymilvus import MilvusClient

client = MilvusClient(
    uri="YOUR_CLUSTER_ENDPOINT",
    token="YOUR_CLUSTER_TOKEN",
)

data = [
    {
        "doc_id": 1,
        "title": "StructArray indexing patterns",
        "category": "index",
        "title_vector": [0.12, 0.08, 0.32, 0.48],
        "chunks": [
            {
                "text": "Create one index for each vector subfield.",
                "section": "index",
                "page": 1,
                "quality_score": 0.96,
                "has_code": False,
                "emb_list_vector": [0.10, 0.20, 0.30, 0.40],
                "emb": [0.10, 0.20, 0.30, 0.40],
            },
            {
                "text": "Use MAX_SIM metrics for EmbeddingList search.",
                "section": "index",
                "page": 2,
                "quality_score": 0.91,
                "has_code": True,
                "emb_list_vector": [0.16, 0.24, 0.35, 0.45],
                "emb": [0.16, 0.24, 0.35, 0.45],
            },
        ],
    },
    {
        "doc_id": 2,
        "title": "Filtered StructArray search",
        "category": "filter",
        "title_vector": [0.20, 0.18, 0.22, 0.40],
        "chunks": [
            {
                "text": "Use element_filter to match scalar conditions within the same Struct element.",
                "section": "filter",
                "page": 1,
                "quality_score": 0.93,
                "has_code": True,
                "emb_list_vector": [0.21, 0.18, 0.33, 0.44],
                "emb": [0.21, 0.18, 0.33, 0.44],
            },
            {
                "text": "MATCH_LEAST checks how many elements satisfy a predicate.",
                "section": "filter",
                "page": 2,
                "quality_score": 0.88,
                "has_code": False,
                "emb_list_vector": [0.24, 0.22, 0.31, 0.39],
                "emb": [0.24, 0.22, 0.31, 0.39],
            },
        ],
    },
    {
        "doc_id": 3,
        "title": "Element-level search with offsets",
        "category": "search",
        "title_vector": [0.33, 0.11, 0.29, 0.37],
        "chunks": [
            {
                "text": "Element-level search can return the offset of the matched Struct element.",
                "section": "search",
                "page": 1,
                "quality_score": 0.95,
                "has_code": False,
                "emb_list_vector": [0.32, 0.14, 0.28, 0.41],
                "emb": [0.32, 0.14, 0.28, 0.41],
            }
        ],
    },
]

result = client.insert(
    collection_name="tech_articles",
    data=data,
)

print(result)
```

## 向 Nullable StructArray Field 插入数据 \{#insert-into-nullable-structarray-fields}

如果 `chunks` Field 是 Nullable，Entity 可以将整个 `chunks` Field 设置为 null。在 Python 中，使用 `None` 表示 null value。

```python
client.insert(
    collection_name="tech_articles",
    data=[
        {
            "doc_id": 10,
            "title": "Article without chunks yet",
            "category": "draft",
            "title_vector": [0.05, 0.10, 0.15, 0.20],
            "chunks": None,
        }
    ],
)
```

当 Nullable StructArray Field 包含有效的 StructArray value 时，该 value 中的所有 subfield 应同时为 null 或同时具有有效值。如果部分 subfield 为 null 而其他 subfield 为有效值，会导致错误。

<Admonition type="warning" icon="🚧" title="警告">

Nullable StructArray Field 仅在 clusters compatible with Milvus v3.0.x 中可用。如果你动态向现有 Collection 添加 StructArray Field，则新增 Field 必须是 Nullable，已有 Entity 会在新 Field 的所有 subfield 上返回 `null`。

</Admonition>

## 验证已插入的数据 \{#validate-inserted-data}

你可以 Query Collection，并返回 StructArray Field 或选定 subfield。

```python
rows = client.query(
    collection_name="tech_articles",
    filter="doc_id in [1, 2, 3]",
    output_fields=[
        "doc_id",
        "title",
        "chunks[text]",
        "chunks[section]",
        "chunks[quality_score]",
    ],
)

for row in rows:
    print(row)
```

只有在 Query、Search、Filter 或创建 Index 时才使用 `chunks[text]` 等 StructArray Field path。Insert payload 仍应在 `chunks` 下使用嵌套对象。

## 插入规则 \{#insert-rules}

| 规则 | 说明 |
| --- | --- |
| 对 StructArray Field 使用对象数组。 | `chunks` 的值是列表，列表中的每一项都是 Struct 元素。 |
| 在每个 Struct 元素内部使用 subfield 名称。 | 在 `chunks` 内插入 `{"text": "...", "emb": [...]}`，不要插入 `{"chunks[text]": "..."}`。 |
| 匹配 Struct Schema。 | 每个 Struct 元素都必须使用 Struct Schema 中定义的 subfield。 |
| 匹配 Vector dimension。 | Vector 值必须匹配对应 Vector subfield 配置的 `dim`。 |
| 遵守 `max_capacity`。 | 一个 Entity 中 Struct 元素数量不能超过 StructArray Field 的 `max_capacity`。 |
| 为不同搜索模式使用独立 Vector subfield。 | 如果同时需要 EmbeddingList Search 和 Element-level Search，请将 Vector 值写入两个 Vector subfield。 |
| 仅在 Field 为 Nullable 时使用 `null`。 | Non-nullable StructArray Field 要求提供有效的 StructArray value。 |

## 常见错误 \{#common-mistakes}

- 在 insert payload 中使用 `chunks[text]` 等 Field path。

- 在 Struct 元素中遗漏必需 subfield。

- 插入 dimension 错误的 Vector。

- 插入超过 `max_capacity` 允许数量的 Struct 元素。

- 只将一个 subfield 设置为 `null`，而同一个 StructArray value 中其他 subfield 具有有效值。

- 只向 `emb_list_vector` 写入 Vector，然后尝试在 `chunks[emb]` 上运行 Element-level Search。

- 只向 `emb` 写入 Vector，然后尝试在 `chunks[emb_list_vector]` 上运行 EmbeddingList Search。

## 下一步 \{#next-steps}

1. 要为 `chunks[emb_list_vector]`、`chunks[emb]` 和 Scalar subfield 创建 Index，请阅读 [为 StructArray Field 创建 Index](./index-struct-array)。

1. 要搜索 StructArray Vector subfield，请阅读 [使用 StructArray 进行基础向量搜索](./search-with-struct-array)。

1. 要查看 Nullable 行为和特定版本限制，请阅读 [StructArray 限制](./struct-array-limits)。

