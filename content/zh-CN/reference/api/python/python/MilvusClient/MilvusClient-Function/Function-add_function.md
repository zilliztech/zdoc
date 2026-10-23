---
title: "add_function() | Python | MilvusClient"
slug: /python/python/Function-add_function
sidebar_label: "add_function()"
beta: false
added_since: v2.5.x
last_modified: v3.0.x
deprecate_since: false
notebook: false
description: "此操作会添加一个函数，用于将原始数据转换为向量表示。 | Python | MilvusClient"
type: docx
token: Mzq0dJGdSo4PBBxO3QLcjtjPnxf
sidebar_position: 1
keywords: 
  - 自然语言处理 Database
  - 低成本向量 Database
  - 托管向量 Database
  - Pinecone 向量 Database
  - Zilliz
  - Zilliz Cloud
  - 云
  - add_function()
  - pymilvus30
displayed_sidebar: pythonSidebar

displayed_sidbar: pythonSidebar
---

import Admonition from '@theme/Admonition';


# add_function()

此操作会添加一个函数，用于将原始数据转换为向量表示。

## 请求语法\{#request-syntax}

```python
add_function(
```

**参数：**

- **function** （*[Function](./MilvusClient-Function)*） -

    **[必需]**

    一个 Function 类实例，用于将数据转换为向量嵌入。此函数将被添加到 Collection 的 Schema 中。

**返回类型：**

*CollectionSchema*

**返回：**

一个 CollectionSchema 对象。

**异常：**

- **FunctionIncorrectType**

    当 `function` 参数类型不正确时，将引发此异常。当 `function` 参数类型不正确时，将引发此异常。

## 示例\{#examples}

```python
from pymilvus import MilvusClient, Function, FunctionType

schema = MilvusClient.create_schema()

bm25_function = Function(
    name="bm25_fn",
    input_field_names=["document_content"],
    output_field_names="sparse_vector",
    function_type=FunctionType.BM25,
)

schema.add_function(bm25_function)
```
