---
title: "MilvusClient | Node.js"
slug: /node/node/Client-MilvusClient
sidebar_label: "MilvusClient"
beta: false
added_since: v2.3.x
last_modified: v2.5.x
deprecate_since: false
notebook: false
description: "A MilvusClient instance represents a Node.js client that connects to a specific Zilliz Cloud cluster. | Node.js"
type: docx
token: ZxPXdeBXGopnvMxl7v6c9DSanFL
sidebar_position: 5
keywords: 
  - Video deduplication
  - Video similarity search
  - Vector retrieval
  - Audio similarity search
  - zilliz
  - zilliz cloud
  - cloud
  - MilvusClient
  - nodejs26
  - knn
  - Image Search
  - LLMs
  - Machine Learning
displayed_sidebar: nodeSidebar

displayed_sidbar: nodeSidebar
---

import Admonition from '@theme/Admonition';


# MilvusClient

A **MilvusClient** instance represents a Node.js client that connects to a specific Zilliz Cloud cluster.

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

    The address of the Zilliz Cloud cluster. For example:

    ```plaintext
    https://inxx-xxxxxxxxxxxxxxxxx.aws-us-west-2.vectordb-uat3.zillizcloud.com:19540
    ```

- **configOrAddress** (*ClientConfig*)

    - **address** (*string*) -

        **[REQUIRED]**

        The cluster endpoint. For example:

        ```plaintext
        https://inxx-xxxxxxxxxxxxxxxxx.aws-us-west-2.vectordb-uat3.zillizcloud.com:19540
        ```

    - **_SKIPCONNECT__** (*boolean*) -

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

    - **password** (*string*) -

        The user password that is used to authenticate the connection.

    - **pool** (*Options*) -

        A generic poll option, which abides by the rules specified in [this repo](https://github.com/coopernurse/node-pool).

    - **protoFilePath** (*protoFilePath*) -

        - **milvus** (*string*) -

        - **schema** (*string*) -

    - **retryDelay** (*number*) -

        The interval between retry attempts.

    - **ssl** (*boolean*) -

        A boolean value indicating whether to use SSL or not. Always set this to `true` on Zilliz Cloud.

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

        - **verifyOptions** (*string*) -

            The verification options.

    - **token** (*string*) -

        The token used for connection. The token can be either an API key or a username and password pair combined with a colon in between.

    - **trace** (*boolean*) -

        Whether to enable tracing. 

    - **username** (*string*) -

        The username used for connection.

- **ssl** (*boolean*) -

    A boolean value indicating whether to use SSL or not. Always set this to `true` on Zilliz Cloud.

- **username** (*string*) -

    A valid username used to connect to the specified Zilliz Cloud cluster.

    This should be used along with **password**.

- **password** (*string*) -

    A valid password used to connect to the specified Zilliz Cloud cluster.

    This should be used along with **username**.

- **channelOptions** (*channelOptions*) -

    Additional channel options for gRPC.

**RETURNS** *MilvusClient*

This method returns a Milvus Client instance that extends GRPC Client and handles communication with Zilliz Cloud clusters.

## Example\{#example}

```java
new MilvusClient(config: ClientConfig)
```

<Admonition type="info" icon="📘" title="Notes">

<ul>
<li>Set <strong>configOrAddress</strong> to your cluster endpoint. You can find the relevant information in Cluster details on the Zilliz Cloud console.</li>
</ul>

</Admonition>

