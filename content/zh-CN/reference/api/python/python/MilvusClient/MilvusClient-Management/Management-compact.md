---
title: "compact() | Python | MilvusClient"
slug: /python/python/Management-compact
sidebar_label: "compact()"
beta: false
added_since: v2.4.x
last_modified: v3.0.x
deprecate_since: false
notebook: false
description: "此操作会启动一个压缩作业，将集合中的小分段合并，以改进存储布局并提升查询效率。 | Python | MilvusClient"
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

此操作会启动一个压缩作业，将集合中的小分段合并，以改进存储布局并提升查询效率。

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

- **collection_name** (*str*) -

    **[必需]**

    要执行压缩的集合名称。

- **is_clustering** (*bool*) -

    是否触发聚类压缩。

- **is_l0** (*bool*) -

    是否触发 L0 压缩。

- **target_size** (*int*) -

    压缩后目标分段大小，可选。必须为正整数。

- **target_size_unit** (*str*) -

    `target_size` 的单位。支持的值包括 `"b"`、`"kb"`、`"mb"`、`"gb"`、`"tb"` 和 `"pb"`。

- **timeout** (*float*) -

    可选的 RPC 超时时间，单位为秒。

- **kwargs** (*dict*) -

    可选的请求上下文参数。

**返回类型：**

*int*

用于后续状态查询的压缩作业 ID。

**异常：**

- **ParamError**

    当 `target_size` 不是整数，或 `target_size_unit` 无效时抛出。

- **MilvusException**

    当服务器拒绝请求或压缩 RPC 失败时抛出。

## 示例\{#examples}

```python
from pymilvus import MilvusClient

client = MilvusClient(uri="YOUR_CLUSTER_ENDPOINT", token="YOUR_CLUSTER_TOKEN")
job_id = client.compact(
    collection_name="book_catalog",
    is_clustering=True,
    target_size=512,
    target_size_unit="mb",
)

print(job_id)
```
