---
title: "S3ConnectParam | Python"
slug: /python/python/RemoteBulkWriter-S3ConnectParam
sidebar_label: "S3ConnectParam"
beta: false
added_since: v2.3.x
last_modified: false
deprecate_since: false
notebook: false
description: "S3ConnectParam インスタンスは、RemoteBulkWriter インスタンスの接続パラメータを設定します。 | Python"
type: docx
token: CSpOd0XgWoVAhzx5xbVcpCVfnPg
sidebar_position: 5
keywords: 
  - 情報検索
  - 次元削減
  - hnsw algorithm
  - ベクトル類似検索
  - zilliz
  - zilliz cloud
  - クラウド
  - S3ConnectParam
  - pymilvus30
displayed_sidebar: pythonSidebar

displayed_sidbar: pythonSidebar
---

import Admonition from '@theme/Admonition';


# S3ConnectParam

**S3ConnectParam** インスタンスは、**[RemoteBulkWriter](./DataImport-RemoteBulkWriter)** インスタンスの接続パラメータを設定します。

```python
class pymilvus.RemoteBulkWriter.S3ConnectParam
```

## Constructor\{#constructor}

**bucket_name**、**access_key**、**secret_key** などの一連のパラメータを使用して **S3ConnectParam** オブジェクトを構築します。

<Admonition type="info" icon="📘" title="Notes">

**S3ConnectParam** オブジェクトは、Zilliz Cloud が AWS-S3-compatible bucket に接続するために必要なパラメータを定義します。

**[RemoteBulkWriter](./DataImport-RemoteBulkWriter)** オブジェクトを初期化する前に、このオブジェクトを作成する必要があります。

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

**PARAMETERS:**

- **bucket_name** (*str*)

    接続先のリモート bucket の名前。

- **endpoint** (*str*)

    AWS-S3-compatible service の URL。

    値には、MinIO service の URL、または AWS S3 compatible public service の URL を指定できます。

    | **Service Name** | **Endpoint** |
    | --- | --- |
    | **AWS S3** | s3.amazonaws.com |
    | **GCS** | storage.googleapis.com |

- **access_key** (*str*)

    指定した bucket へのアクセス認証に使用する access key（ユーザー ID）。

- **secret_key** (*str*)

    指定した bucket へのアクセス認証に使用する secret_key（パスワード）。

- **secure** (*bool*)

    AWS S3 compatible service への安全な（TLS）接続を使用するかどうか。 

- **session_token** (*str*)

    AWS S3 compatible service におけるアカウントの session token。

- **region** (*str*)

    bucket が存在するリージョンの名前または ID。

- **http_client** (*urllib3.poolmanager.PoolManager*)

    カスタマイズされた HTTP クライアント。

- **credentials** (*minio.credentials.Provider*)    

    AWS S3 compatible service におけるアカウントの認証情報プロバイダー。

**RETURN TYPE:**

*[RemoteBulkWriter](./DataImport-RemoteBulkWriter)*

**RETURNS:**

**[RemoteBulkWriter](./DataImport-RemoteBulkWriter)** オブジェクト。

**EXCEPTIONS:**

- **Exception**

    接続に失敗した場合、この例外が発生します。

