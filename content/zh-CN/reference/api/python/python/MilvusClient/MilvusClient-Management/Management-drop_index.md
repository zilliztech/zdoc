---
title: "drop_index() | Python | MilvusClient"
slug: /python/python/Management-drop_index
sidebar_label: "drop_index()"
beta: false
added_since: v2.3.x
last_modified: false
deprecate_since: false
notebook: false
description: "此操作会从指定的 Collection 中删除一个索引。 | Python | MilvusClient"
type: docx
token: NPnQdZCJ7oF002xTntecdI2ini8
sidebar_position: 5
keywords: 
  - Serverless 向量 Database
  - milvus 开源
  - milvus 的工作原理
  - Zilliz 向量 Database
  - zilliz
  - zilliz cloud
  - 云
  - drop_index()
  - pymilvus30
displayed_sidebar: pythonSidebar

displayed_sidbar: pythonSidebar
---

import Admonition from '@theme/Admonition';


# drop_index()

此操作会从指定的 Collection 中删除一个索引。

<Admonition type="info" icon="📘" title="Notes">

按需计算的 Collection 不支持此操作。

</Admonition>

## 请求语法\{#request-syntax}

```python
drop_index(
    collection_name: str,
    index_name: str,
    timeout: Optional[float] = None,
    **kwargs,    
)
```

**参数：**

- **collection_name** (*str*) -

    **[必填]**

    现有 Collection 的名称。

- **index_name** (str) -

    **[必填]**

    要删除的索引名称。

- **timeout** (*float* | *None*) -

    此操作的超时时长。将此参数设置为 **None** 表示当收到任何响应或发生任何错误时，此操作即超时。

**返回类型：**

*NoneType*

**返回值：**

None

**异常：**

- **MilvusException**

    当此操作期间发生任何错误时，将引发此异常。

## 示例\{#examples}

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

# 3. Create index parameters
index_params = client.prepare_index_params()

# 4. Add indexes
# - For a scalar field
index_params.add_index(
    field_name="my_id",
    index_type="STL_SORT"
)

# - For a vector field
index_params.add_index(
    field_name="my_vector", 
    index_type="IVF_FLAT",
    metric_type="L2",
    params={"nlist": 1024}
)

# 5. Create a collection
client.create_collection(
    collection_name="customized_setup",
    schema=schema
)

# 6. Create indexes
client.create_index(
    collection_name="customized_setup",
    index_params=index_params
)

# 6. List indexes
client.list_indexes(collection_name="customized_setup")

# ['my_id', 'my_vector']

# 7. Drop an index
client.drop_index(
    collection_name="customized_setup", 
    index_name="my_id"
)
```

## 相关方法\{#related-methods}

- [add_index()](./Management-add_index)

- [create_index()](./Management-create_index)

- [describe_index()](./Management-describe_index)

- [list_indexes()](./Management-list_indexes)

- [prepare_index_params()](./Management-prepare_index_params)

