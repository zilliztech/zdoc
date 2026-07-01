---
title: "get_collection_stats() | Python | MilvusClient"
slug: /python/python/Collections-get_collection_stats
sidebar_key: python/Collections-get_collection_stats
sidebar_label: "get_collection_stats()"
added_since: v2.3.x
last_modified: v2.6.x
deprecate_since: false
beta: false
notebook: false
description: "This operation lists the statistics collected on a specific collection. | Python | MilvusClient"
type: docx
token: VfaldXzLUocBrJxffw6cJHPinlh
sidebar_position: 13
keywords: 
  - vector databases comparison
  - Faiss
  - Video search
  - AI Hallucination
  - zilliz
  - zilliz cloud
  - cloud
  - get_collection_stats()
  - pymilvus30
displayed_sidebar: pythonSidebar

---

import Admonition from '@theme/Admonition';


# get_collection_stats()

This operation lists the statistics collected on a specific collection.

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

## Request Syntax\{#request-syntax}

```python
get_collection_stats(
    collection_name: str,
    timeout: Optional[float] = None,
    **kwargs,
) -> Dict
```

**PARAMETERS:**

- **collection_name** (*str*) -

    **[REQUIRED]**

    The name of a collection.

- **timeout** (*Optional[float]*) -

    The timeout duration for this operation. Setting this to **None** indicates that this operation timeouts when any response returns or error occurs.

- **\&ast;\&ast;kwargs** -

    Additional keyword arguments for future extensibility.

**RETURN TYPE:**

*dict*

**RETURNS:**

A dictionary containing collected statistics on the specified collection.

```python
{
    'row_count': 0
}
```

<Admonition type="info" icon="📘" title="Why doesn't the row count match the number of entities inserted?">

The data you insert will undergo processing before it is finally saved. Initially, it will arrive as data streams. Then, it will be stored in segments as entities. Milvus will select an appropriate growing segment to store data in streams until it reaches its upper limit and becomes sealed.

However, note that the displayed row count may not match the number of records inserted, as stream data is not included.

</Admonition>

## Examples\{#examples}

```python
from pymilvus import MilvusClient

client = MilvusClient(uri="YOUR_CLUSTER_ENDPOINT")

stats = client.get_collection_stats(
    collection_name="my_collection"
)

print(stats)
# Output: {'row_count': 100}
```
