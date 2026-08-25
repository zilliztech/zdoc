---
title: "compact() | Python | MilvusClient"
slug: /python/python/Management-compact
sidebar_label: "compact()"
beta: false
added_since: v2.4.x
last_modified: v3.0.x
deprecate_since: false
notebook: false
description: "此操作触发手动 Compaction，合并 Collection 中的小 Segment，并返回 Compaction 作业 ID。 | Python | MilvusClient"
type: docx
token: ZANCdUPeBoCis1xylRUcR90Pndb
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

此操作触发手动 Compaction，合并 Collection 中的小 Segment，并返回 Compaction 作业 ID。

## 请求语法\{#request-syntax}

```python
compact(
    collection_name: str,
    is_clustering: Optional[bool] = False,
    is_l0: Optional[bool] = False,
    target_size: Optional[int] = None,
    target_size_unit: str = "mb",
    timeout: Optional[float] = None,
    **kwargs,
) -> int
```

**参数：**

- **collection_name** (*str*) -<br/>
  **[必填]**<br/>
  需要执行 Compaction 的 Collection 名称。

- **is_clustering** (*Optional[bool]*) -<br/>
  默认值：`False`<br/>
  用于指定是否执行聚类 Compaction 的标志。

- **is_l0** (*Optional[bool]*) -<br/>
  默认值：`False`<br/>
  用于指定是否执行 Level-0 Compaction 的标志。

- **target_size** (*Optional[int]*) -<br/>
  默认值：`None`<br/>
  Compaction 后的目标 Segment 大小。该值必须为正整数；若省略，则使用服务器默认值。

- **target_size_unit** (*str*) -<br/>
  默认值：`"mb"`<br/>
  `target_size` 的单位。支持的值包括 `b`、`kb`、`mb`、`gb`、`tb` 和 `pb`；默认值为 `mb`。

- **timeout** (*Optional[float]*) -<br/>
  默认值：`None`<br/>
  RPC 的最大等待时间（秒）。若省略，客户端将一直等待，直到服务器响应或发生错误。

- **kwargs** (*Any*) -<br/>
  额外的请求上下文选项。

**返回类型：**

*int*

**返回值：**

由 Milvus 返回的 Compaction 作业标识符。

**异常：**

- **MilvusException**<br/>
  当服务器拒绝请求或 RPC 失败时抛出。请查看服务器错误消息以获取具体的失败详情。

## 示例\{#examples}

演示 compact 的用法。

```python
from pymilvus import MilvusClient

client = MilvusClient(uri="YOUR_CLUSTER_ENDPOINT")
job_id = client.compact(collection_name="book_chunks", target_size=512, target_size_unit="mb")
print(job_id)
```
