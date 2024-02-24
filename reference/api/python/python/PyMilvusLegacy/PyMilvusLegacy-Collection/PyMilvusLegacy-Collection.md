---
displayed_sidbar: pythonSidebar
slug: /python/PyMilvusLegacy-Collection
beta: false
notebook: false
token: ZGbAfWoUjl0Z3xdgyItc8wYXngf
sidebar_position: 1
---

import Admonition from '@theme/Admonition';


# Collection

A __Collection__ instance represents a Milvus collection.

```python
class pymilvus.Collection
```

## Constructor{#constructor}

Constructs a collection by name, schema, and other parameters.

```python
Collection(
    name: str,
    schema: CollectionSchema,
    using: str
) 
```

__PARAMETERS:__

- __name__ (_string_) - 

    __[REQUIRED]__

    The name of the collection to create.

- __schema__ (_CollectionSchema_[](./PyMilvusLegacy-CollectionSchema)_) - 

    The schema used to create the collection. 

    The default value is __None__, indicating that a default schema is used.

    <Admonition type="info" icon="📘" title="What is a schema?">

    <p>The schema is responsible for organizing data in the target collection. A valid schema should have multiple fields, which must include a primary key, a vector field, and several scalar fields.</p>

    </Admonition>

- __using__ (_string_) - 

    The alias of the employed connection.

    The default value is __default__, indicating that this operation employs the default connection.

- __num_shards__ (_int_) -

    The number of shards to create along with the creation of this collection. 

    The value defaults to __2__, indicating that two shards are to be created along with this collection.

    <Admonition type="info" icon="📘" title="What is sharding?">

    <p>Sharding refers to distributing write operations to different nodes to make the most of the parallel computing potential of a Milvus cluster for writing data.</p>
    <p>By default, a collection contains two shards.</p>

    </Admonition>

- __consistency_level__ (_int_ | _str_)

    The consistency level of the target collection.

    The value defaults to __Bounded __(__1__) with options of __Strong __(__0__), __Bounded __(__1__), __Session __(__2__), and __Eventually __(__3__).

    <Admonition type="info" icon="📘" title="What is the consistency level?">

    <p>Consistency in a distributed database specifically refers to the property that ensures every node or replica has the same view of data when writing or reading data at a given time.</p>
    <p></p>
    <p></p>
    <p>Zilliz Cloud provides three consistency levels: <strong>Strong</strong>, <strong>Bounded Staleness</strong>, and <strong>Eventually</strong>, with <strong>Bounded Staleness</strong> set as the default.</p>
    <p></p>
    <p>You can easily tune the consistency level when conducting a vector similarity search or query to make it best suit your application.</p>

    </Admonition>

- __timeout__ (_float _|_ None_)  

    The timeout duration for this operation. Setting this to __None__ indicates that this operation timeouts when any response arrives or any error occurs.

__RETURN TYPE:__

_Collection_

__RETURNS:__

A collection object.

__EXCEPTIONS:__

- __SchemaNotReadyException__

    This exception will be raised when the provided schema is invalid.

## Examples{#examples}

```python
from pymilvus import Collection, CollectionSchema, FieldSchema, DataType

# Create a collection using the user-defined schema
primary_key = FieldSchema(
    name="id",
    dtype=DataType.INT64,
    is_primary=True,
)

vector = FieldSchema(
    name="vector",
    dtype=DataType.FLOAT_VECTOR,
    dim=768,
)

schema = CollectionSchema(
    fields = [primary_key, vector]
)

collection = Collection(
    name="test_01",
    schema=schema,
    using="default"
)
```

## Members{#members}

The following are the members of the `Collection` class:



import DocCardList from '@theme/DocCardList';

<DocCardList />