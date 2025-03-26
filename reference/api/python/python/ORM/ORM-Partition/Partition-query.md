---
displayed_sidbar: pythonSidebar
title: "query() | Python | ORM"
slug: /python/python/Partition-query
sidebar_label: "query()"
beta: NEAR DEPRECATE
notebook: false
description: "This operation conducts a query on the entity scalar field(s) with a boolean expression. | Python | ORM"
type: docx
token: N97pdfkjlo9j61xrtL2cbB79nKe
sidebar_position: 8
keywords: 
  - ANNS
  - Vector search
  - knn algorithm
  - HNSW
  - zilliz
  - zilliz cloud
  - cloud
  - query()
  - pymilvus25
  - vector database open source
  - open source vector db
  - vector database example
  - rag vector database
displayed_sidebar: pythonSidebar

---

import Admonition from '@theme/Admonition';


# query()

This operation conducts a query on the entity scalar field(s) with a boolean expression.

## Request Syntax{#request-syntax}

```python
query(
    expr: str, 
    output_fields: List[str] | None, 
    timeout: float | None,
    **kwargs
)
```

**PARAMETERS:**

- **expr** (*string*) -

    **[REQUIRED]** 

    A boolean expression to filter the entity scalar fields.

- **output_fields** (List[str] | *None*) -

    A list of the names of fields that has to be contained in the output. Setting this to **None** indicates that this operation only outputs the primary key field.

- **timeout** (*float* | *None*)  

    The timeout duration for this operation. Setting this to **None** indicates that this operation timeouts when any response arrives or any error occurs.

- **kwargs**: 

    Additional keyword arguments.

    - **consistency_level** (*str* | *int*) -

        The consistency level of the target collection.

        The value defaults to the one specified when you create the current collection, with options of **Strong** (**0**), **Bounded** (**1**), **Session** (**2**), and **Eventually** (**3**).

        <Admonition type="info" icon="📘" title="What is the consistency level?">

        <p>Consistency in a distributed database specifically refers to the property that ensures every node or replica has the same view of data when writing or reading data at a given time.</p>
        <p>Zilliz Cloud provides three consistency levels: <strong>Strong</strong>, <strong>Bounded Staleness</strong>, and <strong>Eventually</strong>, with <strong>Bounded Staleness</strong> set as the default.</p>
        <p>You can easily tune the consistency level when conducting a vector similarity search or query to make it best suit your application.</p>

        </Admonition>

    - **guarantee_timestamp** (*int*) -

        A valid timestamp. 

        If this parameter is set, Zilliz Cloud executes the query only if all entities inserted before this timestamp are visible to query nodes. 

        <Admonition type="info" icon="📘" title="Notes">

        <p>This parameter is valid when the default consistency level applies.</p>

        </Admonition>

    - **graceful_time** (*int*) -

        A period of time in seconds.

        The value defaults to **5**. If this parameter is set, Zilliz Cloud calculates the guarantee timestamp by subtracting this from the current timestamp.

        <Admonition type="info" icon="📘" title="Notes">

        <p>This parameter is valid when a consistency level other than the default one applies.</p>

        </Admonition>

    - **offset** (*int*) -

        The number of records to skip in the query result. 

        You can use this parameter in combination with `limit` to enable pagination.

        The sum of this value and `limit` should be less than 16,384. 

    - **limit** (*int*) -

        The number of records to return in the query result.

        You can use this parameter in combination with `offset` to enable pagination.

        The sum of this value and `offset` should be less than 16,384. 

**RETURN TYPE:**

*List*

**RETURNS:**

A list of the query results.

**EXCEPTIONS:**

- **MilvusException**

    This arises when any error occurs during this operation.

## Examples{#examples}

```python
from pymilvus import Collection, Partition, CollectionSchema, FieldSchema, DataType

schema = CollectionSchema([
    FieldSchema("id", DataType.INT64, is_primary=True),
    FieldSchema("vector", DataType.FLOAT_VECTOR, dim=5)
])

# Create a collection
collection = Collection(
    name="test_collection",
    schema=schema
)

# Create a partition
partition = Partition(collection, name="test_collection")

# Insert a list of columns
res = partition.insert(
    data=[
        [0,1,2,3,4,5,6,7,8,9],               # id
        [                                    # vector
            [0.1,0.2,-0.3,-0.4,0.5],
            [0.3,-0.1,-0.2,-0.6,0.7],
            [-0.6,-0.3,0.2,0.8,0.7],
            [0.6,0.2,-0.3,-0.8,0.5],
            [0.3,0.1,-0.2,-0.6,-0.7],
            [0.1,0.2,-0.3,-0.4,0.5],
            [0.3,-0.1,-0.2,-0.6,0.7],
            [-0.6,-0.3,0.2,0.8,0.7],
            [0.6,0.2,-0.3,-0.8,0.5],
            [0.3,0.1,-0.2,-0.6,-0.7],
        ],
    ]
)

# Query without any scalar filtering condition
# This query returns entities with their ids from 0 to 4.
res = partition.query(
    expr="",
    limit=5,
) 

# Query with pagination
# This query returns entities with their ids from 5 to 9.
res = partition.query(
    expr="",
    offset=5
    limit=5
)

# Query with a scalar filtering condition
res = partition.query(
    expr="id in [6,7,8]",
)

# Query with specified output fields
res = partition.query(
    expr="id in [6,7,8]",
    output_fields=["id", "vector"],
)

# Query with a customized consistency level
res = partition.query(
    expr="",
    consistency_level=3,
    graceful_time=6
)
```

## Related operations{#related-operations}

The following operations are related to `query()`:

- [delete()](./Partition-delete)

- [flush()](./Partition-flush)

- [insert()](./Partition-insert)

- [search()](./Partition-search)

- [upsert()](./Partition-upsert)

