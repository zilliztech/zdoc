---
displayed_sidbar: pythonSidebar
title: "has_collection() | Python | MilvusClient"
slug: /python/python/Collections-has_collection
sidebar_label: "has_collection()"
beta: false
notebook: false
description: "This operation checks whether a specific collection exists. | Python | MilvusClient"
type: docx
token: SSQ6dFGdxouy7hxRwCOcatnEn0e
sidebar_position: 14
keywords: 
  - natural language processing
  - AI chatbots
  - cosine distance
  - what is a vector database
  - zilliz
  - zilliz cloud
  - cloud
  - has_collection()
  - python
  - RAG
  - NLP
  - Neural Network
  - Deep Learning
displayed_sidebar: pythonSidebar

---

import Admonition from '@theme/Admonition';


# has_collection()

This operation checks whether a specific collection exists.

## Request Syntax{#request-syntax}

```python
has_collection(
    collection_name: str,
    timeout: Optional[float] = None
) -> Bool
```

**PARAMETERS:**

- **collection_name** (*str*) -

    **[REQUIRED]**

    The name of a collection.

- **timeout** (*float* | *None*) -

    The timeout duration for this operation. 

    Setting this to **None** indicates that this operation timeouts when any response returns or error occurs.

**RETURN TYPE:**

*bool*

**RETURNS:**

A boolean value indicating whether the specified collection exists.

**EXCEPTIONS:**

- **MilvusException**

    This exception will be raised when any error occurs during this operation.

## Examples{#examples}

```python
from pymilvus import MilvusClient

# 1. Set up a milvus client
client = MilvusClient(
    uri="https://inxx-xxxxxxxxxxxx.api.gcp-us-west1.zillizcloud.com:19530",
    token="user:password"
)

# 2. Create a collection
client.create_collection(collection_name="test_collection", dimension=5)

# 3. Check whether a collection named `test_collection` exists
client.has_collection(collection_name="test_collection") 

# True

# 4. Check whether a collection named `test_collection_2` exists
client.has_collection(collection_name="test_collection_2") 

# False
```

## Related methods{#related-methods}

- [create_collection()](./Collections-create_collection)

- [create_schema()](./Collections-create_schema)

- [describe_collection()](./Collections-describe_collection)

- [drop_collection()](./Collections-drop_collection)

- [get_collection_stats()](./Collections-get_collection_stats)

- [list_collections()](./Collections-list_collections)

- [rename_collection()](./Collections-rename_collection)

- [DataType](./Collections-DataType)

