---
title: "describe_collection() | Python | MilvusClient"
slug: /python/python/Collections-describe_collection
sidebar_label: "describe_collection()"
beta: false
added_since: v2.3.x
last_modified: v2.6.x
deprecate_since: false
notebook: false
description: "此操作会列出特定 Collection 的详细信息。 | Python | MilvusClient"
type: docx
token: LXASdPs6KoRfCJx11A1cl2Ssngg
sidebar_position: 9
keywords: 
  - 神经网络
  - 深度学习
  - 知识库
  - 自然语言处理
  - zilliz
  - zilliz cloud
  - 云
  - describe_collection()
  - pymilvus30
displayed_sidebar: pythonSidebar

displayed_sidbar: pythonSidebar
---

import Admonition from '@theme/Admonition';


# describe_collection()

此操作会列出特定 Collection 的详细信息。

<Admonition type="info" icon="📘" title="Notes">

此方法适用于 Dedicated 服务集群和按需计算。

- 对于服务集群中的 Collection，请使用集群 Endpoint 创建 **[MilvusClient](./Client-MilvusClient)**。

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
    collection_name: str, 
    **kwargs
) -> Name
```

**参数：**

- **collection_name** (*str*) -

    **[必需]**

    现有 Collection 的名称。

    如果将其设置为不存在的 Collection，将导致 **MilvusException**。

- **kwargs** -

    - **timeout** (*float* | *None*)  

        此操作的超时时长。

        将其设置为 **None** 表示此操作会在收到任意响应或发生任意错误时超时。

**返回类型：**

*dict*

**返回值：**

包含指定 Collection 详细信息的字典。

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

**参数：**

- **collection_name** (*str*) -

    当前 Collection 的名称。

- **auto_id** (*bool*) -

    Zilliz Cloud 是否自动为该 Collection 生成主键。

- **num_shards** (*int*) -

    当前 Collection 拥有的分片数。

- **description** (*str*) -

    当前 Collection 的描述。

- **external_source** (*str*) -

    Collection 的外部来源。仅适用于外部 Collection。

- **external_specs** (*str*) -

    Collection 的外部规格。仅适用于外部 Collection。

- **fields** (*list*) -

    当前 Collection 中的字段列表。

    - **field_id** (*int*) -

        当前字段的 ID。

    - **name** (*str*) -

        当前字段的名称。

    - **description** (*str*) -

        当前字段的描述。

    - **type** (*int*) -

        当前字段的类型。详情请参阅 [DataType](./Collections-DataType)。

    - **params** (*dict*) -

        当前字段的附加属性。

        - 对于 **VARCHAR** 字段，**max_length** (*int*) 是一个可能的属性，用于确定当前字段值中的字符数。

        - 对于向量字段，**dim** (*int*) 是一个可能的属性，用于确定当前字段值中的向量嵌入数量。

        - 对于 **ARRAY** 字段，**max_capacity** (*int*) 是一个可能的属性，用于确定一个 Entity 的该字段中的最大元素数。

        - 对于已配置 mmap 的字段，**mmap_enabled** (*bool*) 是一个可能的属性，用于指定当前字段是否启用 mmap。

    - **element_type** (*int*) -

        字段值中元素的数据类型。如果当前字段是 ARRAY 字段，则会显示此项。

    - **struct_fields** (*List[Field]*) -

        添加到 struct 数组字段中 struct 元素的字段列表。有关可能的字段类型的详细信息，请参阅 [Array of Structs](/docs/use-array-of-structs)。

    - **is_primary** (*bool*) -

        当前字段是否作为该 Collection 的主键。

- **functions** (*list[[Function](./MilvusClient-Function)]*) -

    在 Schema 中已定义的函数。

- **aliases** (*list[str]*) -      

    Collection 别名列表。您可以使用列表中的任一别名来使用当前 Collection。  

- **collection_id** (*int*) -

    当前 Collection 的 ID。Zilliz Cloud 会在创建每个 Collection 时为其分配一个 ID。

- **consistency_level** (*int*) -

    当前 Collection 的一致性级别。详情请参阅 ConsistencyLevel。

- **properties** (*dict*) -

    当前 Collection 的附加属性。字典中可能包含的键包括：

    - **collection.ttl.seconds** (*int*) -

        Collection 的生存时间（TTL），单位为秒。

    - **collection.timezone** (*str*) -

        为 Collection 配置的时区。默认值为 UTC。

- **num_partitions** (*int*) -

    当前 Collection 中的 Partition 数量。

    - 如果当前 Collection 启用了 Partition key，Zilliz Cloud 会管理为该 Collection 创建的所有 Partition。受管 Partition 的数量应与创建 Collection 时指定的数量一致。

    - 如果当前 Collection 未启用 Partition key，则该数量应与此 Collection 中已创建的 Partition 数量一致。

- **enable_dynamic_field** (*bool*) -

    是否使用保留的 JSON 字段 **&#36;meta** 以键值对形式保存未在 Schema 中定义的字段及其值。

- **created_timestamp** (*int*) -

    Collection 的创建时间戳。该时间戳由 Milvus 的时间戳预言机服务（TSO）生成。

- **updated_timestamp** (*int*) -

    Collection 的更新时间戳。该时间戳由 Milvus 的时间戳预言机服务（TSO）生成。

**异常：**

- **DescribeCollectionException**

    当此操作期间发生任何错误时，会引发此异常。

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

