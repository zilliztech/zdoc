---
displayed_sidbar: javaSidebar
slug: /java/Client-MilvusClientV2
beta: false
notebook: false
type: docx
token: YmaYdEH00oj9DWx9N22cWfbonWb
sidebar_position: 1
---

import Admonition from '@theme/Admonition';


# MilvusClientV2

A __MilvusClientV2__ instance represents a Java client that connects to a specific Zilliz Cloud cluster.

```java
io.milvus.v2.client.MilvusClientV2
```

## Constructor{#constructor}

Constructs a client for common use cases.

<Admonition type="info" icon="📘" title="Notes">

<p>This client serves as an easy-to-use alternative for the current set of APIs that handles Create, Read, Update, and Delete (CRUD) operations on Zilliz Cloud.</p>

</Admonition>

```java
MilvusClientV2(ConnectConfig connectConfig);
```

## ConnectConfig{#connectconfig}

__ConnectConfig__ allows you to configure the connection properties in one place so that __MilvusClientV2__ can reference it to create and manage the connection pool.

```java
// use either token or username/password
ConnectConfig.builder()
    .uri(String uri)
    .token(String token)
    //.username(String userName)
    //.password(String password)
    .build();
```

__BUILDER METHODS:__

- `uri(String uri)`

    The URI of the Zilliz Cloud cluster. For example:

    ```plaintext
    https://inxx-xxxxxxxxxxxxxxxxx.aws-us-west-2.vectordb-uat3.zillizcloud.com:19540
    ```

    To find needed information on the Zilliz Cloud console, refer to [On Zilliz Cloud Console](/docs/on-zilliz-cloud-console).

- `token(String token)`

    A valid access token to access the specified Zilliz Cloud cluster. 

    This can be used as a recommended alternative to setting __user__ and __password__ separately.

    When setting this field, notice that:

    A valid token should be either

    - An [API key](/docs/manage-api-keys) with sufficient permissions, or

    - A pair of [username and password ](/docs/cluster-credentials-console)used to access the target cluster, joined by a colon (:). For example, you can set this to `username:p@ssw0rd`.

- `username(String userName)`

    A valid username used to connect to the specified Zilliz Cloud cluster.

    This should be used along with __password__.

- `password(String password)`

    A valid password used to connect to the specified Zilliz Cloud cluster.

    This should be used along with __user__.

- `connectTimeoutMs(long connectTimeout)`

    The timeout duration for this operation, in milliseconds. 

    The value defaults to __10000__.

- `keepAliveTimeMs(long keepAliveTime)`

    The time in milliseconds between keep-alive probes sent by the client to the server.

    The value defaults to __55000__.

- `keepAliveTimeoutMs(long keepAliveTimeout)`

    The timeout duration in milliseconds for the server to respond to a keep-alive probe sent by the client.

    The value defaults to __20000__.

- `keepAliveWithoutCalls(boolean enable)`

    Whether to send keep-alive probes without making requests.

    The value defaults to __false__.

- `rpcDeadlineMs(long rpcDeadline)`

    The deadline for RPC calls (disabled).

    The value defaults to __0__, which indicates the deadline is disabled.

- `clientKeyPath(String clientKeyPath)`

    The path to the client key file for two-way authentication.

- `clientPemPath(String clientPemPath)`

    The path to the client PEM file for two-way authentication.

- `caPemPath(String caPemPath)`

    The path to the CA PEM file for two-way authentication.

- `serverPemPath(String serverPemPath)`

    The path to the server PEM file for two-way authentication.

- `serverName(String serverName)`

    The expected name of the server.

- `secure(boolean enable)`

    Whether to use TLS for the connection.

    The value defaults to __true__.

- `idleTimeoutMs(long idleTimeout)`

    The idle timeout for a connection.

## Examples{#examples}

```java
import io.milvus.v2.client.ConnectConfig
import io.milvus.v2.client.MilvusClientV2

ConnectConfig connectConfig = ConnectConfig._builder_()
        .uri("https://in01-******.aws-us-west-2.vectordb.zillizcloud.com:19531")
        .token("user:password") // replace this with your token
        .build();
        
MilvusClientV2 client = new MilvusClientV2(connectConfig);
```

<Admonition type="info" icon="📘" title="Notes">

<ul>
<li><p>Set <strong>uri</strong> to your cluster endpoint. The <strong>token</strong> parameter can be a Zilliz Cloud API key with sufficient permissions or the credentials of a cluster user in the format of <code>username:p@ssw0rd</code>.</p></li>
<li><p>To find the above information, refer to <a href="/docs/on-zilliz-cloud-console">On Zilliz Cloud Console</a>.</p></li>
</ul>

</Admonition>

