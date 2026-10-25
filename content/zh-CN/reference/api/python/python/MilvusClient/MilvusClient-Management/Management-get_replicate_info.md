---
title: "get_replicate_info() | Python | MilvusClient"
slug: /python/python/Management-get_replicate_info
sidebar_label: "get_replicate_info()"
beta: false
added_since: v3.0.x
last_modified: false
deprecate_since: false
notebook: false
description: "此操作会获取源集群和源 pchannel 的复制检查点状态。 | Python | MilvusClient"
type: docx
token: C5UqdwH46o2mt1xleeRcx51knJA
sidebar_position: 22
keywords: 
  - 向量 Database 比较
  - Faiss
  - 视频搜索
  - AI 幻觉
  - Zilliz
  - Zilliz Cloud
  - 云
  - get_replicate_info()
  - pymilvus30
displayed_sidebar: pythonSidebar

---

import Admonition from '@theme/Admonition';


# get_replicate_info()

此操作会获取源集群和源 pchannel 的复制检查点状态。

## 请求语法\{#request-syntax}

```python
get_replicate_info(
    source_cluster_id: str,
    target_pchannel: str,
    timeout: Optional[float] = None,
    **kwargs
)
```

**参数：**

- **source_cluster_id** （*str*） -

    **[必需]**

    源集群的 ID。

- **target_pchannel** （*str*） -

    **[必需]**

    源集群中物理通道的名称。

- **timeout** （*Optional[float]*） -

    等待 RPC 完成的最长时间，单位为秒。

- **kwargs** （*Any*） -

    其他请求上下文选项。

**异常：**

- **MilvusException**

    当服务器拒绝请求或 RPC 失败时抛出。请查看服务器错误消息，以了解确切的失败原因。

## 示例\{#examples}

```python
from pymilvus import MilvusClient

client = MilvusClient(uri="YOUR_CLUSTER_ENDPOINT")
info = client.get_replicate_info(
    source_cluster_id="source-1",
    target_pchannel="by-dev-rootcoord-dml_0",
)
```
