---
title: "get_refresh_external_collection_progress() | Python | MilvusClient"
slug: /python/python/Collections-get_refresh_external_collection_progress
sidebar_label: "get_refresh_external_collection_progress()"
beta: PUBLIC
added_since: v3.0.x
last_modified: false
deprecate_since: false
notebook: false
description: "此操作返回指定外部 Collection 刷新作业的进度。 | Python | MilvusClient"
type: docx
token: HITBdKb0HotcK0xCKsycEeuqnXe
sidebar_position: 27
keywords: 
  - 推荐系统
  - 信息检索
  - 降维
  - HNSW 算法
  - Zilliz
  - Zilliz Cloud
  - 云
  - get_refresh_external_collection_progress()
  - pymilvus30
displayed_sidebar: pythonSidebar

displayed_sidbar: pythonSidebar
---

import Admonition from '@theme/Admonition';


# get_refresh_external_collection_progress()

此操作返回指定外部 Collection 刷新作业的进度。

<Admonition type="info" icon="📘" title="Notes">

这需要使用项目 Endpoint 按如下方式设置一个 MilvusClient：

`https://{project-id}.{region}.api.zillizcloud.com`

</Admonition>

## 请求语法\{#request-syntax}

```python
def get_refresh_external_collection_progress(
    job_id: int,
    timeout: Optional[float] = None,
    **kwargs,
) -> RefreshExternalCollectionJobInfo:
```

**参数：**

- **job_id** (*int*) -

    **[必需]**

    由 `refresh_external_collection()` 返回的作业 ID。

- **timeout** (*float*) - 

    此操作的超时时长。 

    将其设置为 **None** 表示当收到任何响应或发生任何错误时，此操作即超时。

**返回类型：**

*RefreshExternalCollectionJobInfo*

**返回：**

一个 **RefreshExternalCollectionJobInfo** 对象，用于记录指定外部 Collection 刷新作业的详细信息。

**参数：**

- **job_id** (*int*) -

    当前请求中指定的作业 ID。

- **collection_name** (*string*) -

    在 `refresh_external_collection()` 中指定的外部 Collection 名称。

- **state** (*string*) -

    指定作业的当前状态。可能的值包括：

    - RefreshPending

    - RefreshInProgress

    - RefreshFailed

    - RefreshCompleted

- **progress** (*int*) -

    指定作业的当前进度。该值是一个范围为 0 到 100 的整数。

- **external_source** (*str*) -

    在 `refresh_external_collection()` 中指定的外部源 URI。

- **external_specs** (*str*) -

    在 `refresh_external_collection()` 中指定的外部规格。

- **reason** (*str*) -

    如果刷新操作失败，则为错误提示。正常情况下为空字符串。

- **start_time** (*int*) -

    指定作业开始时的毫秒级时间戳。

- **end_time** (*int*) -  

    指定作业结束时的毫秒级时间戳。

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

