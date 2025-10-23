---
title: "describe_collection() | Python | MilvusClient"
slug: /python/python/Collections-describe_collection
sidebar_label: "describe_collection()"
beta: false
added_since: v2.3.x
last_modified: false
deprecate_since: false
notebook: false
description: "This operation lists detailed information about a specific collection. | Python | MilvusClient"
type: docx
token: Mx5ZdjrPFonurSxOD6XcXDwAnQe
sidebar_position: 9
keywords: 
  - NLP
  - Neural Network
  - Deep Learning
  - Knowledge base
  - zilliz
  - zilliz cloud
  - cloud
  - describe_collection()
  - pymilvus25
  - What is unstructured data
  - Vector embeddings
  - Vector store
  - open source vector database
displayed_sidebar: pythonSidebar

displayed_sidbar: pythonSidebar
---

import Admonition from '@theme/Admonition';


# describe_collection()

This operation lists detailed information about a specific collection.

## Request Syntax{#request-syntax}

```python
describe_collection(
    collection_name: str, 
    **kwargs
) -> Name
```

**PARAMETERS:**

- **collection_name** (*str*) -

    **&#91;REQUIRED&#93;**

    The name of an existing collection.

    Setting this to a non-existing collection results in **MilvusException**.

- **kwargs** -

    - **timeout** (*float* | *None*)  

        The timeout duration for this operation. 

        Setting this to **None** indicates that this operation timeouts when any response arrives or any error occurs.

**RETURN TYPE:**

*dict*

**RETURNS:**

A dictionary that contains detailed information about the specified collection.

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

    The name of the current collection.

- **auto_id** (*bool*) -

    Whether Zilliz Cloud automatically generates the primary key for the collection.

- **num_shards** (*int*) -

    The number of shards the current collection has.

- **description** (*str*) -

    The description of the current collection.

- **fields** (*list*) -

    A list of fields in the current collection.

    - **field_id** (*int*) -

        The ID of the current field.

    - **name** (*str*) -

        The name of the current field.

    - **description** (*str*) -

        The description of the current field.

    - **type** (*int*) -

        The type of the current field. For details, refer to DataType.

    - **params** (*dict*) -

        Additional attributes of the current fields.

        - For **VARCHAR** fields, **max_length** (*int*) is a possible attribute, which determines the number of characters in the value of the current field.

        - For **FLOAT_VECTOR** fields, **dim** (*int*) is a possible attribute, which determines the number of vector embeddings in the value of the current field.

    - **element_type** (*int*) -

        The data type of the elements in the field values. 

        This always equals **0** if the current field is not an **ARRAY** field.

    - **is_primary** (*bool*) -

        Whether the current field serves as the primary key of the collection.

- **functions** (*list[[Function](./MilvusClient-Function)&#93;*) -

    The functions that have been defined in the schema.

- **aliases** (*list&#91;str&#93;*) -      

    A list of collection aliases. You can use any alias in the list to use the current collection.  

- **collection_id** (*int*) -

    The ID of the current collection. Zilliz Cloud allocates an ID for each collection while creating it.

- **consistency_level** (*int*) -

    The consistency level of the current collection. For details, refer to ConsistencyLevel.

- **properties** (*dict*) -

    Additional properties of the current collection. Possible keys in the dictionary include:

    - **collection.ttl.seconds** (*int*) -

        The time-to-live (TTL) of a collection in seconds.

- **num_partitions** (*int*) -

    The number of partitions in the current collection. 

    - If the current collection has an enabled partition key, Zilliz Cloud manages all created partitions for the collection. The number of partitions managed should match the number specified when the collection was created.

    - If the current collection does not enable the partition key, the number should match the number of partitions already created in this collection.

- **enable_dynamic_field** (*bool*) -

    Whether to use the reserved JSON field **&#36;meta** to save non-schema-defined fields and their values as key-value pairs.

- **created_timestamp** (*int*) -

    The timestamp at which the collection is created. The timestamp is generated by the timestamp oracle service (TSO) of Milvus.

- **updated_timestamp** (*int*) -

    The timestamp at which the collection has been updated. The timestamp is generated by the timestamp oracle service (TSO) of Milvus.

**EXCEPTIONS:**

- **DescribeCollectionException**

    This arises when any error occurs during this operation.

## Examples{#examples}

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

## Related methods{#related-methods}

- [create_collection()](./Collections-create_collection)

- [create_schema()](./Collections-create_schema)

- [drop_collection()](./Collections-drop_collection)

- [get_collection_stats()](./Collections-get_collection_stats)

- [has_collection()](./Collections-has_collection)

- [list_collections()](./Collections-list_collections)

- [rename_collection()](./Collections-rename_collection)

- [DataType](./Collections-DataType)

