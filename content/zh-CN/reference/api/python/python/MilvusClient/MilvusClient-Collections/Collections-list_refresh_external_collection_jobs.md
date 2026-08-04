---
title: "list_refresh_external_collection_jobs() | Python | MilvusClient"
slug: /python/python/Collections-list_refresh_external_collection_jobs
sidebar_label: "list_refresh_external_collection_jobs()"
beta: PUBLIC
added_since: v3.0.x
last_modified: false
deprecate_since: false
notebook: false
description: "此操作列出所有或指定集合的外部集合刷新任务。 | Python | MilvusClient"
type: docx
token: VkBFdLHwao9hVMxzRurcBYIynFh
sidebar_position: 28
keywords: 
  - Large language model
  - Vectorization
  - k nearest neighbor algorithm
  - ANNS
  - zilliz
  - zilliz cloud
  - cloud
  - list_refresh_external_collection_jobs()
  - pymilvus30
displayed_sidebar: pythonSidebar

displayed_sidbar: pythonSidebar
---

import Admonition from '@theme/Admonition';


# list_refresh_external_collection_jobs()

此操作列出所有或指定集合的外部集合刷新任务。

<Admonition type="info" icon="📘" title="说明">

这要求使用如下项目端点设置 MilvusClient：

`https://{project-id}.{region}.api.zillizcloud.com`

</Admonition>

## 请求语法\{#request-syntax}

```python
def list_refresh_external_collection_jobs(
    collection_name: str = "",
    timeout: Optional[float] = None,
    **kwargs,
) -> List:
```

**参数：**

- **collection_name** (*string*) -

    目标集合的名称。如果未指定此参数，则返回所有外部集合的刷新任务。

- **timeout** (*float*) - 

    此操作的超时时长。

    将其设置为 **None** 表示当收到任意响应或发生任何错误时，此操作即超时。

**返回类型：**

*List*

**返回值：**

一个 **RefreshExternalCollectionJobInfo** 对象列表，每个对象都记录一个外部集合刷新任务的详细信息。

**参数：**

- **job_id** (*int*) -

    当前请求中指定的任务 ID。

- **collection_name** (*string*) -

    在 `refresh_external_collection()` 中指定的外部集合名称。

- **state** (*string*) -

    指定任务的当前状态。可能的值包括：

    - RefreshPending

    - RefreshInProgress

    - RefreshFailed

    - RefreshCompleted

- **progress** (*int*) -

    指定任务的当前进度。该值为 0 到 100 的整数。

- **external_source** (*str*) -

    在 `refresh_external_collection()` 中指定的外部源 URI。

- **external_specs** (*str*) -

    在 `refresh_external_collection()` 中指定的外部规格。

- **reason** (*str*) -

    如果刷新操作失败，则为错误提示。在正常情况下，该值为空字符串。

- **start_time** (*int*) -

    指定任务开始时的毫秒级时间戳。

- **end_time** (*int*) -  

    指定任务结束时的毫秒级时间戳。

## 示例\{#example}

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

