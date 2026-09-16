---
title: "create_database() | Python | MilvusClient"
slug: /python/python/Database-create_database
sidebar_label: "create_database()"
beta: false
added_since: v2.5.x
last_modified: false
deprecate_since: false
notebook: false
description: "この操作はデータベースを作成します。 | Python | MilvusClient"
type: docx
token: S278drWUVoRZ5fx8XkfcWaZfnwh
sidebar_position: 2
keywords: 
  - ニューラルネットワーク
  - ディープラーニング
  - ナレッジベース
  - 自然言語処理
  - zilliz
  - zilliz cloud
  - cloud
  - create_database()
  - pymilvus30
displayed_sidebar: pythonSidebar

displayed_sidbar: pythonSidebar
---

import Admonition from '@theme/Admonition';


# create_database()

この操作はデータベースを作成します。

<Admonition type="info" title="Notes">

このメソッドは Dedicated serving クラスターとオンデマンドコンピュートにのみ適用されます。 

- Dedicated serving クラスター内のデータベースの場合は、クラスターエンドポイントを使用して **[MilvusClient](./Client-MilvusClient)** を作成します。

    - **Free & Serverless**

        `https://{cluster-id}.serverless.{region}.vectordb.zillizcloud.com`

    - **Dedicated**

        `https://{cluster-id}.{region}.vectordb.zillizcloud.com:19530`

- オンデマンドコンピュート用のデータベースの場合は、プロジェクトエンドポイントを使用して **[MilvusClient](./Client-MilvusClient)** を作成します。

    `https://{project-id}.{region}.api.zillizcloud.com`

</Admonition>

## リクエスト構文\{#request-syntax}

```python
create_database(
    db_name: str, 
    properties: Optional[dict] = None,
    timeout: Optional[float] = None,
    **kwargs,
)
```

**パラメーター:**

- **db_name** (*string*) -

    **[必須]**

    作成するデータベースの名前。

- **properties** (*dict* | *None*) -

    <Admonition type="info" title="Note">

    これはオンデマンドコンピュート用のデータベースには適用されません。

    </Admonition>

    作成するデータベースのプロパティ。指定可能なデータベースプロパティは次のとおりです。

    - **データベース.replica.number** (*int*) -

        データベースのレプリカ数。

    - **データベース.resource_groups** (*[]str*) -

        データベース専用のリソースグループ。

    - **データベース.diskQuota.mb** (*int*) -

        データベースに割り当てられるディスククォータ（メガバイト単位、**MB**）。

    - **データベース.max.コレクション** (*int*) -

        データベース内で許可されるコレクションの最大数。

    - **データベース.force.deny.writing** (*bool*) -

        データベース内のすべての書き込み操作を拒否するかどうか。

    - **データベース.force.deny.reading** (*bool*) -

        データベース内のすべての読み取り操作を拒否するかどうか。

- **timeout** (*float* | *None*) -

    この操作のタイムアウト時間です。これを *None* に設定すると、レスポンスが返されるかエラーが発生した時点でタイムアウトします。

**戻り値の型:**

*NoneType*

**戻り値:**

*None*

**例外:**

- `MilvusException` - この操作中に何らかのエラーが発生した場合にスローされます。

## 例\{#examples}

```python
from pymilvus import MilvusClient

client = MilvusClient(uri, token) # db = "default" 

client.create_database(
    db_name="my_db"
)
```

