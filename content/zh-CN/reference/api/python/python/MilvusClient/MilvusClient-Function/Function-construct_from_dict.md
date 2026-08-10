---
title: "construct_from_dict() | Python | MilvusClient"
slug: /python/python/Function-construct_from_dict
sidebar_label: "construct_from_dict()"
beta: false
added_since: v2.5.x
last_modified: false
deprecate_since: false
notebook: false
description: "此操作从字典表示中构造一个 `Function` 对象。 | Python | MilvusClient"
type: docx
token: Ulypd24byoDBOpxGnnJcbF3Nnkb
sidebar_position: 2
keywords: 
  - 什么是向量 Database
  - 向量 Database 对比
  - Faiss
  - 视频搜索
  - zilliz
  - zilliz cloud
  - 云
  - construct_from_dict()
  - pymilvus30
displayed_sidebar: pythonSidebar

displayed_sidbar: pythonSidebar
---

import Admonition from '@theme/Admonition';


# construct_from_dict()

此操作从字典表示中构造一个 `Function` 对象。

## 请求语法\{#request-syntax}

```python
construct_from_dict(
    raw: dict
)
```

**参数：**

- `raw` (*dict*)

    包含用于构造 Collection Schema 的原始数据的字典。

**返回类型：**

*[Function](./MilvusClient-Function)*

**返回：**

一个 `Function` 对象。

**异常：**

- `MilvusException`

    当此操作期间发生任何错误时，将引发此异常。

## 示例\{#examples}

```python
from pymilvus import Function  

function_dict = {  
    "name": "bm25",  
    "type": "BM25",  
    "input_field_names": ["text"],  
    "output_field_names": ["score"],  
    "description": "BM25 text search function",  
}  

function = Function.construct_from_dict(function_dict)  

print(function)
```

