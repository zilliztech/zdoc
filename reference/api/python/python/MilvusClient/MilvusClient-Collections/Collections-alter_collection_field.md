---
title: "alter_collection_field() | Python | MilvusClient"
slug: /python/python/Collections-alter_collection_field
sidebar_label: "alter_collection_field()"
beta: false
added_since: v2.4.x
last_modified: false
deprecate_since: false
notebook: false
description: "This operation changes the specified collection field parameters. | Python | MilvusClient"
type: docx
token: G2jjdHvbBoko6BxBZj7csemWnFc
sidebar_position: 2
keywords: 
  - Hierarchical Navigable Small Worlds
  - Dense embedding
  - Faiss vector database
  - Chroma vector database
  - zilliz
  - zilliz cloud
  - cloud
  - alter_collection_field()
  - pymilvus26
  - hallucinations llm
  - Multimodal search
  - vector search algorithms
  - Question answering system
displayed_sidebar: pythonSidebar

displayed_sidbar: pythonSidebar
---

import Admonition from '@theme/Admonition';


# alter_collection_field()

This operation changes the specified collection field parameters.

## Request Syntax\{#request-syntax}

```python
alter_collection_field(
    collection_name: str, 
    field_name: str, 
    field_params: Dict,
    db_name="",
    timeout: Optional[float] = None,
    **kwargs,
)
```

**PARAMETERS:**

- **collection_name** (*str*) -

    The name of the target collection.

- **field_name** (*str*) -

    The name of the target field.

- **field_params** (*dict*) -

    The field parameters to change. The properties not mentioned remain unchanged. Possible parameters vary with the field type. 

    - **mmap_enabled** (*bool*) -

        Whether Milvus maps the field data into memory instead of fully loading it. For details, refer to MMap-enabled Data Storage.

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

## Example\{#example}

```python
from pymilvus import MilvusClient

# 1. Create a milvus client
client = MilvusClient(
    uri="https://inxx-xxxxxxxxxxxx.api.gcp-us-west1.zillizcloud.com:19530",
    token="user:password"
)

# upsert properties
field_params = {"max_length": 1500}

client.alter_collection_field(
    collection_name="collection_name", 
    field_name="my_varchar",
    field_params=field_params
)
```

