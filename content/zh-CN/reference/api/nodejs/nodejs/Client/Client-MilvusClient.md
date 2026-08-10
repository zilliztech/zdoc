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
  - zilliz
  - zilliz cloud
  - 云
  - MilvusClient
  - nodejs30
displayed_sidebar: nodeSidebar

displayed_sidbar: nodeSidebar
---

import Admonition from '@theme/Admonition';


# MilvusClient

**MilvusClient** 实例表示一个连接到特定 Zilliz Cloud 集群的 Node.js 客户端。

```javascript
new MilvusClient(options:ClientConfig)
```

## 请求语法\{#request-syntax}

```javascript
new MilvusClient(config: ClientConfig)
```

**参数：**

- **configOrAddress** (*string*) -

    **[必需]**

    Zilliz Cloud 集群的地址。例如：

    ```plaintext
    https://inxx-xxxxxxxxxxxxxxxxx.aws-us-west-2.vectordb-uat3.zillizcloud.com:19540
    ```

- **configOrAddress** (*ClientConfig*)

    - **address** (*string*) -

        **[必需]**

        集群 Endpoint。例如：

        ```plaintext
        https://inxx-xxxxxxxxxxxxxxxxx.aws-us-west-2.vectordb-uat3.zillizcloud.com:19540
        ```

    - **_SKIPCONNECT__** (*boolean*) -

        一个布尔值，用于指示是否跳过连接。

    - **channelOptions** (*channelOptions*) -

        gRPC 的附加通道选项。

    - **database** (*string*) -

        要连接的集群 Database 名称。

    - **id** (*string*) -

        要连接的集群 ID。

    - **loaderOptions** (*Options*) -

        将 int64 转换为 Long 格式的选项。可能的值包括：

        - `{ longs: Function }`

            这应是一个将 int64 转换为 Long.js 格式的函数。

        - `{ longs: Number }`

            这会将 int64 转换为 number，从而导致精度损失。

        - `{ longs: String }`

            这会将 int64 转换为 string。这是默认行为。

    - **logLevel** (*string*) -

        日志级别。可用选项包括：`debug`、`info`、`warn`、`error`、`panic` 和 `fatal`。

        默认值为 `debug`。

        建议在测试和开发环境中使用 `debug` 级别，在生产环境中使用 `info` 级别。

    - **logPrefix** (*string*) -

        每条日志记录的前缀。

    - **maxRetries** (*number*) -

        当连接未成功时，重试连接的尝试次数。

    - **option** (*Record&lt;string, string&gt;*) -

        在初始握手期间，发送到 `ConnectRequest` 客户端信息中的保留连接选项。使用此项可向服务器传递任意键值对。

    - **password** (*string*) -

        用于验证连接的用户密码。

    - **pool** (*Options*) -

        通用的轮询选项，遵循 [此仓库](https://github.com/coopernurse/node-pool) 中指定的规则。

    - **protoFilePath** (*protoFilePath*) -

        - **milvus** (*string*) -

        - **schema** (*string*) -

    - **retryDelay** (*number*) -

        重试尝试之间的间隔。

    - **ssl** (*boolean*) -

        一个布尔值，用于指示是否使用 SSL。在 Zilliz Cloud 上始终将其设置为 `true`。

    - **timeout** (*string* | *number*) -

        此操作的超时时长。

        将其设置为 **None** 表示当收到任何响应或发生任何错误时，此操作超时。

    - **tls** (*tls*) -

        - **certChain** (*Buffer*) -

            缓冲区中的证书链。

        - **certChainPath** (*string*) -

            证书链的文件路径。

        - **privateKey** (*Buffer*) -

            缓冲区中的私钥。

        - **privateKeyPath** (*string*) -

            私钥的文件路径。

        - **rootCert** (*Buffer*) -

            缓冲区中的根证书。

        - **rootCertPath** (*string*) -

            根证书的文件路径。

        - **serverName** (*string*) -

            服务器名称。

        - **skipCertCheck** (*boolean*) -

            是否跳过对所提供证书的检查。将其设置为 `true` 表示跳过。

        - **verifyOptions** (*string*) -

            验证选项。

    - **token** (*string*) -

        用于连接的令牌。该令牌可以是 API 密钥，也可以是用冒号连接的用户名和密码组合。

    - **trace** (*boolean*) -

        是否启用追踪。

    - **username** (*string*) -

        用于连接的用户名。

- **ssl** (*boolean*) -

    一个布尔值，用于指示是否使用 SSL。在 Zilliz Cloud 上始终将其设置为 `true`。

- **username** (*string*) -

    用于连接到指定 Zilliz Cloud 集群的有效用户名。

    应与 **password** 一起使用。

- **password** (*string*) -

    用于连接到指定 Zilliz Cloud 集群的有效密码。

    应与 **username** 一起使用。

- **channelOptions** (*channelOptions*) -

    gRPC 的附加通道选项。

**返回** *MilvusClient*

此方法返回一个 Milvus Client 实例，该实例扩展自 GRPC Client，并处理与 Zilliz Cloud 集群的通信。

## 示例\{#example}

```java
new MilvusClient(config: ClientConfig)
```

<Admonition type="info" icon="📘" title="Notes">

- 将 **configOrAddress** 设置为您的集群 Endpoint。您可以在 Zilliz Cloud 控制台的 Cluster details 中找到相关信息。

</Admonition>

