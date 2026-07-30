---
title: "describe_collection() | Python | MilvusClient"
slug: /python/python/Collections-describe_collection
sidebar_label: "describe_collection()"
beta: false
added_since: v2.3.x
last_modified: v2.6.x
deprecate_since: false
notebook: false
description: "此操作列出特定集合的详细信息。 | Python | MilvusClient"
type: docx
token: LXASdPs6KoRfCJx11A1cl2Ssngg
sidebar_position: 9
keywords: 
  - Neural Network
  - Deep Learning
  - Knowledge base
  - natural language processing
  - zilliz
  - zilliz cloud
  - cloud
  - describe_collection()
  - pymilvus30
displayed_sidebar: pythonSidebar

displayed_sidbar: pythonSidebar
---

import Admonition from '@theme/Admonition';


# describe_collection()

此操作列出特定集合的详细信息。

<Admonition type="info" icon="📘" title="说明">

此方法适用于专属服务集群和按需计算。

- 对于服务集群中的集合，请使用集群端点创建 **[MilvusClient](./Client-MilvusClient)**。

    - **Free & Serverless**

        `https://{cluster-id}.serverless.{region}.vectordb.zillizcloud.com`

    - **Dedicated**

        `https://{cluster-id}.{region}.vectordb.zillizcloud.com:19530`

- 对于按需计算中的集合，请使用项目端点创建 **[MilvusClient](./Client-MilvusClient)**。

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

    现有集合的名称。

    如果将其设置为不存在的集合，将导致 **MilvusException**。

- **kwargs** -

    - **timeout** (*float* | *None*)  

        此操作的超时时长。

        将其设置为 **None** 表示当收到任何响应或发生任何错误时，此操作超时。

**返回类型：**

*dict*

**返回值：**

包含指定集合详细信息的字典。

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

    当前集合的名称。

- **auto_id** (*bool*) -

    Zilliz Cloud 是否为该集合自动生成主键。

- **num_shards** (*int*) -

    当前集合拥有的分片数量。

- **description** (*str*) -

    当前集合的描述。

- **external_source** (*str*) -

    集合的外部来源。仅适用于外部集合。

- **external_specs** (*str*) -

    集合的外部规格。仅适用于外部集合。

- **fields** (*list*) -

    当前集合中的字段列表。

    - **field_id** (*int*) -

        当前字段的 ID。

    - **name** (*str*) -

        当前字段的名称。

    - **description** (*str*) -

        当前字段的描述。

    - **type** (*int*) -

        当前字段的类型。详情请参见 [DataType](./Collections-DataType)。

    - **params** (*dict*) -

        当前字段的附加属性。

        - 对于 **VARCHAR** 字段，**max_length** (*int*) 是可能的属性之一，用于确定当前字段值中的字符数。

        - 对于向量字段，**dim** (*int*) 是可能的属性之一，用于确定当前字段值中向量嵌入的维度数。

        - 对于 **ARRAY** 字段，**max_capacity** (*int*) 是可能的属性之一，用于确定实体中该字段的最大元素数量。

        - 对于配置了 mmap 的字段，**mmap_enabled** (*bool*) 是可能的属性之一，用于指定当前字段是否启用 mmap。

    - **element_type** (*int*) -

        字段值中元素的数据类型。如果当前字段是 ARRAY 字段，则会显示此项。

    - **struct_fields** (*List[Field]*) -

        添加到结构体数组字段中结构体元素的字段列表。有关可能的字段类型的详细信息，请参见 [Array of Structs](/docs/use-array-of-structs)。

    - **is_primary** (*bool*) -

        当前字段是否作为集合的主键。

- **functions** (*list[[Function](./MilvusClient-Function)]*) -

    已在 schema 中定义的函数。

- **aliases** (*list[str]*) -      

    集合别名列表。您可以使用列表中的任一别名来使用当前集合。  

- **collection_id** (*int*) -

    当前集合的 ID。Zilliz Cloud 会在创建集合时为每个集合分配一个 ID。

- **consistency_level** (*int*) -

    当前集合的一致性级别。详情请参见 ConsistencyLevel。

- **properties** (*dict*) -

    当前集合的附加属性。字典中可能包含的键包括：

    - **collection.ttl.seconds** (*int*) -

        集合的生存时间（TTL），单位为秒。

    - **collection.timezone** (*str*) -

        为集合配置的时区。默认值为 UTC。

- **num_partitions** (*int*) -

    当前集合中的分区数量。

    - 如果当前集合启用了分区键，Zilliz Cloud 会管理为该集合创建的所有分区。管理的分区数应与创建集合时指定的数量一致。

    - 如果当前集合未启用分区键，则该数量应与此集合中已创建的分区数一致。

- **enable_dynamic_field** (*bool*) -

    是否使用保留的 JSON 字段 **&#36;meta** 以键值对形式保存未在 schema 中定义的字段及其值。

- **created_timestamp** (*int*) -

    集合创建时的时间戳。该时间戳由 Milvus 的 timestamp oracle service (TSO) 生成。

- **updated_timestamp** (*int*) -

    集合更新时的时间戳。该时间戳由 Milvus 的 timestamp oracle service (TSO) 生成。

**异常：**

- **DescribeCollectionException**

    当此操作期间发生任何错误时引发。

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

