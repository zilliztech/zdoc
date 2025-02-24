---
displayed_sidbar: pythonSidebar
title: "alter_index_properties() | Python | MilvusClient"
slug: /python/python/Management-alter_index_properties
sidebar_label: "alter_index_properties()"
beta: false
notebook: false
description: "This operation changes the specified index properties. | Python | MilvusClient"
type: docx
token: TRFadKWOAofCVoxH3qYcdTvynHf
sidebar_position: 14
keywords: 
  - Dense vector
  - Hierarchical Navigable Small Worlds
  - Dense embedding
  - Faiss vector database
  - zilliz
  - zilliz cloud
  - cloud
  - alter_index_properties()
  - pymilvus25
  - vector database open source
  - open source vector db
  - vector database example
  - rag vector database
displayed_sidebar: pythonSidebar

---

import Admonition from '@theme/Admonition';


# alter_index_properties()

This operation changes the specified index properties.

## Request Syntax{#request-syntax}

```python
alter_index_properties(
    self,
    collection_name: str,
    index_name: str,
    properties: dict,
    timeout: Optional[float] = None,
    **kwargs,
)
```

**PARAMETERS:**

- **collection_name** (*str*) -

    The name of the target collection.

- **index_name** (*str*) -

    The name of the index file to alter.

- **properties** (*dict*) -

    The properties and their values after this operation. Possible properties to change include:

    - **mmap.enabled** (*bool*) -

        Whether to enable mmap for the specified index. Setting this to `true` offloads the specified index onto the disk. For details, refer to [Use mmap](/docs/use-mmap)

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

# update properties
properties = {"mmap.enabled": true}

client.alter_index_properties(
    collection_name="collection_name",
    index_name="my_vector", 
    properties = properties
)
```

