---
title: "insert() | Python | MilvusClient"
slug: /python/python/Vector-insert
sidebar_label: "insert()"
beta: false
added_since: v2.3.x
last_modified: false
deprecate_since: false
notebook: false
description: "此操作将数据插入到指定集合中。 | Python | MilvusClient"
type: docx
token: QI87dhVnioL9JLxnNKxcM8jWnkh
sidebar_position: 3
keywords: 
  - Audio similarity search
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

此操作将数据插入到指定集合中。

<Admonition type="info" icon="📘" title="说明">

外部集合不支持此操作。

</Admonition>

## 请求语法\{#request-syntax}

```python
insert(
    collection_name: str,
    data: Union[Dict, List[Dict]],
    timeout: Optional[float] = None,
    partition_name: Optional[str] = "",
) -> List[Union[str, int]]
```

**参数：**

- **collection_name** (*str*) -

    **[必填]**

    现有集合的名称。

- **data** (*dict* | *list[dict]*) -

    **[必填]**

    要插入当前集合的数据。

    要插入的数据应为与当前集合 schema 匹配的字典，或由此类字典组成的列表。

    以下代码假设当前集合的 schema 包含两个名为 **id** 和 **vector** 的字段。前者是主字段，后者用于存储 5 维向量嵌入。

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

    此操作的超时时长。

    将其设置为 **None** 表示当收到任意响应或发生任意错误时，此操作即超时。

- **partition_name** (*string* | *None*) -

    当前集合中某个分区的名称。

    如果指定，则数据将插入到指定分区中。

**返回类型：**

*dict*

**返回值：**

一个包含已插入实体数量信息的字典。

```python
{'insert_count': 0}
```

**异常：**

- **MilvusException**

    当此操作期间发生任何错误时，将引发此异常。

## 示例\{#examples}

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

