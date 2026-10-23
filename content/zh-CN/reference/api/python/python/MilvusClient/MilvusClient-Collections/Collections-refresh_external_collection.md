---
title: "refresh_external_collection() | Python | MilvusClient"
slug: /python/python/Collections-refresh_external_collection
sidebar_label: "refresh_external_collection()"
beta: PUBLIC
added_since: v3.0.x
last_modified: v3.0.x
deprecate_since: false
notebook: false
description: "此操作会扫描 Schema 定义的外部存储中的数据文件，并生成元数据文件，以记录这些文件与相应数据文件之间的映射关系。 | Python | MilvusClient"
type: docx
token: ZVs4dDpvmoXI0OxOnKhc9numnJd
sidebar_position: 30
keywords: 
  - 稀疏与稠密
  - 稠密向量
  - 分层可导航小世界
  - 稠密嵌入
  - Zilliz
  - Zilliz Cloud
  - 云
  - refresh_external_collection()
  - pymilvus30
displayed_sidebar: pythonSidebar

displayed_sidbar: pythonSidebar
---

import Admonition from '@theme/Admonition';


# refresh_external_collection()

此操作会扫描 Schema 定义的外部存储中的数据文件，并生成元数据文件，以记录这些文件与相应数据文件之间的映射关系。

<Admonition type="info" title="Notes">

这要求使用如下项目 Endpoint 设置 MilvusClient：

`https://{project-id}.{region}.api.zillizcloud.com`

</Admonition>

## 请求语法\{#request-syntax}

```python
refresh_external_collection(
```

**参数：**

- **collection_name** （*string*） -

    **[必需]**

    现有外部 Collection 的名称。

- **external_source** （*str*） -

    外部源 URI，类似于 AWS S3 对象路径。

- **external_spec** （*str*） -

    外部源规范，是一组次级参数：format（str）：目标源数据文件的格式。可选值为 parquet、vortex、lance-table 和 iceberg-table。snapshot_id（str）：Iceberg 表的 ID。仅当 format 为 iceberg-table 时适用。extfs（string）：以字符串化 JSON 结构表示的外部文件系统设置。可选选项如下：access_key_id（string）：您的对象存储服务的访问密钥 ID。access_key_val（string）：您的对象存储服务的访问密钥值。cloud_provider（string）：您的对象存储服务的云提供商。region（string）：您的对象存储服务的区域。use_iam（string）：是否使用 AWS IAM 进行存储桶访问身份验证。可选值为 "true" 或 "false"。iam_endpoint（string）：AWS IAM STS Endpoint。use_ssl（string）：访问您的对象存储桶时是否使用 SSL。可选值为 "true" 或 "false"。use_virtual_host（string）：存储桶访问是否使用虚拟主机。有关详情，请参见这篇文章。storage_type（string）：存储类型。可选值为 remote。role_arn（string）：从存储桶所有者处获取的 AWS IAM 角色 ARN。external_id（string）：从存储桶所有者处获取的外部 ID。load_frequency（string）：Milvus 获取临时身份验证凭据的时间间隔，单位为秒。

- **timeout** （*float*） -

    此操作的超时时间。将其设置为 None 表示当收到任意响应或发生错误时，此操作即超时。

- **external_source** （*str*） -

    外部源 URI，应是指向可访问外部卷的 `volume://` URI。例如，`volume://<volume-name>/path/to/folder/`。

- **external_spec** （*str*） -

    外部源规范，是一组次级参数：

    - **format** （*str*） - 

        目标源数据文件的格式。

        可选值为 `parquet`、`vortex`、`lance-table` 和 `iceberg-table`。

    - **snapshot_id** （*str*） -

        Iceberg 表的 ID。仅当 `format` 为 `iceberg-table` 时适用。

**返回类型：**

*int*

**返回：**

一个整数，表示已创建的异步任务。

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
