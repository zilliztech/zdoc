---
title: "release_collection() | Python | MilvusClient"
slug: /python/python/Management-release_collection
sidebar_label: "release_collection()"
beta: false
added_since: v2.3.x
last_modified: false
deprecate_since: false
notebook: false
description: "此操作会将指定 collection 的数据从内存中释放。 | Python | MilvusClient"
type: docx
token: PRR7dRfi8o1s61xFRovccAdRnHe
sidebar_position: 13
keywords: 
  - 什么是向量数据库
  - vectordb
  - 多模态向量数据库检索
  - 检索增强生成
  - zilliz
  - zilliz cloud
  - cloud
  - release_collection()
  - pymilvus30
displayed_sidebar: pythonSidebar

displayed_sidbar: pythonSidebar
---

import Admonition from '@theme/Admonition';


# release_collection()

此操作会将指定 collection 的数据从内存中释放。

<Admonition type="info" icon="📘" title="说明">

这仅适用于托管 collection。

</Admonition>

## 请求语法\{#request-syntax}

```python
release_collection(
    collection_name: str, 
    timeout: Optional[float] = None
) -> None
```

**参数：**

- **collection_name** (*str*) -

    **[必需]**

    collection 的名称。

- **timeout** (*float* | *None*) -

    此操作的超时时长。

    将其设置为 **None** 表示此操作会在返回任意响应或发生错误时超时。

**返回类型：**

*NoneType*

**返回：**

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

# 1. 创建 schema
schema = MilvusClient.create_schema(
    auto_id=False,
    enable_dynamic_field=False,
)

# 2. 向 schema 添加字段
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

# 3. 创建 collection
client.create_collection(
    collection_name="customized_setup",
    schema=schema
)

# 4. 准备索引参数
index_params = client.prepare_index_params()

# 5. 添加索引
index_params.add_index(
    field_name="my_id",
    index_type="STL_SORT"
)

index_params.add_index(
    field_name="my_vector", 
    index_type="IVF_FLAT",
    metric_type="L2",
    params={nlist: 1024}
)

# 6. 创建索引
client.create_index(
    collection_name="customized_setup",
    index_params=index_params
)

# 7. 加载 collection
client.load_collection(
    collection_name="customized_setup"
)

# 8. 获取加载状态
client.get_load_state(
    collection_name="customized_setup",
) # Loaded

# {'state': <LoadState: Loaded>}

# 9. 释放 collection
client.release_collection(
    collection_name="customized_setup"
)

# 10. 获取加载状态
client.get_load_state(
    collection_name="customized_setup"
) # Unloaded

# {'state': <LoadState: NotLoad>}
```

## 相关方法\{#related-methods}

- [get_load_state()](./Management-get_load_state)

- [load_collection()](./Management-load_collection)

- [refresh_load()](./Management-refresh_load)

