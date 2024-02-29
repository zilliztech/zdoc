---
displayed_sidbar: pythonSidebar
slug: /python/utility-flush_all
beta: false
notebook: false
type: docx
token: Uwsfd443boKKgyx2zZTcYDqKnCe
sidebar_position: 12
---

import Admonition from '@theme/Admonition';


# flush_all()

This operation seals all segments.

## Request Syntax{#request-syntax}

```python
flush_all(
    using: str = "default",
    timeout: float | None,
    **kwargs,
)
```

__PARAMETERS:__

- __using__ (_str_) - 

    The alias of the employed connection.

    The default value is __default__, indicating that this operation employs the default connection.

- __timeout__ (_float _|_ None_)  

    The timeout duration for this operation. Setting this to __None__ indicates that this operation timeouts when any response arrives or any error occurs.

__RETURN TYPE:__

_NoneType_

__RETURNS:__

None

__EXCEPTIONS:__

N/A

## Examples{#examples}

```python
from pymilvus import (
    connections, 
    Collection, 
    FieldSchema, 
    CollectionSchema, 
    DataType, 
    utility,
)

# Connect to localhost:19530
connections.connect()

# Create a collection
collection = Collection(
    name="test_collection_flush", 
    schema=CollectionSchema(fields=[
        FieldSchema("film_id", DataType.INT64, is_primary=True),
        FieldSchema("films", dtype=DataType.FLOAT_VECTOR, dim=128)
    ])
)

# Insert data
collection.insert([[1, 2], [[1.0, 2.0], [3.0, 4.0]]])

utility.flush_all(_async=False) # synchronized flush_all
# or use `future` to flush_all asynchronously

future = utility.flush_all(_async=True)
future.done() # flush_all finished
```

## Related operations{#related-operations}

The following operations are related to the `flush_all()` method:

- [drop_collection()](./utility-drop_collection)

- [get_query_segment_info()](./utility-get_query_segment_info)

- [has_collection()](./utility-has_collection)

- [has_partition()](./utility-has_partition)

- [list_collections()](./utility-list_collections)

- [rename_collection()](./utility-rename_collection)

