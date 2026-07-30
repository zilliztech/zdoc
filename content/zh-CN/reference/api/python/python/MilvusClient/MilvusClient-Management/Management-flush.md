---
title: "flush() | Python | MilvusClient"
slug: /python/python/Management-flush
sidebar_label: "flush()"
beta: false
added_since: v2.4.x
last_modified: false
deprecate_since: false
notebook: false
description: "此操作会刷写流式数据并封存段。不建议在所有数据都插入到集合后调用此操作，以避免产生小段，这可能会降低搜索性能。 | Python | MilvusClient"
type: docx
token: JnPrdOiPyo2e5gxzzFycbnvwnSd
sidebar_position: 6
keywords: 
  - HNSW
  - What is unstructured data
  - Vector embeddings
  - Vector store
  - zilliz
  - zilliz cloud
  - cloud
  - flush()
  - pymilvus30
displayed_sidebar: pythonSidebar

displayed_sidbar: pythonSidebar
---

import Admonition from '@theme/Admonition';


# flush()

此操作会刷写流式数据并封存段。不建议在所有数据都插入到集合后调用此操作，以避免产生小段，这可能会降低搜索性能。

<Admonition type="info" icon="📘" title="说明">

这仅适用于托管集合。

</Admonition>

## 请求语法\{#request-syntax}

```python
flush(
    self,
    collection_name: str,
    timeout: Optional[float] = None,
    **kwargs,
)
```

**参数：**

- **collection_name** (*str*) -

    目标集合的名称。

- **timeout** (*Optional[float]*) - 

    此操作的超时时长。

    将其设置为 None 表示当收到任意响应或发生任意错误时，此操作超时。

**返回类型：**

*NoneType*

**返回值：**

*None*

**异常：**

- **MilvusException**

    当此操作过程中发生任何错误时，将引发此异常，尤其是在指定的别名不存在时。

## 示例\{#example}

```python
from pymilvus import MilvusClient

# 1. Create a milvus client
client = MilvusClient(
    uri="https://inxx-xxxxxxxxxxxx.api.gcp-us-west1.zillizcloud.com:19530",
    token="user:password"
)

client.flush(
    collection_name="collection_name"
)
```

