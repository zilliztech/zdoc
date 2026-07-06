---
title: "rename_collection() | Python | MilvusClient"
slug: /python/python/Collections-rename_collection
sidebar_label: "rename_collection()"
beta: false
added_since: v2.3.x
last_modified: v2.6.x
deprecate_since: false
notebook: false
description: "This operation renames an existing collection. | Python | MilvusClient"
type: docx
token: WR4qdjFUXog2JHxuJpMcWcVlnEf
sidebar_position: 18
keywords: 
  - vector database example
  - rag vector database
  - what is vector db
  - what are vector databases
  - zilliz
  - zilliz cloud
  - cloud
  - rename_collection()
  - pymilvus30
displayed_sidebar: pythonSidebar

displayed_sidbar: pythonSidebar
---

import Admonition from '@theme/Admonition';


# rename_collection()

This operation renames an existing collection.

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
rename_collection(
    old_name: str,
    new_name: str,
    target_db: Optional[str] = "",
    timeout: Optional[float] = None,
    **kwargs,
) -> None
```

**PARAMETERS:**

- **old_name** (*str*) -

    **[REQUIRED]**

    The name of an existing collection.

    Setting this to a non-existing collection results in a **MilvusException**.

- **new_name** (*str*) -

    **[REQUIRED]**

    The name of the target collection after this operation.

    Setting this to the value of **old_name** results in a **MilvusException**.

- **target_db** (*Optional[str]*) -

    The name of the target database to which the collection will be moved. Defaults to an empty string, which means the collection stays in the current database.

- **timeout** (*float* | *None*) -

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

# Rename the collection
client.rename_collection(
    old_name="test_collection",
    new_name="test_collection_renamed"
)

# Move collection to another database
client.rename_collection(
    old_name="test_collection_renamed",
    new_name="test_collection",
    target_db="my_database"
)
```
