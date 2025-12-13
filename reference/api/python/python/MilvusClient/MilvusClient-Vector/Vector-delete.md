---
title: "delete() | Python | MilvusClient"
slug: /python/python/Vector-delete
sidebar_label: "delete()"
beta: false
added_since: v2.3.x
last_modified: false
deprecate_since: false
notebook: false
description: "This operation deletes entities by their IDs or with a boolean expression. | Python | MilvusClient"
type: docx
token: DWLXdSCYnoPT4ExktRKceEqLnAd
sidebar_position: 1
keywords: 
  - llm hallucinations
  - hybrid search
  - lexical search
  - nearest neighbor search
  - zilliz
  - zilliz cloud
  - cloud
  - delete()
  - pymilvus26
  - Zilliz Cloud
  - what is milvus
  - milvus database
  - milvus lite
displayed_sidebar: pythonSidebar

displayed_sidbar: pythonSidebar
---

import Admonition from '@theme/Admonition';


# delete()

This operation deletes entities by their IDs or with a boolean expression.

## Request syntax\{#request-syntax}

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

**PARAMETERS:**

- **collection_name** (*str*) -

    **[REQUIRED]**

    The name of an existing collection.

- **ids** (*list* | *str* | *int*) -

    **[REQUIRED]**

    A specific entity ID or a list of entity IDs.

    The value defaults to **None**, indicating that a scalar filtering condition applies. Setting both **ids** and **filter** results in a **ParamError** exception.

- **timeout** (*float* | *None*) -

    The timeout duration for this operation. 

    Setting this to **None** indicates that this operation timeouts when any response arrives or any error occurs.

- **filter** (*str*) -

    A scalar filtering condition to filter matching entities. 

    The value defaults to an empty string, indicating that no condition applies. Setting both **ids** and **filter** results in a **ParamError** exception.

    You can set this parameter to an empty string to skip scalar filtering. To build a scalar filtering condition, refer to [Boolean Expression Rules](https://milvus.io/docs/boolean.md). 

    <Admonition type="info" icon="📘" title="Notes">

    <p>When using filter expressions to delete entities, ensure the collection has been loaded. Otherwise, Zilliz Cloud will return an error.</p>

    </Admonition>

- **partition_name** (*str* | *""*) -

    The name of the partition to delete entities from.

    The value defaults to an empty string. If specified, entities will be deleted from the specified partition.

**RETURN TYPE:**

*dict*

**RETURNS:**

A dictionary contains the number of deleted entities.

```python
{
    "delete_cnt": int
}
```

**EXCEPTIONS:**

- **MilvusException**

    This exception will be raised when any error occurs during this operation.

- **ParamError**

    This exception will be raised when both **ids** and **filter** are specified.

- **DataTypeNotMatchException**

    This exception will be raised when a parameter value doesn't match the required data type.

## Examples\{#examples}

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

## Related methods\{#related-methods}

- [get()](./Vector-get)

- [insert()](./Vector-insert)

- [query()](./Vector-query)

- [search()](./Vector-search)

- [upsert()](./Vector-upsert)

