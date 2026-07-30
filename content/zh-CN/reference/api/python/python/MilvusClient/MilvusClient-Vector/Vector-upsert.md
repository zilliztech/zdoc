---
title: "upsert() | Python | MilvusClient"
slug: /python/python/Vector-upsert
sidebar_label: "upsert()"
beta: false
added_since: v2.3.x
last_modified: v2.6.x
deprecate_since: false
notebook: false
description: "此操作会在特定集合中插入或更新数据。 | Python | MilvusClient"
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

此操作会在特定集合中插入或更新数据。

<Admonition type="info" icon="📘" title="说明">

外部集合不支持此操作。

</Admonition>

## Request syntax\{#request-syntax}

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

    现有集合的名称。

- **data** (*dict* | *list[dict]*) -

    **[REQUIRED]**

    要插入到当前集合或在当前集合中更新的数据。

    要插入或更新的数据应为与当前集合 schema 匹配的字典，或由此类字典组成的列表。

    要执行更新，建议先从集合中检索目标实体，修改相关字段的值，然后再将其保存回集合中。

    以下代码假设当前集合的 schema 中有三个字段，分别名为 **id**、**vector** 和 **color**。`id` 字段是主字段，`vector` 字段用于存储 5 维向量嵌入，`color` 字段是用于存储字符串的标量字段。

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

    此操作的超时时长。将其设置为 **None** 表示当收到任意响应或发生任意错误时，此操作即超时。

- **partition_name** (*string* | *None*) -

    当前集合中某个分区的名称。

    如果指定，则数据将被插入或更新到指定分区中。

**RETURN TYPE:**

*dict*

**RETURNS:**

一个包含已插入或已更新实体数量信息的字典。

```python
{
    'upsert_count': int,
    'primary_Keys': List[id | str]
}
```

**EXCEPTIONS:**

- **MilvusException**

    当此操作期间发生任何错误时，将引发此异常。

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

