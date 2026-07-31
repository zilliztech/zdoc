---
title: "MilvusClient | Java | v1"
slug: /java/v1-Connections-MilvusClient
sidebar_label: "MilvusClient"
beta: NEAR DEPRECATE
notebook: FALSE
description: "MilvusClient 是 Milvus 客户端的抽象接口。MilvusServiceClient 类是其实现。 | Java | v1"
type: origin
token: D0cfwvTqMiyhSrkCUv4c1a2Fnjd#MJ3dd20ldo0ZUfxQV7mcDy1on7c
sidebar_position: 1
displayed_sidebar: javaSidebar

---

import Admonition from '@theme/Admonition';


# MilvusClient

MilvusClient 是 Milvus 客户端的抽象接口。MilvusServiceClient 类是其实现。

```java
package io.milvus.client;
MilvusServiceClient(ConnectParam connectParam)
```

MilvusClient 中与连接相关的方法：

<table>
   <tr>
     <th><p><strong>方法</strong></p></th>
     <th><p><strong>说明</strong></p></th>
     <th><p><strong>参数</strong></p></th>
     <th><p><strong>返回值</strong></p></th>
   </tr>
   <tr>
     <td><p>withTimeout(long timeout, TimeUnit timeoutUnit)</p></td>
     <td><p>为 RPC 调用设置超时时间。</p></td>
     <td><p>timeout: 调用方法时的超时时长。</p><p>timeoutUnit: 超时时间的单位。</p></td>
     <td><p>MilvusClient</p></td>
   </tr>
   <tr>
     <td><p>withRetry(RetryParam retryParam)</p></td>
     <td><p>设置重试参数。</p></td>
     <td><p>retryParam: 失败时的重试参数。</p></td>
     <td><p>MilvusClient</p></td>
   </tr>
   <tr>
     <td><p>close(long maxWaitSeconds)</p></td>
     <td><p>使用可配置的超时值断开与 Milvus 服务器的连接。请在应用程序终止前调用此方法。</p><p>如果该方法被中断，将抛出 <code>InterruptedException</code> 异常。</p></td>
     <td><p>maxWaitSeconds: 等待 RPC 通道关闭的超时时长。</p></td>
     <td><p>N/A</p></td>
   </tr>
   <tr>
     <td><p>setLogLevel(LogLevel level)</p></td>
     <td><p>在运行时设置日志级别。</p><p>注意：此方法无法更改由 log4j 配置指定的日志级别。它只能隐藏 MilvusClient 类内部的一些日志。</p></td>
     <td><p>level: 日志级别</p></td>
     <td><p>N/A</p></td>
   </tr>
</table>

#### ConnectParam\{#connectparam}

使用 `ConnectParam.Builder` 为 MilvusClient 构造 `ConnectParam` 对象。

```java
import io.milvus.param.ConnectParam;
ConnectParam.Builder builder = ConnectParam.newBuilder();
```

`ConnectParam.Builder` 的方法：

<table>
    <tr>
        <th><p>方法</p></th>
        <th><p>说明</p></th>
        <th><p>参数</p></th>
    </tr>
    <tr>
        <td><p>withHost(String host)</p></td>
        <td><p>设置主机名或地址。</p></td>
        <td><p>host: 主机名称或地址。</p></td>
    </tr>
    <tr>
        <td><p>withPort(int port)</p></td>
        <td><p>设置连接端口。<br/>该值必须大于零且小于 65536。</p></td>
        <td><p>port: 连接端口。</p></td>
    </tr>
    <tr>
        <td><p>withUri(String uri)</p></td>
        <td><p>设置远程服务的 uri。</p></td>
        <td><p>uri: 远程服务的 uri。</p></td>
    </tr>
    <tr>
        <td><p>withToken(String token)</p></td>
        <td><p>设置远程服务的 token。</p></td>
        <td><p>token: 用作身份识别和认证的密钥。</p></td>
    </tr>
    <tr>
        <td><p>withDatabaseName(String databaseName)</p></td>
        <td><p>设置数据库名称。数据库名称可以为 null，表示默认数据库。</p></td>
        <td><p>databaseName: 数据库名称。</p></td>
    </tr>
    <tr>
        <td><p>withConnectTimeout(long connectTimeout, TimeUnit timeUnit)</p></td>
        <td><p>设置客户端通道的连接超时值。超时值必须大于零。默认值为 10 秒。</p></td>
        <td><p>connectTimeout: 连接超时时长。<br/>timeUnit: 超时时间单位。</p></td>
    </tr>
    <tr>
        <td><p>withKeepAliveTime(long keepAliveTime, TimeUnit timeUnit)</p></td>
        <td><p>设置客户端通道的 keep-alive 时间值。该时间值必须大于零。默认值为 55 秒。</p></td>
        <td><p>keepAliveTime: keep-alive 时长。<br/>timeUnit: 时间单位。</p></td>
    </tr>
    <tr>
        <td><p>withKeepAliveTimeout(long keepAliveTimeout, TimeUnit timeUnit)</p></td>
        <td><p>设置客户端通道的 keep-alive 超时值。超时值必须大于零。默认值为 20 秒。</p></td>
        <td><p>keepAliveTimeout: keep-alive 超时值。<br/>timeUnit: 超时时间单位。</p></td>
    </tr>
    <tr>
        <td><p>keepAliveWithoutCalls(boolean enable)</p></td>
        <td><p>启用客户端通道的 keep-alive 功能。默认值为 false。</p></td>
        <td><p>enable: 布尔值，用于指示是否启用 keep-alive 功能。设置为 true 时启用该功能。</p></td>
    </tr>
    <tr>
        <td><p>secure(boolean enable)<br/>withSecure(boolean enable)</p></td>
        <td><p>为客户端通道启用安全连接。</p></td>
        <td><p>enable: 设置为 true 时启用安全连接。</p></td>
    </tr>
    <tr>
        <td><p>withIdleTimeout(long idleTimeout, TimeUnit timeUnit)</p></td>
        <td><p>设置客户端通道的空闲超时值。超时值必须大于零。默认值为 24 小时。</p></td>
        <td><p>idleTimeout: 客户端通道的空闲超时时长。<br/>timeUnit: 超时时间单位。</p></td>
    </tr>
    <tr>
        <td><p>withRpcDeadline(long deadline, TimeUnit timeUnit)</p></td>
        <td><p>设置你愿意等待服务器回复的截止时间。<br/>设置 deadline 后，客户端在遇到由网络波动引起的快速 RPC 失败时会继续等待。<br/>deadline 值必须大于或等于零。默认值为 0，表示禁用 deadline。</p></td>
        <td><p>deadline: deadline 值<br/>timeUnit: deadline 单位</p></td>
    </tr>
    <tr>
        <td><p>withAuthorization(String username, String password)</p></td>
        <td><p>为此连接设置用户名和密码。</p></td>
        <td><p>username: 当前用户的用户名。<br/>password: 与用户名对应的密码。</p></td>
    </tr>
    <tr>
        <td><p>withClientKeyPath(String clientKeyPath)</p></td>
        <td><p>设置用于 TLS 双向认证的 client.key 路径，仅当 "secure" 为 True 时生效。</p></td>
        <td><p>clientKeyPath: client.key 的本地路径</p></td>
    </tr>
    <tr>
        <td><p>withClientPemPath(String clientPemPath)</p></td>
        <td><p>设置用于 TLS 双向认证的 client.pem 路径，仅当 "secure" 为 True 时生效。</p></td>
        <td><p>clientPemPath: client.pem 的本地路径</p></td>
    </tr>
    <tr>
        <td><p>withCaPemPath(String caPemPath)</p></td>
        <td><p>设置用于 TLS 双向认证的 ca.pem 路径，仅当 "secure" 为 True 时生效。</p></td>
        <td><p>caPemPath: ca.pem 的本地路径</p></td>
    </tr>
    <tr>
        <td><p>withServerPemPath(String serverPemPath)</p></td>
        <td><p>设置用于 TLS 单向认证的 server.pem 路径，仅当 "secure" 为 True 时生效。</p></td>
        <td><p>serverPemPath: server.pem 的本地路径</p></td>
    </tr>
    <tr>
        <td><p>withServerName(String serverName)</p></td>
        <td><p>为 SSL 主机名检查设置目标名称覆盖，仅当 "secure" 为 True 时生效。<br/>注意：该值会传递给 grpc.ssl_target_name_override</p></td>
        <td><p>serverName: SSL 主机的覆盖名称。</p></td>
    </tr>
    <tr>
        <td><p>build()</p></td>
        <td><p>构造一个 ConnectParam 对象。</p></td>
        <td><p>N/A</p></td>
    </tr>
</table>

`ConnectParam.Builder.build()` 可能抛出以下异常：

- ParamException: 参数无效时抛出错误。

#### RetryParam\{#retryparam}

使用 `RetryParam.Builder` 为 `MilvusClient` 构造 RetryParam 对象。

```java
import io.milvus.param.RetryParam;
RetryParam.Builder builder = RetryParam.newBuilder();
```

`RetryParam.Builder` 的方法：

<table>
    <tr>
        <th><p>方法</p></th>
        <th><p>说明</p></th>
        <th><p>参数</p></th>
    </tr>
    <tr>
        <td><p>withMaxRetryTimes(int maxRetryTimes)</p></td>
        <td><p>设置失败时的最大重试次数。默认值为 75。</p></td>
        <td><p>maxRetryTimes: 最大重试次数。</p></td>
    </tr>
    <tr>
        <td><p>withInitialBackOffMs(long initialBackOffMs)</p></td>
        <td><p>设置两次重试之间的首次时间间隔，单位：毫秒。默认值为 10ms。</p></td>
        <td><p>initialBackOffMs: 以毫秒为单位的重试初始间隔值。</p></td>
    </tr>
    <tr>
        <td><p>withMaxBackOffMs(long maxBackOffMs)</p></td>
        <td><p>设置两次重试之间的最大时间间隔，单位：毫秒。默认值为 3000ms。</p></td>
        <td><p>maxBackOffMs: 以毫秒为单位的重试最大间隔值。</p></td>
    </tr>
    <tr>
        <td><p>withBackOffMultiplier(int backOffMultiplier)</p></td>
        <td><p>设置每次重试后增加时间间隔的倍数。默认值为 3。</p></td>
        <td><p>backOffMultiplier: 每次重试后增加时间间隔的倍数。</p></td>
    </tr>
    <tr>
        <td><p>withRetryOnRateLimie(boolean retryOnRateLimie)</p></td>
        <td><p>设置当返回的错误为 rate limit 时是否重试。默认值为 true。</p></td>
        <td><p>retryOnRateLimit: 当返回的错误为 rate limit 时是否重试。</p></td>
    </tr>
    <tr>
        <td><p>build()</p></td>
        <td><p>构造一个 RetryParam 对象。</p></td>
        <td><p>N/A</p></td>
    </tr>
</table>

`RetryParam.Builder.build()` 可能抛出以下异常：

- ParamException: 参数无效时抛出错误。

#### 示例\{#example}

- 不为 RPC 调用设置超时时间：

```java
import io.milvus.param.*;
import io.milvus.client.*;

ConnectParam connectParam = ConnectParam.newBuilder()
    .withHost("localhost")
    .withPort(19530)
    .withAuthorization("root", "Milvus")
    .build();
RetryParam retryParam = RetryParam.newBuilder()
        .withMaxRetryTimes(10)
        .build();
MilvusClient client = new MilvusServiceClient(connectParam).withRetry(retryParam);

ShowCollectionsParam param = ShowCollectionsParam.newBuilder().build()
R<ShowCollectionsResponse> response = client.showCollections(param);

client.close(1);
```

- 为 RPC 调用设置超时时间：

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
