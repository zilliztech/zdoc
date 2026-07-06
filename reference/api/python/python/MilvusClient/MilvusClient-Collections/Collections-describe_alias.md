---
title: "describe_alias() | Python | MilvusClient"
slug: /python/python/Collections-describe_alias
sidebar_label: "describe_alias()"
beta: false
added_since: v2.3.x
last_modified: false
deprecate_since: false
notebook: false
description: "This operation displays the details of an alias. | Python | MilvusClient"
type: docx
token: HN7nddgueo3scIxmPXAcpjkFnDf
sidebar_position: 8
keywords: 
  - hybrid search
  - lexical search
  - nearest neighbor search
  - Agentic RAG
  - zilliz
  - zilliz cloud
  - cloud
  - describe_alias()
  - pymilvus30
displayed_sidebar: pythonSidebar

displayed_sidbar: pythonSidebar
---

import Admonition from '@theme/Admonition';


# describe_alias()

This operation displays the details of an alias.

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
describe_alias(
    alias: str,
    timeout: Optional[float] = None
) -> dict
```

**PARAMETERS:**

- **alias** (*str*) -

    **[REQUIRED]**

    The alias of a collection. 

    Before this operation, ensure that the alias exists. Otherwise, exceptions will occur.

- **timeout** (*float* | *None*)  

    The timeout duration for this operation. 

    Setting this to **None** indicates that this operation timeouts when any response arrives or any error occurs.

**RETURN TYPE:**

*Dict*

**RETURNS:**

A dictionary containing the alias details.

```python
{
    alias: 'string',
    collection_name: 'string',
    db_name: 'default'
}
```

**PARAMETERS:**

- **alias** (*str*) -

    The specified alias. 

- **collection_name** (*str*) -

    The name of the bound collection. 

- **db_name** (*str*) -

    The database to which the bound collection belongs. 

**EXCEPTIONS:**

- **MilvusException**

    This exception will be raised when any error occurs during this operation, especially when you set `alias` to a non-existing alias.

- **BaseException**

    This exception will be raised when this operation fails.

## Example\{#example}

```python
from pymilvus import MilvusClient

# 1. Create a milvus client
client = MilvusClient(
    uri="https://inxx-xxxxxxxxxxxx.api.gcp-us-west1.zillizcloud.com:19530",
    token="user:password"
)

# 2. Create a collection
client.create_collection(collection_name="test_collection", dimension=5)

# 3. Create an alias for the collection
client.create_alias(collection_name="test_collection", alias="test")

# 4. Describe the alias
client.describe_alias(alias="test")

# {
#     'alias': 'test', 
#     'collection_name': 'test_collection', 
#     'db_name': 'default'
# }
```

## Related methods\{#related-methods}

- [alter_alias()](./Collections-alter_alias)

- [create_alias()](./Collections-create_alias)

- [drop_alias()](./Collections-drop_alias)

- [list_aliases()](./Collections-list_aliases)

