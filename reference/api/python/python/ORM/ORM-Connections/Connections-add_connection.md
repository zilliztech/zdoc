---
title: "add_connection() | Python | ORM"
slug: /python/python/Connections-add_connection
sidebar_label: "add_connection()"
beta: NEAR DEPRECATE
added_since: Inherit
last_modified: false
deprecate_since: false
notebook: false
description: "This operation adds connections to multiple Zilliz Cloud clusters for different purposes in a batch. | Python | ORM"
type: docx
token: C37ldNLbFog6ThxA23ScMldnnmb
sidebar_position: 1
keywords: 
  - Zilliz vector database
  - Zilliz database
  - Unstructured Data
  - vector database
  - zilliz
  - zilliz cloud
  - cloud
  - add_connection()
  - pymilvus26
  - llm-as-a-judge
  - hybrid vector search
  - Video deduplication
  - Video similarity search
displayed_sidebar: pythonSidebar

displayed_sidbar: pythonSidebar
---

import Admonition from '@theme/Admonition';


# add_connection()

This operation adds connections to multiple Zilliz Cloud clusters for different purposes in a batch. 

## Request Syntax\{#request-syntax}

```python
add_connection(
    default: dict,
    # add other connections
    # your_conn_name: dict
)
```

**PARAMETERS:**

- **kwargs** - 

    When passing keyword arguments, the name of each argument will serve as a connection alias in the **connect()** method.

    The argument value should be a dictionary with one or more of these fields:

    - **address** (*string*) -

        The actual address to connect. Example address: **YOUR_CLUSTER_ENDPOINT**.

    - **uri** (*string*) -

        The URI of the Zilliz Cloud cluster. For example: **https://in01-*****************.aws-us-west-2.vectordb-uat3.zillizcloud.com:19540**.

    - **host** (*string*) -

        The host of the Zilliz Cloud cluster. The value defaults to **localhost**, and PyMilvus will fill in the default host if only **port** is provided.

    - **port** (*string | int*) -

        The port that Zilliz Cloud cluster listens to. The value defaults to **19530**, and PyMilvus will fill in the default port if only **host** is provided.

    - **user** (*string*) -

        A valid username used to connect to the specified Zilliz Cloud cluster.

        This should be used along with **password**.

    - **password** (*string*) -

        A valid password used to connect to the specified Zilliz Cloud cluster.

        This should be used along with **user**.

    - **token** (string) -

        A valid access token to access the specified Zilliz Cloud cluster. This can be used as an alternative to setting **user** and **password** separately.

        When setting this field, notice that:

        A valid token should be either

        - An API key with sufficient permissions, or

        - A pair of username and password used to access the target cluster, joined by a colon (:). For example, you can set this to `username:p@ssw0rd`.

<Admonition type="info" icon="📘" title="How can I get the cluster endpoint and token?">

<ul>
<li><strong>Cluster endpoint</strong></li>
</ul>
<p>You can log into the <a href="https://cloud.zilliz.com">Zilliz Cloud</a> console and click <strong>Clusters</strong> in the left navigation pane. In the cluster list, click the name of the target cluster, copy its endpoint in the <strong>Connect</strong> area, and use it as the URI above.</p>
<ul>
<li><strong>Access token</strong></li>
</ul>
<p>To connect to a Zilliz Cloud cluster, you can use either of the following</p>
<ul>
<li>An API key</li>
</ul>
<p>You can log into the <a href="https://cloud.zilliz.com">Zilliz Cloud</a> console and click <strong>API Keys</strong> in the left navigation pane.</p>
<ul>
<li>A pair of username and password to access the cluster, joined by a colon (<strong>:</strong>).</li>
</ul>
<p>You can use the cluster credentials specified when the cluster has been created on the Zilliz Cloud console, or those of any existing cluster users.</p>
<p>For details, refer to <a href="/docs/on-zilliz-cloud-console">On Zilliz Cloud Console</a> for more information.</p>

</Admonition>

**RETURN TYPE:**

None

**RETURNS:**

None

**EXCEPTIONS:**

- **ConnectionConfigException**

    This exception will be raised when the connection configuration is invalid.

## Examples\{#examples}

```python
from pymilvus import connections

SERVERLESS_ENDPOINT = "https://in03-************.api.gcp-us-west1.zillizcloud.com"
SERVERLESS_TOKEN = "db_admin:************"
DEDICATED_ENDPOINT = "https://in03-************.api.gcp-us-west1.zillizcloud.com:19541"
DEDICATED_USER = "db_admin"
DEDICATED_PASS = "*****************"

connections.add_connection(
  serverless={"uri": SERVERLESS_ENDPOINT, "token": SERVERLESS_TOKEN},
  dedicated={"uri": DEDICATED_ENDPOINT, "user": DEDICATED_USER, "password": DEDICATED_PASS}
)
```

## Related operations\{#related-operations}

The following operations are related to `add_connection()`:

- [connect()](./Connections-connect)

- [disconnect()](./Connections-disconnect)

- [get_connection_addr()](./Connections-get_connection_addr)

- [has_connection()](./Connections-has_connection)

- [list_connections()](./Connections-list_connections)

- [remove_connection()](./Connections-remove_connection)

