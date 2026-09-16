---
title: "describe_collection() | Python | MilvusClient"
slug: /python/python/Collections-describe_collection
sidebar_label: "describe_collection()"
beta: false
added_since: v2.3.x
last_modified: v2.6.x
deprecate_since: false
notebook: false
description: "この操作は、特定のコレクションに関する詳細情報を一覧表示します。 | Python | MilvusClient"
type: docx
token: LXASdPs6KoRfCJx11A1cl2Ssngg
sidebar_position: 9
keywords: 
  - ニューラルネットワーク
  - ディープラーニング
  - ナレッジベース
  - 自然言語処理
  - zilliz
  - zilliz cloud
  - クラウド
  - describe_collection()
  - pymilvus30
displayed_sidebar: pythonSidebar

displayed_sidbar: pythonSidebar
---

import Admonition from '@theme/Admonition';


# describe_collection()

この操作は、特定のコレクションに関する詳細情報を一覧表示します。

<Admonition type="info" title="Notes">

このメソッドは、専用のサービングクラスターとオンデマンドコンピュートに適用されます。 

- サービングクラスター内のコレクションの場合は、クラスターエンドポイントを使用して **[MilvusClient](./Client-MilvusClient)** を作成してください。

    - **Free & Serverless**

        `https://{cluster-id}.serverless.{region}.vectordb.zillizcloud.com`

    - **Dedicated**

        `https://{cluster-id}.{region}.vectordb.zillizcloud.com:19530`

- オンデマンドコンピュート内のコレクションの場合は、プロジェクトエンドポイントを使用して **[MilvusClient](./Client-MilvusClient)** を作成してください。

    `https://{project-id}.{region}.api.zillizcloud.com`

</Admonition>

## リクエスト構文\{#request-syntax}

```python
describe_collection(
    collection_name: str, 
    **kwargs
) -> Name
```

**パラメーター:**

- **collection_name** (*str*) -

    **[REQUIRED]**

    既存のコレクションの名前です。

    これを存在しないコレクションに設定すると、**MilvusException** が発生します。

- **kwargs** -

    - **timeout** (*float* | *None*)  

        この操作のタイムアウト時間です。 

        これを **None** に設定すると、何らかのレスポンスが到着するか、何らかのエラーが発生した時点でこの操作はタイムアウトします。

**戻り値の型:**

*dict*

**戻り値:**

指定したコレクションに関する詳細情報を含む辞書です。

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

**パラメーター:**

- **collection_name** (*str*) -

    現在のコレクションの名前です。

- **auto_id** (*bool*) -

    Zilliz Cloud がそのコレクションの主キーを自動生成するかどうか。

- **num_shards** (*int*) -

    現在のコレクションが持つシャード数です。

- **description** (*str*) -

    現在のコレクションの説明です。

- **external_source** (*str*) -

    コレクションの外部ソースです。これは外部コレクションにのみ適用されます。 

- **external_specs** (*str*) -

    コレクションの外部仕様です。これは外部コレクションにのみ適用されます。

- **fields** (*list*) -

    現在のコレクション内のフィールドのリストです。

    - **field_id** (*int*) -

        現在のフィールドの ID です。

    - **name** (*str*) -

        現在のフィールドの名前です。

    - **description** (*str*) -

        現在のフィールドの説明です。

    - **type** (*int*) -

        現在のフィールドの型です。詳細は [DataType](./Collections-DataType) を参照してください。

    - **params** (*dict*) -

        現在のフィールドの追加属性です。

        - **VARCHAR** フィールドの場合、**max_length** (*int*) が指定可能な属性であり、現在のフィールドの値に含まれる文字数を決定します。

        - ベクトルフィールドの場合、**dim** (*int*) が指定可能な属性であり、現在のフィールドの値に含まれるベクトル埋め込みの数を決定します。

        - **ARRAY** フィールドの場合、**max_capacity** (*int*) が指定可能な属性であり、エンティティのフィールドに含まれる要素の最大数を決定します。

        - mmap が設定されているフィールドの場合、**mmap_enabled** (*bool*) が指定可能な属性であり、現在のフィールドに対して mmap を有効にするか無効にするかを指定します。

    - **element_type** (*int*) -

        フィールド値内の要素のデータ型です。これは現在のフィールドが ARRAY フィールドの場合に表示されます。

    - **struct_fields** (*List[Field]*) -

        array of structs フィールド内の struct 要素に追加されたフィールドのリストです。指定可能なフィールド型の詳細については、[Array of Structs](/docs/use-array-of-structs) を参照してください。

    - **is_primary** (*bool*) -

        現在のフィールドがコレクションの主キーとして機能するかどうか。

- **functions** (*list[[Function](./MilvusClient-Function)]*) -

    スキーマ内で定義された関数です。

- **aliases** (*list[str]*) -      

    コレクションエイリアスのリストです。リスト内の任意のエイリアスを使用して現在のコレクションを利用できます。  

- **collection_id** (*int*) -

    現在のコレクションの ID です。Zilliz Cloud はコレクションの作成時に各コレクションに ID を割り当てます。

- **consistency_level** (*int*) -

    現在のコレクションの整合性レベルです。詳細は ConsistencyLevel を参照してください。

- **properties** (*dict*) -

    現在のコレクションの追加プロパティです。辞書に含めることが可能なキーは次のとおりです。

    - **コレクション.ttl.seconds** (*int*) -

        そのコレクションの存続時間（TTL）を秒単位で示します。

    - **collection.timezone** (*str*) -

        そのコレクションに設定されたタイムゾーンです。デフォルト値は UTC です。

- **num_partitions** (*int*) -

    現在のコレクション内のパーティション数です。 

    - 現在のコレクションでパーティションキーが有効になっている場合、Zilliz Cloud はそのコレクション用に作成されたすべてのパーティションを管理します。管理されるパーティション数は、そのコレクションの作成時に指定した数と一致している必要があります。

    - 現在のコレクションでパーティションキーが有効になっていない場合、その数はこのコレクションにすでに作成されているパーティションの数と一致している必要があります。

- **enable_dynamic_field** (*bool*) -

    スキーマで定義されていないフィールドとその値をキーと値のペアとして保存するために、予約済みの JSON フィールド **&#36;meta** を使用するかどうか。

- **created_timestamp** (*int*) -

    コレクションが作成された時点のタイムスタンプです。このタイムスタンプは、Milvus の timestamp oracle service（TSO）によって生成されます。

- **updated_timestamp** (*int*) -

    コレクションが更新された時点のタイムスタンプです。このタイムスタンプは、Milvus の timestamp oracle service（TSO）によって生成されます。

**例外:**

- **DescribeCollectionException**

    この操作中に何らかのエラーが発生した場合に発生します。

## 例\{#examples}

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

