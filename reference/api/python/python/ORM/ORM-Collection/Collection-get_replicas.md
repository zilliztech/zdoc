---
displayed_sidbar: pythonSidebar
title: "get_replicas() | Python | ORM"
slug: /python/python/Collection-get_replicas
sidebar_label: "get_replicas()"
beta: false
notebook: false
description: "This operation gets information about the current loaded replica. | Python | ORM"
type: docx
token: BQKPdDd5xo8OPgxoXorcMxk0nVb
sidebar_position: 14
keywords: 
  - Multimodal search
  - vector search algorithms
  - Question answering system
  - llm-as-a-judge
  - zilliz
  - zilliz cloud
  - cloud
  - get_replicas()
  - python
  - What is unstructured data
  - Vector embeddings
  - Vector store
  - open source vector database
displayed_sidebar: pythonSidebar

---

import Admonition from '@theme/Admonition';


# get_replicas()

This operation gets information about the current loaded replica.

## Request Syntax{#request-syntax}

```python
get_replicas(
    timeout: float | None
)
```

**PARAMETERS:**

- **timeout** (*float* | *None*)  

    The timeout duration for this operation. Setting this to **None** indicates that this operation timeouts when any response arrives or any error occurs.

**RETURN TYPE:**

*Replica*

**RETURNS:**

A **Replica** object that contains the following fields:

- **groups** (*list*)

    A list of replica groups. Each **Group** objects that contains the following fields:

    - **id** (*int*)

        The group ID.

    - **group_nodes** (*tuple*)

        A tuple containing the IDs of the involved query nodes

    - **resource_group** (*str*)

        The name of the resource group to which the above query nodes belong

    - **shards** (*list*)  

        A list of **Shard** objects that contains the following fields:

        - **channel_name** (*str*)

        - **shard_leader** (*int*)

        - **shard_nodes** (*set*)

<Admonition type="info" icon="📘" title="What is a replica?">

<p>With replicas, Zilliz Cloud can load the same segments on multiple query nodes. If one query node has failed or is busy with a current search request when another arrives, the system can send new requests to an idle query node that has a replication of the same segment. </p>
<p>Replicas are organized as replica groups. Each replica group contains <a href="https://milvus.io/docs/v2.1.x/glossary.md#Sharding">shard</a> replicas. Each shard replica has a streaming replica and a historical replica that correspond to the growing and sealed <a href="https://milvus.io/docs/v2.1.x/glossary.md#Segment">segments</a> in the shard.</p>
<p>Shards can be regarded as DML channels for distributed data write operations among multiple nodes to make the most of the parallel computing potential out of a Zilliz Cloud cluster.</p>

</Admonition>

**EXCEPTIONS:**

- **MilvusException**

    This exception will be raised when any error occurs during this operation.

## Examples{#examples}

```python
from pymilvus import Collection, CollectionSchema, FieldSchema, DataType

schema = CollectionSchema([
    FieldSchema("id", DataType.INT64, is_primary=True),
    FieldSchema("vector", DataType.FLOAT_VECTOR, dim=5)
])

# Create a collection
collection = Collection(
    name="test_collection",
    schema=schema
)

# Get the currently loaded replicas
collection.get_replicas()
```

## Related operations{#related-operations}

The following operations are related to `get_replicas()`:

- [describe()](./Collection-describe)

- [drop()](./Collection-drop)

- [flush()](./Collection-flush)

- [set_properties()](./Collection-set_properties)

