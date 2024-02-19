---
displayed_sidbar: pythonSidebar
slug: /python/MilvusClient
beta: false
notebook: false
token: DxvKfXmUolw51AdM5Mdcyr8Angh
sidebar_position: 1
---

import Admonition from '@theme/Admonition';


# MilvusClient

A **MilvusClient** instance represents a python client that connects to a specific Zilliz Cloud cluster.

```python
pymilvus.MilvusClient
```

## Constructor{#constructor}

Constructs a client for the common Milvus use cases.

<Admonition type="info" icon="📘" title="Notes">

<p>This client serves as an easy-to-use alternative for the current set of APIs that handles CRUD operations in Milvus.</p>

</Admonition>

```python
from pymilvus import MilvusClient

client = MilvusClient(
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

    The URI of the Zilliz Cloud cluster. For example: **https://in01-*****************.aws-us-west-2.vectordb-uat3.zillizcloud.com:19540**.

- **user** (*string*) -

    A valid username used to connect to the specified Zilliz Cloud cluster.

    This should be used along with **password**.

- **password** (*string*) -

    A valid password used to connect to the specified Zilliz Cloud cluster.

    This should be used along with **user**.

- **db_name** (*string*) -

    The name of the database to which the target Zilliz Cloud cluster belongs.

- **token** (*string*) -

    A valid access token to access the specified Zilliz Cloud cluster. This can be used as a recommended alternative to setting **user** and **password** separately.

    When setting this field, notice that:

    A valid token should be either

    - An API key with sufficient permissions, or

    - A pair of username and password used to access the target cluster, joined by a colon (:). For example, you can set this to `username:p@ssw0rd`.

- **timeout** (*float *|* None*)  

    The timeout duration for this operation. Setting this to **None** indicates that this operation timeouts when any response arrives or any error occurs.

## Examples{#examples}

```python
from pymilvus import MilvusClient

# Authentication enabled with a non-root user
client = MilvusClient(
    uri="Your-Cluster-Endpoint",
    token="Your-Token",
    db_name="default"
)
```

<Admonition type="info" icon="📘" title="Notes">

<ul>
<li><p>Set **uri to your cluster endpoint. The *<em>token</em>* parameter can be a Zilliz Cloud API key with sufficient permissions or the credentials of a cluster user in the format of <code>username:p@ssw0rd</code>.</p></li>
<li><p>To find the above information, refer to <strong>Find Information on Zilliz Cloud</strong>.</p></li>
</ul>

</Admonition>

## Methods{#methods}

The following are the methods of the `MilvusClient` class:

import DocCardList from '@theme/DocCardList';

<DocCardList />