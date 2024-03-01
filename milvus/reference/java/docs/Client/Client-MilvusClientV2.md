---
displayed_sidbar: javaSidebar
slug: /java/Client-MilvusClientV2
beta: false
notebook: false
type: docx
token: YmaYdEH00oj9DWx9N22cWfbonWb
sidebar_position: 1
---

# MilvusClientV2

A __MilvusClientV2__ instance represents a Java client that connects to a specific Milvus instance.

```java
io.milvus.v2.client.MilvusClientV2
```

## Constructor{#constructor}

Constructs a client for common use cases.

<div class="admonition note">

<p><b>notes</b></p>

<p>This client serves as an easy-to-use alternative for the current set of APIs that handles CRUD operations in Milvus.</p>

</div>

```java
MilvusClientV2(ConnectConfig connectConfig);
```

## ConnectConfig{#connectconfig}

`ConnectConfig` is a class that centralizes all the connection configurations in one place, which is then used by `MilvusClientV2` to actually create and manage the connection pool.

```java
ConnectConfig.builder()
    .uri(String uri)
    .token(String token)
    .username(String userName)
    .password(String password)
    .dbName(String databaseName)
    .build();
```

__BUILDER METHODS:__

- `uri(String uri)`

    The URI of the Milvus instance. For example:

    ```plaintext
    http://localhost:19530
    ```

- `token(String token)`

    A valid access token to access the specified Milvus instance. 

    This can be used as a recommended alternative to setting __user__ and __password__ separately.

    When setting this field, notice that:

    A valid token should be a pair of username and password used to access the target cluster, joined by a colon (:). For example, you can set this to `root:Milvus`, which is the default credential of the root user.

    Use this if authentication has been enabled on the target Milvus instance. To enable authentication, refer to [Authenticate User Access](https://milvus.io/docs/authenticate.md).

- `username(String userName)`

    A valid username used to connect to the specified Milvus instance.

    Use this if authentication has been enabled on the target Milvus instance. To enable authentication, refer to [Authenticate User Access](https://milvus.io/docs/authenticate.md).

    This should be used along with __password__.

- `password(String password)`

    A valid password used to connect to the specified Milvus instance.

    Use this if authentication has been enabled on the target Milvus instance. To enable authentication, refer to [Authenticate User Access](https://milvus.io/docs/authenticate.md).

    This should be used along with __user__.

- `dbName(String databaseName)`

    The name of the database to which the target Milvus instance belongs.

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
ConnectConfig connectConfig = ConnectConfig._builder_()
        .uri("http://localhost:19530")
        .token("*****")
        .build();
MilvusClientV2 client = new MilvusClientV2(connectConfig);
```

