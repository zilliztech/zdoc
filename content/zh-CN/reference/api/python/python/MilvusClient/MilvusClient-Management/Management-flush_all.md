---
title: "flush_all() | Python | MilvusClient"
slug: /python/python/Management-flush_all
sidebar_label: "flush_all()"
beta: false
added_since: v2.6.x
last_modified: false
deprecate_since: false
notebook: false
description: "此操作会刷新当前数据库中的所有集合。这可确保所有已插入的数据都写入持久化存储。 | Python | MilvusClient"
type: docx
token: QejKdv2qKo97mQxEV0CcaSM5nLh
sidebar_position: 17
keywords: 
  - Knowledge base
  - natural language processing
  - AI chatbots
  - cosine distance
  - zilliz
  - zilliz cloud
  - cloud
  - flush_all()
  - pymilvus30
displayed_sidebar: pythonSidebar

displayed_sidbar: pythonSidebar
---

import Admonition from '@theme/Admonition';


# flush_all()

此操作会刷新当前数据库中的所有集合。这可确保所有已插入的数据都写入持久化存储。

<Admonition type="info" icon="📘" title="说明">

这仅适用于托管集合。

</Admonition>

## 请求语法\{#request-syntax}

```python
client.flush_all(
    timeout: float = None
)
```

**参数：**

- **timeout** (*float* | *None*) -

    此操作的超时时长。将其设置为 **None** 表示当收到任何响应或发生任何错误时，此操作超时。

**返回类型：**

*NoneType*

**异常：**

- **MilvusException**

    当此操作期间发生任何错误时，将引发此异常。

## 示例\{#example}

```python
from pymilvus import MilvusClient

client = MilvusClient(
    uri="YOUR_CLUSTER_ENDPOINT",
    token="YOUR_CLUSTER_TOKEN"
)

# Flush all collections
client.flush_all()
```
