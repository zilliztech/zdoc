---
title: "MilvusClient | Python | MilvusClient"
slug: /python/python/Client-MilvusClient
sidebar_label: "MilvusClient"
beta: false
added_since: v2.3.x
last_modified: v3.0.x
deprecate_since: false
notebook: false
description: "MilvusClient インスタンスは、特定の Zilliz Cloud クラスターに接続する Python クライアントを表します。 | Python | MilvusClient"
type: docx
token: SojTdgw1joOuA8xMzb5cMUFYnce
sidebar_position: 2
keywords: 
  - 字句検索
  - 最近傍探索
  - Agentic RAG
  - rag llm architecture
  - zilliz
  - zilliz cloud
  - クラウド
  - MilvusClient
  - pymilvus30
displayed_sidebar: pythonSidebar

displayed_sidbar: pythonSidebar
---

import Admonition from '@theme/Admonition';


# MilvusClient

**MilvusClient** インスタンスは、特定の Zilliz Cloud クラスターに接続する Python クライアントを表します。

```python
pymilvus.MilvusClient
```

## Constructor\{#constructor}

一般的なユースケース向けのクライアントを構築します。

<Admonition type="info" icon="📘" title="Notes">

このクライアントは、Zilliz Cloud 上で Create、Read、Update、Delete（CRUD）操作を処理する現在の API セットに対する、使いやすい代替手段として機能します。

</Admonition>

```python
MilvusClient(
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

    - **プロジェクトエンドポイント (On-demand)**

        `https://{project-id}.{region}.api.zillizcloud.com`

- **user** (*string*) -

    指定された Zilliz Cloud クラスターへの接続に使用する有効なユーザー名。

    これは **password** と一緒に使用する必要があります。

- **password** (*string*) -

    指定された Zilliz Cloud クラスターへの接続に使用する有効なパスワード。

    これは **user** と一緒に使用する必要があります。

- **db_name** (*string*) -

    対象の Milvus インスタンスが属するデータベースの名前。

- **token** (*string*) -

    指定された Zilliz Cloud クラスターにアクセスするための有効なアクセストークン。 

    これは、**user** と **password** を別々に設定する代わりの推奨される方法として使用できます。

    このフィールドを設定する際は、次の点に注意してください。

    有効なトークンは、次のいずれかである必要があります。

    - 十分な権限を持つ [API キー](/docs/manage-api-keys)、または

    - 対象クラスターへのアクセスに使用する [ユーザー名とパスワード](/docs/cluster-credentials)をコロン（:）で連結したもの。たとえば、これを `username:p@ssw0rd` に設定できます。これはクラスターエンドポイントを使用する場合にのみ適用されます。

- **timeout** (*float* | *None*)  

    この操作のタイムアウト時間。 

    これを **None** に設定すると、何らかのレスポンスが到着するか、何らかのエラーが発生した時点でこの操作はタイムアウトします。

## Examples\{#examples}

```python
from pymilvus import MilvusClient

# Authentication enabled with a cluster user
client = MilvusClient(
    uri="https://inxx-xxxxxxxxxxxx.api.gcp-us-west1.zillizcloud.com:19530",
    token="user:password", # replace this with your token,
    db_name="default"
)
```

<Admonition type="info" icon="📘" title="Notes">

**uri** をクラスターエンドポイントに設定してください。**token** パラメータには、十分な権限を持つ Zilliz Cloud API キー、または `username:p@ssw0rd` 形式のクラスター ユーザー認証情報を指定できます。

</Admonition>

