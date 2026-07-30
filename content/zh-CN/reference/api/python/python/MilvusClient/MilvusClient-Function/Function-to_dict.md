---
title: "to_dict() | Python | MilvusClient"
slug: /python/python/Function-to_dict
sidebar_label: "to_dict()"
beta: false
added_since: v2.5.x
last_modified: false
deprecate_since: false
notebook: false
description: "此操作返回 `Function` 对象的字典表示。 | Python | MilvusClient"
type: docx
token: AmwJdW0z6opMPcxhMlBcYPIWn2M
sidebar_position: 4
keywords: 
  - lexical search
  - nearest neighbor search
  - Agentic RAG
  - rag llm architecture
  - zilliz
  - zilliz cloud
  - cloud
  - to_dict()
  - pymilvus30
displayed_sidebar: pythonSidebar

displayed_sidbar: pythonSidebar
---

import Admonition from '@theme/Admonition';


# to_dict()

此操作返回 `Function` 对象的字典表示。

## 请求语法\{#request-syntax}

```python
to_dict()
```

**参数：**

无

**返回类型：**

*dict*

**返回值：**

`Function` 对象的字典表示。

**异常：**

- `MilvusException`

    当此操作期间发生任何错误时，将引发此异常。

## 示例\{#examples}

```python
from pymilvus import Function, FunctionType

bm25_function = Function(
    name="bm25_fn",
    input_field_names=["document_content"],
    output_field_names="sparse_vector",
    function_type=FunctionType.BM25,
)

bm25_func_dict = bm25_function.to_dict()

print(bm25_func_dict)
```
