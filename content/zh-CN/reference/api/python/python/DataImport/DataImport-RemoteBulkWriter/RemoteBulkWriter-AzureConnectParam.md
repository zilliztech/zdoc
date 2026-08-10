---
title: "AzureConnectParam | Python"
slug: /python/python/RemoteBulkWriter-AzureConnectParam
sidebar_label: "AzureConnectParam"
beta: false
added_since: v2.3.x
last_modified: false
deprecate_since: false
notebook: false
description: "AzureConnectParam 实例为 RemoteBulkWriter 实例设置连接参数。| Python"
type: docx
token: C2YSddNqZoDNmNxWqqEcuzhKn4f
sidebar_position: 2
keywords: 
  - 向量存储
  - 开源向量 Database
  - 向量索引
  - 开源向量 Database
  - zilliz
  - zilliz cloud
  - 云
  - AzureConnectParam
  - pymilvus30
displayed_sidebar: pythonSidebar

displayed_sidbar: pythonSidebar
---

import Admonition from '@theme/Admonition';


# AzureConnectParam

**AzureConnectParam** 实例为 **[RemoteBulkWriter](./DataImport-RemoteBulkWriter)** 实例设置连接参数。

```python
class pymilvus.RemoteBulkWriter.AzureConnectParam
```

## 构造函数\{#constructor}

使用一组参数（例如 **container_name**、**account_url**、**credential** 等）构造 **AzureConnectParam** 对象。

<Admonition type="info" icon="📘" title="Notes">

**AzureConnectParam** 对象定义了 Zilliz Cloud 连接到 Azure Blob 存储桶所需的参数。

您需要在初始化 **[RemoteBulkWriter](./DataImport-RemoteBulkWriter)** 对象之前创建此对象。

</Admonition>

```python
from pymilvus.bulk_writer import RemoteBulkWriter

connect_param = RemoteBulkWriter.AzureConnectParam(
    container_name: str,
    conn_str: str,
    account_url: Optional[str] = None,
    credential: Optional[Union[str, Dict[str, str]]] = None,
    upload_chunk_size: int = 8 * 1024 * 1024,
    upload_concurrency: int = 4,
)
```

**参数：**

- **container_name** (*str*)

    要连接的远程 Azure Blob 存储容器名称。

- **conn_str** (*str*)

    Azure Storage 账户的连接字符串，可解析为 **account_url** 和 **credential**。要生成连接字符串，请参阅[此链接](https://learn.microsoft.com/en-us/azure/storage/common/storage-configure-connection-string)。

- **account_url** (*str*)

    格式类似于 `https://<storage-account>.blob.core.windows.net` 的字符串。

    更多信息请参阅[此链接](https://learn.microsoft.com/en-us/azure/storage/common/storage-account-overview)。

- **credential** (*str*)

    该账户的访问密钥。更多信息请参阅[此链接](https://learn.microsoft.com/en-us/azure/storage/common/storage-account-keys-manage?tabs=azure-portal#view-account-access-keys)。

- **upload_chunk_size** (*int*)

    如果 Blob 大小大于此值或未知，则会通过并行连接分块上传 Blob。此参数会传递给 Azure 的 **max_single_put_size**。更多信息请参阅[此链接](https://learn.microsoft.com/en-us/azure/storage/blobs/storage-blob-upload-python#specify-data-transfer-options-for-upload)。

- **upload_concurrency** (*int*)

    分块上传时使用的最大并行连接数。 

    此参数会传递给 Azure 的 **max_concurrency**。更多信息请参阅[此链接](https://learn.microsoft.com/en-us/azure/storage/blobs/storage-blob-upload-python#specify-data-transfer-options-for-upload)。

**返回类型：**

*AzureConnectParam*

**返回值：**

一个 **AzureConnectParam** 对象。

**异常：**

- **Exception**

    如果连接失败，将引发此异常。

