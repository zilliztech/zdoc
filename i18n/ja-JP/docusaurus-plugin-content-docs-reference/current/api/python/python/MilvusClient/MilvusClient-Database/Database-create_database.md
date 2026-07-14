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
  - クラウド
  - create_database()
  - pymilvus30
displayed_sidebar: pythonSidebar

displayed_sidbar: pythonSidebar
---

import Admonition from '@theme/Admonition';


# create_database()

この操作はデータベースを作成します。

<Admonition type="info" icon="📘" title="Notes">

このメソッドは dedicated serving clusters と on-demand compute にのみ適用されます。 

- dedicated serving clusters 内のデータベースの場合は、cluster endpoint を使用して **[MilvusClient](./Client-MilvusClient)** を作成します。

    - **Free & Serverless**

        `https://{cluster-id}.serverless.{region}.vectordb.zillizcloud.com`

    - **Dedicated**

        `https://{cluster-id}.{region}.vectordb.zillizcloud.com:19530`

- on-demand compute 用のデータベースの場合は、project endpoints を使用して **[MilvusClient](./Client-MilvusClient)** を作成します。

    `https://{project-id}.{region}.api.zillizcloud.com`

</Admonition>

## Request Syntax\{#request-syntax}

```python
create_database(
    db_name: str, 
    properties: Optional[dict] = None,
    timeout: Optional[float] = None,
    **kwargs,
)
```

**PARAMETERS:**

- **db_name** (*string*) -

    **[REQUIRED]**

    作成するデータベースの名前。

- **properties** (*dict* | *None*) -

    <Admonition type="info" icon="📘" title="Note">

    これは on-demand compute 用のデータベースには適用されません。

    </Admonition>

    作成するデータベースのプロパティ。指定可能なデータベースプロパティは次のとおりです。

    - **database.replica.number** (*int*) -

        データベースのレプリカ数。

    - **database.resource_groups** (*[]str*) -

        データベース専用の resource groups。

    - **database.diskQuota.mb** (*int*) -

        データベースに割り当てられるディスククォータ（メガバイト（**MB**）単位）。

    - **database.max.collections** (*int*) -

        データベースで許可される collection の最大数。

    - **database.force.deny.writing** (*bool*) -

        データベース内のすべての書き込み操作を拒否するかどうか。

    - **database.force.deny.reading** (*bool*) -

        データベース内のすべての読み取り操作を拒否するかどうか。

- **timeout** (*float* | *None*) -

    この操作のタイムアウト時間です。これを *None* に設定すると、レスポンスが到着するかエラーが発生した時点でタイムアウトします。

**RETURN TYPE:**

*NoneType*

**RETURNS:**

*None*

**EXCEPTIONS:**

- `MilvusException` - この操作中にエラーが発生した場合に発生します。

## Examples\{#examples}

```python
from pymilvus import MilvusClient

client = MilvusClient(uri, token) # db = "default" 

client.create_database(
    db_name="my_db"
)
```

