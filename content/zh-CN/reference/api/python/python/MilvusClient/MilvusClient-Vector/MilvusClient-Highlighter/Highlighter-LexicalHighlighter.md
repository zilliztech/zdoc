---
title: "LexicalHighlighter | Python | MilvusClient"
slug: /python/python/Highlighter-LexicalHighlighter
sidebar_label: "LexicalHighlighter"
beta: false
added_since: v2.6.x
last_modified: v3.0.x
deprecate_since: false
notebook: false
description: "LexicalHighlighter 为搜索结果中的文本字段配置后处理词项高亮。高亮使用可自定义的标记标注匹配的文本片段，并可返回基于片段的摘要，以提高可读性和 UI 渲染效果。它不会影响检索、过滤、排序或评分。 | Python | MilvusClient"
type: docx
token: WytXd3BYFo2bY2xDrRIcCcoXnb0
sidebar_position: 1
keywords: 
  - 稀疏向量
  - 向量维度
  - ANN 搜索
  - 什么是向量嵌入
  - Zilliz
  - Zilliz Cloud
  - 云
  - LexicalHighlighter
  - pymilvus30
displayed_sidebar: pythonSidebar

---

import Admonition from '@theme/Admonition';


# LexicalHighlighter

**LexicalHighlighter** 为搜索结果中的文本字段配置后处理词项高亮。高亮使用可自定义的标记标注匹配的文本片段，并可返回基于片段的摘要，以提高可读性和 UI 渲染效果。它不会影响检索、过滤、排序或评分。

## 请求语法\{#request-syntax}

```python
class pymilvus.LexicalHighlighter
```

**参数：**

- **highlight_query** (*list[dict]*) -

    一个选项，用于定义文本过滤器中哪些查询词会被高亮。每个条目必须是 dict：如果未设置，则不会高亮任何过滤词。有关详细信息，请参见文本高亮器。

- **highlight_search_text** (*bool*) -

    一个标志，指示是否高亮 BM25 全文搜索中使用的搜索词。如果为 True，则将 BM25 查询词用作高亮词的来源。如果未设置，则不会高亮 BM25 搜索词。

- **pre_tags** (*list[str]*) -

    一个选项，用于在返回的高亮内容中为每个匹配词之前插入标记。支持普通字符串（例如，\{）或 HTML 安全标记（例如，&lt;em>、&lt;mark>）。如果提供多个标记，标记将按匹配顺序轮换。

- **post_tags** (*list[str]*) -

    一个选项，用于在每个匹配词之后插入标记，并与 pre_tags 配合使用。如果提供多个标记，轮换顺序与 pre_tags 相同。

- **fragment_offset** (*int*) -

    以片段形式返回输出时，在第一个高亮匹配项之前保留的前置上下文字符数。默认行为不保留额外的前置上下文。

- **fragment_size** (*int*) -

    一个选项，用于指定每个返回片段的最大长度（以字符为单位）。高亮器会将片段长度大致限制为该大小。

- **num_of_fragments** (*int*) -

    一个选项，用于指定每个文本值最多返回的片段数。如果未设置，默认返回多个片段（实现默认值；典型值请参见示例）。

**返回类型：**

*LexicalHighlighter*

**返回：**

一个 LexicalHighlighter 对象。

## 示例\{#examples}

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

在文本匹配中高亮查询词：

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
