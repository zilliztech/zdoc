---
displayed_sidbar: pythonSidebar
slug: /python/Collections-get_collection_stats
beta: false
notebook: false
token: VVyNdx038oECxNxMQavc9vssnoh
sidebar_position: 5
---

import Admonition from '@theme/Admonition';


# get_collection_stats()

This operation lists the statistics collected on a specific collection.

## Request Syntax{#request-syntax}

```python
pymilvus.MilvusClient.get_collection_stats(
    collection_name: str, 
    timeout: Optional[float] = None
) -> Dict
```

**PARAMETERS:**

- **collection_name** (*str*) -

    **[REQUIRED]**

    The name of a collection.

- **timeout** (*float* | *None*) -

    The timeout duration for this operation. Setting this to **None** indicates that this operation timeouts when any response returns or error occurs.

**RETURN TYPE:**

*dict*

**RETURNS:**

A dictionary containing collected statistics on the specified collection.

```python
{
    'row_count': 0
}
```

<Admonition type="info" icon="📘" title="**Why doesn't the row count match the number of entities inserted?**">

<p>The data that you insert will go through a process before it is finally saved. Initially, it will flow in as data streams. Then, it will be stored in segments as entities. Milvus will select an appropriate growing segment to store the data in streams until the segment reaches its upper limit and becomes sealed.</p>
<p>However, it's important to note that the row count displayed may not match the number of records that were inserted because data in streams is not taken into account.</p>

</Admonition>

**EXCEPTIONS:**

- **MilvusException**

    This exception will be raised when any error occurs during this operation.

## Examples{#examples}

```python
from pymilvus import MilvusClient

# 1. Set up a milvus client
client = MilvusClient(
    uri="http://localhost:19530",
    token="root:Milvus"
)

# 2. Create a collection
client.create_collection(collection_name="test_collection", dimension=5)

# 3. Describe the collection
client.get_collection_stats(collection_name="test_collection")

# Output
# 
# {
#     'row_count': 0
# }
```
