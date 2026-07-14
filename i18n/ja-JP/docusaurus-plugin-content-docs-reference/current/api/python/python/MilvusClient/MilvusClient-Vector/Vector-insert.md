---
title: "insert() | Python | MilvusClient"
slug: /python/python/Vector-insert
sidebar_label: "insert()"
beta: false
added_since: v2.3.x
last_modified: false
deprecate_since: false
notebook: false
description: "この操作は、特定の collection にデータを挿入します。 | Python | MilvusClient"
type: docx
token: QI87dhVnioL9JLxnNKxcM8jWnkh
sidebar_position: 3
keywords: 
  - 音声類似検索
  - Elastic vector database
  - Pinecone vs Milvus
  - Chroma vs Milvus
  - zilliz
  - zilliz cloud
  - cloud
  - insert()
  - pymilvus30
displayed_sidebar: pythonSidebar

displayed_sidbar: pythonSidebar
---

import Admonition from '@theme/Admonition';


# insert()

この操作は、特定の collection にデータを挿入します。

<Admonition type="info" icon="📘" title="注意">

外部コレクションはこの操作をサポートしていません。

</Admonition>

## Request syntax\{#request-syntax}

```python
insert(
    collection_name: str,
    data: Union[Dict, List[Dict]],
    timeout: Optional[float] = None,
    partition_name: Optional[str] = "",
) -> List[Union[str, int]]
```

**PARAMETERS:**

- **collection_name** (*str*) -

    **[REQUIRED]**

    既存の collection の名前です。

- **data** (*dict* | *list[dict]*) -

    **[REQUIRED]**

    現在の collection に挿入するデータです。

    挿入するデータは、現在の collection のスキーマに一致する辞書、またはそのような辞書のリストである必要があります。 

    次のコードは、現在の collection のスキーマに **id** と **vector** という名前の 2 つのフィールドがあることを前提としています。前者はプライマリフィールドで、後者は 5 次元の vector 埋め込みを保持するフィールドです。

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
        ]
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
            ]
        },
        {
            'id': 2,
            'vector': [
                0.46949086179692356,
                -0.533609076732849,
                -0.8344432775467099,
                0.9797361846081416,
                0.6294256393761057
            ]
        }
    ]
    ```

- **timeout** (*float* | *None*)  

    この操作のタイムアウト時間です。 

    これを **None** に設定すると、何らかのレスポンスが到着するか、何らかのエラーが発生した時点でこの操作はタイムアウトします。

- **partition_name** (*string* | *None*) -

    現在の collection 内の partition の名前です。 

    指定した場合、データは指定された partition に挿入されます。

**RETURN TYPE:**

*dict*

**RETURNS:**

挿入されたエンティティ数に関する情報を含む辞書です。

```python
{'insert_count': 0}
```

**EXCEPTIONS:**

- **MilvusException**

    この操作中に何らかのエラーが発生すると、この例外が発生します。

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

# 3. Insert a record
res = client.insert(
    collection_name="test_collection",
    data={
        'id': 0,
        'vector': [
            0.6186516144460161,
            0.5927442462488592,
            0.848608119657156,
            0.9287046808231654,
            -0.42215796530168403
        ]
    }
)

# {'insert_count': 1}

# 4. Insert multiple records
res = client.insert(
    collection_name="test_collection",
    data=[
        {
            'id': 1,
             'vector': [
                 0.37417449965222693,
                 -0.9401784221711342,
                 0.9197526367693833,
                 0.49519396415367245,
                 -0.558567588166478
             ]
       },
       {
           'id': 2,
           'vector': [
               0.46949086179692356,
               -0.533609076732849,
               -0.8344432775467099,
               0.9797361846081416,
               0.6294256393761057
           ]
       }
   ]
)

# {'insert_count': 2}
```

