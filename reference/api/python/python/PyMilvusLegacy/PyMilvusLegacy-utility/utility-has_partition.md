---
displayed_sidbar: pythonSidebar
slug: /python/utility-has_partition
beta: false
notebook: false
token: KsmadNcXRoElO2xJi5HcJO57nwb
sidebar_position: 34
---

import Admonition from '@theme/Admonition';


# has_partition()

This operation checks whether a partition exists.

```python
pymilvus.utility.has_partition(
    collection_name: str,
    partition_name: str,
    using: str = "default",
    timeout: float | None,
)
```

The following operations are related to `has_partition()`:

- Collection

- Partition

- list_collections()

- has_collection()

- rename_collection()

- flush_all()

See also the Python SDK Reference.

## Request Syntax{#request-syntax}

```python
from pymilvus import utility

utility.has_partition(
    collection_name="string",
    partition_name="string",
    using="default",
    timeout=None
)
```

**PARAMETERS:**

- **collection_name** (*str*) -

    **[REQUIRED]**
The name of an existing collection.

    Setting this to a non-existing collection results in a **MilvusException**.

- **partition_name** (*str*) -

    **[REQUIRED]**
The name of a partition.

- **using** (*str*) - 

    The alias of the employed connection.

    The default value is **default**, indicating that this operation employs the default connection.

- **timeout** (*float *|* None*)  

    The timeout duration for this operation. Setting this to **None** indicates that this operation timeouts when any response arrives or any error occurs.

**RETURN TYPE:**

*bool*

**RETURNS:**
A boolean value indicates whether the specified partition exists.

**EXCEPTIONS:**

- **MilvusException**

    This exception will be raised when any error occurs during this operation, especially when the specified alias does not exist.

## Examples{#examples}

```python
from pymilvus import connections, utility

# Connect to localhost:19530
connections.connect()

# Get an existing collection
collection = Collection(name="test_collection")

# Check whether a partition exist
collection.has_partition(
    collection_name="test_collection",
    partition_name="test_partition",
) # True
```

