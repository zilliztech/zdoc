---
title: "release_collection() | Python | MilvusClient"
slug: /python/python/Management-release_collection
sidebar_label: "release_collection()"
beta: false
added_since: v2.3.x
last_modified: false
deprecate_since: false
notebook: false
description: "この操作は、特定のコレクションのデータをメモリから解放します。 | Python | MilvusClient"
type: docx
token: PRR7dRfi8o1s61xFRovccAdRnHe
sidebar_position: 13
keywords: 
  - ベクトルデータベースとは
  - vectordb
  - マルチモーダルベクトルデータベース検索
  - Retrieval Augmented Generation
  - zilliz
  - zilliz cloud
  - クラウド
  - release_collection()
  - pymilvus30
displayed_sidebar: pythonSidebar

displayed_sidbar: pythonSidebar
---

import Admonition from '@theme/Admonition';


# release_collection()

この操作は、特定のコレクションのデータをメモリから解放します。

<Admonition type="info" icon="📘" title="注記">

これは管理対象のコレクションにのみ適用されます。

</Admonition>

## リクエスト構文\{#request-syntax}

```python
release_collection(
    collection_name: str, 
    timeout: Optional[float] = None
) -> None
```

**パラメーター:**

- **collection_name** (*str*) -

    **[必須]**

    コレクションの名前。

- **timeout** (*float* | *None*) -

    この操作のタイムアウト時間。 

    これを **None** に設定すると、いずれかのレスポンスが返されるか、エラーが発生した時点でこの操作はタイムアウトします。

**戻り値の型:**

*NoneType*

**戻り値:**

なし

**例外:**

- **MilvusException**

    この操作中に何らかのエラーが発生した場合、この例外が発生します。

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

# 3. Create a collection
client.create_collection(
    collection_name="customized_setup",
    schema=schema
)

# 4. Prepare index parameters
index_params = client.prepare_index_params()

# 5. Add indexes
index_params.add_index(
    field_name="my_id",
    index_type="STL_SORT"
)

index_params.add_index(
    field_name="my_vector", 
    index_type="IVF_FLAT",
    metric_type="L2",
    params={nlist: 1024}
)

# 6. Create indexes
client.create_index(
    collection_name="customized_setup",
    index_params=index_params
)

# 7. Load the collection
client.load_collection(
    collection_name="customized_setup"
)

# 8. Get load status
client.get_load_state(
    collection_name="customized_setup",
) # Loaded

# {'state': <LoadState: Loaded>}

# 9. Release the collection
client.release_collection(
    collection_name="customized_setup"
)

# 10. Get load status
client.get_load_state(
    collection_name="customized_setup"
) # Unloaded

# {'state': <LoadState: NotLoad>}
```

## 関連メソッド\{#related-methods}

- [get_load_state()](./Management-get_load_state)

- [load_collection()](./Management-load_collection)

- [refresh_load()](./Management-refresh_load)

