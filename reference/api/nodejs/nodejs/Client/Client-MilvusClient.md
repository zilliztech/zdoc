---
displayed_sidbar: this.displayedSidebar
slug: /node/node/Client-MilvusClient
beta: FALSE
notebook: FALSE
type: docx
token: SiL3ds1HPo2bOxx4iWwcxgg8nvd
sidebar_position: 2
displayed_sidebar: nodeSidebar

---

import Admonition from '@theme/Admonition';


# MilvusClient

A **MilvusClient** instance represents a Node.js client that connects to a specific Zilliz Cloud cluster.

```javascript
new MilvusClient(options:ClientConfig)
```

## Request Syntax{#request-syntax}

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

    For details on finding information on the Zilliz Cloud console, refer to [On Zilliz Cloud Console](/docs/on-zilliz-cloud-console).

- **configOrAddress** (*ClientConfig*)

    - **address** (*string*) -

        **[REQUIRED]**

        The cluster endpoint. For example:

        ```plaintext
        https://inxx-xxxxxxxxxxxxxxxxx.aws-us-west-2.vectordb-uat3.zillizcloud.com:19540
        ```

        For details on finding information on the Zilliz Cloud console, refer to [On Zilliz Cloud Console](/docs/on-zilliz-cloud-console).

    - **_SKIPCONNECT__** (*boolean*) -

        A boolean value indicating whether to skip the connection or not. 

    - **channelOptions** (*channelOptions*) -

        Additional channel options for gRPC.

    - **database** (*string*) -

        The name of the cluster database to connect.

    - **id** (*string*) -

        The ID of the cluster to connect.

    - **logLevel** (*string*) -

        The level of the log. Available options include: `debug`, `info`, `warn`, `error`, `panic`, and `fatal`. 

        The default value is `debug`.

        It is recommended to use `debug` level under test and development environments, and `info` level in production environment.

    - **maxRetries** (*number*) -

        The number of attempts to retry connection if the connection is not successful.

    - **password** (*string*) -

        The user password used to authenticate the connection.

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

        - **certChainPath** (*string*) -

            The file path of the certificate chain.

        - **privateKeyPath** (*string*) -

            The file path of the private key.

        - **rootCertPath** (*string*) -

            The file path of the root certificate.

        - **serverName** (*string*) -

            The name of the server.

        - **verifyOptions** (*string*) -

            The verification options.

    - **token** (*string*) -

        The token used for connection. The token can be either an API key or a username and password pair combined with a colon in between.

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

## Example{#example}

```java
new MilvusClient(config: ClientConfig)
```

<Admonition type="info" icon="📘" title="Notes">

<ul>
<li>Set <strong>configOrAddress</strong> to your cluster endpoint. To find this information, refer to <a href="/docs/on-zilliz-cloud-console">On Zilliz Cloud Console</a>.</li>
</ul>

</Admonition>

