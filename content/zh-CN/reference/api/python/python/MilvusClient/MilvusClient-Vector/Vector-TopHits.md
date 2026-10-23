---
title: "TopHits | Python | MilvusClient"
slug: /python/python/Vector-TopHits
sidebar_label: "TopHits"
beta: PUBLIC
added_since: v3.0.x
last_modified: v3.0.x
deprecate_since: false
notebook: false
description: "TopHits 实例用于配置从每个 SearchAggregation 桶返回的代表性 Entity。 | Python | MilvusClient"
type: docx
token: PszSdqvtRo4t96xrW0ycWlVAnfc
sidebar_position: 15
keywords: 
  - Milvus 开源
  - Milvus 如何工作
  - Zilliz 向量 Database
  - Zilliz Database
  - Zilliz
  - Zilliz Cloud
  - 云
  - TopHits
  - pymilvus30
displayed_sidebar: pythonSidebar

displayed_sidbar: pythonSidebar
---

import Admonition from '@theme/Admonition';


# TopHits

TopHits 实例用于配置从每个 SearchAggregation 桶返回的代表性 Entity。

## 请求语法\{#request-syntax}

```python
__init__(
    size: int,
    sort: Optional[List[Dict[str, str]]] = None
)
```

**参数：**

- **size** (*int*) -

    **[必需]**

    从每个桶返回的代表性 Entity 的最大数量。该值必须为正整数。

- **sort** (*list[dict[str, str]] | None*) -

    命中排序规则，按列表顺序求值。每个项都是一个单键字典，将字段名或 _score 映射到 "asc" 或 "desc"。

**异常：**

- **MilvusException**

    当服务器拒绝请求或 RPC 失败时抛出。请检查服务器错误消息，以获取确切的失败原因。

## 示例\{#examples}

```python
from pymilvus import TopHits

top = TopHits(
    size=3,
    sort=[{"_score": "desc"}],
)
```
