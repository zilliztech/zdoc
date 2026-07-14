---
title: "describe() | Python | ORM"
slug: /python/python/Collection-describe
sidebar_label: "describe()"
beta: NEAR DEPRECATE
added_since: Inherit
last_modified: false
deprecate_since: false
notebook: false
description: "この操作は現在のコレクションの詳細情報を返します。 | Python | ORM"
type: docx
token: EZwsd887JojFjLxbMByckhW0nxg
sidebar_position: 7
keywords: 
  - ANN Search
  - ベクトル埋め込みとは
  - ベクトルデータベース チュートリアル
  - ベクトルデータベースはどのように機能するか
  - zilliz
  - zilliz cloud
  - cloud
  - describe()
  - pymilvus30
displayed_sidebar: pythonSidebar

displayed_sidbar: pythonSidebar
---

import Admonition from '@theme/Admonition';


# describe()

この操作は現在のコレクションの詳細情報を返します。

## Request Syntax\{#request-syntax}

```python
describe(timeout: float | None)
```

**PARAMETERS:**

- **timeout** (*float* | *None*)  

    この操作のタイムアウト時間です。これを **None** に設定すると、レスポンスが到着するかエラーが発生した時点でこの操作はタイムアウトします。

**RETURN TYPE:**

*dict*

**RETURNS:**

指定したコレクションに関する詳細情報を含む辞書。

```python
{
    'collection_name': 'test_01',
    'auto_id': False,
    'num_shards': 1,
    'description': '',
    'fields': [
          {
              'field_id': 100,
              'name': 'id',
              'description': '',
              'type': 5,
              'params': {},
              'element_type': 0,
              'is_primary': True
          },
          {
              'field_id': 101,
              'name': 'vector',
              'description': '',
              'type': 101,
              'params': {
                  'dim': 768
              },
              'element_type': 0
          }
     ],
     'aliases': [],
     'collection_id': 446738261026541332,
     'consistency_level': 2,
     'properties': {},
     'num_partitions': 1
}
```

**PARAMETERS:**

- **collection_name** (*str*) -

    現在のコレクションの名前。

- **auto_id** (*bool*) -

    Zilliz Cloud がコレクションの主キーを自動生成するかどうか。

- **num_shards** (*int*) -

    現在のコレクションが持つシャードの数。

- **description** (*str*)

    現在のコレクションの説明。

- **fields** (*list*)

    現在のコレクション内のフィールドのリスト。

    - **field_id** (*int*)

        現在のフィールドの ID。

    - **name** (*str*)

        現在のフィールドの名前。

    - **description** (*str*)

        現在のフィールドの説明。

    - **type** (*int*)

        現在のフィールドの型。詳細については、DataType を参照してください。

    - **params** (*dict*)

        現在のフィールドの追加属性。

        - VARCHAR フィールドの場合、**max_length** (*int*) は指定可能な属性であり、現在のフィールドの値に含まれる文字数を決定します。

        - FLOAT_VECTOR フィールドの場合、**dim** (*int*) は指定可能な属性であり、現在のフィールドの値に含まれるベクトル埋め込みの数を決定します。

    - **element_type** (*int*)

    - **is_primary** (*bool*)

        現在のフィールドがコレクションの主キーとして機能するかどうか。

- **aliases** (*list*)      

    コレクションエイリアスのリストです。リスト内の任意のエイリアスを使用して現在のコレクションを利用できます。  

- **collection_id** (*int*)

    現在のコレクションの ID。Zilliz Cloud は、各コレクションの作成時に ID を割り当てます。

- **consistency_level** (*int*)

    現在のコレクションの整合性レベル。詳細については、ConsistencyLevel を参照してください。

- **properties** (*dict*)

- **num_partitions** (*int*) 

    現在のコレクション内のパーティションの数。

**EXCEPTIONS:**

- **DescribeCollectionException**

    この操作中に何らかのエラーが発生した場合に発生します。

## Example\{#example}

```python
from pymilvus import Collection, CollectionSchema, FieldSchema, DataType

schema = CollectionSchema([
    FieldSchema("id", DataType.INT64, is_primary=True),
    FieldSchema("vector", DataType.FLOAT_VECTOR, dim=5)
])

# Create a collection
collection = Collection(
    name="test_collection",
    schema=schema
)

# Get detailed information about the collection
collection.describe()

# Output
# {
#     'collection_name': 'test_01',
#     'auto_id': False,
#     'num_shards': 1,
#     'description': '',
#     'fields': [
#           {
#               'field_id': 100,
#               'name': 'id',
#               'description': '',
#               'type': 5,
#               'params': {},
#               'element_type': 0,
#               'is_primary': True
#           },
#           {
#               'field_id': 101,
#               'name': 'vector',
#               'description': '',
#               'type': 101,
#               'params': {
#                   'dim': 768
#               },
#               'element_type': 0
#           }
#      ],
#      'aliases': [],
#      'collection_id': 446738261026541332,
#      'consistency_level': 2,
#      'properties': {},
#      'num_partitions': 1
# }
```

## Related operations\{#related-operations}

- [drop()](./Collection-drop)

- [flush()](./Collection-flush)

- [get_replicas()](./Collection-get_replicas)

- [set_properties()](./Collection-set_properties)

