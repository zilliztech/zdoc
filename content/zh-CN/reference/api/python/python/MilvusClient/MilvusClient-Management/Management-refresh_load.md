---
title: "refresh_load() | Python | MilvusClient"
slug: /python/python/Management-refresh_load
sidebar_label: "refresh_load()"
beta: false
added_since: v2.3.x
last_modified: false
deprecate_since: false
notebook: false
description: "此操作将已加载集合中尚未加载的数据加载到内存中。 | Python | MilvusClient"
type: docx
token: X3NXdtC2koiAxyxhcUBcv38Wnsh
sidebar_position: 12
keywords: 
  - rag llm architecture
  - private llms
  - nn search
  - llm eval
  - zilliz
  - zilliz cloud
  - cloud
  - refresh_load()
  - pymilvus30
displayed_sidebar: pythonSidebar

displayed_sidbar: pythonSidebar
---

import Admonition from '@theme/Admonition';


# refresh_load()

此操作将已加载集合中尚未加载的数据加载到内存中。

<Admonition type="info" icon="📘" title="说明">

这仅适用于托管集合。

</Admonition>

## 请求语法\{#request-syntax}

```python
refresh_load(
    collection_name: str,
    timeout: Optional[str] = None
)
```

**参数：**

- **collection_name** (*str*) -

    **[必需]**

    此操作目标集合的名称。

- **timeout** (*float* | *None*)  

    此操作的超时时长。

    将其设置为 **None** 表示当收到任意响应或发生任意错误时，此操作超时。

**返回类型：**

*NoneType*

**返回：**

None

**异常：**

- **MilvusException**

    当此操作期间发生任何错误时，将引发此异常。

## 示例\{#example}

```python
from pymilvus import MilvusClient

# 1. Set up a milvus client
client = MilvusClient(
    uri="https://inxx-xxxxxxxxxxxx.api.gcp-us-west1.zillizcloud.com:19530",
    token="user:password"
)

# 2. Create a collection
client.create_collection(
    collection_name="test_collection",
    dimension=5
)

# 3. Refresh the load status of the collection
client.refresh_load(
    collection_name="test_collection"
)
```

## 相关方法\{#related-methods}

- [get_load_state()](./Management-get_load_state)

- [load_collection()](./Management-load_collection)

- [release_collection()](./Management-release_collection)

