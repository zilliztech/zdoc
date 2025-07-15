---
displayed_sidbar: javaSidebar
title: "MilvusClientV2 | Java | v2"
slug: /java/java/v2-Client-MilvusClientV2
sidebar_label: "MilvusClientV2"
beta: false
notebook: false
description: "A MilvusClientV2 instance represents a Java client that connects to a specific Zilliz Cloud cluster. | Java | v2"
type: docx
token: IeOWd0yR2onm5Ex6XyqcrGjKnpS
sidebar_position: 1
keywords: 
  - what is vector db
  - what are vector databases
  - vector databases comparison
  - Faiss
  - zilliz
  - zilliz cloud
  - cloud
  - MilvusClientV2
  - javaV225
  - NLP
  - Neural Network
  - Deep Learning
  - Knowledge base
displayed_sidebar: javaSidebar

---

import Admonition from '@theme/Admonition';


# MilvusClientV2

A **MilvusClientV2** instance represents a Java client that connects to a specific Zilliz Cloud cluster.

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

**ConnectConfig** allows you to configure the connection properties in one place so that **MilvusClientV2** can reference it to create and manage the connection pool.

```java
// use either token or username/password
ConnectConfig.builder()
    .uri(String uri)
    .token(String token)
    //.username(String userName)
    //.password(String password)
    .build();
```

**BUILDER METHODS:**

- `uri(String uri)`

    The URI of the Zilliz Cloud cluster. For example:

    ```plaintext
    https://inxx-xxxxxxxxxxxxxxxxx.aws-us-west-2.vectordb-uat3.zillizcloud.com:19540
    ```

- `token(String token)`

    A valid access token to access the specified Zilliz Cloud cluster. 

    This can be used as a recommended alternative to setting **user** and **password** separately.

    When setting this field, notice that:

    A valid token should be either

    - An [API key](/docs/manage-api-keys) with sufficient permissions, or

    - A pair of [username and password ](/docs/cluster-credentials)used to access the target cluster, joined by a colon (:). For example, you can set this to `username:p@ssw0rd`.

- `username(String userName)`

    A valid username used to connect to the specified Zilliz Cloud cluster.

    This should be used along with **password**.

- `password(String password)`

    A valid password used to connect to the specified Zilliz Cloud cluster.

    This should be used along with **user**.

- `connectTimeoutMs(long connectTimeout)`

    The timeout duration for this operation, in milliseconds. 

    The value defaults to **10000**.

- `keepAliveTimeMs(long keepAliveTime)`

    The time in milliseconds between keep-alive probes sent by the client to the server.

    The value defaults to **55000**.

- `keepAliveTimeoutMs(long keepAliveTimeout)`

    The timeout duration in milliseconds for the server to respond to a keep-alive probe sent by the client.

    The value defaults to **20000**.

- `keepAliveWithoutCalls(boolean enable)`

    Whether to send keep-alive probes without making requests.

    The value defaults to **false**.

- `rpcDeadlineMs(long rpcDeadline)`

    The deadline for RPC calls (disabled).

    The value defaults to **0**, which indicates the deadline is disabled.

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

- `proxyAddress(String proxyAddress)`

    The proxy server's address through which the connection is to be established.

- `secure(boolean enable)`

    Whether to use TLS for the connection.

    The value defaults to **true**.

- `idleTimeoutMs(long idleTimeout)`

    The idle timeout for a connection.

**PUBLIC METHODS:**

- `getHost()`

    Returns the hostname of the currently connected Milvus instance.

- `getPort()`

    Returns the port number at which the currently connected Milvus instance.

- `getAuthorization()`

    Returns the credentials used to set up the current connection.

- `getDbName()`

    Returns the name of the database currently in use.

- `isSecure()`

    Returns whether the current connection is over TLS.

- `getProxyAddress()`

    Returns the proxy server's address specified in **ConnectConfig**.

## Examples{#examples}

```java
import io.milvus.v2.client.ConnectConfig;
import io.milvus.v2.client.MilvusClientV2;

ConnectConfig connectConfig = ConnectConfig.builder()
        .uri("https://in01-******.aws-us-west-2.vectordb.zillizcloud.com:19531")
        .token("user:password") // replace this with your token
        .build();
        
MilvusClientV2 client = new MilvusClientV2(connectConfig);
```

<Admonition type="info" icon="📘" title="Notes">

<p>Set <strong>uri</strong> to your cluster endpoint. The <strong>token</strong> parameter can be a Zilliz Cloud API key with sufficient permissions or the credentials of a cluster user in the format of <code>username:p@ssw0rd</code>.</p>

</Admonition>

