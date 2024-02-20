---
displayed_sidbar: pythonSidebar
slug: /python/Partitions-drop_partition
beta: false
notebook: false
token: EMI8dM8uooIAFPxVfffcoqRwnZf
sidebar_position: 2
---

import Admonition from '@theme/Admonition';


# drop_partition()

This operation drops a specified partition from the current collection.

<Admonition type="info" icon="📘" title="Notes">

<p>Before dropping a partition, you must first release it.</p>

</Admonition>

## Request Syntax{#request-syntax}

```python
pymilvus.MilvusClient.create_partition(
    collection_name: str,
    partition_name: str,
    timeout: Optional[float] = None
) -> None
```

__PARAMETERS:__

- __collection_name __(_str_) -

    __[REQUIRED]__

    The name of an existing collection.

- __partition_name__ (_string_)

    __[REQUIRED]__

    The name of the partition to create.

- __timeout__ (_float _|_ None_)  

    The timeout duration for this operation. Setting this to __None__ indicates that this operation timeouts when any response arrives or any error occurs.

__RETURN TYPE:__

_NoneType_

__RETURNS:__

None

__EXCEPTIONS:__

- __MilvusException__

    This exception will be raised when any error occurs during this operation.

## Example{#example}

```python
from pymilvus import MilvusClient

# 1. Create a milvus client
client = MilvusClient(
    uri="http://localhost:19530",
    token="root:Milvus"
)

# 2. Create a collection
client.create_collection(collection_name="test_collection", dimension=5)

# 3. Create a partition
client.create_partition(
    collection_name="test_collection", 
    partition_name="partition_A"
)

# 4. Release partition
client.release_partition(
    collection_name="test_collection",
    partition_name="partition_A"
)

# 4. Drop the partition
client.drop_partition(
    collection_name="test_collection", 
    partition_name="partition_A"
)
```

