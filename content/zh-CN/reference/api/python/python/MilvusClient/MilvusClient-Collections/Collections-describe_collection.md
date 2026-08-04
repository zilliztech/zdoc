---
title: "describe_collection() | Python | MilvusClient"
slug: /python/python/Collections-describe_collection
sidebar_label: "describe_collection()"
beta: false
added_since: v2.3.x
last_modified: v2.6.x
deprecate_since: false
notebook: false
description: "此操作列出特定 collection 的详细信息。 | Python | MilvusClient"
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

此操作列出特定 collection 的详细信息。

<Admonition type="info" icon="📘" title="说明">

此方法适用于专属服务集群和按需计算。 

- 对于服务集群中的 collection，请使用集群端点创建 **[MilvusClient](./Client-MilvusClient)**。

    - **Free & Serverless**

        `https://{cluster-id}.serverless.{region}.vectordb.zillizcloud.com`

    - **Dedicated**

        `https://{cluster-id}.{region}.vectordb.zillizcloud.com:19530`

- 对于按需计算中的 collection，请使用项目端点创建 **[MilvusClient](./Client-MilvusClient)**。

    `https://{project-id}.{region}.api.zillizcloud.com`

</Admonition>

## Request Syntax\{#request-syntax}

```python
describe_collection(
    collection_name: str, 
    **kwargs
) -> Name
```

**PARAMETERS:**

- **collection_name** (*str*) -

    **[REQUIRED]**

    已存在 collection 的名称。

    如果将其设置为不存在的 collection，则会导致 **MilvusException**。

- **kwargs** -

    - **timeout** (*float* | *None*)  

        此操作的超时时长。 

        将其设置为 **None** 表示当收到任何响应或发生任何错误时，此操作超时。

**RETURN TYPE:**

*dict*

**RETURNS:**

包含指定 collection 详细信息的字典。

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

**PARAMETERS:**

- **collection_name** (*str*) -

    当前 collection 的名称。

- **auto_id** (*bool*) -

    Zilliz Cloud 是否为该 collection 自动生成主键。

- **num_shards** (*int*) -

    当前 collection 拥有的分片数量。

- **description** (*str*) -

    当前 collection 的描述。

- **external_source** (*str*) -

    collection 的外部来源。仅适用于外部 collection。 

- **external_specs** (*str*) -

    collection 的外部规格。仅适用于外部 collection。

- **fields** (*list*) -

    当前 collection 中的字段列表。

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

        - 对于 **VARCHAR** 字段，**max_length** (*int*) 是一个可能的属性，用于确定当前字段值中的字符数。

        - 对于向量字段，**dim** (*int*) 是一个可能的属性，用于确定当前字段值中的向量嵌入数量。

        - 对于 **ARRAY** 字段，**max_capacity** (*int*) 是一个可能的属性，用于确定实体中该字段的最大元素数量。

        - 对于已配置 mmap 的字段，**mmap_enabled** (*bool*) 是一个可能的属性，用于指定当前字段是否启用 mmap。

    - **element_type** (*int*) -

        字段值中元素的数据类型。如果当前字段是 ARRAY 字段，则会显示此项。

    - **struct_fields** (*List[Field]*) -

        添加到结构体数组字段中的 struct 元素的字段列表。有关可能的字段类型，请参见 [Array of Structs](/docs/use-array-of-structs)。

    - **is_primary** (*bool*) -

        当前字段是否作为 collection 的主键。

- **functions** (*list[[Function](./MilvusClient-Function)]*) -

    schema 中已定义的函数。

- **aliases** (*list[str]*) -      

    collection 别名列表。你可以使用列表中的任一别名来使用当前 collection。  

- **collection_id** (*int*) -

    当前 collection 的 ID。Zilliz Cloud 在创建每个 collection 时都会为其分配一个 ID。

- **consistency_level** (*int*) -

    当前 collection 的一致性级别。详情请参见 ConsistencyLevel。

- **properties** (*dict*) -

    当前 collection 的附加属性。字典中的可能键包括：

    - **collection.ttl.seconds** (*int*) -

        collection 的生存时间（TTL），单位为秒。

    - **collection.timezone** (*str*) -

        为 collection 配置的时区。默认值为 UTC。

- **num_partitions** (*int*) -

    当前 collection 中的分区数量。 

    - 如果当前 collection 启用了 partition key，Zilliz Cloud 会管理为该 collection 创建的所有分区。被管理的分区数量应与创建 collection 时指定的数量一致。

    - 如果当前 collection 未启用 partition key，则该数量应与此 collection 中已创建的分区数量一致。

- **enable_dynamic_field** (*bool*) -

    是否使用保留的 JSON 字段 **&#36;meta** 将 schema 未定义的字段及其值保存为键值对。

- **created_timestamp** (*int*) -

    collection 创建时的时间戳。该时间戳由 Milvus 的 timestamp oracle service (TSO) 生成。

- **updated_timestamp** (*int*) -

    collection 更新时的时间戳。该时间戳由 Milvus 的 timestamp oracle service (TSO) 生成。

**EXCEPTIONS:**

- **DescribeCollectionException**

    当此操作期间发生任何错误时会引发此异常。

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

