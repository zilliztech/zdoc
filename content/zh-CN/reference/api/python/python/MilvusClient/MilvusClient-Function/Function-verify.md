---
title: "verify() | Python | MilvusClient"
slug: /python/python/Function-verify
sidebar_label: "verify()"
beta: false
added_since: v2.5.x
last_modified: false
deprecate_since: false
notebook: false
description: "此操作会验证 CollectionSchema 中定义的函数的输入和输出字段。 | Python | MilvusClient"
type: docx
token: YXogdv0Dpovi2Pxbyh2cdA4nnbe
sidebar_position: 5
keywords: 
  - NLP
  - 神经网络
  - 深度学习
  - 知识库
  - zilliz
  - zilliz cloud
  - cloud
  - verify()
  - pymilvus30
displayed_sidebar: pythonSidebar

displayed_sidbar: pythonSidebar
---

import Admonition from '@theme/Admonition';


# verify()

此操作会验证 CollectionSchema 中定义的函数的输入和输出字段。

## 请求语法\{#request-syntax}

```python
verify(
    schema: CollectionSchema
)
```

**参数：**

无

**返回类型：**

无

**返回值：**

无

**异常：**

- `MilvusException`

    当此操作期间发生任何错误时，将引发此异常。

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

# Verify the function
bm25_function.verify(schema)
```
