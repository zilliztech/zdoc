---
title: "MilvusClient | Node.js"
slug: /node/node/Client-MilvusClient
sidebar_label: "MilvusClient"
beta: false
added_since: v2.3.x
last_modified: v2.6.x
deprecate_since: false
notebook: false
description: "MilvusClient 实例表示一个连接到特定 Zilliz Cloud 集群的 Node.js 客户端。 | Node.js"
type: docx
token: DsyLdmJr0o7FAfxwPcNct1Bqnth
sidebar_position: 5
keywords: 
  - 词法搜索
  - 最近邻搜索
  - Agentic RAG
  - RAG LLM 架构
  - Zilliz
  - Zilliz Cloud
  - 云
  - MilvusClient
  - nodejs30
displayed_sidebar: nodeSidebar

---

import Admonition from '@theme/Admonition';

# MilvusClient

一个 **MilvusClient** 实例表示一个连接到特定 Milvus 实例的 Node.js 客户端。

```javascript
new MilvusClient(options:ClientConfig)
```

## 请求语法\{#request-syntax}

```javascript
new MilvusClient(config: ClientConfig)
```

**参数：**

- **configOrAddress** （*string*） -

    **[必需]**

    Milvus 实例的地址。例如：

    ```javascript
    https://inxx-xxxxxxxxxxxxxxxxx.aws-us-west-2.vectordb-uat3.zillizcloud.com:19540
    ```

- **configOrAddress** （*ClientConfig*）

    - **address** （*string*） -

        **[必需]**

        集群 Endpoint。例如：

        ```javascript
        https://inxx-xxxxxxxxxxxxxxxxx.aws-us-west-2.vectordb-uat3.zillizcloud.com:19540
        ```

    - **__SKIP_CONNECT__** （*boolean*） -

        一个布尔值，指示是否跳过连接。

    - **channelOptions** （*channelOptions*） -

        gRPC 的附加通道选项。

    - **Database** （*string*） -

        要连接的集群 Database 名称。

    - **id** （*string*） -

        要连接的集群 ID。

    - **loaderOptions** （*Options*） -

        将 int64 转换为 Long 格式的选项。可选值如下：

        - `{ longs: Function }`

            该值应是一个将 int64 转换为 Long.js 格式的函数。

        - `{ longs: Number }`

            该值会将 int64 转换为数字，从而导致精度损失。

        - `{ longs: String }`

            该值会将 int64 转换为字符串。这是默认行为。

    - **logLevel** （*string*） -

        日志的级别。可选值包括：`debug`、`info`、`warn`、`error`、`panic` 和 `fatal`。

        该值默认为 `debug`。

        建议在测试和开发环境中使用 `debug` 级别，在生产环境中使用 `info` 级别。

    - **logPrefix** （*string*） -

        每条日志条目的前缀。

    - **maxRetries** （*number*） -

        连接不成功时重试连接的次数。

    - **option** （*Record&lt;string, string&gt;*） -

        在 `ConnectRequest` 客户端信息中发送的保留连接选项。您可以使用此选项在初始握手期间向服务器传递任意键值对。

    - **password** （*string*） -

        用于对连接进行身份验证的用户密码。

    - **pool** （*Options*） -

        通用轮询选项，遵循[此仓库](https://github.com/coopernurse/node-pool)中规定的规则。

    - **retryDelay** （*number*） -

        重试尝试之间的间隔。

    - **ssl** （*boolean*） -

        指示是否使用 SSL 的布尔值。如果您已将 Milvus 配置为在 TLS Endpoint 上工作，请将其设置为 `true`。详细信息请参见 [传输加密](https://milvus.io/docs/tls.md)。

        在 Zilliz Cloud 上，始终通过 TLS 连接：传入带 `https://` 的集群 Endpoint（SDK 会自动启用 TLS），或者当 Endpoint 不包含协议方案时，将 `ssl` 设置为 `true`。

    - **timeout** （*string* | *number*） -

        此操作的超时持续时间。

        将其设置为 **None** 表示当收到任意响应或发生错误时，此操作即超时。

    - **tls** （*tls*） -

        - **certChain** （*Buffer*） -

            缓冲区中的证书链。

        - **certChainPath** （*string*） -

            证书链的文件路径。

        - **privateKey** （*Buffer*） -

            缓冲区中的私钥。

        - **privateKeyPath** （*string*） -

            私钥的文件路径。

        - **rootCert** （*Buffer*） -

            缓冲区中的根证书。

        - **rootCertPath** （*string*） -

            根证书的文件路径。

        - **serverName** （*string*） -

            服务器名称。

        - **skipCertCheck** （*boolean*） -

            是否跳过对所提供的证书的检查。将其设置为 `true` 表示跳过。

        - **verifyOptions** （*Record&lt;string, any&gt;*） -

            验证选项。

    - **token** （*string*） -

        用于连接的访问令牌。该访问令牌可以是 API key，也可以是由用户名和密码组成并以冒号分隔的组合。

    - **trace** （*boolean*） -

        是否启用跟踪。

    - **telemetry** （*TelemetryConfig*） -

        客户端指标、心跳和服务器推送命令的配置。

    - **isGlobal** （*boolean*） -

        是否启用全局集群模式。当设置为 **true** 时，SDK 会从 Endpoint 获取集群拓扑，并将请求路由到主集群。如果省略此参数，则会从地址 URI 自动检测该模式。

    - **username** （*string*） -

        用于连接的用户名。

- **ssl** （*boolean*） -

    指示是否使用 SSL 的布尔值。如果您已将 Milvus 配置为在 TLS Endpoint 上工作，请将其设置为 `true`。详细信息请参见 [传输加密](https://milvus.io/docs/tls.md)。

    在 Zilliz Cloud 上，始终通过 TLS 连接：传入带 `https://` 的集群 Endpoint（SDK 会自动启用 TLS），或者当 Endpoint 不包含协议方案时，将 `ssl` 设置为 `true`。

- **username** （*string*） -

    用于连接指定 Milvus 实例的有效用户名。

    如果目标 Milvus 实例已启用身份验证，请使用此参数。要启用身份验证，请参见 [用户访问认证](https://milvus.io/docs/authenticate.md)。

    此参数应与 **password** 一起使用。

- **password** （*string*） -

    用于连接指定 Milvus 实例的有效密码。

    如果目标 Milvus 实例已启用身份验证，请使用此参数。要启用身份验证，请参见 [用户访问认证](https://milvus.io/docs/authenticate.md)。

    此参数应与 **username** 一起使用。

- **channelOptions** （*channelOptions*） -

    gRPC 的附加通道选项。

**方法：**

- `static get sdkInfo`

    返回 `{ version, recommendMilvus }`，即构建时生成的 SDK 版本和推荐的 Milvus 版本。

- `session(clusterId: string): MilvusClientSession`

    创建一个固定到目标集群 ID 的轻量级 DQL 会话。该会话会复用此客户端的连接，并将 `cluster_id` 注入 `search`、`hybridSearch`、`searchIterator`、`query`、`queryIterator` 和 `get` 请求。请参见 [session()](./Client-session)。

- `createCollection(data): Promise<ResStatus>`

    高级 Collection 创建方法，它会根据 `collection_name` 和 `dimension` 构建默认 Schema，并可选择创建索引和加载 Collection。

- 所有其他操作（例如 `insert`、`search`、`query`、`createIndex`、`loadCollection`）均继承自底层 GRPC 客户端。

**返回：**

*MilvusClient*

此方法返回一个继承自 GRPC Client 并负责与 Milvus 服务器通信的 Milvus Client 实例。

## 示例\{#example}

```javascript
new MilvusClient(config: ClientConfig)
```

<Admonition type="info" title="Notes">

- 将 **configOrAddress** 设置为您的集群 Endpoint。您可以在 Zilliz Cloud 控制台的 Cluster details 中找到相关信息。

</Admonition>
