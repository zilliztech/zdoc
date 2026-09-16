---
title: "create_index() | Python | MilvusClient"
slug: /python/python/Management-create_index
sidebar_label: "create_index()"
beta: false
added_since: v2.3.x
last_modified: false
deprecate_since: false
notebook: false
description: "この操作は、特定のコレクションのインデックスを作成します。 | Python | MilvusClient"
type: docx
token: B3n3db0idoia02xXxJfcONK8nRh
sidebar_position: 3
keywords: 
  - 大規模言語モデル
  - ベクトル化
  - k 最近傍アルゴリズム
  - ANNS
  - zilliz
  - zilliz cloud
  - クラウド
  - create_index()
  - pymilvus30
displayed_sidebar: pythonSidebar

displayed_sidbar: pythonSidebar
---

import Admonition from '@theme/Admonition';


# create_index()

この操作は、特定のコレクションのインデックスを作成します。

<Admonition type="info" title="Notes">

このメソッドは、専用の serving クラスターと on-demand compute にのみ適用されます。

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
create_index(
    collection_name: str,
    index_params: IndexParams,
    timeout: Optional[float] = None,
    **kwargs,    
)
```

**パラメーター:**

- **collection_name** (*str*) -

    **[必須]**

    既存のコレクションの名前です。

- **index_params** (*IndexParams*) -

    **[必須]**

    **IndexParam** オブジェクトのリストを含む **IndexParams** オブジェクトです。

- **timeout** (*float* | *None*) -

    この操作のタイムアウト時間です。これを **None** に設定すると、何らかのレスポンスが到着するかエラーが発生した時点でこの操作がタイムアウトすることを示します。

- **kwargs** -

    - **sync** (*bool*)

        クライアントのリクエストに対してインデックスをどのように構築するかを制御します。有効な値は次のとおりです。

        - `True` (デフォルト): インデックスが完全に構築されるまでクライアントは待機してから戻ります。つまり、プロセスが完了するまでレスポンスは返されません。

        - `False`: リクエストが受信され、インデックスがバックグラウンドで構築され始めると、クライアントはすぐに戻ります。インデックスの作成が完了したかどうかを確認するには、[`describe_index()`](./Management-describe_index) メソッドを使用してください。

**戻り値の型:**

*NoneType*

**戻り値:**

なし

**例外:**

- **MilvusException**

    この操作中に何らかのエラーが発生すると、この例外が発生します。

## 例\{#examples}

```python
from pymilvus import MilvusClient, DataType

client = MilvusClient(
    uri="https://inxx-xxxxxxxxxxxx.api.gcp-us-west1.zillizcloud.com:19530",
    token="user:password"
)

# 1. Create schema
schema = MilvusClient.create_schema(
    auto_id=False,
    enable_dynamic_field=False,
)

# 2. Add fields to schema
schema.add_field(field_name="my_id", datatype=DataType.INT64, is_primary=True)
schema.add_field(field_name="my_vector", datatype=DataType.FLOAT_VECTOR, dim=5)

# 3. Create index parameters
index_params = client.prepare_index_params()

# 4. Add indexes
# - For a scalar field
index_params.add_index(
    field_name="my_id"
    index_type="STL_SORT"
)

# - For a vector field
index_params.add_index(
    field_name="my_vector", 
    index_type="AUTOINDEX",
    metric_type="L2",
    params={"nlist": 1024}
)

# 5. Create a collection
client.create_collection(
    collection_name="customized_setup",
    schema=schema
)

# 6. Create indexes
client.create_index(
    collection_name="customized_setup",
    index_params=index_params
)

# 6. List indexes
client.list_indexes(collection_name="customized_setup")

# ['my_id', 'my_vector']
```

## 関連メソッド\{#related-methods}

- [add_index()](./Management-add_index)

- [describe_index()](./Management-describe_index)

- [drop_index()](./Management-drop_index)

- [list_indexes()](./Management-list_indexes)

- [prepare_index_params()](./Management-prepare_index_params)
