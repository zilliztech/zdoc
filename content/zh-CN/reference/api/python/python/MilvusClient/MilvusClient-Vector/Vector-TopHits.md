---
title: "TopHits | Python | MilvusClient"
slug: /python/python/Vector-TopHits
sidebar_label: "TopHits"
beta: PUBLIC
added_since: v3.0.x
last_modified: false
deprecate_since: false
notebook: false
description: "`TopHits` 实例用于配置从每个 `SearchAggregation` bucket 返回的代表性实体。 | Python | MilvusClient"
type: docx
token: PszSdqvtRo4t96xrW0ycWlVAnfc
sidebar_position: 14
keywords: 
  - milvus open source
  - how does milvus work
  - Zilliz vector database
  - Zilliz database
  - zilliz
  - zilliz cloud
  - cloud
  - TopHits
  - pymilvus30
displayed_sidebar: pythonSidebar

displayed_sidbar: pythonSidebar
---

import Admonition from '@theme/Admonition';


# TopHits

`TopHits` 实例用于配置从每个 `SearchAggregation` bucket 返回的代表性实体。

```python
class pymilvus.TopHits
```

## 构造函数\{#constructor}

```python
TopHits(
    size: int,
    sort: list[dict[str, str]] | None = None,
)
```

**参数：**

- **size** (*int*) **[必需]** -

    从每个 bucket 返回的代表性实体的最大数量。该值必须为正整数。

- **sort** (*list[dict[str, str]] | None*) -

    按列表顺序评估的命中排序规则。每一项都是一个仅包含单个键的字典，用于将标量字段名称或 `_score` 映射为 `"asc"` 或 `"desc"`。如果省略，服务器将使用其默认的命中顺序。

**返回类型：**

*TopHits*

**异常：**

- **ParamError** - 当 `size` 不是正整数，或 `sort` 不是由带有有效排序方向的单键字典组成的列表时引发。

## 示例\{#example}

```python
from pymilvus import SearchAggregation, TopHits

aggregation = SearchAggregation(
    fields=["brand"],
    size=10,
    top_hits=TopHits(
        size=3,
        sort=[{"rating": "desc"}, {"_score": "desc"}],
    ),
)
```
