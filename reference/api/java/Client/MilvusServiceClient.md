---
displayed_sidebar: referenceSidebar
sidebar_position: 0
slug: /java/milvus_service_client
---

# MilvusServiceClient

调用接口创建 MilvusClient 实例。

```java
package io.milvus.client;

MilvusServiceClient(ConnectParam connectParam)
```

## 请求示例

- 调用接口创建 MilvusClient 实例：

    ```java
    import io.milvus.param.*;
    import io.milvus.client.*;

    ConnectParam connectParam = ConnectParam.newBuilder()
        .withHost("localhost")
        .withPort(19530)
        .withAuthorization("root", "Milvus")
        .build();
    MilvusClient client = new MilvusServiceClient(connectParam);

    ShowCollectionsParam param = ShowCollectionsParam.newBuilder().build()
    R<ShowCollectionsResponse> response = client.showCollections(param);

    client.close(1);
    ```

- 调用接口创建 MilvusClient 实例，并指定超时时间：

    ```java
    import io.milvus.param.*;
    import io.milvus.client.*;
    import java.util.concurrent.TimeUnit;

    ConnectParam connectParam = ConnectParam.newBuilder()
        .withHost("localhost")
        .withPort(19530)
        .withAuthorization("root", "Milvus")
        .build();
    MilvusClient client = new MilvusServiceClient(connectParam);

    ShowCollectionsParam param = ShowCollectionsParam.newBuilder().build()
    R<ShowCollectionsResponse> response = client.withTimeout(2, TimeUnit.SECONDS).showCollections(param);

    client.close(1);
    ```

## ConnectParam

使用 `ConnectParam.Builder` 为 `MilvusServiceClient` 构造 `ConnectParam` 对象。

```java
import io.milvus.param.ConnectParam;
ConnectParam.Builder builder = ConnectParam.newBuilder();
```

`ConnectParam.Builder` 方法：

| 方法                                                       | 描述                                                  | 参数                                                   |
| ------------------------------------------------------------ | ------------------------------------------------------------ | ------------------------------------------------------------ |
| `withHost(String host)`                                      | 设置主机名称或地址。                               | `host`：主机名称或地址。                     |
| `withPort(int port)`                                         | 设置连接端口。 该值必须大于 0 且小于 65536。 | `port`：连接端口。                                 |
| `withConnectTimeout(long connectTimeout, TimeUnit timeUnit)` | 设置客户端通道的连接超时值。 超时值必须大于 0。 | <li>`connectTimeout`：连接超时值。</li> <li>`timeUnit`：超时单位。</li> |
| `withKeepAliveTime(long keepAliveTime, TimeUnit timeUnit)`   | 设置客户端通道的保活超时值。 超时值必须大于 0。 | <li><code>keepAliveTime</code>: 保活超时值。</li><li><code>timeUnit</code>：保活超时值。</li> |
| `keepAliveWithoutCalls(boolean enable)`                      | 启用客户端通道保活功能。      | 是否启用保活功能。 如果该值设置为 `true`，则启用保活功能。 |
| `secure(boolean enable) withSecure(boolean enable)`          | 启用客户端通道的安全性。                     | 如果该值设置为 `true`，则启用安全性。 |
| `withIdleTimeout(long idleTimeout, TimeUnit timeUnit)`       | 设置客户端通道的空闲超时值。 超时值必须大于 0。 | <li>`idleTimeout`：客户端通道空闲超时时间。</li> <li>`timeUnit`：超时单位。</li> |
| `withAuthorization(String username, String password)`        | 设置此连接的用户名和密码。          | <li><code>username</code>：当前用户的用户名。</li><li><code>password</code>：当前用户的用户名密码。</li> |
| `build()`                                                    | 构建 `ConnectParam` 对象。                         | N/A                                                          |

`ConnectParam.Builder.build()` 可能抛出以下异常：

- `ParamException`：如果指定参数为无效参数则抛出此异常。