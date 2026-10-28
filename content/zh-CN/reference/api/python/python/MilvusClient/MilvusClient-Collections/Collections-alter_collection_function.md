---
title: "alter_collection_function() | Python | MilvusClient"
slug: /python/python/Collections-alter_collection_function
sidebar_label: "alter_collection_function()"
beta: false
added_since: v2.6.x
last_modified: v3.0.x
deprecate_since: false
notebook: false
description: "此操作通过将 Collection 中的现有函数替换为新的函数 Schema 来修改该函数。 | Python | MilvusClient"
type: docx
token: TBe0dMVZlogHEdxUs97cHDownUd
sidebar_position: 22
keywords: 
  - 向量 Database 示例
  - RAG 向量 Database
  - 什么是向量 Database
  - 什么是向量 Database
  - Zilliz
  - Zilliz Cloud
  - 云
  - alter_collection_function()
  - pymilvus30
displayed_sidebar: pythonSidebar

---

import Admonition from '@theme/Admonition';


# alter_collection_function()

此操作通过将 Collection 中的现有函数替换为新的函数 Schema 来修改该函数。

<Admonition type="info" title="Note">

此操作不适用于外部 Collection。

</Admonition>

## 请求语法\{#request-syntax}

```python
client.alter_collection_function(
    collection_name: str,
    function_name: str,
    function: Function,
    timeout: float = None,
    **kwargs
)
```

**参数：**

- **collection_name** （*str*） -

    **[必需]**

    Collection 的名称。

- **function_name** （*str*） -

    **[必需]**

    要修改的函数的名称。

- **function** (*[Function](./MilvusClient-Function)*) -

    **[必需]**

    用于替换现有函数 Schema 的新函数 Schema。

- **timeout** （*float | None*） -

    此操作的超时时间。将其设置为 None 表示当收到任意响应或发生任何错误时，此操作即超时。

- **kwargs** （*dict*） -

    可选的附加参数。

**返回类型：**

*NoneType*

**返回：**

None。

**异常：**

- **MilvusException**

    此操作期间发生任何错误时，将引发此异常。此操作期间发生任何错误时，将引发此异常。

## 示例\{#examples}

```python
from pymilvus import MilvusClient, Function, FunctionType

client = MilvusClient(
    uri="YOUR_CLUSTER_ENDPOINT",
    token="YOUR_CLUSTER_TOKEN"
)

updated_function = Function(
    name="bm25",
    function_type=FunctionType.BM25,
    input_field_names=["text"],
    output_field_names=["sparse_vector"],
    params={"bm25_k1": 1.5, "bm25_b": 0.75},
)

client.alter_collection_function(
    collection_name="my_collection",
    function_name="bm25",
    function=updated_function,
)
```
