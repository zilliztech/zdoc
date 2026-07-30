---
title: "S3ConnectParam | Python"
slug: /python/python/RemoteBulkWriter-S3ConnectParam
sidebar_label: "S3ConnectParam"
beta: false
added_since: v2.3.x
last_modified: false
deprecate_since: false
notebook: false
description: "S3ConnectParam 实例为 RemoteBulkWriter 实例设置连接参数。 | Python"
type: docx
token: CSpOd0XgWoVAhzx5xbVcpCVfnPg
sidebar_position: 5
keywords: 
  - information retrieval
  - dimension reduction
  - hnsw algorithm
  - vector similarity search
  - zilliz
  - zilliz cloud
  - cloud
  - S3ConnectParam
  - pymilvus30
displayed_sidebar: pythonSidebar

displayed_sidbar: pythonSidebar
---

import Admonition from '@theme/Admonition';


# S3ConnectParam

**S3ConnectParam** 实例为 **[RemoteBulkWriter](./DataImport-RemoteBulkWriter)** 实例设置连接参数。

```python
class pymilvus.RemoteBulkWriter.S3ConnectParam
```

## Constructor\{#constructor}

使用一组参数（例如 **bucket_name**、**access_key**、**secret_key** 等）构造一个 **S3ConnectParam** 对象。

<Admonition type="info" icon="📘" title="说明">

**S3ConnectParam** 对象定义了 Zilliz Cloud 连接到兼容 AWS S3 的存储桶所需的参数。

您需要先创建此对象，然后再初始化 **[RemoteBulkWriter](./DataImport-RemoteBulkWriter)** 对象。

</Admonition>

```python
from urllib3.poolmanager import PoolManager
from minio.credentials import Provider
from pymilvus.bulk_writer import RemoteBulkWriter

connect_param = RemoteBulkWriter.S3ConnectParam(
    bucket_name="string",
    endpoint="string",
    access_key="string",
    secret_key="string",
    secure=False,
    session_token="string",
    region="str",
    http_client=PoolManager(),
    credentials=Provider()
)
```

**参数：**

- **bucket_name** (*str*)

    要连接的远程存储桶的名称。

- **endpoint** (*str*)

    兼容 AWS S3 的服务的 URL。

    该值可以是 MinIO 服务的 URL，或任何兼容 AWS S3 的公共服务的 URL。

    | **服务名称** | **端点** |
    | --- | --- |
    | **AWS S3** | s3.amazonaws.com |
    | **GCS** | storage.googleapis.com |

- **access_key** (*str*)

    用于验证对指定存储桶的访问权限的 access key（用户 ID）。

- **secret_key** (*str*)

    用于验证对指定存储桶的访问权限的 secret_key（密码）。

- **secure** (*bool*)

    是否使用安全（TLS）连接访问兼容 AWS S3 的服务。 

- **session_token** (*str*)

    您在兼容 AWS S3 的服务中的账户会话令牌。

- **region** (*str*)

    存储桶所在区域的名称或 ID。

- **http_client** (*urllib3.poolmanager.PoolManager*)

    自定义 HTTP 客户端。

- **credentials** (*minio.credentials.Provider*)    

    您在兼容 AWS S3 的服务中的账户凭证提供程序。

**返回类型：**

*[RemoteBulkWriter](./DataImport-RemoteBulkWriter)*

**返回：**

一个 **[RemoteBulkWriter](./DataImport-RemoteBulkWriter)** 对象。

**异常：**

- **Exception**

    如果连接失败，将引发此异常。

