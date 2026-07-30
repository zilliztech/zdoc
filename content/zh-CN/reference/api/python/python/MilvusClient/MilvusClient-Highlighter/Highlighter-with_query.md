---
title: "with_query() | Python | MilvusClient"
slug: /python/python/Highlighter-with_query
sidebar_label: "with_query()"
beta: false
added_since: v2.6.x
last_modified: false
deprecate_since: false
notebook: false
description: "向 `LexicalHighlighter` 配置添加一个查询词定义，用于高亮通过过滤表达式（例如 TEXTMATCH）匹配到的文本。这会向 `highlightquery` 增加一个条目，用于描述应高亮哪个字段和哪些词项，以及这些词项由哪种过滤类型产生。高亮作为后处理执行，不会影响检索、过滤、排序或评分。 | Python | MilvusClient"
type: docx
token: KdiQdpHp3oEQwNx2hd5chqQKn2D
sidebar_position: 3
keywords: 
  - 向量数据库
  - IVF
  - knn
  - 图片搜索
  - zilliz
  - zilliz cloud
  - 云
  - with_query()
  - pymilvus30
displayed_sidebar: pythonSidebar

displayed_sidbar: pythonSidebar
---

import Admonition from '@theme/Admonition';


# with_query()

向 `LexicalHighlighter` 配置添加一个查询词定义，用于高亮通过过滤表达式（例如 `TEXT_MATCH`）匹配到的文本。这会向 `highlight_query` 增加一个条目，用于描述应高亮哪个字段和哪些词项，以及这些词项由哪种过滤类型产生。高亮作为后处理执行，不会影响检索、过滤、排序或评分。

## 请求语法\{#request-syntax}

```python
with_query(
    field: str,
    text: str,
    query_type: str
)
```

**参数**：

- **field** (*str*) -
当过滤表达式发现匹配项时，其内容应被标注的目标文本字段名称。必须对应集合 schema 中的 **VARCHAR** 文本字段。

- **text** (*str*) -
需要从过滤表达式中高亮的词项或短语。例如，**"my doc"** 将在指定字段中高亮 **"my"** 和 **"doc"** 的匹配项。

- **query_type** (*str*) -
提供待高亮词项的过滤类型。对于基于文本的过滤，请使用 **"TextMatch"**，以对应 **TEXT_MATCH** 条件。

**返回值**：

*None*

## 示例\{#examples}

```python
from pymilvus import LexicalHighlighter

highlighter = LexicalHighlighter(
    pre_tags=["{"],
    post_tags=["}"],
)

highlighter.with_query(field="text", text="my doc", query_type="TextMatch")

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
