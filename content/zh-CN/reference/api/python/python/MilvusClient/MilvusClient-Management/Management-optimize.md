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
sidebar_position: 26
keywords: 
  - 开源向量 Database
  - 向量索引
  - 开源向量 Database
  - 开源向量数据库
  - zilliz
  - zilliz cloud
  - 云
  - optimize()
  - pymilvus30
displayed_sidebar: pythonSidebar

displayed_sidbar: pythonSidebar
---

import Admonition from '@theme/Admonition';


# optimize()

- **is_l0** (*bool*) -

    是否运行 L0 Compaction。

- **target_size** (*int*) -

    Compaction 后的目标 Segment 大小。必须为正整数。如果省略，则使用服务器默认值。

- **target_size_unit** (*str*) -

    `target_size` 的单位。支持的值包括 `"b"`、`"kb"`、`"mb"`、`"gb"`、`"tb"` 和 `"pb"`。客户端会在发送请求前将该值转换为 MB。

此操作会对 Collection 中的小 Segment 执行 Compaction，并返回一个 Compaction 作业 ID，您可以轮询其进度。

<Admonition type="warning" icon="🚧" title="Warning">

这是一个预览版功能，仅供非生产用途使用（Benchmark、POC）。

</Admonition>

<Admonition type="info" icon="📘" title="Notes">

此方法仅适用于 dedicated serving cluster 和按需计算。

- 如果要在 serving cluster 的 Collection 中执行此操作，请使用集群 Endpoint 创建 **[MilvusClient](./Client-MilvusClient)**。

    - **Free & Serverless**

        `https://{cluster-id}.serverless.{region}.vectordb.zillizcloud.com`

    - **Dedicated**

        `https://{cluster-id}.{region}.vectordb.zillizcloud.com:19530`

- 如果要在按需计算的 Collection 中执行此操作，请使用项目 Endpoint 创建 **[MilvusClient](./Client-MilvusClient)**，然后创建一个会话，将其附加到按需集群以执行搜索。

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

    要优化的 Collection 名称。

- **is_clustering** (*bool*) -

    目标 Segment 大小。格式：`"1000MB"`、`"1GB"`、`"1.2gb"`。如果未提供，则使用系统默认值。

- **wait** (*bool*) -

    是否等待优化完成。默认为 **True**。如果为 **False**，则返回一个 `OptimizeTask` 以进行异步跟踪。

- **timeout** (*float*) -

    等待优化完成的最长时间（秒）。仅在 `wait=True` 时适用。

**返回类型：**
*OptimizeResult | OptimizeTask*

当 `wait=True` 时，返回一个 `OptimizeResult`；当 `wait=False` 时，返回一个 `OptimizeTask`。

**返回值：**

当 `wait=True` 时，返回一个 **OptimizeResult**，包含 status、collection_name、compaction_id、target_size 和 progress。当 `wait=False` 时，返回一个 **OptimizeTask**，支持 `done()`、`progress()`、`result()` 和 `cancel()`。

**异常：**

- **ParamError**

    当 `collection_name` 无效或 `target_size` 格式不正确时，将引发此异常。

- **MilvusException**

    当索引构建失败、Compaction 失败或发生超时时，将引发此异常。

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
