---
title: "SemanticHighlighter | Python | MilvusClient"
slug: /python/python/Highlighter-SemanticHighlighter
sidebar_label: "SemanticHighlighter"
beta: false
added_since: v2.6.x
last_modified: false
deprecate_since: false
notebook: false
description: "SemanticHighlighter 用于为搜索结果中的文本字段配置后处理语义高亮。与匹配精确词项的词法高亮不同，语义高亮基于与查询的语义相似性识别并标记相关文本片段。高亮会使用可自定义标签对匹配的跨度进行注释。它不会影响检索、过滤、排序或评分。 | Python | MilvusClient"
type: docx
token: SVoVdTdZRotav9xFjdFcZ8V2n3d
sidebar_position: 2
keywords: 
  - Sparse vector
  - Vector Dimension
  - ANN Search
  - What are vector embeddings
  - zilliz
  - zilliz cloud
  - cloud
  - SemanticHighlighter
  - pymilvus30
displayed_sidebar: pythonSidebar

displayed_sidbar: pythonSidebar
---

import Admonition from '@theme/Admonition';


# SemanticHighlighter

**SemanticHighlighter** 用于为搜索结果中的文本字段配置后处理语义高亮。与匹配精确词项的词法高亮不同，语义高亮基于与查询的语义相似性识别并标记相关文本片段。高亮会使用可自定义标签对匹配的跨度进行注释。它不会影响检索、过滤、排序或评分。

```python
class pymilvus.SemanticHighlighter
```

## Constructor\{#constructor}

初始化用于语义搜索的高亮配置。

```python
SemanticHighlighter(
    queries: List[str],
    input_fields: List[str],
    pre_tags: Optional[List[str]] = None,
    post_tags: Optional[List[str]] = None,
    threshold: Optional[float] = None,
    highlight_only: Optional[bool] = None,
    model_deployment_id: Optional[str] = None,
    max_client_batch_size: Optional[int] = None,
)
```

**PARAMETERS:**

- **queries** (*list[str]*) - 

    用于与文档进行匹配的搜索查询列表。高亮器使用这些查询来识别结果中在语义上相关的文本片段。

- **input_fields** (*list[str]*) - 

    要高亮的 schema 字段。用于指定搜索结果中哪些文本字段应进行语义高亮处理。

- **pre_tags** (*list[str]*) - 

    插入到返回高亮结果中每个匹配片段之前的标签。支持普通字符串（例如 `{`）或 HTML-safe 标记（例如 `<em>`、`<mark>`）。如果提供多个标签，则标签会按匹配顺序轮换使用。

- **post_tags** (*list[str]*) - 

    插入到每个匹配片段之后并与 `pre_tags` 配对的标签。当提供多个标签时，其轮换顺序与 `pre_tags` 相同。

- **threshold** (*float*) - 

    定义“足够匹配”以进行高亮的最小置信度分数（0.0 到 1.0）。语义高亮会在 top-k 检索之后按每个条目应用——只有与查询在语义上匹配且高于该阈值的片段，才会返回带有 `pre_tags`/`post_tags` 的高亮片段。如果未设置，则低于该阈值的片段会返回空结果（`fragments=[], scores=[]`）

- **highlight_only** (*bool*) - 

    如果为 `True`（默认值），则仅返回与查询在语义上相关的句子级片段，这有助于聚焦最相关的上下文。如果设置为 `False`，则会返回包含这些片段的完整段落，但其长度不能超过模型的上下文限制。不过，当返回完整段落时，`scores` 字段将不再具有实际意义。

- **model_deployment_id** (*str*) - 

    用于语义推理的已部署高亮模型的 ID。该模型决定如何计算查询与文档片段之间的语义相似性。

- **max_client_batch_size** (*int*) - 

    限制单个批次中处理的条目数。可用于控制内存使用和处理吞吐量。

**RETURN TYPE:**

*SemanticHighlighter*

**RETURNS:**

一个 SemanticHighlighter 对象。

## Examples\{#examples}

在稠密向量搜索中高亮语义相关的文本：

```python
from pymilvus import MilvusClient, SemanticHighlighter

queries = ["When was artificial intelligence founded",
           "Where was Alan Turing born?"]

highlighter = SemanticHighlighter(
    queries,
    ["document"],
    pre_tags=["<mark>"],
    post_tags=["</mark>"],
    model_deployment_id="your-model-deployment-id",
)

results = client.search(
    collection_name="your_collection",
    data=queries,
    anns_field="dense",
    limit=3,
    output_fields=["document"],
    highlighter=highlighter,
)
```

搜索结果包含一个 `highlight` 字段，其中包含高亮片段及其置信度分数：

```python
# Example output:
# hit: {
#     'id': 1,
#     'distance': 0.766,
#     'entity': {'document': 'Artificial intelligence was founded as an academic discipline in 1956.'},
#     'highlight': {
#         'document': {
#             'fragments': ['<mark>Artificial intelligence was founded as an academic discipline in 1956.</mark>'],
#             'scores': [1.0]
#         }
#     }
# }
```

使用 `threshold` 过滤低置信度高亮结果：

```python
from pymilvus import MilvusClient, SemanticHighlighter

highlighter = SemanticHighlighter(
    queries=["machine learning applications"],
    input_fields=["content"],
    pre_tags=["<em>"],
    post_tags=["</em>"],
    threshold=0.8,
    model_deployment_id="your-model-deployment-id",
)

results = client.search(
    collection_name="your_collection",
    data=["machine learning applications"],
    anns_field="dense",
    limit=10,
    output_fields=["content"],
    highlighter=highlighter,
)
```
