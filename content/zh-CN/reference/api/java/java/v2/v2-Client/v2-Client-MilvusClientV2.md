---
title: "MilvusClientV2 | Java | v2"
slug: /java/java/v2-Client-MilvusClientV2
sidebar_label: "MilvusClientV2"
beta: false
added_since: v2.3.x
last_modified: v2.5.x
deprecate_since: false
notebook: false
description: "MilvusClientV2 实例表示一个连接到特定 Zilliz Cloud 集群的 Java 客户端。 | Java | v2"
type: docx
token: IeOWd0yR2onm5Ex6XyqcrGjKnpS
sidebar_position: 1
keywords: 
  - 向量 Database
  - IVF
  - knn
  - 图像搜索
  - zilliz
  - zilliz cloud
  - 云
  - MilvusClientV2
  - javaV230
displayed_sidebar: javaSidebar

displayed_sidbar: javaSidebar
---

import Admonition from '@theme/Admonition';


# MilvusClientV2

**MilvusClientV2** 实例表示一个连接到特定 Zilliz Cloud 集群的 Java 客户端。

```java
io.milvus.v2.client.MilvusClientV2
```

## 构造函数\{#constructor}

为常见用例构造一个客户端。

<Admonition type="info" icon="📘" title="Notes">

该客户端可作为当前这组 API 的易用替代方案，用于处理 Zilliz Cloud 上的创建、读取、更新和删除（CRUD）操作。

</Admonition>

```java
MilvusClientV2(ConnectConfig connectConfig);
```

## [ConnectConfig](./v2-Client-ConnectConfig)\{#connectconfigv2-client-connectconfig}

**[ConnectConfig](./v2-Client-ConnectConfig)** 允许您在一处配置连接属性，以便 **MilvusClientV2** 可以引用它来创建和管理连接池。

```java
// use either token or username/password
ConnectConfig.builder()
    .uri(String uri)
    .token(String token)
    .username(String userName)
    .password(String password)
    .dbName(String dbName)
    .connectTimeoutMs(long connectTimeoutMs)
    .keepAliveTimeMs(long keepAliveTimeMs)
    .keepAliveTimeoutMs(long keepAliveTimeoutMs)
    .keepAliveWithoutCalls(Boolean keeAliveWithoutCalls)
    .rpcDeadlineMs(long rpcDeadlineMs)
    .clientKeyPath(String clientKeyPath)
    .clientPemPath(String clientPemPath)
    .caPemPath(String caPemPath)
    .serverPemPath(String serverPemPath)
    .serverName(String serverName)
    .proxyAddress(String proxyAddress)
    .secure(Boolean secure)
    .idleTimeoutMs(long idleTimeoutMs)
    .sslContext(SSLContext sslContext)
    .clientRequestId(ThreadLocal<String> clientRequestId)
    .build();
```

**构建器方法：**

- `uri(String uri)`

    Zilliz Cloud 集群的 URI。例如：

    ```plaintext
    https://inxx-xxxxxxxxxxxxxxxxx.aws-us-west-2.vectordb-uat3.zillizcloud.com:19540
    ```

- `token(String token)`

    用于访问指定 Zilliz Cloud 集群的有效访问令牌。

    这可作为分别设置 **user** 和 **password** 的推荐替代方式。

    设置此字段时，请注意：

    有效的 token 应为以下之一

    - 具有足够权限的 [API key](/docs/manage-api-keys)，或

    - 一组用于访问目标集群的[用户名和密码](/docs/cluster-credentials)，并使用冒号（:）连接。例如，您可以将其设置为 `username:p@ssw0rd`。

- `username(String userName)`

    用于连接指定 Zilliz Cloud 集群的有效用户名。

    应与 **password** 一起使用。

- `password(String password)`

    用于连接指定 Zilliz Cloud 集群的有效密码。

    应与 **user** 一起使用。

- `connectTimeoutMs(long connectTimeout)`

    此操作的超时时长，单位为毫秒。

    默认值为 **10000**。

- `keepAliveTimeMs(long keepAliveTime)`

    客户端向服务器发送 keep-alive 探测的时间间隔，单位为毫秒。

    默认值为 **55000**。

- `keepAliveTimeoutMs(long keepAliveTimeout)`

    服务器响应客户端发送的 keep-alive 探测的超时时长，单位为毫秒。

    默认值为 **20000**。

- `keepAliveWithoutCalls(boolean enable)`

    是否在不发出请求的情况下发送 keep-alive 探测。

    默认值为 **false**。

- `rpcDeadlineMs(long rpcDeadline)`

    RPC 调用的截止时间（已禁用）。

    默认值为 **0**，表示截止时间已禁用。

- `clientKeyPath(String clientKeyPath)`

    用于双向认证的客户端密钥文件路径。

- `clientPemPath(String clientPemPath)`

    用于双向认证的客户端 PEM 文件路径。

- `caPemPath(String caPemPath)`

    用于双向认证的 CA PEM 文件路径。

- `serverPemPath(String serverPemPath)`

    用于双向认证的服务器 PEM 文件路径。

- `serverName(String serverName)`

    服务器的预期名称。

- `proxyAddress(String proxyAddress)`

    用于建立连接的代理服务器地址。

- `secure(boolean enable)`

    是否对此连接使用 TLS。

    默认值为 **true**。

- `idleTimeoutMs(long idleTimeout)`

    连接的空闲超时时间。

- `.clientRequestId(ThreadLocal<String> clientRequestId)`

    客户端请求的 ID。您可以使用此参数维护线程映射，其中每个线程映射到一个特定的请求 ID。

    该请求 ID 将传递给服务器，以便您从访问日志中了解是哪个客户端调用了此接口。

**公共方法：**

- `getHost()`

    返回当前连接的 Milvus 实例的主机名。

- `getPort()`

    返回当前连接的 Milvus 实例所在的端口号。

- `getAuthorization()`

    返回用于建立当前连接的凭据。

- `getDbName()`

    返回当前正在使用的 Database 名称。

- `isSecure()`

    返回当前连接是否通过 TLS 建立。

- `getProxyAddress()`

    返回在 **[ConnectConfig](./v2-Client-ConnectConfig)** 中指定的代理服务器地址。

## 示例\{#examples}

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

将 **uri** 设置为您的集群 Endpoint。**token** 参数可以是具有足够权限的 Zilliz Cloud API key，也可以是格式为 `username:p@ssw0rd` 的集群用户凭据。

</Admonition>

