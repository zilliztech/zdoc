---
title: "load_collection() | Python | MilvusClient"
slug: /python/python/Management-load_collection
sidebar_label: "load_collection()"
beta: false
added_since: v2.3.x
last_modified: v2.6.x
deprecate_since: false
notebook: false
description: "この操作は、特定の collection のデータをメモリにロードします。 | Python | MilvusClient"
type: docx
token: YtiQdxTYzoCaYDxEMZcc8TEenQb
sidebar_position: 10
keywords: 
  - Zilliz Cloud
  - Milvus とは
  - Milvus database
  - Milvus lite
  - zilliz
  - Zilliz Cloud
  - cloud
  - load_collection()
  - pymilvus30
displayed_sidebar: pythonSidebar

displayed_sidbar: pythonSidebar
---

import Admonition from '@theme/Admonition';


# load_collection()

この操作は、特定の collection のデータをメモリにロードします。

<Admonition type="info" icon="📘" title="注意">

これは managed collection にのみ適用されます。

</Admonition>

## リクエスト構文\{#request-syntax}

```python
load_collection(
    collection_name: str, 
    timeout: Optional[float] = None
) -> None
```

**パラメーター:**

- **collection_name** (*str*) -

    **[必須]**

    collection の名前。

- **priority** (*string*) -

    現在の collection のロード優先度です。この値は、ロード処理中の CPU 使用率に影響を与える可能性があります。指定可能な値は `low` および `high` です。

- **timeout** (*float* | *None*) -

    この操作のタイムアウト時間。 

    これを **None** に設定すると、いずれかのレスポンスが返るかエラーが発生した時点で、この操作はタイムアウトします。

**戻り値の型:**

*NoneType*

**戻り値:**

None

**例外:**

- **MilvusException**

    この操作中にエラーが発生した場合、この例外が送出されます。

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
    params: {nlist: 1024}
)

# 6. Create indexes
client.create_index(
    collection_name="customized_setup",
    index_params=index_params
)

# 7. Load indexes
client.load_collection(
    collection_name="customized_setup"
)
```

## 関連メソッド\{#related-methods}

- [get_load_state()](./Management-get_load_state)

- [refresh_load()](./Management-refresh_load)

- [release_collection()](./Management-release_collection)

