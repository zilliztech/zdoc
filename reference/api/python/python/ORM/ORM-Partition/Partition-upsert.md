---
title: "upsert() | Python | ORM"
slug: /python/python/Partition-upsert
sidebar_label: "upsert()"
beta: NEAR DEPRECATE
added_since: Inherit
last_modified: false
deprecate_since: false
notebook: false
description: "This operation inserts new records into the database or updates existing ones. | Python | ORM"
type: docx
token: MQMzddDnao5Zz0xmSRncZM2nn5b
sidebar_position: 11
keywords: 
  - Deep Learning
  - Knowledge base
  - natural language processing
  - AI chatbots
  - zilliz
  - zilliz cloud
  - cloud
  - upsert()
  - pymilvus26
  - IVF
  - knn
  - Image Search
  - LLMs
displayed_sidebar: pythonSidebar

displayed_sidbar: pythonSidebar
---

import Admonition from '@theme/Admonition';
import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

# upsert()

This operation inserts new records into the database or updates existing ones. 

<Admonition type="info" icon="📘" title="Notes">

<p>An upsert is a data-level operation that will overwrite an existing entity if a specified field already exists in a collection, and insert a new entity if the specified value doesn’t already exist.</p>

</Admonition>

## Request Syntax\{#request-syntax}

```python
upsert(
    data: List | pandas.DataFrame | Dict,, 
    timeout=float | None
)
```

```python
from pymilvus import Collection, Partition

# Get an existing collection
collection = Collection(name="string")

# Get an existing partition
partition = Partition(name="string")

# Prepare your data
data = ...

# Upsert data into partition
partition.upsert(
    data=data,
    timeout=None
)
```

**PARAMETERS:**

- **data** (*list* | *dict* | *pandas.DataFrame*) -

    **[REQUIRED]**

    The data to insert into the current collection.

    The data to insert should match the schema of the current collection. You can organize your data into:

    - A list of columns

        Each column is a list of values of all entities in that column.

        ```python
        data = [
            [0,1,2,3,4],                         # id
            [                                    # vector
                [0.1,0.2,-0.3,-0.4,0.5],
                [0.3,-0.1,-0.2,-0.6,0.7],
                [-0.6,-0.3,0.2,0.8,0.7],
                [0.6,0.2,-0.3,-0.8,0.5],
                [0.3,0.1,-0.2,-0.6,-0.7],
            ],
        ]
        ```

    - A **pandas.DataFrame**

        You can form a data frame in any way, as demonstrated in the **Example** section on [this page](https://pandas.pydata.org/docs/reference/api/pandas.DataFrame.html).

        ```python
        data = pd.DataFrame({
            "id": [5,6,7,8,9],
            "vector": [
                [0.1,0.2,-0.3,-0.4,0.5],
                [0.3,-0.1,-0.2,-0.6,0.7],
                [-0.6,-0.3,0.2,0.8,0.7],
                [0.6,0.2,-0.3,-0.8,0.5],
                [0.3,0.1,-0.2,-0.6,-0.7],
            ]
        })
        ```

    - A list of rows or just a row

        Each row is a dictionary that represents an entity.

        ```python
        data = [
            {"id": 10, "vector": [0.1,0.2,-0.3,-0.4,0.5]},
            {"id": 11, "vector": [0.3,-0.1,-0.2,-0.6,0.7]},
            {"id": 12, "vector": [-0.6,-0.3,0.2,0.8,0.7]},
            {"id": 13, "vector": [0.6,0.2,-0.3,-0.8,0.5]},
            {"id": 14, "vector": [0.3,0.1,-0.2,-0.6,-0.7]},
        ]
        
        # or 
        
        data = {"id": 15, "vector": [0.3,0.1,-0.2,-0.6,-0.7]},
        ```

- **timeout** (*float* | *None*)  

    The timeout duration for this operation. Setting this to **None** indicates that this operation timeouts when any response arrives or any error occurs.

**RETURN TYPE:**

*MutationResult*

**RETURNS:**

A **MutationResult** object that contains the following fields:

- **insert_count** (*int*)

    The count of inserted entities.

- **delete_count** (*int*)

    The count of deleted entities.

- **upsert_count** (*int*)

    The count of upserted entities.

- **succ_count** (*int*)

    The count of successful executions during this operation.

- **succ_index** (*list*)

    A list of index numbers starting from 0, each indicating a successful operation.

- **err_count** (*int*)

    The count of failed executions during this operation.

- **err_index** (*list*)

    A list of index numbers starting from 0, each indicating a failed operation.

- **primary_keys** (*list*)

    A list of primary keys for the inserted entities.

- **timestamp** (*int*)

    The timestamp at which this operation is completed.

**EXCEPTIONS:**

- **MilvusException**

    This exception will be raised when any error occurs during this operation.

## Examples\{#examples}

```python
from pymilvus import Collection, Partition, FieldSchema, CollectionSchema, DataType

# Define collection schema    
schema = CollectionSchema([
    FieldSchema("film_id", DataType.INT64, is_primary=True),
    FieldSchema("films", dtype=DataType.FLOAT_VECTOR, dim=2)
])

# Get an existing collection
collection = Collection("test_partition_insert", schema)

# Get an existing partition in the current collection
partition = Partition(collection, "comedy", "comedy films")

# Prepare the data to insert
data = [
    [i for i in range(10)],
    [[float(i) for i in range(2)] for _ in range(10)]
]

# Upsert data
res = partition.upsert(data)

# Return the count of upserted entities
res.upsert_count
10
```

## Related operations\{#related-operations}

The following operations are related to `upsert()`:

- [delete()](./Partition-delete)

- [flush()](./Partition-flush)

- [insert()](./Partition-insert)

- [query()](./Partition-query)

- [search()](./Partition-search)

