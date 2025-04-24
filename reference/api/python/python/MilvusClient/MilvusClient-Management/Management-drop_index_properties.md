---
displayed_sidbar: pythonSidebar
title: "drop_index_properties() | Python | MilvusClient"
slug: /python/python/Management-drop_index_properties
sidebar_label: "drop_index_properties()"
beta: false
notebook: false
description: "This operation drops the specified index properties. | Python | MilvusClient"
type: docx
token: M2kXd5zWSoMIOnxXWamcgCkznih
sidebar_position: 15
keywords: 
  - Chroma vs Milvus
  - Annoy vector search
  - milvus
  - Zilliz
  - zilliz
  - zilliz cloud
  - cloud
  - drop_index_properties()
  - pymilvus25
  - llm hallucinations
  - hybrid search
  - lexical search
  - nearest neighbor search
displayed_sidebar: pythonSidebar

---

import Admonition from '@theme/Admonition';


# drop_index_properties()

This operation drops the specified index properties.

## Request Syntax{#request-syntax}

```python
drop_index_properties(
    self,
    collection_name: str,
    index_name: str,
    property_keys: List[str],
    timeout: Optional[float] = None,
    **kwargs,
)
```

**PARAMETERS:**

- **collection_name** (*str*) -

    The name of the target collection.

- **index_name** (*str*) -

    The name of the index file to drop.

- **property_keys** (*List[str]*) -

    The names of the properties to drop in a list. Possible properties are as follows:

    - `mmap.enabled`

- **timeout** (*Optional[float]*) - 

    The timeout duration for this operation.

    Setting this to None indicates that this operation timeouts when any response arrives or any error occurs.

**RETURN TYPE:**

*NoneType*

**RETURNS:**

None

**EXCEPTIONS:**

- **MilvusException**

    This exception will be raised when any error occurs during this operation.

## Examples{#examples}

```python
from pymilvus import MilvusClient

# 1. Create a milvus client
client = MilvusClient(
    uri="YOUR_CLUSTER_ENDPOINT",
    token="YOUR_CLUSTER_TOKEN"
)

client.drop_index_properties(
    collection_name="collection_name",
    index_name="my_vector", 
    property_keys = ["mmap.enabled"]
)
```

