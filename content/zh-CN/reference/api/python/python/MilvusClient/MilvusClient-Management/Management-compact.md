---
title: "compact() | Python | MilvusClient"
slug: /python/python/Management-compact
sidebar_label: "compact()"
beta: false
added_since: v2.4.x
last_modified: v3.0.x
deprecate_since: false
notebook: false
description: "此操作会启动一个 Compaction 作业，用于合并 Collection 中的小 Segment，以改善存储布局和查询效率。 | Python | MilvusClient"
type: docx
token: CQawdFCJcodv5lx91kBck7rLnwh
sidebar_position: 2
keywords: 
  - hybrid search
  - lexical search
  - nearest neighbor search
  - Agentic RAG
  - zilliz
  - zilliz cloud
  - cloud
  - compact()
  - pymilvus30
displayed_sidebar: pythonSidebar

displayed_sidbar: pythonSidebar
---

import Admonition from '@theme/Admonition';


# compact()

此操作会启动一个 Compaction 作业，用于合并 Collection 中的小 Segment，以改善存储布局和查询效率。

## 请求语法\{#request-syntax}

```python
compact(
```

**参数：**

- **collection_name** (*str*) -

    **[必需]**

    目标 Collection 的名称。

- **is_clustering** (*bool*) -

    一个用于指示是否 he 的标志。

- **is_l0** (*bool*) -

    一个用于指示是否 he 的标志。

- **target_size** (*int*) -

    一个用于指定 Compaction 后目标 Segment 大小的选项。必须为正整数。单位由 target_size_unit 指定（默认为 MB）。如果未提供，服务器将使用其默认目标大小。

- **target_size_unit** (*str*) -

    一个用于指定 target_size 单位的选项。支持的值为 "b"、"kb"、"mb"（默认）、"gb"、"tb"、"pb"。该值在发送到服务器之前会转换为 MB。

- **timeout** (*float*) -

    此操作的超时持续时间。将其设置为 None 表示当收到任意响应或发生错误时，此操作即超时。

- **kwargs** (*dict*) -

    可选的请求上下文参数。

**返回类型：**

*int*

**返回值：**

用于后续状态查询的 Compaction 作业 ID。Compaction 作业 ID，可用于获取 Compaction 状态。

**异常：**

- **ParamError**

    当 `target_size` 不是整数或 `target_size_unit` 无效时引发。当 `target_size` 不是整数或 `target_size_unit` 无效时引发。

- **MilvusException**

    此操作期间发生任何错误时都会引发此异常。此操作期间发生任何错误时都会引发此异常。

## 示例\{#examples}

```python
from pymilvus import MilvusClient

client = MilvusClient(
    uri="YOUR_CLUSTER_ENDPOINT",
    token="YOUR_CLUSTER_TOKEN",
)
job_id = client.compact(
    collection_name="book_catalog",
    is_clustering=True,
    target_size=512,
    target_size_unit="mb",
)

print(job_id)
```
