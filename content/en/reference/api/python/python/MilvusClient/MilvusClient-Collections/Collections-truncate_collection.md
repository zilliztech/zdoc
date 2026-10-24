---
title: "truncate_collection() | Python | MilvusClient"
slug: /python/python/Collections-truncate_collection
sidebar_label: "truncate_collection()"
beta: false
added_since: v2.6.x
last_modified: v3.0.x
deprecate_since: false
notebook: false
description: "This operation removes all entities while preserving the collection's schema, constraints, and indexes. It is more efficient than deleting entities because it hides all entities flushed before the current timestamp from searches and queries and drops them in the background. | Python | MilvusClient"
type: docx
token: QsIndHtmXohzARxrQdBcVTJun9g
sidebar_position: 25
keywords: 
  - Zilliz
  - milvus vector database
  - milvus db
  - milvus vector db
  - zilliz
  - zilliz cloud
  - cloud
  - truncate_collection()
  - pymilvus30
displayed_sidebar: pythonSidebar

displayed_sidbar: pythonSidebar
---

import Admonition from '@theme/Admonition';


# truncate_collection()

This operation removes all entities while preserving the collection's schema, constraints, and indexes. It is more efficient than deleting entities because it hides all entities flushed before the current timestamp from searches and queries and drops them in the background.

<Admonition type="info" title="Notes">

This does not apply to external collections.

</Admonition>

<Admonition type="info" title="Note">

This does not apply to external collections.

</Admonition>

## Request Syntax\{#request-syntax}

```python
truncate_collection(
```

**PARAMETERS:**

- **collection_name** (*string*) -

    **[REQUIRED]**

    The name of the target collection.

- **timeout** (*float*) -

    The timeout (in seconds) for the RPC request. If None, the call waits indefinitely.

**RETURN TYPE:**

*None*

**RETURNS:**

None.

**EXCEPTIONS:**

- **CollectionNotExists**

    This exception will be raised when the specified collection does not exist. This exception will be raised when the specified collection does not exist.

## Examples\{#examples}

```python
from pymilvus import MilvusClient, DataType

client = MilvusClient(
    uri="YOUR_CLUSTER_ENDPOINT",
    token="YOUR_CLUSTER_TOKEN"
)

client.truncate_collection(
    collection_name="my_collection"
)
```
