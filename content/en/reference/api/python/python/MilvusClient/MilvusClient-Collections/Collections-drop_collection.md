---
title: "drop_collection() | Python | MilvusClient"
slug: /python/python/Collections-drop_collection
sidebar_label: "drop_collection()"
beta: false
added_since: v2.3.x
last_modified: v2.6.x
deprecate_since: false
notebook: false
description: "This operation drops a collection. | Python | MilvusClient"
type: docx
token: HZByd7LqQoiorTxCgyrcu3VUnof
sidebar_position: 11
keywords: 
  - Pinecone vs Milvus
  - Chroma vs Milvus
  - Annoy vector search
  - milvus
  - zilliz
  - zilliz cloud
  - cloud
  - drop_collection()
  - pymilvus30
displayed_sidebar: pythonSidebar

displayed_sidbar: pythonSidebar
---

import Admonition from '@theme/Admonition';


# drop_collection()

This operation drops a collection.

<Admonition type="info" icon="📘" title="Notes">

This method applies to dedicated serving clusters and on-demand compute. 

- For a collection in a serving cluster, please create **[MilvusClient](./Client-MilvusClient)** with the cluster endpoint.

    - **Free & Serverless**

        `https://{cluster-id}.serverless.{region}.vectordb.zillizcloud.com`

    - **Dedicated**

        `https://{cluster-id}.{region}.vectordb.zillizcloud.com:19530`

- For a collection in on-demand compute, create **[MilvusClient](./Client-MilvusClient)** with the project endpoints.

    `https://{project-id}.{region}.api.zillizcloud.com`

</Admonition>

## Request syntax\{#request-syntax}

```python
drop_collection(
    collection_name: str,
    timeout: Optional[float] = None,
    **kwargs,
) -> None
```

**PARAMETERS:**

- **collection_name** (*str*) -

    **[REQUIRED]**

    The name of an existing collection.

- **timeout** (*Optional[float]*) -

    The timeout duration for this operation. Setting this to **None** indicates that this operation timeouts when any response arrives or any error occurs.

**RETURN TYPE:**

*NoneType*

**RETURNS:**

None

**EXCEPTIONS:**

- **MilvusException**

    This exception will be raised when any error occurs during this operation.

## Examples\{#examples}

```python
from pymilvus import MilvusClient

client = MilvusClient(
    uri="YOUR_CLUSTER_ENDPOINT",
    token="YOUR_CLUSTER_TOKEN"
)

# Create a collection
client.create_collection(
    collection_name="test_collection",
    dimension=5
)

# List collections
res = client.list_collections()
# ['test_collection']

# Drop the collection
client.drop_collection(collection_name="test_collection")

# Verify
res = client.list_collections()
# []
```
