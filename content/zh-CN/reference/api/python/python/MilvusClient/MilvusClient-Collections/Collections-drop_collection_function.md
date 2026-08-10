---
title: "drop_collection_function() | Python | MilvusClient"
slug: /python/python/Collections-drop_collection_function
sidebar_label: "drop_collection_function()"
beta: false
added_since: v2.6.x
last_modified: false
deprecate_since: false
notebook: false
description: "此操作会从 Collection 中删除现有函数。 | Python | MilvusClient"
type: docx
token: F1mJdDLyzoMTrxxarPMcqPkqnqg
sidebar_position: 24
keywords: 
  - RAG LLM 架构
  - 私有 LLM
  - 近邻搜索
  - LLM 评估
  - zilliz
  - Zilliz Cloud
  - 云
  - drop_collection_function()
  - pymilvus30
displayed_sidebar: pythonSidebar

displayed_sidbar: pythonSidebar
---

import Admonition from '@theme/Admonition';


# drop_collection_function()

此操作会从 Collection 中删除现有函数。

<Admonition type="info" icon="📘" title="Notes">

这不适用于外部 Collection。

</Admonition>

## 请求语法\{#request-syntax}

```python
client.drop_collection_function(
    collection_name: str,
    function_name: str,
    timeout: float = None,
    **kwargs
)
```

**参数：**

- **collection_name** (*str*) -

    **[必需]**

    Collection 的名称。

- **function_name** (*str*) -

    **[必需]**

    要删除的函数名称。

- **timeout** (*float* | *None*) -

    此操作的超时时长。将其设置为 **None** 表示当收到任何响应或发生任何错误时，此操作即超时。

- **kwargs** (*dict*) -

    可选的附加参数。

**返回类型：**

*NoneType*

**异常：**

- **MilvusException**

    此操作期间发生任何错误时，将引发此异常。

## 示例\{#example}

```python
from pymilvus import MilvusClient

client = MilvusClient(
    uri="YOUR_CLUSTER_ENDPOINT",
    token="YOUR_CLUSTER_TOKEN"
)

client.drop_collection_function(
    collection_name="my_collection",
    function_name="bm25",
)
```
