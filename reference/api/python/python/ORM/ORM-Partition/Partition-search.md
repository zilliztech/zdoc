---
title: "search() | Python | ORM"
slug: /python/python/Partition-search
sidebar_label: "search()"
beta: NEAR DEPRECATE
added_since: Inherit
last_modified: false
deprecate_since: false
notebook: false
description: "This operation conducts a vector similarity search with an optional scalar filtering expression. | Python | ORM"
type: docx
token: XW72dhBuNoqNWhxUQLtcfa6Fnwd
sidebar_position: 10
keywords: 
  - Chroma vector database
  - nlp search
  - hallucinations llm
  - Multimodal search
  - zilliz
  - zilliz cloud
  - cloud
  - search()
  - pymilvus25
  - Video deduplication
  - Video similarity search
  - Vector retrieval
  - Audio similarity search
displayed_sidebar: pythonSidebar

displayed_sidbar: pythonSidebar
---

import Admonition from '@theme/Admonition';


# search()

This operation conducts a vector similarity search with an optional scalar filtering expression.

## Request Syntax{#request-syntax}

```python
search(
    data: list[list[float]], 
    anns_field: str, 
    param: dict, 
    limit: int 
    expr: str | None, 
    partition_names: list[str] | None, 
    output_fields: list[str] | None, 
    timeout: float | None, 
    round_decimal: int
)
```

**PARAMETERS:**

- **data** (*list&#91;list&#91;float&#93;&#93;*) - 

    **&#91;REQUIRED&#93;**

    A list of vector embeddings.

    Zilliz Cloud searches for the most similar vector embeddings to the specified ones.

- **anns_field** (str) -

    The name of the target vector field of the current search.

    This parameter defaults to an empty string. If this parameter is left unspecified, the default value applies, indicating that the only vector field in the collection will be used as the search target.

- **param** (dict) -

    **&#91;REQUIRED&#93;**

    The parameter settings specific to this operation.

    - **metric_type** (*str*) -

        The metric type applied to this operation. This should be the same as the one used when you index the vector field specified above. 

        Possible values are **L2**, **IP**, and **COSINE**.

    - **params** (dict) -

        Additional parameters.

        - **offset** (int) -

            The number of records to skip in the search result. 

            You can use this parameter in combination with `limit` to enable pagination.

            The sum of this value and `limit` should be less than 16,384. 

        - **radius** (float) -

            Determines the threshold of least similarity. When setting `metric_type` to `L2`, ensure that this value is greater than that of **range_filter**. Otherwise, this value should be lower than that of **range_filter**. 

        - **range_filter**  (float) -  

            Refines the search to vectors within a specific similarity range. When setting `metric_type` to `IP` or `COSINE`, ensure that this value is greater than that of **radius**. Otherwise, this value should be lower than that of **radius**.

    For details on other applicable search parameters, read [AUTOINDEX Explained](/docs/autoindex-explained) to get more.

- **limit** (*int*) -

    The total number of entities to return.

    You can use this parameter in combination with `offset` in **param** to enable pagination.

    The sum of this value and `offset` in **param** should be less than 16,384. 

- **expr** (*str*) -

    A scalar filtering condition to filter matching entities.

    The value defaults to **None**, indicating that scalar filtering is ignored. To build a scalar filtering condition, refer to [Boolean Expression Rules](https://milvus.io/docs/boolean.md).

- **output_fields** (*list*) -

    A list of field names to include in each entity in return.

    The value defaults to **None**. If left unspecified, only the primary field is included.

- **timeout** (*float*)  -

    The timeout duration for this operation. Setting this to **None** indicates that this operation timeouts when any response arrives or any error occurs.

- **round_decimal** (int) -

    The number of decimal places that Zilliz Cloud rounds the calculated distances to.

    The value defaults to **-1**, indicating that Zilliz Cloud skips rounding the calculated distances and returns the raw value.

**RETURN TYPE:**

*SearchResult*

**RETURNS:**

A **SearchResult** object that contains a list of **Hits** objects. 

- Response structure

    <Admonition type="info" icon="📘" title="Notes">

    <p>A <strong>SearchResult</strong> object contains a list of <strong>Hits</strong> objects, each corresponding to a query vector in the search request. </p>
    <p>A <strong>Hits</strong> object contains a list of <strong>Hit</strong> objects, each corresponding to an entity hit by the search.</p>

    </Admonition>

    ```plaintext
    ├── SearchResult
    │   └── Hits  
    │       ├── ids
    │       ├── distances
    │       └── Hit
    │           ├── id
    │           ├── distance
    │           ├── score
    │           ├── vector
    │           └── get()
    ```

- Properties and methods

    - A **Hits** object has the following fields:

        - **ids** (*list&#91;int&#93;* | *list&#91;str&#93;*)

            A list containing the IDs of the hit entities.

        - **distances** (list&#91;float&#93;) 

            A list of distances from the hit entities' vector fields to the query vector.

    - A **Hit** object has the following fields:

        - **id** (*int* | *str*)

            The ID of a hit entity.

        - **distance** (*float*)

            The distance from a hit entity's vector field to the query vector.

        - **score** (*float*)

            An alias to **distance**.

        - **vector** (*list&#91;float&#93;*)   

            The vector field of a hit entity.

        - **get(*field_name: str*)**

            A function to get the value of the specified field in a hit entity. 

**EXCEPTIONS:**

- **MilvusException**

    This exception will be raised when any error occurs during this operation.

## Examples{#examples}

```python
from pymilvus import Collection, Partition

# Get an existing collection
collection = Collection(name="test_collection")

# Get an existing partition
partition = Partition(name="test_partition")

BATCH_SIZE = 2
LIMIT = 10

param = {
    "metric_type": "COSINE",
    "params": {
        "nprobe": 1024,
        "radius": 0.2,
        "range_filter": 1.0
    }
}

# Create a search request
res = partition.search(
    data=[[0.1,0.2,-0.3,-0.4,0.5]],
    anns_field="vector",
    param=param,
    batch_size=BATCH_SIZE,
    limit=LIMIT,
    expr="id > 3",
    output_fields=["id", "vector"]
)

for hits in res:
    # Get ids
    hits.ids
    
    # Get distances
    hits.distances
    
    for hit in hits:
        # Get id
        hit.id
        
        # Get distance
        hit.distance # hit.score
        
        # Get vector
        hit.vector
        
        # Get output field
        hit.get("vector")
        
```

## Related operations{#related-operations}

The following operations are related to `search()`:

- [delete()](./Partition-delete)

- [flush()](./Partition-flush)

- [insert()](./Partition-insert)

- [query()](./Partition-query)

- [upsert()](./Partition-upsert)

