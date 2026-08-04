---
title: "get_flush_all_state() | Python | MilvusClient"
slug: /python/python/Management-get_flush_all_state
sidebar_label: "get_flush_all_state()"
beta: false
added_since: v2.6.x
last_modified: false
deprecate_since: false
notebook: false
description: "此操作返回 flush-all 操作是否已完成。在调用 `flushall()` 后，可使用此方法检查 flush 状态。 | Python | MilvusClient"
type: docx
token: G31wdmzVFo687JxZTAGctQlKnir
sidebar_position: 20
keywords: 
  - AI chatbots
  - cosine distance
  - what is a vector database
  - vectordb
  - zilliz
  - zilliz cloud
  - cloud
  - get_flush_all_state()
  - pymilvus30
displayed_sidebar: pythonSidebar

displayed_sidbar: pythonSidebar
---

import Admonition from '@theme/Admonition';


# get_flush_all_state()

此操作返回 flush-all 操作是否已完成。在调用 `flush_all()` 后，可使用此方法检查 flush 状态。

<Admonition type="info" icon="📘" title="注意">

这仅适用于托管集合。

</Admonition>

## 请求语法\{#request-syntax}

```python
client.get_flush_all_state(
    timeout: float = None
) -> bool
```

**参数：**

- **timeout** (*float* | *None*) -

    此操作的超时时长。将其设置为 **None** 表示当收到任何响应或发生任何错误时，此操作即超时。

**返回类型：**

*bool*

**返回值：**

如果 flush-all 操作已完成，则返回 **True**；否则返回 **False**。

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

client.flush_all()

# Check if flush completed
is_done = client.get_flush_all_state()
print(is_done)  # True or False
```
