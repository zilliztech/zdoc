---
title: "with_query() | Python | MilvusClient"
slug: /python/python/Highlighter-with_query
sidebar_label: "with_query()"
beta: false
added_since: v2.6.x
last_modified: v3.0.x
deprecate_since: false
notebook: false
description: "向 `LexicalHighlighter` 配置添加查询词定义，用于高亮由过滤表达式（例如 TEXTMATCH）匹配的文本。这会为 `highlightquery` 增加一个条目，用于说明要高亮的字段和词项，以及生成这些词项的过滤类型。高亮作为后处理运行，不会影响检索、过滤、排序或评分。 | Python | MilvusClient"
type: docx
token: SzT2dS1cko3x0RxjkAEcMJLwnlf
sidebar_position: 3
keywords: 
  - 向量 Database
  - IVF
  - knn
  - 图像搜索
  - zilliz
  - zilliz cloud
  - 云
  - with_query()
  - pymilvus30
displayed_sidebar: pythonSidebar

---

import Admonition from '@theme/Admonition';


# with_query()

向 `LexicalHighlighter` 配置添加查询词定义，用于高亮由过滤表达式（例如 TEXT_MATCH）匹配的文本。这会为 `highlight_query` 增加一个条目，用于说明要高亮的字段和词项，以及生成这些词项的过滤类型。高亮作为后处理运行，不会影响检索、过滤、排序或评分。

## 请求语法\{#request-syntax}

```python
with_query(
    field: str,
    text: str,
    query_type: str
)
```

**参数：**

- **field** （*str*） -

    目标文本字段名称，当过滤表达式找到匹配项时，应标注该字段的内容。必须与 Collection Schema 中的 VARCHAR 文本字段相对应。

- **text** （*str*） -

    要从过滤表达式中高亮的词项或短语。例如，“my doc” 会高亮指定字段中 “my” 和 “doc” 的匹配项。

- **query_type** （*str*） -

    提供要高亮词项的过滤类型。对于基于文本的过滤，请使用 “TextMatch” 以对应 TEXT_MATCH 条件。

**返回类型：**

*with_query*

**返回：**

*None*。

## 示例\{#examples}

```python
from pymilvus import LexicalHighlighter

highlighter = LexicalHighlighter(
    pre_tags=["{"],
    post_tags=["}"],
)

highlighter.with_query(
    field="text",
    text="my doc",
    query_type="TextMatch",
)

results = client.search(
    collection_name="your_collection",
    data=["test"],
    anns_field="sparse_vector",
    limit=10,
    search_params={"metric_type": "BM25", "params": {"drop_ratio_search": 0.0}},
    output_fields=["text"],
    highlighter=highlighter,
)
```
