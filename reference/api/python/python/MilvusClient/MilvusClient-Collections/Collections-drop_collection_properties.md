---
displayed_sidbar: pythonSidebar
title: "drop_collection_properties() | Python | MilvusClient"
slug: /python/python/Collections-drop_collection_properties
sidebar_label: "drop_collection_properties()"
beta: false
notebook: false
description: "This operation drops the specified collection properties. | Python | MilvusClient"
type: docx
token: JLFIdAyIsoSYc8xQWo0cpmisnDW
sidebar_position: 12
keywords: 
  - Annoy vector search
  - milvus
  - Zilliz
  - milvus vector database
  - zilliz
  - zilliz cloud
  - cloud
  - drop_collection_properties()
  - python
  - NLP
  - Neural Network
  - Deep Learning
  - Knowledge base
displayed_sidebar: pythonSidebar

---

import Admonition from '@theme/Admonition';


# drop_collection_properties()

This operation drops the specified collection properties.

## Request Syntax{#request-syntax}

```python
drop_collection_properties(
    self,
    collection_name: str,
    property_keys: List[str],
    timeout: Optional[float] = None,
    **kwargs,
)
```

**PARAMETERS:**

- **collection_name** (*str*) -

    The name of the target collection.

- **property_keys** (*List[str]*) -

    The names of the properties to drop in a list. Possible values are as follows:

    - `collection.ttl.seconds`

    - `mmap.enabled`

- **timeout** (*Optional[float]*) - 

    The timeout duration for this operation.

    Setting this to None indicates that this operation timeouts when any response arrives or any error occurs.

**RETURN TYPE:**

*NoneType*

**RETURNS:**

*None*

**EXCEPTIONS:**

- **MilvusException**

    This exception will be raised when any error occurs during this operation, especially when the specified alias does not exist.

## Example{#example}

```python
from pymilvus import MilvusClient

# 1. Create a milvus client
client = MilvusClient(
    uri="https://inxx-xxxxxxxxxxxx.api.gcp-us-west1.zillizcloud.com:19530",
    token="user:password"
)

# upsert properties
properties = {"collection.ttl.seconds": 500, "mmap.enabled": true}

client.drop_collection_properties(
    collection_name="collection_name", 
    property_keys=property_keys
)
```

