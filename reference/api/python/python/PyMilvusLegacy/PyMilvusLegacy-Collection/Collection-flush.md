---
displayed_sidbar: pythonSidebar
slug: /python/Collection-flush
beta: false
notebook: false
token: VdiwdqQ9iofbkoxcc8Kcqk5gnhZ
sidebar_position: 11
---

import Admonition from '@theme/Admonition';


# flush()

This operation seals all segments in the collection. Any insertions after this operation will generate a new segment.

```python
pymilvus.Collection.flush(
    timeout: float | None
)   
```

The following operations are related to `drop()`:

- insert()

See also the Python SDK Reference.

## Request Syntax{#request-syntax}

```python
from pymilvus import Collection

# Get an existing collection
collection = Collection(name="string")

# flush the data
collection.flush()
```

<Admonition type="info" icon="📘" title="Can I call `flush()` after every data insertion?">

<p>When new data is inserted, it is written into a growing segment. Once the size of a growing segment reaches its upper limit, Zilliz Cloud automatically seals the segment. </p>
<p>Continuously calling this operation results in many sealed segments of small sizes, which can gradually degrade search performance. </p>
<p>It is recommended that you wait for Zilliz Cloud to seal all segments before conducting any searches.</p>

</Admonition>

__PARAMETERS:__

- __PARAMETERS:__

- __timeout__ (_float _|_ None_)  

    The timeout duration for this operation. Setting this to __None__ indicates that this operation timeouts when any response arrives or any error occurs.

__RETURN TYPE:__

_NoneType_

__RETURNS:__

None

__EXCEPTIONS:__

- __MilvusException__

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

# Insert some data
collection.insert(
    data=[
        [0,1,2,3,4],                         # id
        [                                    # vector
            [0.1,0.2,-0.3,-0.4,0.5],
            [0.3,-0.1,-0.2,-0.6,0.7],
            [-0.6,-0.3,0.2,0.8,0.7],
            [0.6,0.2,-0.3,-0.8,0.5],
            [0.3,0.1,-0.2,-0.6,-0.7],
        ],
    ]
)

# Flush the data 
collection.flush()

# Check the number of flushed entities in the collection 
collection.num_entities # 5
```

