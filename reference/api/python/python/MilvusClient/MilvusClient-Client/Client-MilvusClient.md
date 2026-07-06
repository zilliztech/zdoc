---
title: "MilvusClient | Python | MilvusClient"
slug: /python/python/Client-MilvusClient
sidebar_label: "MilvusClient"
beta: false
added_since: v2.3.x
last_modified: v3.0.x
deprecate_since: false
notebook: false
description: "A MilvusClient instance represents a Python client that connects to a specific Zilliz Cloud cluster. | Python | MilvusClient"
type: docx
token: SojTdgw1joOuA8xMzb5cMUFYnce
sidebar_position: 2
keywords: 
  - lexical search
  - nearest neighbor search
  - Agentic RAG
  - rag llm architecture
  - zilliz
  - zilliz cloud
  - cloud
  - MilvusClient
  - pymilvus30
displayed_sidebar: pythonSidebar

displayed_sidbar: pythonSidebar
---

import Admonition from '@theme/Admonition';


# MilvusClient

A **MilvusClient** instance represents a Python client that connects to a specific Zilliz Cloud cluster.

```python
pymilvus.MilvusClient
```

## Constructor\{#constructor}

Constructs a client for common use cases.

<Admonition type="info" icon="📘" title="Notes">

This client serves as an easy-to-use alternative for the current set of APIs that handles Create, Read, Update, and Delete (CRUD) operations on Zilliz Cloud.

</Admonition>

```python
MilvusClient(
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

    - **Project endpoint (On-demand)**

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

    - An [API](/docs/manage-api-keys)[ key](/docs/manage-api-keys) with sufficient permissions, or

    - A pair of [username and password ](/docs/cluster-credentials)used to access the target cluster, joined by a colon (:). For example, you can set this to `username:p@ssw0rd`. This applies only when you use a cluster endpoint.

- **timeout** (*float* | *None*)  

    The timeout duration for this operation. 

    Setting this to **None** indicates that this operation timeouts when any response arrives or any error occurs.

## Examples\{#examples}

```python
from pymilvus import MilvusClient

# Authentication enabled with a cluster user
client = MilvusClient(
    uri="https://inxx-xxxxxxxxxxxx.api.gcp-us-west1.zillizcloud.com:19530",
    token="user:password", # replace this with your token,
    db_name="default"
)
```

<Admonition type="info" icon="📘" title="Notes">

Set **uri** to your cluster endpoint. The **token** parameter can be a Zilliz Cloud API key with sufficient permissions or the credentials of a cluster user in the format of `username:p@ssw0rd`.

</Admonition>

