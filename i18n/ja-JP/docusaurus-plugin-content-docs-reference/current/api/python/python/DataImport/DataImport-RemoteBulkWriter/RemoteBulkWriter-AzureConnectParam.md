---
title: "AzureConnectParam | Python"
slug: /python/python/RemoteBulkWriter-AzureConnectParam
sidebar_label: "AzureConnectParam"
beta: false
added_since: v2.3.x
last_modified: false
deprecate_since: false
notebook: false
description: "AzureConnectParam インスタンスは、RemoteBulkWriter インスタンスの接続パラメータを設定します。 | Python"
type: docx
token: C2YSddNqZoDNmNxWqqEcuzhKn4f
sidebar_position: 2
keywords: 
  - ベクトルストア
  - オープンソースベクトルデータベース
  - ベクトルインデックス
  - オープンソースベクトルデータベース
  - zilliz
  - zilliz cloud
  - クラウド
  - AzureConnectParam
  - pymilvus30
displayed_sidebar: pythonSidebar

displayed_sidbar: pythonSidebar
---

import Admonition from '@theme/Admonition';


# AzureConnectParam

**AzureConnectParam** インスタンスは、**[RemoteBulkWriter](./DataImport-RemoteBulkWriter)** インスタンスの接続パラメータを設定します。

```python
class pymilvus.RemoteBulkWriter.AzureConnectParam
```

## Constructor\{#constructor}

**container_name**、**account_url**、**credential** などの一連のパラメータを使用して **AzureConnectParam** オブジェクトを構築します。

<Admonition type="info" icon="📘" title="Notes">

**AzureConnectParam** オブジェクトは、Zilliz Cloud が Azure blob storage bucket に接続するために必要なパラメータを定義します。

**[RemoteBulkWriter](./DataImport-RemoteBulkWriter)** オブジェクトを初期化する前に、このオブジェクトを作成する必要があります。

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

    接続先のリモート Azure blob storage container の名前です。

- **conn_str** (*str*)

    Azure Storage account への接続文字列で、**account_url** と **credential** に解析できます。接続文字列を生成するには、[このリンク](https://learn.microsoft.com/en-us/azure/storage/common/storage-configure-connection-string) を参照してください。

- **account_url** (*str*)

    `https://<storage-account>.blob.core.windows.net` のような形式の文字列です。

    詳細は [このリンク](https://learn.microsoft.com/en-us/azure/storage/common/storage-account-overview) を参照してください。

- **credential** (*str*)

    account のアクセスキーです。詳細は [このリンク](https://learn.microsoft.com/en-us/azure/storage/common/storage-account-keys-manage?tabs=azure-portal#view-account-access-keys) を参照してください。

- **upload_chunk_size** (*int*)

    blob サイズがこの値より大きい、または不明な場合、blob は並列接続によってチャンク単位でアップロードされます。このパラメータは Azure の **max_single_put_size** に渡されます。詳細は [このリンク](https://learn.microsoft.com/en-us/azure/storage/blobs/storage-blob-upload-python#specify-data-transfer-options-for-upload) を参照してください。

- **upload_concurrency** (*int*)

    チャンク単位でアップロードする際に使用する並列接続の最大数です。 

    このパラメータは Azure の **max_concurrency** に渡されます。詳細は [このリンク](https://learn.microsoft.com/en-us/azure/storage/blobs/storage-blob-upload-python#specify-data-transfer-options-for-upload) を参照してください。

**RETURN TYPE:**

*AzureConnectParam*

**RETURNS:**

**AzureConnectParam** オブジェクトです。

**EXCEPTIONS:**

- **Exception**

    接続に失敗した場合、この例外が発生します。

