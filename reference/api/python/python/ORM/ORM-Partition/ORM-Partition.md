---
displayed_sidbar: pythonSidebar
title: "Partition | Python | ORM"
slug: /python/python/ORM-Partition
sidebar_label: "Partition"
beta: NEAR DEPRECATE
notebook: false
description: "A Partition instance represents a partition within a collection. | Python | ORM"
type: docx
token: X9scdVMmxoBTuUxlKhecJXEunHd
sidebar_position: 7
keywords: 
  - openai vector db
  - natural language processing database
  - cheap vector database
  - Managed vector database
  - zilliz
  - zilliz cloud
  - cloud
  - Partition
  - pymilvus25
  - Context Window
  - Natural language search
  - Similarity Search
  - multimodal RAG
displayed_sidebar: pythonSidebar

---

import Admonition from '@theme/Admonition';


# Partition

A **Partition** instance represents a partition within a collection.

```python
class pymilvus.Partition
```

## Constructor{#constructor}

Constructs a partition in a collection by name, description, and other parameters. 

<Admonition type="info" icon="📘" title="Notes">

<p>When using partitions, ensure that <strong>enable<em>partition</em>key</strong> is not set to <strong>True</strong> in the collection schema. Otherwise, an error will occur.</p>

</Admonition>

```python
Partition(
    collection=collection, 
    name="string",
    description="string",
)
```

**PARAMETERS:**

- **collection** (*Collection* | *str*) - 

    **[REQUIRED]**

    The collection in which to create a partition. 

    You can either reference a **Collection** object or its name.

    <Admonition type="info" icon="📘" title="What is a collection?">

    <p>A collection collects data in a two-dimensional table with a fixed number of columns and a variable number of rows. In the table, each column corresponds to a field, and each row represents an entity.</p>
    <p>A collection can support up to 64 partitions.</p>

    </Admonition>

- **name** (*string*) - 

    **[REQUIRED]**

    The name of the partition to create.

- **description** (*string*) - 

    The description of the partition to create.

**RETURN TYPE:**

*Partition*

**RETURNS:**

A **Partition** object.

**EXCEPTIONS:**

- **MilvusException**

    This exception will be raised when any error occurs during this operation.

## Examples{#examples}

```python
from pymilvus import Collection, Partition

# Get an existing collection
collection = Collection("book")

# Create a partition object in the current collection
partition = Partition(collection, "novel", "")
```

## Members{#members}

The following are the members of the `Partition` class:

