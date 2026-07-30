---
title: "add_collection_function() | Python | MilvusClient"
slug: /python/python/Collections-add_collection_function
sidebar_label: "add_collection_function()"
beta: false
added_since: v2.6.x
last_modified: false
deprecate_since: false
notebook: false
description: "此操作会向集合中添加一个新函数。函数允许您定义自定义处理逻辑，例如 BM25 评分或 embedding 生成。 | Python | MilvusClient"
type: docx
token: Qe3GdWZa9oAxjrx85tkct8ManRe
sidebar_position: 21
keywords: 
  - 什么是向量嵌入
  - 向量数据库教程
  - 向量数据库如何工作
  - 向量数据库比较
  - zilliz
  - zilliz cloud
  - cloud
  - add_collection_function()
  - pymilvus30
displayed_sidebar: pythonSidebar

displayed_sidbar: pythonSidebar
---

import Admonition from '@theme/Admonition';


# add_collection_function()

此操作会向集合中添加一个新函数。函数允许您定义自定义处理逻辑，例如 BM25 评分或 embedding 生成。

<Admonition type="info" icon="📘" title="说明">

这不适用于外部集合。

</Admonition>

## 请求语法\{#request-syntax}

```python
client.add_collection_function(
    collection_name: str,
    function: Function,
    timeout: float = None,
    **kwargs
)
```

**参数：**

- **collection_name** (*str*) -

    **[必需]**

    集合名称。

- **[function](./MilvusClient-Function)** (*[Function](./MilvusClient-Function)*) -

    **[必需]**

    要添加的函数模式。这是一个 `Function` 对象，用于定义函数名称、类型、输入字段、输出字段和参数。

- **timeout** (*float* | *None*) -

    此操作的超时时长。将其设置为 **None** 表示当收到任何响应或发生任何错误时，此操作即超时。

- **kwargs** (*dict*) -

    可选的附加参数。

**返回类型：**

*NoneType*

**异常：**

- **MilvusException**

    当此操作期间发生任何错误时，将引发此异常。

## 示例\{#example}

```python
from pymilvus import MilvusClient, Function, FunctionType

client = MilvusClient(
    uri="YOUR_CLUSTER_ENDPOINT",
    token="YOUR_CLUSTER_TOKEN"
)

bm25_function = Function(
    name="bm25",
    function_type=FunctionType.BM25,
    input_field_names=["text"],
    output_field_names=["sparse_vector"],
)

client.add_collection_function(
    collection_name="my_collection",
    function=bm25_function,
)
```
