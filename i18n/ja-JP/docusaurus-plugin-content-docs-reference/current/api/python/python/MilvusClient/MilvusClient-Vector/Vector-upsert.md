---
title: "upsert() | Python | MilvusClient"
slug: /python/python/Vector-upsert
sidebar_label: "upsert()"
beta: false
added_since: v2.3.x
last_modified: v2.6.x
deprecate_since: false
notebook: false
description: "この操作は、特定の collection にデータを挿入または更新します。 | Python | MilvusClient"
type: docx
token: UjjpdBwaooRDdlxFHScc6dKwnTg
sidebar_position: 8
keywords: 
  - Vector embeddings
  - Vector store
  - open source vector database
  - Vector index
  - zilliz
  - zilliz cloud
  - cloud
  - upsert()
  - pymilvus30
displayed_sidebar: pythonSidebar

displayed_sidbar: pythonSidebar
---

import Admonition from '@theme/Admonition';


# upsert()

この操作は、特定の collection にデータを挿入または更新します。

<Admonition type="info" icon="📘" title="注記">

External collections はこの操作をサポートしていません。

</Admonition>

## リクエスト構文\{#request-syntax}

```python
upsert(
    collection_name: str,
    data: Union[Dict, List[Dict]],
    timeout: Optional[float] = None,
    partial_update: Optional[bool] = False,
    partition_name: Optional[str] = "",
) -> List[Union[str, int]]
```

**PARAMETERS:**

- **collection_name** (*str*) -

    **[REQUIRED]**

    既存の collection の名前。

- **data** (*dict* | *list[dict]*) -

    **[REQUIRED]**

    現在の collection に挿入または更新するデータ。

    挿入または更新するデータは、現在の collection の schema に一致する辞書、またはそのような辞書のリストである必要があります。 

    更新を行うには、まず collection から対象エンティティを取得し、関連するフィールドの値を変更してから、collection に保存し直すことを推奨します。 

    以下のコードは、現在の collection の schema に **id**、**vector**、**color** という 3 つのフィールドがあることを前提としています。`id` フィールドは primary field、`vector` フィールドは 5 次元の vector embeddings を保持するフィールド、`color` フィールドは文字列を保持する scalar field です。

    ```python
    # A dictionary, or
    data={
        'id': 0,
        'vector': [
            0.6186516144460161,
            0.5927442462488592,
            0.848608119657156,
            0.9287046808231654,
            -0.42215796530168403
        ],
        'color': 'green'
    }
    
    # A list of dictionaries
    data = [
        {
            'id': 1,
            'vector': [
                0.37417449965222693,
                -0.9401784221711342,
                0.9197526367693833,
                0.49519396415367245,
                -0.558567588166478
            ],
            'color': 'brown'
        },
        {
            'id': 2,
            'vector': [
                0.46949086179692356,
                -0.533609076732849,
                -0.8344432775467099,
                0.9797361846081416,
                0.6294256393761057
            ],
            'color': 'purple'
        }
    ]
    ```

- **timeout** (*float* | *None*)  

    この操作のタイムアウト時間です。これを **None** に設定すると、レスポンスが返るかエラーが発生した時点でこの操作はタイムアウトします。

- **partition_name** (*string* | *None*) -

    現在の collection 内の partition の名前。 

    指定した場合、データは指定された partition に挿入または更新されます。

**RETURN TYPE:**

*dict*

**RETURNS:**

挿入または更新されたエンティティ数に関する情報を含む辞書。

```python
{
    'upsert_count': int,
    'primary_Keys': List[id | str]
}
```

**EXCEPTIONS:**

- **MilvusException**

    この操作中に何らかのエラーが発生した場合に、この例外が発生します。

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

# 3. Insert records
res = client.insert(
    collection_name="test_collection",
    data=[
        {
            'id': 0,
            'vector': [
                0.37417449965222693,
                -0.9401784221711342,
                -0.8344432775467099,
                0.9797361846081416,
                0.6294256393761057
            ],
            'color': 'green'
        },
        {
            'id': 1,
            'vector': [
                0.37417449965222693,
                -0.9401784221711342,
                0.9197526367693833,
                0.49519396415367245,
                -0.558567588166478
            ],
            'color': 'brown'
        },
        {
            'id': 2,
            'vector': [
                0.46949086179692356,
                -0.533609076732849,
                -0.8344432775467099,
                0.9797361846081416,
                0.6294256393761057
            ],
            'color': 'purple'
        }
    ]
)

# {'insert_count': 3, ids: [0, 1, 2]}

# 4. Upsert a record
res = client.upsert(
    collection_name="test_collection",
    data={
        'id': 0,
        'vector': [
            0.6186516144460161,
            0.5927442462488592,
            0.848608119657156,
            0.9287046808231654,
            -0.42215796530168403
        ],
        'color': 'grass-green'
    }
)

# {'upsert_count': 1, 'primary_keys': [0]}

# 4. Upsert multiple records
res = client.upsert(
    collection_name="test_collection",
    data=[
        {
            'id': 1,
             'vector': [
                 0.3457690490452393,
                 -0.9401784221711342,
                 0.9123948134344333,
                 0.49519396415367245,
                 -0.558567588166478
             ],
             'color': 'mud-brown'
       },
       {
           'id': 2,
           'vector': [
               0.42349086179692356,
               -0.533609076732849,
               -0.8344432775467099,
               0.675761846081416,
               0.57094256393761057
           ],
           'color': 'violet-purple'
       }
   ]
)

# {'upsert_count': 2, primary_keys: [1, 2]}

# 5. Upsert with partial update
res = client.upsert(
    collection_name="test_collection",
    data=[
        {
            'id': 1,
            'color': 'cesped-green'
        },
        {
            'id': 2,
            'color': 'manganese-purple'
        }
    ],
    partial_update=True
)

# {'upsert_count': 2: primary_keys: [1, 2]}
```

