---
title: "to_dict() | Python | MilvusClient"
slug: /python/python/Function-to_dict
sidebar_label: "to_dict()"
beta: false
added_since: v2.5.x
last_modified: v3.0.x
deprecate_since: false
notebook: false
description: "此操作返回 `Function` 对象的字典表示。 | Python | MilvusClient"
type: docx
token: HacudytI2olONTxEtofcuXLin1f
sidebar_position: 4
keywords: 
  - 词法搜索
  - 最近邻搜索
  - Agentic RAG
  - RAG LLM 架构
  - zilliz
  - zilliz cloud
  - 云
  - to_dict()
  - pymilvus30
displayed_sidebar: pythonSidebar

---

import Admonition from '@theme/Admonition';


# to_dict()

此操作返回 `Function` 对象的字典表示。

## 请求语法\{#request-syntax}

```python
to_dict()
```

**返回类型：**

*dict*

**返回值：**

Function 对象的字典表示。

**异常：**

- **MilvusException**

    此操作期间发生任何错误时，都会引发此异常。此操作期间发生任何错误时，都会引发此异常。

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
