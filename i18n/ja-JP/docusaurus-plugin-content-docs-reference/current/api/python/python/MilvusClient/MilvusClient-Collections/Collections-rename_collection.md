---
title: "rename_collection() | Python | MilvusClient"
slug: /python/python/Collections-rename_collection
sidebar_label: "rename_collection()"
beta: false
added_since: v2.3.x
last_modified: v2.6.x
deprecate_since: false
notebook: false
description: "この操作は、既存のコレクションの名前を変更します。 | Python | MilvusClient"
type: docx
token: WR4qdjFUXog2JHxuJpMcWcVlnEf
sidebar_position: 18
keywords: 
  - ベクトルデータベースの例
  - RAG 用ベクトルデータベース
  - ベクトル db とは
  - ベクトルデータベースとは
  - zilliz
  - zilliz cloud
  - cloud
  - rename_collection()
  - pymilvus30
displayed_sidebar: pythonSidebar

displayed_sidbar: pythonSidebar
---

import Admonition from '@theme/Admonition';


# rename_collection()

この操作は、既存のコレクションの名前を変更します。

<Admonition type="info" title="Notes">

このメソッドは、Dedicated serving クラスターとオンデマンドコンピュートに適用されます。 

- serving クラスター内のコレクションの場合は、クラスターエンドポイントを使用して **[MilvusClient](./Client-MilvusClient)** を作成してください。

    - **Free & Serverless**

        `https://{cluster-id}.serverless.{region}.vectordb.zillizcloud.com`

    - **Dedicated**

        `https://{cluster-id}.{region}.vectordb.zillizcloud.com:19530`

- オンデマンドコンピュート内のコレクションの場合は、プロジェクトエンドポイントを使用して **[MilvusClient](./Client-MilvusClient)** を作成してください。

    `https://{project-id}.{region}.api.zillizcloud.com`

</Admonition>

## リクエスト構文\{#request-syntax}

```python
rename_collection(
    old_name: str,
    new_name: str,
    target_db: Optional[str] = "",
    timeout: Optional[float] = None,
    **kwargs,
) -> None
```

**パラメーター:**

- **old_name** (*str*) -

    **[REQUIRED]**

    既存のコレクションの名前です。

    存在しないコレクションに設定すると、**MilvusException** が発生します。

- **new_name** (*str*) -

    **[REQUIRED]**

    この操作後の対象コレクションの名前です。

    これを **old_name** の値に設定すると、**MilvusException** が発生します。

- **target_db** (*Optional[str]*) -

    コレクションの移動先となる対象データベースの名前です。デフォルトは空文字列で、この場合コレクションは現在のデータベースに残ります。

- **timeout** (*float* | *None*) -

    この操作のタイムアウト時間です。これを **None** に設定すると、何らかの応答が返るか、何らかのエラーが発生した時点でこの操作がタイムアウトすることを示します。

**戻り値の型:**

*NoneType*

**戻り値:**

なし

**例外:**

- **MilvusException**

    この例外は、この操作中に何らかのエラーが発生した場合に送出されます。

## 例\{#examples}

```python
from pymilvus import MilvusClient

client = MilvusClient(
    uri="YOUR_CLUSTER_ENDPOINT",
    token="YOUR_CLUSTER_TOKEN"
)

# Create a collection
client.create_collection(
    collection_name="test_collection",
    dimension=5
)

# Rename the collection
client.rename_collection(
    old_name="test_collection",
    new_name="test_collection_renamed"
)

# Move collection to another database
client.rename_collection(
    old_name="test_collection_renamed",
    new_name="test_collection",
    target_db="my_database"
)
```
