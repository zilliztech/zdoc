---
title: "flush_all() | Python | MilvusClient"
slug: /python/python/Management-flush_all
sidebar_label: "flush_all()"
beta: false
added_since: v2.6.x
last_modified: v3.0.x
deprecate_since: false
notebook: false
description: "此操作会刷新当前 Database 中的所有 Collection。这可确保所有已插入的数据都写入持久化存储。 | Python | MilvusClient"
type: docx
token: YaXGd43eqog2RExt8btcwxQOn0f
sidebar_position: 17
keywords: 
  - 知识库
  - 自然语言处理
  - AI 聊天机器人
  - 余弦距离
  - zilliz
  - zilliz cloud
  - 云
  - flush_all()
  - pymilvus30
displayed_sidebar: pythonSidebar

displayed_sidbar: pythonSidebar
---

import Admonition from '@theme/Admonition';


# flush_all()

此操作会刷新当前 Database 中的所有 Collection。这可确保所有已插入的数据都写入持久化存储。

## 请求语法\{#request-syntax}

```python
client.flush_all(
    timeout: float = None
)
```

**参数：**

- **timeout** (*float | None*) -

    此操作的超时时长。将其设置为 None 表示当收到任何响应或发生任何错误时，此操作即超时。

**返回类型：**

*NoneType*

**返回：**

None。

**异常：**

- **MilvusException**

    当此操作过程中发生任何错误时，将引发此异常。当此操作过程中发生任何错误时，将引发此异常。

## 示例\{#examples}

```python
from pymilvus import MilvusClient

client = MilvusClient(
    uri="YOUR_CLUSTER_ENDPOINT",
    token="YOUR_CLUSTER_TOKEN"
)

# Flush all collections
client.flush_all()
```
