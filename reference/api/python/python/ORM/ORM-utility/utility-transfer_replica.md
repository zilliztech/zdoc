---
displayed_sidbar: pythonSidebar
title: "transfer_replica() | Python | ORM"
slug: /python/python/utility-transfer_replica
sidebar_label: "transfer_replica()"
beta: NEAR DEPRECATE
notebook: false
description: "This operation transfers a specific number of replicas between resource groups. | Python | ORM"
type: docx
token: SuePdciB0o4du5xtpIhcMVyYnPb
sidebar_position: 40
keywords: 
  - milvus
  - Zilliz
  - milvus vector database
  - milvus db
  - zilliz
  - zilliz cloud
  - cloud
  - transfer_replica()
  - pymilvus25
  - private llms
  - nn search
  - llm eval
  - Sparse vs Dense
displayed_sidebar: pythonSidebar

---

import Admonition from '@theme/Admonition';


# transfer_replica()

This operation transfers a specific number of replicas between resource groups.

## Request Syntax{#request-syntax}

```python
transfer_replica(
    source_group: str,
    target_group: str,
    collection_name: str,
    num_replicas: int,
    using: str = "default",
    timeout: float | None,
)
```

**PARAMETERS:**

- **source_group** (*str*) -

    **[REQUIRED]**

    The name of the source resource group from which the query nodes are moved.

    Setting this to a resource group that does not exist results in a **MilvusException**.

- **target_group** (*str*) -

    **[REQUIRED]**

    The name of the source resource group to which the query nodes are moved.

    Setting this to a resource group that does not exist results in a **MilvusException**.

- **num_replicas** (*int*) -

    **[REQUIRED]**

    The number of replicas to move between the source and target resource groups.

    <Admonition type="info" icon="📘" title="What is a replica?">

    <p>With replicas, Zilliz Cloud can load the same segments on multiple query nodes. If one query node has failed or is busy with a current search request when another arrives, the system can send new requests to an idle query node that has a replication of the same segment. </p>
    <p>Replicas are organized as replica groups. Each replica group contains <a href="https://milvus.io/docs/v2.1.x/glossary.md#Sharding">shard</a> replicas. Each shard replica has a streaming replica and a historical replica that correspond to the growing and sealed <a href="https://milvus.io/docs/v2.1.x/glossary.md#Segment">segments</a> in the shard.</p>
    <p>Shards can be regarded as DML channels for distributed data write operations among multiple nodes to make the most of the parallel computing potential out of a Zilliz Cloud cluster.</p>

    </Admonition>

- **using** (*str*) - 

    The alias of the employed connection.

    The default value is **default**, indicating that this operation employs the default connection.

- **timeout** (*float* | *None*)  

    The timeout duration for this operation. Setting this to **None** indicates that this operation timeouts when any response arrives or any error occurs.

**RETURN TYPE:**

*NoneType*

**RETURNS:**

None.

**EXCEPTIONS:**

- **MilvusException**

    This exception will be raised when any error occurs during this operation.

**EXAMPLE:**

```python
from pymilvus import (
    connections, 
    Collection, 
    CollectionSchema, 
    FieldSchema, 
    DataType, 
    utility,
)

# Connect to YOUR_CLUSTER_ENDPOINT
connections.connect()

# Create a collection
collection = Collection(
    name="test_collection",
    schema=CollectionSchema([
        FieldSchema("id", DataType.INT64, is_primary=True),
        FieldSchema("vector", DataType.FLOAT_VECTOR, dim=5)
    ])
)

# Get the currently loaded replicas
collection.get_replicas()

# Create a new resource group
utility.create_resource_group(
    name="rg_01",
    using="default"
)

# Transfer replicas between resource groups
utility.transfer_node(
    source_group="__default_resource_group",
    target_group="rg_01",
    num_nodes=1
)
```

## Related operations{#related-operations}

The following operations are related to `transfer_replica()`:

- [create_resource_group()](./utility-create_resource_group)

- [describe_resource_group()](./utility-describe_resource_group)

- [drop_resource_group()](./utility-drop_resource_group)

- [list_resource_groups()](./utility-list_resource_groups)

- [transfer_node()](./utility-transfer_node)

