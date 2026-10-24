---
title: "describe_collection() | Python | MilvusClient"
slug: /python/python/Collections-describe_collection
sidebar_label: "describe_collection()"
beta: false
added_since: v2.3.x
last_modified: v3.0.x
deprecate_since: false
notebook: false
description: "此操作会列出特定 Collection 的详细信息。 | Python | MilvusClient"
type: docx
token: OdEsdo0lHom3YlxHHVMcerhdnWe
sidebar_position: 9
keywords: 
  - 神经网络
  - 深度学习
  - 知识库
  - 自然语言处理
  - Zilliz
  - Zilliz Cloud
  - 云
  - describe_collection()
  - pymilvus30
displayed_sidebar: pythonSidebar

displayed_sidbar: pythonSidebar
---

import Admonition from '@theme/Admonition';


# describe_collection()

此操作会列出特定 Collection 的详细信息。

<Admonition type="info" title="Notes">

此方法适用于专用 serving 集群和按需计算。 

- 对于 serving 集群中的 Collection，请使用集群 Endpoint 创建 **[MilvusClient](./Client-MilvusClient)**。

    - **Free & Serverless**

        `https://{cluster-id}.serverless.{region}.vectordb.zillizcloud.com`

    - **Dedicated**

        `https://{cluster-id}.{region}.vectordb.zillizcloud.com:19530`

- 对于按需计算中的 Collection，请使用项目 Endpoint 创建 **[MilvusClient](./Client-MilvusClient)**。

    `https://{project-id}.{region}.api.zillizcloud.com`

</Admonition>

## 请求语法\{#request-syntax}

```python
describe_collection(
```

**参数：**

- **collection_name** （*str*） -

    **[必需]**

    现有 Collection 的名称。如果将其设置为不存在的 Collection，则会引发 MilvusException。

- **kwargs** （*Any*） -

    超时时间（float | None）：此操作的超时持续时间。将其设置为 None 表示当收到任意响应或发生错误时，此操作即超时。

**返回类型：**

*dict*

**返回：**

包含指定 Collection 详细信息的字典。

**异常：**

- **DescribeCollectionException**

    此操作过程中发生任何错误时，就会出现此异常。此操作过程中发生任何错误时，就会出现此异常。

## 示例\{#examples}

```python
from pymilvus import MilvusClient

# 1. Set up a milvus client
client = MilvusClient(
    uri="YOUR_CLUSTER_ENDPOINT",
    token="YOUR_CLUSTER_TOKEN"
)

# 2. Create a collection
client.create_collection(
    collection_name="test_collection",
    dimension=5,
)

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
