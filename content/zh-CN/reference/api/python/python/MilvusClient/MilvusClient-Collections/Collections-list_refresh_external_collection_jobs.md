---
title: "list_refresh_external_collection_jobs() | Python | MilvusClient"
slug: /python/python/Collections-list_refresh_external_collection_jobs
sidebar_label: "list_refresh_external_collection_jobs()"
beta: PUBLIC
added_since: v3.0.x
last_modified: false
deprecate_since: false
notebook: false
description: "此操作列出所有或指定 Collection 的外部 Collection 刷新作业。 | Python | MilvusClient"
type: docx
token: VkBFdLHwao9hVMxzRurcBYIynFh
sidebar_position: 28
keywords: 
  - 大语言模型
  - 向量化
  - k 最近邻算法
  - ANNS
  - zilliz
  - zilliz cloud
  - 云
  - list_refresh_external_collection_jobs()
  - pymilvus30
displayed_sidebar: pythonSidebar

displayed_sidbar: pythonSidebar
---

import Admonition from '@theme/Admonition';


# list_refresh_external_collection_jobs()

此操作列出所有或指定 Collection 的外部 Collection 刷新作业。

<Admonition type="info" icon="📘" title="Notes">

这需要使用项目 Endpoint 按如下方式设置 MilvusClient：

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

    目标 Collection 的名称。如果未指定此参数，则返回所有外部 Collection 的刷新作业。

- **timeout** (*float*) - 

    此操作的超时时长。

    将此参数设置为 **None** 表示当收到任何响应或发生任何错误时，此操作超时。

**返回类型：**

*List*

**返回值：**

由 **RefreshExternalCollectionJobInfo** 对象组成的列表，每个对象记录一个外部 Collection 刷新作业的详细信息。

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

    指定作业的当前进度。该值为 0 到 100 的整数。

- **external_source** (*str*) -

    在 `refresh_external_collection()` 中指定的外部源 URI。

- **external_specs** (*str*) -

    在 `refresh_external_collection()` 中指定的外部 specs。

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

