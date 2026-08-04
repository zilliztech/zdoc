---
title: "LexicalHighlighter | Python | MilvusClient"
slug: /python/python/Highlighter-LexicalHighlighter
sidebar_label: "LexicalHighlighter"
beta: false
added_since: v2.6.x
last_modified: false
deprecate_since: false
notebook: false
description: "LexicalHighlighter 为搜索结果中的文本字段配置后处理术语高亮。高亮会使用可自定义的标签标注匹配片段，并可返回基于片段的摘要，以提升可读性和 UI 渲染效果。它不会影响检索、过滤、排序或评分。 | Python | MilvusClient"
type: docx
token: DXTJdXSquo8NutxCqfBccO7pnWw
sidebar_position: 1
keywords: 
  - Sparse vector
  - Vector Dimension
  - ANN Search
  - What are vector embeddings
  - zilliz
  - zilliz cloud
  - cloud
  - LexicalHighlighter
  - pymilvus30
displayed_sidebar: pythonSidebar

displayed_sidbar: pythonSidebar
---

import Admonition from '@theme/Admonition';


# LexicalHighlighter

**LexicalHighlighter** 为搜索结果中的文本字段配置后处理术语高亮。高亮会使用可自定义的标签标注匹配片段，并可返回基于片段的摘要，以提升可读性和 UI 渲染效果。它不会影响检索、过滤、排序或评分。

```python
class pymilvus.LexicalHighlighter
```

## Constructor\{#constructor}

初始化用于搜索和标量过滤的高亮器配置。

```python
LexicalHighlighter(
    highlight_query: Optional[List] = None,
    highlight_search_text: Optional[bool] = None,
    pre_tags: Optional[List[str]] = None,
    post_tags: Optional[List[str]] = None,
    fragment_offset: Optional[int] = None,
    fragment_size: Optional[int] = None,
)
```

**PARAMETERS**:

- **highlight_query** (*list[dict]*) -<br/>
  定义高亮哪些来自基于文本过滤器的查询词。每个条目必须是一个 dict：

    ```python
    [
        {"type": "<QueryType>", "field": "<text field name>", "text": "<terms to highlight>"},
        {...},
    ]
    ```

    如果未设置，则不会高亮任何过滤条件中的术语。

    有关详细信息，请参见 [Text Highlighter](https://milvus.io/docs/text-highlighter.md)。

- **highlight_search_text** (*bool*) -<br/>
  是否高亮 BM25 全文搜索中使用的搜索词。如果为 True，则使用 BM25 查询词作为高亮术语的来源。如果未设置，则不会高亮 BM25 搜索词。

- **pre_tags** (*list[str]*) -<br/>
  在返回的高亮结果中插入到每个匹配术语之前的标签。支持纯字符串（例如 `{`）或对 HTML 安全的标记（例如 `<em>`、`<mark>`）。如果提供了多个标签，则会按匹配顺序轮换使用这些标签。

- **post_tags** (*list[str]*) -<br/>
  插入到每个匹配术语之后的标签，并与 `pre_tags` 配对。提供多个标签时，轮换顺序与 pre_tags 相同。

- **fragment_offset** (*int*) -<br/>
  在返回基于片段的输出时，在第一个高亮匹配之前保留的前导上下文字符数。默认行为是不保留额外的前导上下文。

- **fragment_size** (*int*) -<br/>
  每个返回片段的最大长度（按字符数计）。高亮器会将片段长度大致限制在该大小内。

- **num_of_fragments** (*int*) -<br/>
  每个文本值返回的最大片段数。如果未设置，默认为多个片段（实现默认值；典型值请参见示例）。

**RETURN TYPE**:

*LexicalHighlighter*

**RETURNS**:

一个 **LexicalHighlighter** 对象。

## Examples\{#examples}

在 BM25 全文搜索中高亮搜索词：

```python
from pymilvus import MilvusClient, LexicalHighlighter

highlighter = LexicalHighlighter(
    pre_tags=["{"],
    post_tags=["}"],
    highlight_search_text=True,
)

results = client.search(
    collection_name="your_collection",
    data=["test"],                 # BM25 query term
    anns_field="sparse_vector",
    limit=10,
    search_params={"metric_type": "BM25", "params": {"drop_ratio_search": 0.0}},
    output_fields=["text"],
    highlighter=highlighter,
)
```

在 Text Match 中高亮查询词：

```python
from pymilvus import MilvusClient, LexicalHighlighter

highlighter = LexicalHighlighter(
    pre_tags=["<mark>"],
    post_tags=["</mark>"],
    highlight_query=[{"type": "TextMatch", "field": "text", "text": "my doc"}],
)

results = client.search(
    collection_name="your_collection",
    data=["test"],                 # BM25 can be combined
    anns_field="sparse_vector",
    limit=10,
    search_params={"metric_type": "BM25", "params": {"drop_ratio_search": 0.0}},
    output_fields=["text"],
    highlighter=highlighter,
)
```
