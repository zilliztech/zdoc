---
displayed_sidbar: pythonSidebar
title: "describe_collection() | Python | MilvusClient"
slug: /python/python/Collections-describe_collection
sidebar_label: "describe_collection()"
beta: false
notebook: false
description: "This operation lists detailed information about a specific collection. | Python | MilvusClient"
type: docx
token: MCkjdiRNKo2HCCxzHReclrgAnbg
sidebar_position: 9
keywords: 
  - IVF
  - knn
  - Image Search
  - LLMs
  - zilliz
  - zilliz cloud
  - cloud
  - describe_collection()
  - python
  - hybrid vector search
  - Video deduplication
  - Video similarity search
  - Vector retrieval
displayed_sidebar: pythonSidebar

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

    **[REQUIRED]**

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
     'aliases': [],
     'collection_id': 446738261026541332,
     'consistency_level': 2,
     'properties': {},
     'num_partitions': 1，
     'enable_dynamic_field': True
}
```

**PARAMETERS:**

- **collection_name** (*str*) -

    The name of the current collection.

- **auto_id** (*bool*) -

    Whether Zilliz Cloud automatically generates the primary key for the collection.

- **num_shards** (*int*) -

    The number of shards the current collection has.

- **description** (*str*)

    The description of the current collection.

- **fields** (*list*)

    A list of fields in the current collection.

    - **field_id** (*int*)

        The ID of the current field.

    - **name** (*str*)

        The name of the current field.

    - **description** (*str*)

        The description of the current field.

    - **type** (*int*)

        The type of the current field. For details, refer to DataType.

    - **params** (*dict*)

        Additional attributes of the current fields.

        - For **VARCHAR** fields, **max_length** (*int*) is a possible attribute, which determines the number of characters in the value of the current field.

        - For **FLOAT_VECTOR** fields, **dim** (*int*) is a possible attribute, which determines the number of vector embeddings in the value of the current field.

    - **element_type** (*int*) 

        The data type of the elements in the field values. 

        This always equals **0** if the current field is not an **ARRAY** field.

    - **is_primary** (*bool*)

        Whether the current field serves as the primary key of the collection.

- **aliases** (*list*)      

    A list of collection aliases. You can use any alias in the list to use the current collection.  

- **collection_id** (*int*)

    The ID of the current collection. Zilliz Cloud allocates an ID for each collection while creating it.

- **consistency_level** (*int*)

    The consistency level of the current collection. For details, refer to ConsistencyLevel.

- **properties** (*dict*)

    Additional properties of the current collection. Possible keys in the dictionary include:

    - **collection.ttl.seconds** (*int*)

        The time-to-live (TTL) of a collection in seconds.

- **num_partitions** (*int*) 

    The number of partitions in the current collection. 

    - If the current collection has an enabled partition key, Zilliz Cloud manages all created partitions for the collection. The number of partitions managed should match the number specified when the collection was created.

    - If the current collection does not enable the partition key, the number should match the number of partitions already created in this collection.

- **enable_dynamic_field** (*bool*)

    Whether to use the reserved JSON field **$meta** to save non-schema-defined fields and their values as key-value pairs.

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
#      'aliases': [],
#      'collection_id': 446738261026541332,
#      'consistency_level': 2,
#      'properties': {},
#      'num_partitions': 1,
#      'enable_dynamic_field': True
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

