---
title: "MilvusClient | Node.js"
slug: /node/node/Client-MilvusClient
sidebar_label: "MilvusClient"
beta: false
added_since: v2.3.x
last_modified: v2.6.x
deprecate_since: false
notebook: false
description: "A MilvusClient instance represents a Node.js client that connects to a specific Zilliz Cloud cluster. | Node.js"
type: docx
token: DsyLdmJr0o7FAfxwPcNct1Bqnth
sidebar_position: 5
keywords: 
  - lexical search
  - nearest neighbor search
  - Agentic RAG
  - rag llm architecture
  - zilliz
  - zilliz cloud
  - cloud
  - MilvusClient
  - nodejs30
displayed_sidebar: nodeSidebar

---

import Admonition from '@theme/Admonition';

# MilvusClient

A **MilvusClient** instance represents a Node.js client that connects to a specific Milvus instance.

```javascript
new MilvusClient(options:ClientConfig)
```

## Request Syntax\{#request-syntax}

```javascript
new MilvusClient(config: ClientConfig)
```

**PARAMETERS:**

- **configOrAddress** (*string*) -

    **[REQUIRED]**

    The address of the Milvus instance. For example:

    ```javascript
    https://inxx-xxxxxxxxxxxxxxxxx.aws-us-west-2.vectordb-uat3.zillizcloud.com:19540
    ```

- **configOrAddress** (*ClientConfig*)

    - **address** (*string*) -

        **[REQUIRED]**

        The cluster endpoint. For example:

        ```javascript
        https://inxx-xxxxxxxxxxxxxxxxx.aws-us-west-2.vectordb-uat3.zillizcloud.com:19540
        ```

    - **__SKIP_CONNECT__** (*boolean*) -

        A boolean value indicating whether to skip the connection or not. 

    - **channelOptions** (*channelOptions*) -

        Additional channel options for gRPC.

    - **database** (*string*) -

        The name of the cluster database to connect.

    - **id** (*string*) -

        The ID of the cluster to connect.

    - **loaderOptions** (*Options*) -

        The option that converts int64 to Long format. Possible values are:

        - `{ longs: Function }`

            This should be a function that converts int64 to Long.js format.

        - `{ longs: Number }`

            This converts int64 to a number, resulting in precision loss.

        - `{ longs: String }`

            This converts int64 to a string. This is the default behavior.

    - **logLevel** (*string*) -

        The level of the log. Available options include: `debug`, `info`, `warn`, `error`, `panic`, and `fatal`. 

        The default value is `debug`.

        It is recommended to use `debug` level under test and development environments, and `info` level in the production environment.

    - **logPrefix** (*string*) -

        The prefix of each log entry.

    - **maxRetries** (*number*) -

        The number of attempts to retry the connection if the connection is not successful.

    - **option** (*Record&lt;string, string&gt;*) -

        Reserved connection options sent in the `ConnectRequest` client info. Use this to pass arbitrary key-value pairs to the server during the initial handshake.

    - **password** (*string*) -

        The user password that is used to authenticate the connection.

    - **pool** (*Options*) -

        A generic poll option, which abides by the rules specified in [this repo](https://github.com/coopernurse/node-pool).

    - **retryDelay** (*number*) -

        The interval between retry attempts.

    - **ssl** (*boolean*) -

        A boolean value indicating whether to use SSL or not. Set this to `true` if you have configured Milvus to work at a TLS endpoint. For details, refer to [Encryption in Transit](https://milvus.io/docs/tls.md).

        On Zilliz Cloud, always connect over TLS: pass the `https://` cluster endpoint (the SDK enables TLS automatically), or set `ssl` to `true` when the endpoint does not include a scheme.

    - **timeout** (*string* | *number*) -

        The timeout duration for this operation. 

        Setting this to **None** indicates that this operation timeouts when any response arrives or any error occurs.

    - **tls** (*tls*) -

        - **certChain** (*Buffer*) -

            The certificate chain in the buffer.

        - **certChainPath** (*string*) -

            The file path of the certificate chain.

        - **privateKey** (*Buffer*) -

            The private key in the buffer.

        - **privateKeyPath** (*string*) -

            The file path of the private key.

        - **rootCert** (*Buffer*) -

            The root certificate in the buffer.

        - **rootCertPath** (*string*) -

            The file path of the root certificate.

        - **serverName** (*string*) -

            The name of the server.

        - **skipCertCheck** (*boolean*) -

            Whether to skip the checks against the provided certificates. Setting it `true` indicates a skip.

        - **verifyOptions** (*Record&lt;string, any&gt;*) -

            The verification options.

    - **token** (*string*) -

        The token used for connection. The token can be either an API key or a username and password pair combined with a colon in between.

    - **trace** (*boolean*) -

        Whether to enable tracing. 

    - **telemetry** (*TelemetryConfig*) -

        Configuration for client metrics, heartbeat, and server-pushed commands.

    - **isGlobal** (*boolean*) -

        Whether to enable global-cluster mode. When **true**, the SDK fetches the cluster topology from the endpoint and routes to the primary cluster. When omitted, the mode is auto-detected from the address URI.

    - **username** (*string*) -

        The username used for connection.

- **ssl** (*boolean*) -

    A boolean value indicating whether to use SSL or not. Set this to `true` if you have configured Milvus to work at a TLS endpoint. For details, refer to [Encryption in Transit](https://milvus.io/docs/tls.md).

    On Zilliz Cloud, always connect over TLS: pass the `https://` cluster endpoint (the SDK enables TLS automatically), or set `ssl` to `true` when the endpoint does not include a scheme.

- **username** (*string*) -

    A valid username used to connect to the specified Milvus instance.

    Use this if authentication has been enabled on the target Milvus instance. To enable authentication, refer to [Authenticate User Access](https://milvus.io/docs/authenticate.md).

    This should be used along with **password**.

- **password** (*string*) -

    A valid password used to connect to the specified Milvus instance.

    Use this if authentication has been enabled on the target Milvus instance. To enable authentication, refer to [Authenticate User Access](https://milvus.io/docs/authenticate.md).

    This should be used along with **username**.

- **channelOptions** (*channelOptions*) -

    Additional channel options for gRPC.

**METHODS:**

- `static get sdkInfo`

    Returns `{ version, recommendMilvus }`, the SDK version and the recommended Milvus version generated at build time.

- `session(clusterId: string): MilvusClientSession`

    Creates a lightweight DQL session pinned to a target cluster ID. The session reuses this client's connection and injects `cluster_id` into `search`, `hybridSearch`, `searchIterator`, `query`, `queryIterator`, and `get` requests. See [session()](./Client-session).

- `createCollection(data): Promise<ResStatus>`

    The high-level collection creation method that builds a default schema from `collection_name` and `dimension` and optionally creates the index and loads the collection.

- All other operations (for example, `insert`, `search`, `query`, `createIndex`, `loadCollection`) are inherited from the underlying GRPC client.

**RETURNS:**

*MilvusClient*

This method returns a Milvus Client instance that extends GRPC Client and handles communication with Milvus server.

## Example\{#example}

```javascript
new MilvusClient(config: ClientConfig)
```

<Admonition type="info" title="Notes">

- Set **configOrAddress** to your cluster endpoint. You can find the relevant information in Cluster details on the Zilliz Cloud console.

</Admonition>