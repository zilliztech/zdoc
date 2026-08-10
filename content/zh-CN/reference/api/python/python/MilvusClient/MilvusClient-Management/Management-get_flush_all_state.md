---
title: "get_flush_all_state() | Python | MilvusClient"
slug: /python/python/Management-get_flush_all_state
sidebar_label: "get_flush_all_state()"
beta: false
added_since: v2.6.x
last_modified: false
deprecate_since: false
notebook: false
description: "此操作返回 flush-all 操作是否已完成。调用 `flushall()` 后，可使用此操作检查 flush 状态。 | Python | MilvusClient"
type: docx
token: G31wdmzVFo687JxZTAGctQlKnir
sidebar_position: 20
keywords: 
  - AI 聊天机器人
  - 余弦距离
  - 什么是向量 Database
  - 向量数据库
  - zilliz
  - zilliz cloud
  - 云
  - get_flush_all_state()
  - pymilvus30
displayed_sidebar: pythonSidebar

displayed_sidbar: pythonSidebar
---

import Admonition from '@theme/Admonition';


# get_flush_all_state()

此操作返回 flush-all 操作是否已完成。调用 `flush_all()` 后，可使用此操作检查 flush 状态。

<Admonition type="info" icon="📘" title="Notes">

这仅适用于托管 Collection。

</Admonition>

## 请求语法\{#request-syntax}

```python
client.get_flush_all_state(
    timeout: float = None
) -> bool
```

**参数：**

- **timeout** (*float* | *None*) -

    此操作的超时时长。将其设置为 **None** 表示当收到任意响应或发生任意错误时，此操作即超时。

**返回类型：**

*bool*

**返回值：**

如果 flush-all 操作已完成，则为 **True**；否则为 **False**。

**异常：**

- **MilvusException**

    此操作过程中发生任何错误时，将引发此异常。

## 示例\{#example}

```python
from pymilvus import MilvusClient

client = MilvusClient(
    uri="YOUR_CLUSTER_ENDPOINT",
    token="YOUR_CLUSTER_TOKEN"
)

client.flush_all()

# Check if flush completed
is_done = client.get_flush_all_state()
print(is_done)  # True or False
```
