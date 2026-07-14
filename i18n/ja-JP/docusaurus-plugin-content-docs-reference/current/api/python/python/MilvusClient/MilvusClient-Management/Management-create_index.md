---
title: "create_index() | Python | MilvusClient"
slug: /python/python/Management-create_index
sidebar_label: "create_index()"
beta: false
added_since: v2.3.x
last_modified: false
deprecate_since: false
notebook: false
description: "この操作は、特定の collection に対して index を作成します。 | Python | MilvusClient"
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

この操作は、特定の collection に対して index を作成します。

<Admonition type="info" icon="📘" title="注意">

このメソッドは、専用の serving cluster と on-demand compute にのみ適用されます。 

- serving cluster の collection でこの操作を行うには、cluster endpoint を使用して **[MilvusClient](./Client-MilvusClient)** を作成してください。

    - **Free & Serverless**

        `https://{cluster-id}.serverless.{region}.vectordb.zillizcloud.com`

    - **Dedicated**

        `https://{cluster-id}.{region}.vectordb.zillizcloud.com:19530`

- on-demand compute 用の collection でこの操作を行うには、project endpoints を使用して **[MilvusClient](./Client-MilvusClient)** を作成し、その後、検索のために on-demand cluster に接続する session を作成してください。

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

    **[REQUIRED]**

    既存の collection の名前。

- **index_params** (*IndexParams*) -

    **[REQUIRED]**

    **IndexParam** オブジェクトのリストを含む **IndexParams** オブジェクト。

- **timeout** (*float* | *None*) -

    この操作のタイムアウト時間です。これを **None** に設定すると、レスポンスが到着するかエラーが発生した時点でこの操作はタイムアウトします。

- **kwargs** -

    - **sync** (*bool*)

        クライアントのリクエストに対して、index をどのように構築するかを制御します。有効な値:

        - `True` (デフォルト): index が完全に構築されるまでクライアントは待機してから戻ります。つまり、プロセスが完了するまでレスポンスは返されません。

        - `False`: リクエストが受理され、index がバックグラウンドで構築され始めた直後にクライアントはすぐに戻ります。index の作成が完了したかどうかを確認するには、[`describe_index()`](./Management-describe_index) メソッドを使用してください。

**戻り値の型:**

*NoneType*

**戻り値:**

なし

**例外:**

- **MilvusException**

    この操作の実行中に何らかのエラーが発生した場合、この例外が発生します。

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

