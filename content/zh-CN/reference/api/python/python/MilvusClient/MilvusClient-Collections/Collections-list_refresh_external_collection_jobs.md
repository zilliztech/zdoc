---
title: "list_refresh_external_collection_jobs() | Python | MilvusClient"
slug: /python/python/Collections-list_refresh_external_collection_jobs
sidebar_label: "list_refresh_external_collection_jobs()"
beta: PUBLIC
added_since: v3.0.x
last_modified: v3.0.x
deprecate_since: false
notebook: false
description: "此操作会列出所有或指定 Collection 的外部 Collection 刷新任务。 | Python | MilvusClient"
type: docx
token: VkBFdLHwao9hVMxzRurcBYIynFh
sidebar_position: 29
keywords: 
  - 大型语言模型
  - 向量化
  - k 近邻算法
  - ANNS
  - Zilliz
  - Zilliz Cloud
  - 云
  - list_refresh_external_collection_jobs()
  - pymilvus30
displayed_sidebar: pythonSidebar

---

import Admonition from '@theme/Admonition';


# list_refresh_external_collection_jobs()

此操作会列出所有或指定 Collection 的外部 Collection 刷新任务。

<Admonition type="info" title="Notes">

此操作要求使用以下项目 Endpoint 配置 MilvusClient：

`https://{project-id}.{region}.api.zillizcloud.com`

</Admonition>

## 请求语法\{#request-syntax}

```python
def list_refresh_external_collection_jobs(
```

**参数：**

- **collection_name** （*string*） -

    目标 Collection 的名称。如果未指定此参数，则会返回所有外部 Collection 的刷新任务。

- **timeout** （*float*） -

    此操作的超时时长。将其设置为 None 表示当收到任意响应或发生错误时，此操作即超时。

**返回类型：**

*List*

**返回：**

一个 RefreshExternalCollectionJobInfo 对象列表，其中的每个对象记录一个外部 Collection 刷新任务的详细信息。

**参数：**

- **job_id** （*int*） -

    当前请求中指定的任务 ID。

- **collection_name** （*string*） -

    在 `refresh_external_collection()` 中指定的外部 Collection 的名称。

- **state** （*string*） -

    指定任务的当前状态。可选值为：

    - RefreshPending

    - RefreshInProgress

    - RefreshFailed

    - RefreshCompleted

- **progress** （*int*） -

    指定任务的当前进度。该值为 0 到 100 之间的整数。

- **external_source** （*str*） -

    在 `refresh_external_collection()` 中指定的外部源 URI。

- **external_specs** （*str*） -

    在 `refresh_external_collection()` 中指定的外部规范。

- **reason** （*str*） -

    刷新操作失败时的错误提示。正常情况下为空字符串。

- **start_time** （*int*） -

    指定任务开始时的毫秒级时间戳。

- **end_time** （*int*） -  

    指定任务结束时的毫秒级时间戳。

## 示例\{#examples}

```python
import time

from pymilvus import MilvusClient

# 1. Set up a milvus client
client = MilvusClient(
    uri="YOUR_CLUSTER_ENDPOINT",
    token="YOUR_CLUSTER_TOKEN"
)

job_id = client.refresh_external_collection(
    collection_name="test_collection"
)

while True:
    progress = client.get_refresh_external_collection_progress(job_id=job_id)
    print(f"  {progress.state}: {progress.progress}%")

    if progress.state == "RefreshCompleted":
        elapsed = progress.end_time - progress.start_time
        print(f"  Completed in {elapsed}ms")
        break
    elif progress.state == "RefreshFailed":
        print(f"  Failed: {progress.reason}")
        break

    time.sleep(2)
```

```python
from pymilvus import MilvusClient

# 1. Set up a milvus client
client = MilvusClient(
    uri="YOUR_PROJECT_ENDPOINT",
    token="YOUR_API_KEY"
)

job_id = client.refresh_external_collection(
    collection_name="test_collection"
)

while True:
    progress = client.get_refresh_external_collection_progress(job_id=job_id)
    print(f"  {progress.state}: {progress.progress}%")

    if progress.state == "RefreshCompleted":
        elapsed = progress.end_time - progress.start_time
        print(f"  Completed in {elapsed}ms")
        return job_id
    elif progress.state == "RefreshFailed":
        print(f"  Failed: {progress.reason}")
        return job_id

    time.sleep(2)
```

