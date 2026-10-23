---
title: "drop_function_field() | Python | MilvusClient"
slug: /python/python/Function-drop_function_field
sidebar_label: "drop_function_field()"
beta: false
added_since: v3.0.x
last_modified: false
deprecate_since: false
notebook: false
description: "此操作从现有 Collection 中删除函数字段：删除绑定的函数、该字段及其支撑索引。 | Python | MilvusClient"
type: docx
token: UxyedGPErolaikxcssgc2IF1nAh
sidebar_position: 7
keywords: 
  - LLM 幻觉
  - 混合搜索
  - 词法搜索
  - 最近邻搜索
  - Zilliz
  - Zilliz Cloud
  - 云
  - drop_function_field()
  - pymilvus30
displayed_sidebar: pythonSidebar

displayed_sidbar: pythonSidebar
---

import Admonition from '@theme/Admonition';


# drop_function_field()

此操作从现有 Collection 中删除函数字段：它会删除绑定的函数、该字段及其支撑索引。

## 请求语法\{#request-syntax}

```python
drop_function_field(
    collection_name: str,
    function_name: str,
    timeout: Optional[float] = None,
    **kwargs
)
```

**参数：**

- **collection_name** （*str*） -

    目标 Collection 的名称。

- **function_name** （*str*） -

    要删除其输出字段的函数的名称。

- **timeout** （*float* | *None*） -

    该值默认为 `None`。

    此操作的超时时间，单位为秒。

**异常：**

- **MilvusException**

    当服务器拒绝请求或 RPC 失败时抛出。请查看服务器错误消息，以了解确切的失败原因。

## 示例\{#examples}

```python
from pymilvus import MilvusClient

client = MilvusClient(uri="YOUR_CLUSTER_ENDPOINT")
client.drop_function_field(
    collection_name="docs",
    function_name="bm25_sparse",
)
```
