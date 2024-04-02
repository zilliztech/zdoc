---
displayed_sidbar: pythonSidebar
slug: /python/Collection-load
beta: false
notebook: false
type: docx
token: HQDndiGwloWKIexgPCUcEZGenOh
sidebar_position: 20
---

import Admonition from '@theme/Admonition';


# load()

This operation loads the data of the current collection into memory. 

## Request Syntax{#request-syntax}

```python
load(
    partition_names: list[str] | None, 
    replica_number: int, 
    timeout: float | None, 
)
```

<Admonition type="info" icon="📘" title="Notes">

<p>This operation is non-blocking. You can call <code>utility.wait_for_loading_complete()</code> to block the current process.</p>

</Admonition>

__PARAMETERS:__

- __partition_names__ (_list(str)_ | _None_) - 

    The partitions of the current collection to load. If left unspecified, all partitions are to be loaded.

- __replica_number__ (_int_) -

    The number of replicas to create. The value defaults to 1 and ranges from 1 to the number of query nodes available. Setting this to `1` indicates that segments in the current collection or any specified partitions are to be loaded onto one query node.

    <Admonition type="info" icon="📘" title="What are the differences between partitions and replicas?">

    <p>Partitioning allows you to further split a collection into multiple partitions, store different data in them, and load or release each of them individually. A collection can have up to 64 partitions. </p>
    <p>Replication is a mechanism for Zilliz Cloud to load the same segments on multiple query nodes. It is very useful if you have a relatively small dataset but want to increase read-throughput with extra hardware resources.</p>

    </Admonition>

- __timeout__ (_float _|_ None_)  -

    The timeout duration for this operation. Setting this to __None__ indicates that this operation timeouts when any response arrives or any error occurs.

- __kwargs__ - 

    - ___resource_groups__ (_list_) -

        A specific set of resource groups into which the current collection is to be loaded.

        If left unspecified, the default resource group applies.

        <Admonition type="info" icon="📘" title="What is a resource group?">

        <p>A resource group can hold several or all of the query nodes in a Zilliz Cloud cluster.</p>
        <p>Setting this parameter for this operation makes Zilliz Cloud loads the current collection to the query nodes in the specified resource groups.</p>

        </Admonition>

__RETURN TYPE:__

_NoneType_

__RETURNS:__

_None_

__EXCEPTIONS:__

- __MilvusException__

    This exception is to be raised when any error occurs during this operation.

<Admonition type="danger" icon="🚧" title="Warning">

<p>If you try to load a collection that is not indexed, you will receive a <strong>MilvusException</strong>.</p>

</Admonition>

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

# Set the index parameters
index_params = {
    "index_type": "AUTOINDEX",
    "metric_type": "COSINE",
    "params": {
        "nprobe": 10
    }
}

# Create an index on the vector field
collection.create_index(
    field_name="vector", 
    index_params=index_params, 
    timeout=None
)

# Load the entire collection with one replica of the collection data
collection.load()

# Load the entire collection with two replicas of the collection data
collection.load(
    replica_number=2
)

# Load a specific partition with two replicas of the partition data
collection.load(
    partition_names=["partitionA"],
    replica_number=2
)
```

## Related operations{#related-operations}

The following operations are related to `load()`:

- [Partition](./ORM-Partition)

- [release()](./Collection-release)

- [load_state()](./utility-load_state)

- [loading_progress()](./utility-loading_progress)

- [wait_for_loading_complete()](./utility-wait_for_loading_complete)

