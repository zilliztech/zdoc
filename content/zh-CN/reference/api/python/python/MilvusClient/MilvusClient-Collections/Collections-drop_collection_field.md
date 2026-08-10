---
title: "drop_collection_field() | Python | MilvusClient"
slug: /python/python/Collections-drop_collection_field
sidebar_label: "drop_collection_field()"
beta: false
added_since: v3.0.x
last_modified: false
deprecate_since: false
notebook: false
description: "此操作通过字段名称或字段 ID 从现有 Collection Schema 中移除一个字段。 | Python | MilvusClient"
type: docx
token: SpmqdHRBjoRKQuxTibQcx0zMnnb
sidebar_position: 26
keywords: 
  - 大型语言模型
  - 向量化
  - k 近邻算法
  - ANNS
  - zilliz
  - zilliz cloud
  - 云
  - drop_collection_field()
  - pymilvus30
displayed_sidebar: pythonSidebar

displayed_sidbar: pythonSidebar
---

import Admonition from '@theme/Admonition';


# drop_collection_field()

此操作通过字段名称或字段 ID 从现有 Collection Schema 中移除一个字段。

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

    目标 Collection 的名称。

- **field_name** (*str*) -

    要移除的字段名称。当您通过名称标识字段时，请提供此参数。

- **field_id** (*int*) -

    要移除的字段 ID。当您的工作流通过字段 ID 跟踪 Schema 时，请使用此参数。

- **timeout** (*Optional[float]*) -

    此操作的超时时间，单位为秒。

- **kwargs** (*dict*) -

    传递给底层 RPC 的其他请求选项。

**返回类型：**

*NoneType*

此操作不返回数据。

**异常：**

- **MilvusException**

    当 Collection 不存在、字段无法解析或请求失败时引发。

## 示例\{#example}

```python
from pymilvus import MilvusClient

client = MilvusClient(uri="YOUR_CLUSTER_ENDPOINT", token="YOUR_CLUSTER_TOKEN")

client.drop_collection_field(
    collection_name="products",
    field_name="legacy_score",
)
```
