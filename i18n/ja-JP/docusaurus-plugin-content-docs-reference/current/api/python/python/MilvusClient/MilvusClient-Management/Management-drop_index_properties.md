---
title: "drop_index_properties() | Python | MilvusClient"
slug: /python/python/Management-drop_index_properties
sidebar_label: "drop_index_properties()"
beta: false
added_since: v2.5.x
last_modified: false
deprecate_since: false
notebook: false
description: "この操作は、指定されたインデックスプロパティを削除します。 | Python | MilvusClient"
type: docx
token: M2kXd5zWSoMIOnxXWamcgCkznih
sidebar_position: 15
keywords: 
  - milvus benchmark
  - managed milvus
  - Serverless ベクトル データベース
  - milvus open source
  - zilliz
  - zilliz cloud
  - cloud
  - drop_index_properties()
  - pymilvus30
displayed_sidebar: pythonSidebar

displayed_sidbar: pythonSidebar
---

import Admonition from '@theme/Admonition';


# drop_index_properties()

この操作は、指定されたインデックスプロパティを削除します。

<Admonition type="info" title="Notes">

このメソッドは、Dedicated の serving クラスターおよび on-demand compute にのみ適用されます。

- serving クラスターのコレクションでこの操作を行うには、クラスターエンドポイントを指定して **[MilvusClient](./Client-MilvusClient)** を作成してください。

    - **Free & Serverless**

        `https://{cluster-id}.serverless.{region}.vectordb.zillizcloud.com`

    - **Dedicated**

        `https://{cluster-id}.{region}.vectordb.zillizcloud.com:19530`

- on-demand compute のコレクションでこの操作を行うには、プロジェクトエンドポイントを指定して **[MilvusClient](./Client-MilvusClient)** を作成し、その後、検索のために on-demand クラスターにアタッチするセッションを作成してください。

    `https://{project-id}.{region}.api.zillizcloud.com`

</Admonition>

## リクエスト構文\{#request-syntax}

```python
drop_index_properties(
    self,
    collection_name: str,
    index_name: str,
    property_keys: List[str],
    timeout: Optional[float] = None,
    **kwargs,
)
```

**パラメーター:**

- **collection_name** (*str*) -

    対象コレクションの名前です。

- **index_name** (*str*) -

    削除するインデックスファイルの名前です。

- **property_keys** (*List[str]*) -

    削除するプロパティの名前をリストとして指定します。指定できるプロパティは次のとおりです。

    - `mmap.enabled`

- **timeout** (*Optional[float]*) -

    この操作のタイムアウト時間です。

    これを None に設定すると、何らかのレスポンスが到着するか、何らかのエラーが発生した時点でこの操作がタイムアウトすることを示します。

**戻り値の型:**

*NoneType*

**戻り値:**

なし

**例外:**

- **MilvusException**

    この操作中に何らかのエラーが発生すると、この例外が発生します。

## 例\{#examples}

```python
from pymilvus import MilvusClient

# 1. Create a milvus client
client = MilvusClient(
    uri="YOUR_CLUSTER_ENDPOINT",
    token="YOUR_CLUSTER_TOKEN"
)

client.drop_index_properties(
    collection_name="collection_name",
    index_name="my_vector", 
    property_keys = ["mmap.enabled"]
)
```
