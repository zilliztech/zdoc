---
title: "delete() | Python | MilvusClient"
slug: /python/python/Vector-delete
sidebar_label: "delete()"
beta: false
added_since: v2.3.x
last_modified: false
deprecate_since: false
notebook: false
description: "此操作通过实体 ID 或布尔表达式删除实体。 | Python | MilvusClient"
type: docx
token: DWLXdSCYnoPT4ExktRKceEqLnAd
sidebar_position: 1
keywords: 
  - cheap vector database
  - Managed vector database
  - Pinecone vector database
  - Audio search
  - zilliz
  - zilliz cloud
  - cloud
  - delete()
  - pymilvus30
displayed_sidebar: pythonSidebar

displayed_sidbar: pythonSidebar
---

import Admonition from '@theme/Admonition';


# delete()

此操作通过实体 ID 或布尔表达式删除实体。

<Admonition type="info" icon="📘" title="说明">

外部集合不支持此操作。

</Admonition>

## 请求语法\{#request-syntax}

```python
delete(
    collection_name: str,
    ids: Optional[Union[list, str, int]] = None,
    timeout: Optional[float] = None,
    filter: Optional[str] = "",
    partition_name: Optional[str] = "",
    **kwargs,
) -> dict
```

**参数：**

- **collection_name** (*str*) -

    **[必填]**

    现有集合的名称。

- **ids** (*list* | *str* | *int*) -

    **[必填]**

    特定实体 ID 或实体 ID 列表。

    该值默认为 **None**，表示将应用标量过滤条件。同时设置 **ids** 和 **filter** 会导致抛出 **ParamError** 异常。

- **timeout** (*float* | *None*) -

    此操作的超时时长。 

    将其设置为 **None** 表示此操作会在收到任意响应或发生任意错误时超时。

- **filter** (*str*) -

    用于筛选匹配实体的标量过滤条件。 

    该值默认为空字符串，表示不应用任何条件。同时设置 **ids** 和 **filter** 会导致抛出 **ParamError** 异常。

    你可以将此参数设置为空字符串以跳过标量过滤。有关构建标量过滤条件的信息，请参见 [Boolean Expression Rules](https://milvus.io/docs/boolean.md)。 

    <Admonition type="info" icon="📘" title="说明">

    使用过滤表达式删除实体时，请确保集合已被加载。否则，Zilliz Cloud 将返回错误。

    </Admonition>

- **partition_name** (*str* | *""*) -

    要从中删除实体的分区名称。

    该值默认为空字符串。如果已指定，将从指定分区中删除实体。

**返回类型：**

*dict*

**返回值：**

一个包含已删除实体数量的字典。

```python
{
    "delete_cnt": int
}
```

**异常：**

- **MilvusException**

    当此操作期间发生任何错误时，将引发此异常。

- **ParamError**

    当同时指定 **ids** 和 **filter** 时，将引发此异常。

- **DataTypeNotMatchException**

    当参数值与所需的数据类型不匹配时，将引发此异常。

## 示例\{#examples}

```python
from pymilvus import MilvusClient

# 1. Set up a milvus client
client = MilvusClient(
    uri="https://inxx-xxxxxxxxxxxx.api.gcp-us-west1.zillizcloud.com:19530",
    token="user:password"
)

# 2. Create a collection
client.create_collection(
    collection_name="test_collection",
    dimension=5
)

# 3. Insert data
client.insert(
    collection_name="test_collection",
    data=[
        {"id": 0, "vector": [0.5, 0.09, 0.2, 0.15, 0.05], "color": "green"},
        {"id": 1, "vector": [0.04, 0.09, 0.33, 0.03, 0.35], "color": "blue"},
        {"id": 2, "vector": [0.1, 0.21, 0.41, 0.36, 0.9], "color": "orange"},
        {"id": 3, "vector": [0.75, 0.24, 0.09, 0.81, 0.41], "color": "red"},
        {"id": 4, "vector": [0.13, 0.27, 0.3, 0.23, 0.17], "color": "yellow"},
        {"id": 5, "vector": [0.17, 0.3, 0.13, 0.9, 0.29], "color": "white"},
        {"id": 6, "vector": [0.33, 0.22, 0.39, 0.17, 0.18], "color": "black"},
        {"id": 7, "vector": [0.16, 0.13, 0.03, 0.13, 0.12], "color": "purple"},
        {"id": 8, "vector": [0.12, 0.16, 0.25, 0.2, 0.16], "color": "pink"},
        {"id": 9, "vector": [0.07, 0.38, 0.36, 0.03, 0.47], "color": "brown"}
    ]
)

# {'insert_count': 10}

# 4. Delete entities
client.delete(
    collection_name="test_collection",
    ids=[3, 6, 7]
)

# {'delete_count': 3}

client.delete(
    collection_name="test_collection",
    filter="id in [1, 8, 9] and color like 'b%'"
)

# {'delete_count': 2}
```

