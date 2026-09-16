---
title: "add_index() | Python | MilvusClient"
slug: /python/python/Management-add_index
sidebar_label: "add_index()"
beta: false
added_since: v2.3.x
last_modified: false
deprecate_since: false
notebook: false
description: "この操作は、コレクション内の特定のフィールドにインデックスパラメーターを追加します。 | Python | MilvusClient"
type: docx
token: SM7ld0ZsEoYLqaxVMZxcSH82n9f
sidebar_position: 1
keywords: 
  - 画像類似検索
  - コンテキストウィンドウ
  - 自然言語検索
  - 類似検索
  - zilliz
  - zilliz cloud
  - クラウド
  - add_index()
  - pymilvus30
displayed_sidebar: pythonSidebar

displayed_sidbar: pythonSidebar
---

import Admonition from '@theme/Admonition';


# add_index()

この操作は、コレクション内の特定のフィールドにインデックスパラメーターを追加します。

<Admonition type="info" title="Notes">

このメソッドは、Dedicated serving クラスターと on-demand compute にのみ適用されます。 

- serving クラスターのコレクションでこの操作を行うには、クラスターエンドポイントを使用して **[MilvusClient](./Client-MilvusClient)** を作成してください。

    - **Free & Serverless**

        `https://{cluster-id}.serverless.{region}.vectordb.zillizcloud.com`

    - **Dedicated**

        `https://{cluster-id}.{region}.vectordb.zillizcloud.com:19530`

- on-demand compute のコレクションでこの操作を行うには、project エンドポイントを使用して **[MilvusClient](./Client-MilvusClient)** を作成し、その後、検索のために on-demand クラスターにアタッチするセッションを作成してください。

    `https://{project-id}.{region}.api.zillizcloud.com`

</Admonition>

## リクエスト構文\{#request-syntax}

```python
IndexParams.add_index(
    field_name: str,
    index_type: str,
    index_name: str,
    metric_type: str,
    params: dict
) -> None
```

**パラメーター:**

- **field_name** (*str*) -

    このオブジェクトを適用する対象フィールドの名前です。

- **index_name** (*str*) -

    このオブジェクトが適用された後に生成されるインデックスファイルの名前です。

- **index_type** (*str*) -

    特定のフィールドのデータを配置するために使用されるアルゴリズムの名前です。Zilliz Cloud では、インデックスタイプは常に **AUTOINDEX** です。詳細については、[AUTOINDEX](/docs/autoindex-explained) Explained を参照してください。

- **metric_type** (*str*) -

    ベクトル間の類似度を測定するために使用されるアルゴリズムです。指定可能な値: `IP`、`L2`、`COSINE`、`HAMMING`、`JACCARD`、`BM25`（フルテキスト検索でのみ使用）。詳細については、[Metric Types](https://milvus.io/docs/metric.md) を参照してください。

    これは、指定されたフィールドがベクトルフィールドである場合にのみ使用できます。

- **params** (*dict*) -

    指定されたインデックスタイプの微調整パラメーターです。使用可能なキーと値の範囲の詳細については、[インメモリインデックス](https://milvus.io/docs/index.md) を参照してください。

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

# 1. Create schema
schema = MilvusClient.create_schema(
    auto_id=False,
    enable_dynamic_field=False,
)

# 2. Add fields to schema
schema.add_field(field_name="my_id", datatype=DataType.INT64, is_primary=True)

# {
#     'auto_id': False, 
#     'description': '', 
#     'fields': [
#         {
#             'name': 'my_id', 
#             'description': '', 
#             'type': <DataType.INT64: 5>, 
#             'is_primary': True, 
#             'auto_id': False
#         }
#     ]
# }

schema.add_field(field_name="my_vector", datatype=DataType.FLOAT_VECTOR, dim=5)

# {
#     'auto_id': False, 
#     'description': '', 
#     'fields': [
#         {
#             'name': 'my_id', 
#             'description': '', 
#             'type': <DataType.INT64: 5>, 
#             'is_primary': True, 
#             'auto_id': False
#         }, 
#         {
#             'name': 'my_vector', 
#             'description': '', 
#             'type': <DataType.FLOAT_VECTOR: 101>, 
#             'params': {
#                 'dim': 5
#             }
#         }        
#     ]
# }

# 3. Create index parameters
index_params = client.prepare_index_params()

# 4. Add indexes
# - For a scalar field
index_params.add_index(
    field_name="my_id",
    index_type="STL_SORT"
)

# - For a vector field
index_params.add_index(
    field_name="my_vector", 
    index_type="AUTOINDEX",
    metric_type="L2",
    params={"nlist": 1024}
)
```

## 関連メソッド\{#related-methods}

- [create_index()](./Management-create_index)

- [describe_index()](./Management-describe_index)

- [drop_index()](./Management-drop_index)

- [list_indexes()](./Management-list_indexes)

- [prepare_index_params()](./Management-prepare_index_params)

