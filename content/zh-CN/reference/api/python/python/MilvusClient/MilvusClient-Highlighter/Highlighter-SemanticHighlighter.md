---
title: "SemanticHighlighter | Python | MilvusClient"
slug: /python/python/Highlighter-SemanticHighlighter
sidebar_label: "SemanticHighlighter"
beta: false
added_since: v2.6.x
last_modified: false
deprecate_since: false
notebook: false
description: "SemanticHighlighter 用于为搜索结果中文本字段配置后处理语义高亮。与匹配精确术语的词法高亮不同，语义高亮会基于与查询的语义相似性识别并标记相关文本 Segment。高亮使用可自定义标签标注匹配范围。它不会影响检索、过滤、排序或评分。 | Python | MilvusClient"
type: docx
token: SVoVdTdZRotav9xFjdFcZ8V2n3d
sidebar_position: 2
keywords: 
  - 稀疏向量
  - 向量维度
  - ANN 搜索
  - 什么是向量嵌入
  - zilliz
  - zilliz cloud
  - 云
  - SemanticHighlighter
  - pymilvus30
displayed_sidebar: pythonSidebar

displayed_sidbar: pythonSidebar
---

import Admonition from '@theme/Admonition';


# SemanticHighlighter

**SemanticHighlighter** 用于为搜索结果中文本字段配置后处理语义高亮。与匹配精确术语的词法高亮不同，语义高亮会基于与查询的语义相似性识别并标记相关文本 Segment。高亮使用可自定义标签标注匹配范围。它不会影响检索、过滤、排序或评分。

```python
class pymilvus.SemanticHighlighter
```

## 构造函数\{#constructor}

初始化与语义搜索配合使用的高亮器配置。

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

**参数：**

- **queries** (*list[str]*) - 

    用于与文档进行匹配的搜索查询列表。高亮器使用这些查询来识别结果中在语义上相关的文本 Segment。

- **input_fields** (*list[str]*) - 

    要高亮的 Schema 字段。指定搜索结果中哪些文本字段应进行语义高亮处理。

- **pre_tags** (*list[str]*) - 

    在返回的高亮结果中，插入到每个匹配 Segment 之前的标签。支持普通字符串（例如 `{`）或 HTML 安全标记（例如 `<em>`、`<mark>`）。如果提供了多个标签，则会按匹配顺序轮换使用。

- **post_tags** (*list[str]*) - 

    在每个匹配 Segment 之后插入的标签，与 `pre_tags` 配对使用。提供多个标签时，轮换顺序与 `pre_tags` 相同。

- **threshold** (*float*) - 

    用于定义高亮“足够匹配”的最小置信度分数（0.0 到 1.0）。语义高亮会在 top-k 检索之后按条目应用——只有与查询在语义上匹配且高于此阈值的 Segment，才会返回带有 `pre_tags`/`post_tags` 的高亮片段。如果未设置，则低于该阈值的 Segment 会返回空结果（`fragments=[], scores=[]`）

- **highlight_only** (*bool*) - 

    如果为 `True`（默认值），则仅返回与查询在语义上相关的句子级片段，这有助于聚焦最相关的上下文。如果设置为 `False`，则会改为返回包含这些片段的完整段落，前提是其长度不超过模型的上下文限制。不过，当返回完整段落时，`scores` 字段将不再有意义。

- **model_deployment_id** (*str*) - 

    用于语义推理的已部署高亮模型的 ID。该模型决定如何计算查询与文档 Segment 之间的语义相似度。

- **max_client_batch_size** (*int*) - 

    限制单个批次中处理的条目数量。可用于控制内存使用量和处理吞吐量。

**返回类型：**

*SemanticHighlighter*

**返回：**

一个 SemanticHighlighter 对象。

## 示例\{#examples}

在稠密向量搜索中高亮语义相关文本：

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
