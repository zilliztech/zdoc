---
title: "get_compact_state() | Python | MilvusClient"
slug: /python/python/Management-get_compact_state
sidebar_label: "get_compact_state()"
beta: false
added_since: v2.4.x
last_modified: false
deprecate_since: v2.6.x
notebook: false
description: "此操作返回指定压缩任务的状态。 | Python | MilvusClient"
type: docx
token: WEsjdspGLokueRxggM1cNFgknze
sidebar_position: 7
keywords: 
  - milvus db
  - milvus vector db
  - Zilliz Cloud
  - what is milvus
  - zilliz
  - zilliz cloud
  - cloud
  - get_compact_state()
  - pymilvus30
displayed_sidebar: pythonSidebar

displayed_sidbar: pythonSidebar
---

import Admonition from '@theme/Admonition';


# get_compact_state()

此操作返回指定压缩任务的状态。

<Admonition type="info" icon="📘" title="说明">

此方法已弃用。最新的等效方法请参见 [get_compaction_state()](./Management-get_compaction_state)。

</Admonition>

## 请求语法\{#request-syntax}

```python
get_compaction_state(
    self,
    job_id: int,
    timeout: Optional[float] = None,
    **kwargs,
) -> str
```

**参数：**

- **job_id** (*int*) -

    压缩任务 ID。

- **timeout** (*Optional[float]*) - 

    此操作的超时时长。

    将其设置为 None 表示当收到任何响应或发生任何错误时，此操作即超时。

**返回类型：**

*str*

**返回：**

指定压缩任务的状态。可能的值包括：

- `UndefinedState`

- `Executing`

- `Completed`

**异常：**

- **MilvusException**

    当此操作期间发生任何错误时，将引发此异常，尤其是在指定别名不存在时。

## 示例\{#example}

```python
from pymilvus import MilvusClient

# 1. Create a milvus client
client = MilvusClient(
    uri="https://inxx-xxxxxxxxxxxx.api.gcp-us-west1.zillizcloud.com:19530",
    token="user:password"
)

client.get_compact_state(
    job_id=45389273892800
)

# Completed
```

