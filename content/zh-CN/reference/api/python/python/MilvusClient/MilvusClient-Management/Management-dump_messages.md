---
title: "dump_messages() | Python | MilvusClient"
slug: /python/python/Management-dump_messages
sidebar_label: "dump_messages()"
beta: false
added_since: v3.0.x
last_modified: false
deprecate_since: false
notebook: false
description: "此操作会转储指定消息 ID 和时间 tick 范围内物理通道的消息。 | Python | MilvusClient"
type: docx
token: W2HMdGNjrokVNvxQqYEcFR5Yn4g
sidebar_position: 16
keywords: 
  - DiskANN
  - 稀疏向量
  - 向量维度
  - ANN 搜索
  - zilliz
  - zilliz cloud
  - 云
  - dump_messages()
  - pymilvus30
displayed_sidebar: pythonSidebar

---

import Admonition from '@theme/Admonition';


# dump_messages()

此操作会转储指定消息 ID 和时间 tick 范围内物理通道的消息。

## 请求语法\{#request-syntax}

```python
dump_messages(
    pchannel: str,
    start_message_id: Dict,
    start_timetick: int = 0,
    end_timetick: int = 0,
    timeout: Optional[float] = None,
    **kwargs
)
```

**参数：**

- **pchannel** （*str*） -

    **[必需]**

    要从中转储消息的物理通道名称。

- **start_message_id** （*Dict*） -

    **[必需]**

    起始预写日志位置，以包含 `id` 和 `wal_name` 的对象表示。可以直接传入 `get_replicate_info()` 返回的 `message_id`。

- **start_timetick** （*int*） -

    包含边界的时间 tick 下限。使用 `0` 可省略下限。

- **end_timetick** （*int*） -

    包含边界的时间 tick 上限。使用 `0` 可继续流式传输，直到 RPC 被取消。

- **timeout** （*Optional[float]*） -

    整个流式传输允许的最长时间，单位为秒。

- **kwargs** （*Any*） -

    传递给底层客户端或请求的其他关键字参数。

**异常：**

- **MilvusException**

    当服务器拒绝请求或 RPC 失败时引发。请查看服务器错误消息以了解确切的失败原因。

## 示例\{#examples}

```python
from pymilvus import MilvusClient

client = MilvusClient(uri="YOUR_CLUSTER_ENDPOINT")
messages = client.dump_messages(
    pchannel="by-dev-rootcoord-dml_0_449019091。",
    start_message_id={},
)
```
