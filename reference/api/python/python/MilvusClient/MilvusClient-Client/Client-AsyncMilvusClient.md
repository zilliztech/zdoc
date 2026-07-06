---
title: "AsyncMilvusClient | Python | MilvusClient"
slug: /python/python/Client-AsyncMilvusClient
sidebar_label: "AsyncMilvusClient"
beta: false
added_since: v2.5.x
last_modified: v3.0.x
deprecate_since: false
notebook: false
description: "An AsyncMilvusClient instance represents an asynchronous Python client that connects to a specific Zilliz Cloud cluster. It provides the same parameter sets and behaviors as MilvusClient, and the only difference lies in the way you call them. | Python | MilvusClient"
type: docx
token: MIKkdpGuuoEaGWx1m7Fcw52inKg
sidebar_position: 3
keywords: 
  - semantic search
  - Anomaly Detection
  - sentence transformers
  - Recommender systems
  - zilliz
  - zilliz cloud
  - cloud
  - AsyncMilvusClient
  - pymilvus30
displayed_sidebar: pythonSidebar

displayed_sidbar: pythonSidebar
---

import Admonition from '@theme/Admonition';


# AsyncMilvusClient

An **AsyncMilvusClient** instance represents an asynchronous Python client that connects to a specific Zilliz Cloud cluster. It provides the same parameter sets and behaviors as **[MilvusClient](./Client-MilvusClient)**, and the only difference lies in the way you call them.

```python
pymilvus.AsyncMilvusClient
```

## Constructor\{#constructor}

Constructs a client for common use cases.

<Admonition type="info" icon="📘" title="Notes">

- This interface is still in its early stage and may change significantly in future releases. You are advised not to use it in production.

- To call **AsyncMilvusClient**, you need to get an event loop from asyncio to manage request handling. For details, refer to [Tutorial: Use AsyncMilvusClient with asyncio](https://milvus.io/docs/use-async-milvus-client-with-asyncio.md#Tutorial-Use-AsyncMilvusClient-with-asyncio).

</Admonition>

```python
AsyncMilvusClient(
    uri: str,
    user: str,
    password: str,
    db_name: str,
    token: str,
    timeout=None,
    **kwargs
)
```

**PARAMETERS:**

- **uri** (*string*) -

    The URI of the Zilliz Cloud cluster. For example:

    - **Cluster endpoint**

        - **Free & Serverless**

            `https://{cluster-id}.serverless.{region}.vectordb.zillizcloud.com`

        - **Dedicated**

            `https://{cluster-id}.{region}.vectordb.zillizcloud.com:19530`

    - **Project Endpoint (On-Demand)**

        `https://{project-id}.{region}.api.zillizcloud.com`

- **user** (*string*) -

    A valid username used to connect to the specified Zilliz Cloud cluster.

    This should be used along with **password**.

- **password** (*string*) -

    A valid password used to connect to the specified Zilliz Cloud cluster.

    This should be used along with **user**.

- **db_name** (*string*) -

    The name of the database to which the target Milvus instance belongs.

- **token** (*string*) -

    A valid access token to access the specified Zilliz Cloud cluster. 

    This can be used as a recommended alternative to setting **user** and **password** separately.

    When setting this field, notice that:

    A valid token should be either

    - An [API key](/docs/manage-api-keys) with sufficient permissions, or

    - A pair of [username and password ](/docs/cluster-credentials)used to access the target cluster, joined by a colon (:). For example, you can set this to `username:p@ssw0rd`. This applies only when you use a cluster endpoint.

- **timeout** (*float* | *None*)  

    The timeout duration for this operation. 

    Setting this to **None** indicates that this operation timeouts when any response arrives or any error occurs.

## Examples\{#examples}

```python
import asyncio
from pymilvus import MilvusClient

# Get an event loop from asyncio
loop = asyncio.get_event_loop()

# Authentication enabled with a cluster user
client = AsyncMilvusClient(
    uri="https://inxx-xxxxxxxxxxxx.api.gcp-us-west1.zillizcloud.com:19530",
    token="user:password", # replace this with your token,
    db_name="default"
)
```

<Admonition type="info" icon="📘" title="Notes">

Set **uri** to your cluster endpoint. The **token** parameter can be a Zilliz Cloud API key with sufficient permissions or the credentials of a cluster user in the format of `username:p@ssw0rd`.

</Admonition>

