---
title: "optimize() | Python | MilvusClient"
slug: /python/python/Management-optimize
sidebar_label: "optimize()"
beta: false
added_since: v2.6.x
last_modified: false
deprecate_since: false
notebook: false
description: "- isl0 (bool) - | Python | MilvusClient"
type: docx
token: MhRidjHwYorxaexS8WXcaxWQnjd
sidebar_position: 24
keywords: 
  - open source vector database
  - Vector index
  - vector database open source
  - open source vector db
  - zilliz
  - zilliz cloud
  - cloud
  - optimize()
  - pymilvus30
displayed_sidebar: pythonSidebar

displayed_sidbar: pythonSidebar
---

import Admonition from '@theme/Admonition';


# optimize()

- **is_l0** (*bool*) -

    是否运行 L0 压缩。

- **target_size** (*int*) -

    压缩后的目标 segment 大小。必须为正整数。如果省略，则使用服务器默认值。

- **target_size_unit** (*str*) -

    `target_size` 的单位。支持的值包括 `"b"`、`"kb"`、`"mb"`、`"gb"`、`"tb"` 和 `"pb"`。客户端会在发送请求前将该值转换为 MB。

此操作会压缩 collection 中的小 segment，并返回一个可用于轮询进度的压缩任务 ID。

<Admonition type="warning" icon="🚧" title="警告">

这是一个预览版功能，仅用于非生产用途（Benchmark、POC）。

</Admonition>

<Admonition type="info" icon="📘" title="说明">

此方法仅适用于专用服务集群和按需计算。 

- 对于在服务集群的 collection 上执行此操作，请使用集群端点创建 **[MilvusClient](./Client-MilvusClient)**。

    - **Free & Serverless**

        `https://{cluster-id}.serverless.{region}.vectordb.zillizcloud.com`

    - **Dedicated**

        `https://{cluster-id}.{region}.vectordb.zillizcloud.com:19530`

- 对于在按需计算的 collection 上执行此操作，请使用项目端点创建 **[MilvusClient](./Client-MilvusClient)**，然后创建一个会话以附加到按需集群进行搜索。

    `https://{project-id}.{region}.api.zillizcloud.com`

</Admonition>

## 请求语法\{#request-syntax}

```python
client.optimize(
    collection_name: str,
    is_clustering: bool = False,
    is_l0: bool = False,
    target_size: int | None = None,
    target_size_unit: str = "mb",
    wait: bool = True,
    timeout: float | None = None,
)
```

**参数：**

- **collection_name** (*str*) -

    **[必需]**

    要优化的 collection 名称。

- **is_clustering** (*bool*) -

    目标 segment 大小。格式：`"1000MB"`、`"1GB"`、`"1.2gb"`。如果未提供，则使用系统默认值。

- **wait** (*bool*) -

    是否等待优化完成。默认为 **True**。如果为 **False**，则返回一个 `OptimizeTask` 用于异步跟踪。

- **timeout** (*float*) -

    等待优化完成的最长时间（秒）。仅在 `wait=True` 时生效。

**返回类型：**
*OptimizeResult | OptimizeTask*

当 `wait=True` 时，返回一个 `OptimizeResult`；当 `wait=False` 时，返回一个 `OptimizeTask`。

**返回值：**

当 `wait=True` 时，返回一个包含 status、collection_name、compaction_id、target_size 和 progress 的 **OptimizeResult**。当 `wait=False` 时，返回一个支持 `done()`、`progress()`、`result()` 和 `cancel()` 的 **OptimizeTask**。

**异常：**

- **ParamError**

    当 `collection_name` 无效或 `target_size` 格式不正确时，将引发此异常。

- **MilvusException**

    当索引构建失败、压缩失败或发生超时时，将引发此异常。

## 示例\{#examples}

```python
from pymilvus import MilvusClient

client = MilvusClient(uri="YOUR_CLUSTER_ENDPOINT", token="YOUR_CLUSTER_TOKEN")

# Wait for completion
result = client.optimize(
    collection_name="book",
    target_size=512,
    target_size_unit="mb",
    wait=True,
)
print(result)

# Run asynchronously
task = client.optimize(
    collection_name="book",
    is_clustering=True,
    target_size=1,
    target_size_unit="gb",
    wait=False,
)
print(task.job_id)
```
