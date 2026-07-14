---
title: "AsyncMilvusClient | Python | MilvusClient"
slug: /python/python/Client-AsyncMilvusClient
sidebar_label: "AsyncMilvusClient"
beta: false
added_since: v2.5.x
last_modified: v3.0.x
deprecate_since: false
notebook: false
description: "AsyncMilvusClient インスタンスは、特定の Zilliz Cloud クラスターに接続する非同期 Python クライアントを表します。MilvusClient と同じパラメータセットおよび動作を提供し、違いは呼び出し方法のみにあります。 | Python | MilvusClient"
type: docx
token: MIKkdpGuuoEaGWx1m7Fcw52inKg
sidebar_position: 3
keywords: 
  - セマンティック検索
  - 異常検知
  - sentence transformers
  - レコメンダーシステム
  - zilliz
  - zilliz cloud
  - クラウド
  - AsyncMilvusClient
  - pymilvus30
displayed_sidebar: pythonSidebar

displayed_sidbar: pythonSidebar
---

import Admonition from '@theme/Admonition';


# AsyncMilvusClient

**AsyncMilvusClient** インスタンスは、特定の Zilliz Cloud クラスターに接続する非同期 Python クライアントを表します。**[MilvusClient](./Client-MilvusClient)** と同じパラメータセットおよび動作を提供し、違いは呼び出し方法のみにあります。

```python
pymilvus.AsyncMilvusClient
```

## Constructor\{#constructor}

一般的なユースケース向けのクライアントを構築します。

<Admonition type="info" icon="📘" title="Notes">

- このインターフェースはまだ初期段階にあり、今後のリリースで大きく変更される可能性があります。本番環境では使用しないことを推奨します。

- **AsyncMilvusClient** を呼び出すには、リクエスト処理を管理するために asyncio からイベントループを取得する必要があります。詳細は、[Tutorial: Use AsyncMilvusClient with asyncio](https://milvus.io/docs/use-async-milvus-client-with-asyncio.md#Tutorial-Use-AsyncMilvusClient-with-asyncio) を参照してください。

</Admonition>

```python
AsyncMilvusClient(
    uri: str,
    user: str,
    password: str,
    db_name: str,
    token: str,
    timeout=None,
    **kwargs
)
```

**PARAMETERS:**

- **uri** (*string*) -

    Zilliz Cloud クラスターの URI。例:

    - **クラスターエンドポイント**

        - **Free & Serverless**

            `https://{cluster-id}.serverless.{region}.vectordb.zillizcloud.com`

        - **Dedicated**

            `https://{cluster-id}.{region}.vectordb.zillizcloud.com:19530`

    - **プロジェクトエンドポイント (On-Demand)**

        `https://{project-id}.{region}.api.zillizcloud.com`

- **user** (*string*) -

    指定した Zilliz Cloud クラスターへの接続に使用する有効なユーザー名。

    これは **password** と一緒に使用する必要があります。

- **password** (*string*) -

    指定した Zilliz Cloud クラスターへの接続に使用する有効なパスワード。

    これは **user** と一緒に使用する必要があります。

- **db_name** (*string*) -

    対象の Milvus インスタンスが属するデータベースの名前。

- **token** (*string*) -

    指定した Zilliz Cloud クラスターにアクセスするための有効なアクセストークン。 

    これは、**user** と **password** を個別に設定する代わりとなる推奨方法として使用できます。

    このフィールドを設定する際は、以下に注意してください:

    有効なトークンは次のいずれかである必要があります

    - 十分な権限を持つ [API キー](/docs/manage-api-keys)、または

    - 対象クラスターへのアクセスに使用する [ユーザー名とパスワード ](/docs/cluster-credentials) をコロン (:) で連結したもの。たとえば、`username:p@ssw0rd` に設定できます。これはクラスターエンドポイントを使用する場合にのみ適用されます。

- **timeout** (*float* | *None*)  

    この操作のタイムアウト時間。 

    これを **None** に設定すると、何らかの応答が返るかエラーが発生した時点でこの操作はタイムアウトします。

## Examples\{#examples}

```python
import asyncio
from pymilvus import MilvusClient

# Get an event loop from asyncio
loop = asyncio.get_event_loop()

# Authentication enabled with a cluster user
client = AsyncMilvusClient(
    uri="https://inxx-xxxxxxxxxxxx.api.gcp-us-west1.zillizcloud.com:19530",
    token="user:password", # replace this with your token,
    db_name="default"
)
```

<Admonition type="info" icon="📘" title="Notes">

**uri** をクラスターエンドポイントに設定します。**token** パラメータには、十分な権限を持つ Zilliz Cloud API キー、または `username:p@ssw0rd` 形式のクラスター ユーザー資格情報を指定できます。

</Admonition>

