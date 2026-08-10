---
title: "TopHits | Python | MilvusClient"
slug: /python/python/Vector-TopHits
sidebar_label: "TopHits"
beta: PUBLIC
added_since: v3.0.x
last_modified: false
deprecate_since: false
notebook: false
description: "`TopHits` 实例用于配置从每个 `SearchAggregation` bucket 返回的代表性 Entity。| Python | MilvusClient"
type: docx
token: PszSdqvtRo4t96xrW0ycWlVAnfc
sidebar_position: 14
keywords: 
  - milvus 开源
  - milvus 如何工作
  - Zilliz 向量 Database
  - Zilliz Database
  - zilliz
  - zilliz cloud
  - 云
  - TopHits
  - pymilvus30
displayed_sidebar: pythonSidebar

displayed_sidbar: pythonSidebar
---

import Admonition from '@theme/Admonition';


# TopHits

`TopHits` 实例用于配置从每个 `SearchAggregation` bucket 返回的代表性 Entity。

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

    从每个 bucket 返回的代表性 Entity 的最大数量。该值必须为正整数。

- **sort** (*list[dict[str, str]] | None*) -

    按列表顺序计算的命中排序规则。每一项都是单键字典，将标量字段名或 `_score` 映射为 `"asc"` 或 `"desc"`。如果省略，服务器将使用其默认的命中排序顺序。

**返回类型：**

*TopHits*

**异常：**

- 当 `size` 不是正整数，或 `sort` 不是由具有有效方向的单键字典组成的列表时，将引发 **ParamError**。

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
