---
title: "refresh_external_collection() | Python | MilvusClient"
slug: /python/python/Collections-refresh_external_collection
sidebar_label: "refresh_external_collection()"
beta: PUBLIC
added_since: v3.0.x
last_modified: false
deprecate_since: false
notebook: false
description: "此操作会扫描 Schema 定义的外部存储中的数据文件，并生成元数据文件，用于记录其与这些数据文件之间的映射关系。 | Python | MilvusClient"
type: docx
token: ZVs4dDpvmoXI0OxOnKhc9numnJd
sidebar_position: 29
keywords: 
  - 稀疏 vs 稠密
  - 稠密向量
  - 分层可导航小世界
  - 稠密嵌入
  - zilliz
  - zilliz cloud
  - 云
  - refresh_external_collection()
  - pymilvus30
displayed_sidebar: pythonSidebar

displayed_sidbar: pythonSidebar
---

import Admonition from '@theme/Admonition';


# refresh_external_collection()

此操作会扫描 Schema 定义的外部存储中的数据文件，并生成元数据文件，用于记录其与这些数据文件之间的映射关系。

<Admonition type="info" icon="📘" title="Notes">

这要求您使用项目 Endpoint 按如下方式设置 MilvusClient：

`https://{project-id}.{region}.api.zillizcloud.com`

</Admonition>

## 请求语法\{#request-syntax}

```python
refresh_external_collection(
    collection_name: str,
    external_source: str = "",
    external_spec: str = "",
    timeout: Optional[float] = None,
    **kwargs,    
) -> int
```

**参数：**

- **collection_name** (*string*) -

    **[必需]**

    现有外部 Collection 的名称。

- **external_source** (*str*) -

    外部源 URI，应为指向可访问外部卷的 `volume://` URI。例如，`volume://<volume-name>/path/to/folder/`..

- **external_spec** (*str*) -

    外部源规格，即一组次级参数：

    - **format** (*str*) - 

        目标源数据文件的格式。

        可能的值包括 `parquet`、`vortex`、`lance-table` 和 `iceberg-table`。

    - **snapshot_id** (*str*) -

        Iceberg 表的 ID。仅当 `format` 为 `iceberg-table` 时适用。

- **timeout** (*float*) -

    此操作的超时时长。 

    将此项设置为 **None** 表示当收到任意响应或发生任意错误时，此操作超时。

**返回类型：**

*int*

**返回值：**

一个整数，表示已创建的异步作业。

## 示例\{#examples}

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

