---
displayed_sidbar: pythonSidebar
title: "drop_collection_properties() | Python | MilvusClient"
slug: /python/python/Collections-drop_collection_properties
sidebar_label: "drop_collection_properties()"
added_since: v2.4.x
last_modified: v2.5.x
deprecate_since: false
beta: false
notebook: false
description: "This operation drops the specified collection properties. | Python | MilvusClient"
type: docx
token: WjNRdifU9o3xl5xG0W7ch4Fjnme
sidebar_position: 12
keywords: 
  - hybrid search
  - lexical search
  - nearest neighbor search
  - Agentic RAG
  - zilliz
  - zilliz cloud
  - cloud
  - drop_collection_properties()
  - pymilvus26
displayed_sidebar: pythonSidebar

---

import Admonition from '@theme/Admonition';


# drop_collection_properties()

This operation drops the specified collection properties.

## Request Syntax

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

    - `partitionkey.isolation`

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

## Example

```python
from pymilvus import MilvusClient

# 1. Create a milvus client
client = MilvusClient(
    uri="https://inxx-xxxxxxxxxxxx.api.ali-cn-hangzhou.zillizcloud.com:19530",
    token="user:password"
)

# upsert properties
properties = {"collection.ttl.seconds": 500, "mmap.enabled": true}

client.drop_collection_properties(
    collection_name="collection_name", 
    property_keys=property_keys
)
```

