---
title: "alter_collection_properties() | Python | MilvusClient"
slug: /python/python/Collections-alter_collection_properties
sidebar_label: "alter_collection_properties()"
beta: false
added_since: v2.4.x
last_modified: v2.6.x
deprecate_since: false
notebook: false
description: "This operation alters the specified collection properties. | Python | MilvusClient"
type: docx
token: Pl7Fd8C3zocPaZx3VrAcl54Dnkd
sidebar_position: 3
keywords: 
  - milvus vector db
  - Zilliz Cloud
  - what is milvus
  - milvus database
  - zilliz
  - zilliz cloud
  - cloud
  - alter_collection_properties()
  - pymilvus26
  - AI Agent
  - semantic search
  - Anomaly Detection
  - sentence transformers
displayed_sidebar: pythonSidebar

displayed_sidbar: pythonSidebar
---

import Admonition from '@theme/Admonition';


# alter_collection_properties()

This operation alters the specified collection properties.

## Request Syntax\{#request-syntax}

```python
alter_collection_properties(
    self, 
    collection_name: str, 
    properties: dict, 
    timeout: Optional[float] = None, 
    **kwargs
)
```

**PARAMETERS:**

- **collection_name** (*str*) -

    The name of the target collection.

- **properties** (*dict*) -

    The properties and their new values in a dictionary. Possible dictionary keys are as follows:

    - **collection.ttl.seconds** (*int*) -

        The time-to-live (TTL) of a collection in seconds.

    - **mmap.enabled** (*bool*) -

        Whether to enable mmap for the raw data and indexes of all fields in the collection. For details, refer to [Use mmap](/docs/use-mmap).

    - **partitionkey.isolation** (bool) -

        Whether to enable partition key isolation. For details, refer to [Use Partition Key](/docs/use-partition-key).

    - **dynamicfield.enabled** (bool) -

        Whether to enable the dynamic field. For details, refer to [Dynamic Field](/docs/enable-dynamic-field).

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
properties = {"collection.ttl.seconds": 500, "mmap.enabled": true}

client.alter_collection_properties(
    collection_name="collection_name", 
    properties = properties
)
```

