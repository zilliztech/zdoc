---
displayed_sidbar: pythonSidebar
slug: /python/Client-MilvusClient
beta: false
notebook: false
token: TUrSdmskuoGdFRxFT75c6xhinzc
sidebar_position: 2
---

import Admonition from '@theme/Admonition';


# MilvusClient

A __MilvusClient__ instance represents a python client that connects to a specific Zilliz Cloud cluster.

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

__PARAMETERS:__

- __uri__ (_string_) -

    The URI of the Zilliz Cloud cluster. For example: __https://in01-\*\*\*\*\*\*\*\*\*\*\*\*\*\*\*\*\*.aws-us-west-2.vectordb-uat3.zillizcloud.com:19540__.

- __user__ (_string_) -

    A valid username used to connect to the specified Zilliz Cloud cluster.

    This should be used along with __password__.

- __password__ (_string_) -

    A valid password used to connect to the specified Zilliz Cloud cluster.

    This should be used along with __user__.

- __db_name__ (_string_) -

    The name of the database to which the target Zilliz Cloud cluster belongs.

- __token__ (_string_) -

    A valid access token to access the specified Zilliz Cloud cluster. This can be used as a recommended alternative to setting __user__ and __password__ separately.

    When setting this field, notice that:

    A valid token should be either

    - An API key with sufficient permissions, or

    - A pair of username and password used to access the target cluster, joined by a colon (:). For example, you can set this to `username:p@ssw0rd`.

- __timeout__ (_float _|_ None_)  

    The timeout duration for this operation. Setting this to __None__ indicates that this operation timeouts when any response arrives or any error occurs.

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
<li><p>Set <strong>uri</strong> to your cluster endpoint. The <strong>token</strong> parameter can be a Zilliz Cloud API key with sufficient permissions or the credentials of a cluster user in the format of <code>username:p@ssw0rd</code>.</p></li>
<li><p>To find the above information, refer to Find Information on Zilliz Cloud.</p></li>
</ul>

</Admonition>

## Methods{#methods}

The following are the methods of the `MilvusClient` class: