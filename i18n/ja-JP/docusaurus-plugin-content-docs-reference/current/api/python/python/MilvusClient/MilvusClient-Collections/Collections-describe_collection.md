---
title: "describe_collection() | Python | MilvusClient"
slug: /python/python/Collections-describe_collection
sidebar_label: "describe_collection()"
beta: false
added_since: v2.3.x
last_modified: v2.6.x
deprecate_since: false
notebook: false
description: "この操作は、特定の collection に関する詳細情報を一覧表示します。 | Python | MilvusClient"
type: docx
token: LXASdPs6KoRfCJx11A1cl2Ssngg
sidebar_position: 9
keywords: 
  - Neural Network
  - Deep Learning
  - Knowledge base
  - natural language processing
  - zilliz
  - zilliz cloud
  - cloud
  - describe_collection()
  - pymilvus30
displayed_sidebar: pythonSidebar

displayed_sidbar: pythonSidebar
---

import Admonition from '@theme/Admonition';


# describe_collection()

この操作は、特定の collection に関する詳細情報を一覧表示します。

<Admonition type="info" icon="📘" title="注記">

このメソッドは、Dedicated serving cluster と on-demand compute に適用されます。 

- serving cluster 内の collection の場合は、cluster endpoint を使用して **[MilvusClient](./Client-MilvusClient)** を作成してください。

    - **Free & Serverless**

        `https://{cluster-id}.serverless.{region}.vectordb.zillizcloud.com`

    - **Dedicated**

        `https://{cluster-id}.{region}.vectordb.zillizcloud.com:19530`

- on-demand compute 内の collection の場合は、project endpoints を使用して **[MilvusClient](./Client-MilvusClient)** を作成してください。

    `https://{project-id}.{region}.api.zillizcloud.com`

</Admonition>

## Request Syntax\{#request-syntax}

```python
describe_collection(
    collection_name: str, 
    **kwargs
) -> Name
```

**PARAMETERS:**

- **collection_name** (*str*) -

    **[REQUIRED]**

    既存の collection の名前。

    存在しない collection にこれを設定すると、**MilvusException** が発生します。

- **kwargs** -

    - **timeout** (*float* | *None*)  

        この操作のタイムアウト時間。 

        これを **None** に設定すると、レスポンスが返されるか、何らかのエラーが発生した時点でこの操作はタイムアウトします。

**RETURN TYPE:**

*dict*

**RETURNS:**

指定した collection に関する詳細情報を含む辞書。

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
     'externalSource': '',
     'externalSpecs': '',
     'functions': [],
     'aliases': [],
     'collection_id': 446738261026541332,
     'consistency_level': 2,
     'properties': {},
     'num_partitions': 1，
     'enable_dynamic_field': True,
     'created_timestamp': 461643298319106049,
     'update_timestamp': 461643298319106049
}
```

**PARAMETERS:**

- **collection_name** (*str*) -

    現在の collection の名前。

- **auto_id** (*bool*) -

    Zilliz Cloud がその collection の主キーを自動生成するかどうか。

- **num_shards** (*int*) -

    現在の collection が持つ shard の数。

- **description** (*str*) -

    現在の collection の説明。

- **external_source** (*str*) -

    collection の外部ソース。これは external collection にのみ適用されます。 

- **external_specs** (*str*) -

    collection の外部仕様。これは external collection にのみ適用されます。

- **fields** (*list*) -

    現在の collection 内の field のリスト。

    - **field_id** (*int*) -

        現在の field の ID。

    - **name** (*str*) -

        現在の field の名前。

    - **description** (*str*) -

        現在の field の説明。

    - **type** (*int*) -

        現在の field の型。詳細は [DataType](./Collections-DataType) を参照してください。

    - **params** (*dict*) -

        現在の field の追加属性。

        - **VARCHAR** field の場合、**max_length** (*int*) が指定可能な属性であり、現在の field の値に含まれる文字数を決定します。

        - vector field の場合、**dim** (*int*) が指定可能な属性であり、現在の field の値に含まれる vector embedding の数を決定します。

        - **ARRAY** field の場合、**max_capacity** (*int*) が指定可能な属性であり、entity の field に含まれる要素の最大数を決定します。

        - mmap が設定されている field の場合、**mmap_enabled** (*bool*) が指定可能な属性であり、現在の field に対して mmap が有効か無効かを指定します。

    - **element_type** (*int*) -

        field 値内の要素のデータ型。これは現在の field が ARRAY field の場合に表示されます。

    - **struct_fields** (*List[Field]*) -

        array of structs field 内の struct 要素に追加された field のリスト。指定可能な field 型の詳細については、[Array of Structs](/docs/use-array-of-structs) を参照してください。

    - **is_primary** (*bool*) -

        現在の field が collection の主キーとして機能するかどうか。

- **functions** (*list[[Function](./MilvusClient-Function)]*) -

    schema 内で定義された function。

- **aliases** (*list[str]*) -      

    collection alias のリスト。リスト内の任意の alias を使用して現在の collection を利用できます。  

- **collection_id** (*int*) -

    現在の collection の ID。Zilliz Cloud は collection の作成時に各 collection に ID を割り当てます。

- **consistency_level** (*int*) -

    現在の collection の整合性レベル。詳細は ConsistencyLevel を参照してください。

- **properties** (*dict*) -

    現在の collection の追加プロパティ。辞書に含まれ得るキーは次のとおりです。

    - **collection.ttl.seconds** (*int*) -

        collection の存続時間 (TTL) を秒単位で示したもの。

    - **collection.timezone** (*str*) -

        collection に設定されたタイムゾーン。デフォルト値は UTC です。

- **num_partitions** (*int*) -

    現在の collection 内の partition の数。 

    - 現在の collection で partition key が有効な場合、Zilliz Cloud はその collection 用に作成されたすべての partition を管理します。管理される partition の数は、collection 作成時に指定した数と一致している必要があります。

    - 現在の collection で partition key が有効でない場合、その数はこの collection にすでに作成されている partition の数と一致している必要があります。

- **enable_dynamic_field** (*bool*) -

    schema で定義されていない field とその値をキーと値のペアとして保存するために、予約済み JSON field **&#36;meta** を使用するかどうか。

- **created_timestamp** (*int*) -

    collection が作成された時点の timestamp。この timestamp は、Milvus の timestamp oracle service (TSO) によって生成されます。

- **updated_timestamp** (*int*) -

    collection が更新された時点の timestamp。この timestamp は、Milvus の timestamp oracle service (TSO) によって生成されます。

**EXCEPTIONS:**

- **DescribeCollectionException**

    この操作中に何らかのエラーが発生した場合に起こります。

## Examples\{#examples}

```python
from pymilvus import MilvusClient

# 1. Set up a milvus client
client = MilvusClient(
    uri="https://inxx-xxxxxxxxxxxx.api.gcp-us-west1.zillizcloud.com:19530",
    token="user:password"
)

# 2. Create a collection
client.create_collection(collection_name="test_collection", dimension=5)

# 3. Describe the collection
client.describe_collection(collection_name="test_collection")

# Output
# {
#     'collection_name': 'test_collection',
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
#                   'dim': 5
#               },
#               'element_type': 0
#           }
#      ],
#      'functions': [],
#      'aliases': [],
#      'collection_id': 461639391399348915,
#      'consistency_level': 2,
#      'properties': {},
#      'num_partitions': 1,
#      'enable_dynamic_field': True,
#      'created_timestamp': 461643298319106049,
#      'updated_timestamp': 461643298319106049
# }
```

