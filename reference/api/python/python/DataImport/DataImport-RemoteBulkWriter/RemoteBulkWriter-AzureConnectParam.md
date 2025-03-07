---
displayed_sidbar: pythonSidebar
title: "AzureConnectParam | Python"
slug: /python/python/RemoteBulkWriter-AzureConnectParam
sidebar_label: "AzureConnectParam"
beta: false
notebook: false
description: "An AzureConnectParam instance sets connection parameters for a RemoteBulkWriter instance. | Python"
type: docx
token: C2YSddNqZoDNmNxWqqEcuzhKn4f
sidebar_position: 2
keywords: 
  - what is semantic search
  - Embedding model
  - image similarity search
  - Context Window
  - zilliz
  - zilliz cloud
  - cloud
  - AzureConnectParam
  - pymilvus25
  - Question answering system
  - llm-as-a-judge
  - hybrid vector search
  - Video deduplication
displayed_sidebar: pythonSidebar

---

import Admonition from '@theme/Admonition';


# AzureConnectParam

An **AzureConnectParam** instance sets connection parameters for a **RemoteBulkWriter** instance.

```python
class pymilvus.RemoteBulkWriter.AzureConnectParam
```

## Constructor{#constructor}

Constructs an **AzureConnectParam** object by a set of parameters, such as **container_name**, **account_url**, **credential**, etc.

<Admonition type="info" icon="📘" title="Notes">

<p>An <strong>AzureConnectParam</strong> object defines the parameters necessary for Zilliz Cloud to connect to an Azure blob storage bucket.</p>
<p>You need to create this object before initializing a <strong>RemoteBulkWriter</strong> object.</p>

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

**PARAMETERS:**

- **container_name** (*str*)

    The name of the remote Azure blob storage container to connect to.

- **conn_str** (*str*)

    A connection string to an Azure Storage account, which can be parsed to an **account_url** and a **credential**. To generate a connection string, read [this link](https://learn.microsoft.com/en-us/azure/storage/common/storage-configure-connection-string).

- **account_url** (*str*)

    A string in format like `https://<storage-account>.blob.core.windows.net`.

    Read [this link](https://learn.microsoft.com/en-us/azure/storage/common/storage-account-overview) for more info.

- **credential** (*str*)

    Account access key for the account. Read [this link](https://learn.microsoft.com/en-us/azure/storage/common/storage-account-keys-manage?tabs=azure-portal#view-account-access-keys) for more info.

- **upload_chunk_size** (*int*)

    If the blob size is larger than this value or unknown, the blob is uploaded in chunks by parallel connections. This parameter is passed to **max_single_put_size** of Azure. Read [this link](https://learn.microsoft.com/en-us/azure/storage/blobs/storage-blob-upload-python#specify-data-transfer-options-for-upload) for more.

- **upload_concurrency** (*int*)

    The maximum number of parallel connections to use when uploading in chunks. 

    This parameter is passed to **max_concurrency** of Azure. Read [this link](https://learn.microsoft.com/en-us/azure/storage/blobs/storage-blob-upload-python#specify-data-transfer-options-for-upload) for more.

**RETURN TYPE:**

*AzureConnectParam*

**RETURNS:**

An **AzureConnectParam** object.

**EXCEPTIONS:**

- **Exception**

    This exception will be raised if the connection fails.

