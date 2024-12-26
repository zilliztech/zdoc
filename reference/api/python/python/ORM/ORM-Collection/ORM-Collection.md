---
displayed_sidbar: pythonSidebar
title: "Collection | Python | ORM"
slug: /python/python/ORM-Collection
sidebar_label: "Collection"
beta: false
notebook: false
description: "A Collection instance represents a Milvus collection. | Python | ORM"
type: docx
token: OSehdj15Ao3AUvxOIJucXzU8nWW
sidebar_position: 1
keywords: 
  - Anomaly Detection
  - sentence transformers
  - Recommender systems
  - information retrieval
  - zilliz
  - zilliz cloud
  - cloud
  - Collection
  - python
  - lexical search
  - nearest neighbor search
  - Agentic RAG
  - rag llm architecture
displayed_sidebar: pythonSidebar

---

import Admonition from '@theme/Admonition';


# Collection

A **Collection** instance represents a Milvus collection.

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

**PARAMETERS:**

- **name** (*string*) - 

    **[REQUIRED]**

    The name of the collection to create.

- **schema** (*[CollectionSchema](./ORM-CollectionSchema)*) - 

    The schema used to create the collection. 

    The default value is **None**, indicating that a default schema is used.

    <Admonition type="info" icon="📘" title="What is a schema?">

    <p>The schema is responsible for organizing data in the target collection. A valid schema should have multiple fields, which must include a primary key, a vector field, and several scalar fields.</p>

    </Admonition>

- **using** (*string*) - 

    The alias of the employed connection.

    The default value is **default**, indicating that this operation employs the default connection.

- **num_shards** (*int*) -

    The number of shards to create along with the creation of this collection. 

    The value defaults to **1**, indicating that one shard is to be created along with this collection.

    <Admonition type="info" icon="📘" title="What is sharding?">

    <p>Sharding refers to distributing write operations to different nodes to make the most of the parallel computing potential of a Milvus cluster for writing data.</p>
    <p>By default, a collection contains one shard.</p>

    </Admonition>

- **consistency_level** (*int* | *str*)

    The consistency level of the target collection.

    The value defaults to **Bounded** (**1**) with options of **Strong** (**0**), **Bounded** (**1**), **Session** (**2**), and **Eventually** (**3**).

    <Admonition type="info" icon="📘" title="What is the consistency level?">

    <p>Consistency in a distributed database specifically refers to the property that ensures every node or replica has the same view of data when writing or reading data at a given time.</p>
    <p>Zilliz Cloud provides three consistency levels: <strong>Strong</strong>, <strong>Bounded Staleness</strong>, and <strong>Eventually</strong>, with <strong>Bounded Staleness</strong> set as the default.</p>
    <p>You can easily tune the consistency level when conducting a vector similarity search or query to make it best suit your application.</p>

    </Admonition>

- **timeout** (*float* | *None*)  

    The timeout duration for this operation. Setting this to **None** indicates that this operation timeouts when any response arrives or any error occurs.

**RETURN TYPE:**

*Collection*

**RETURNS:**

A collection object.

**EXCEPTIONS:**

- **SchemaNotReadyException**

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

