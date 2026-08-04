---
title: "drop_collection_field() | Python | MilvusClient"
slug: /python/python/Collections-drop_collection_field
sidebar_label: "drop_collection_field()"
beta: false
added_since: v3.0.x
last_modified: false
deprecate_since: false
notebook: false
description: "此操作通过字段名称或字段 ID 从现有集合 schema 中移除一个字段。 | Python | MilvusClient"
type: docx
token: SpmqdHRBjoRKQuxTibQcx0zMnnb
sidebar_position: 26
keywords: 
  - Large language model
  - Vectorization
  - k nearest neighbor algorithm
  - ANNS
  - zilliz
  - zilliz cloud
  - cloud
  - drop_collection_field()
  - pymilvus30
displayed_sidebar: pythonSidebar

displayed_sidbar: pythonSidebar
---

import Admonition from '@theme/Admonition';


# drop_collection_field()

此操作通过字段名称或字段 ID 从现有集合 schema 中移除一个字段。

## 请求语法\{#request-syntax}

```python
drop_collection_field(
    self,
    collection_name: str,
    field_name: str = "",
    field_id: int = 0,
    timeout: Optional[float] = None,
    **kwargs,
)
```

**参数：**

- **collection_name** (*str*) -

    目标集合的名称。

- **field_name** (*str*) -

    要移除的字段名称。当你通过名称标识字段时，提供此参数。

- **field_id** (*int*) -

    要移除的字段 ID。当你的工作流通过字段 ID 跟踪 schema 时，使用此参数。

- **timeout** (*Optional[float]*) -

    此操作的超时时间，单位为秒。

- **kwargs** (*dict*) -

    传递给底层 RPC 的其他请求选项。

**返回类型：**

*NoneType*

此操作不返回数据。

**异常：**

- **MilvusException**

    当集合不存在、无法解析字段或请求失败时引发。

## 示例\{#example}

```python
from pymilvus import MilvusClient

client = MilvusClient(uri="YOUR_CLUSTER_ENDPOINT", token="YOUR_CLUSTER_TOKEN")

client.drop_collection_field(
    collection_name="products",
    field_name="legacy_score",
)
```
