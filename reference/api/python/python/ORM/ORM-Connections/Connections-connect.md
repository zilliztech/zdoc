---
displayed_sidbar: pythonSidebar
title: "connect() | Python | ORM"
slug: /python/python/Connections-connect
sidebar_label: "connect()"
beta: NEAR DEPRECATE
notebook: false
description: "This operation establishes a connection to a Zilliz Cloud cluster using the provided alias, address, and authentication parameters. | Python | ORM"
type: docx
token: KzCXdTVVSoOmkbxuFjsccDlXnff
sidebar_position: 2
keywords: 
  - dimension reduction
  - hnsw algorithm
  - vector similarity search
  - approximate nearest neighbor search
  - zilliz
  - zilliz cloud
  - cloud
  - connect()
  - pymilvus25
  - Deep Learning
  - Knowledge base
  - natural language processing
  - AI chatbots
displayed_sidebar: pythonSidebar

---

import Admonition from '@theme/Admonition';


# connect()

This operation establishes a connection to a Zilliz Cloud cluster using the provided alias, address, and authentication parameters.

## Request Syntax{#request-syntax}

```python
connect(
    alias: str,
    user: str | "",
    password: str | "",
    db_name: str | "default",
    token: str | "",
    **kwargs
)
```

**PARAMETERS:**

- **alias** (*string*) -

    **&#91;REQUIRED&#93;**

    A connection alias.

    <Admonition type="info" icon="📘" title="Notes">

    <ul>
    <li><p>If the specified connection alias does not exist, a new one will be added, and the parameters specified below are added as the parameters of the connection alias.</p></li>
    <li><p>If the specified connection alias has already been added by calling <strong>add_connection()</strong>, the parameters specified below overwrite those of the connection alias.</p></li>
    </ul>

    </Admonition>

- **user** (*string*) -

    A valid username used to connect to the specified Zilliz Cloud cluster.

    This should be used along with **password**.

- **password** (*string*) -

    A valid password used to connect to the specified Zilliz Cloud cluster.

    This should be used along with **user**.

- **db_name** (*string*) -

    The name of the database to which the target Milvus instance belongs.

- **token** (*string*) -

    A valid access token to access the specified Zilliz Cloud cluster. This can be used as an alternative to setting **user** and **password** separately.

    When setting this field, notice that:

    A valid token should be either

    - An API key with sufficient permissions, or

    - A pair of username and password used to access the target cluster, joined by a colon (:). For example, you can set this to `username:p@ssw0rd`.

- **kwargs** (*dict*) -

    Keyword arguments for configuring the connection. The following keys are supported:

    - **address** (*string*) -

        The actual address to connect. Example address: **YOUR_CLUSTER_ENDPOINT**.

    - **uri** (*string*) -

        The URI of the Zilliz Cloud cluster. For example: **https://in01-*****************.aws-us-west-2.vectordb-uat3.zillizcloud.com:19540**.

    - **host** (*string*) -

        The host of the Zilliz Cloud cluster. The value defaults to **localhost**, and PyMilvus will fill in the default host if only **port** is provided.

    - **port** (*string | int*) -

        The port that Zilliz Cloud cluster listens to. The value defaults to **19530**, and PyMilvus will fill in the default port if only **host** is provided.

    - **secure** (*bool*) -

        A boolean value indicating whether TLS is employed in the connection.

    - **client_key_path** (*string*) -

        A path to a valid **client.key** file for the TLS certificate verification on the client side.

        This parameter is necessary when using a self-signed TLS certificate or a certificate signed by an unknown authority.

        This parameter should work with **client_pem_path**, **ca_pem_path**, **server_pem_path**, and **server_name** if applicable.

    - **client_pem_path** (*string*) -

        A path to a valid **client.pem** file for the TLS certificate verification on the client side.

        This parameter is necessary when using a self-signed TLS certificate or a certificate signed by an unknown authority.

        This parameter should work with **client_key_path**, **ca_pem_path**, **server_pem_path**, and **server_name** if applicable.

    - **ca_pem_path** (*string*) -

        A path to a valid **ca.pem** file for the TLS certificate verification.

        This parameter is necessary when using a self-signed TLS certificate or a certificate signed by an unknown authority.

        This parameter should work with **client_key_path**, **client_pem_path**, **server_pem_path**, and **server_name** if applicable.

    - **server_pem_path** (*string*) -

        A path to a valid **server.pem** file for the TLS certificate verification on the server side.

        This parameter is necessary when using a self-signed TLS certificate or a certificate signed by an unknown authority.

        This parameter should work with **client_key_path**, **client_pem_path**, **ca_pem_path**, and **server_name** if applicable.

    - **server_name** (*string*) -

        A path to a valid server name for the TLS certificate verification on the server side.

        This parameter is necessary when using a self-signed TLS certificate or a certificate signed by an unknown authority.

        This parameter should work with **client_key_path**, **client_pem_path**, **ca_pem_path**, and **server_pem_path** if applicable.

**RETURN TYPE:**

None

**RETURNS:**

None

## Exceptions{#exceptions}

- **NotImplementedError**:

    This exception will be raised when the handler parameter value is not GRPC.

- **ParamError**: 

    This exception will be raised when an unsupported value is passed for the pool parameter.

- **Exception**: 

    This exception will be raised when the server specified in the connection parameters is not reachable/ready and the client cannot connect to it.

## Examples{#examples}

```python
from pymilvus import connections

# Use host and port
connections.connect(
  alias="default", 
  host='localhost', 
  port='19530'
)

# Use uri
uri="YOUR_CLUSTER_ENDPOINT"
connections.connect(uri=uri)

# Use environment variable
# The following assumes that you have already set an environment 
# variable using export MILVUS_URI=http://username:password@YOUR_CLUSTER_ENDPOINT
connections.connect()

# Use environment files
# A sample file at https://github.com/milvus-io/pymilvus/blob/master/.env.example
# Rename the file to .env so that pymilvus will automatically load it.
connections.connect()

# Connect to a specific database
# Ensure the specified database exists.
connections.connect(db_name="books")
```

## Related operations{#related-operations}

The following operations are related to `connect()`:

- [add_connection()](./Connections-add_connection)

- [disconnect()](./Connections-disconnect)

- [get_connection_addr()](./Connections-get_connection_addr)

- [has_connection()](./Connections-has_connection)

- [list_connections()](./Connections-list_connections)

- [remove_connection()](./Connections-remove_connection)

