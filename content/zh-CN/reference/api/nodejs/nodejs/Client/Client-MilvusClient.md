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

**MilvusClient** 实例表示一个连接到特定 Zilliz Cloud 集群的 Node.js 客户端。

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

    Zilliz Cloud 集群的地址。例如：

    ```plaintext
    https://inxx-xxxxxxxxxxxxxxxxx.aws-us-west-2.vectordb-uat3.zillizcloud.com:19540
    ```

- **configOrAddress** （*ClientConfig*）

    - **address** （*string*） -

        **[必需]**

        集群 Endpoint。例如：

        ```plaintext
        https://inxx-xxxxxxxxxxxxxxxxx.aws-us-west-2.vectordb-uat3.zillizcloud.com:19540
        ```

    - **_SKIPCONNECT__** （*boolean*） -

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

    - **protoFilePath** （*protoFilePath*） -

        - **milvus** （*string*） -

        - **Schema** （*string*） -

    - **retryDelay** （*number*） -

        重试尝试之间的间隔。

    - **ssl** （*boolean*） -

        一个布尔值，指示是否使用 SSL。在 Zilliz Cloud 上，请始终将其设置为 `true`。

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

        - **verifyOptions** （*string*） -

            验证选项。

    - **token** （*string*） -

        用于连接的访问令牌。该访问令牌可以是 API key，也可以是由用户名和密码组成并以冒号分隔的组合。

    - **trace** （*boolean*） -

        是否启用跟踪。

    - **username** （*string*） -

        用于连接的用户名。

- **ssl** （*boolean*） -

    一个布尔值，指示是否使用 SSL。在 Zilliz Cloud 上，请始终将其设置为 `true`。

- **username** （*string*） -

    用于连接指定 Zilliz Cloud 集群的有效用户名。

    此参数应与 **password** 一起使用。

- **password** （*string*） -

    用于连接指定 Zilliz Cloud 集群的有效密码。

    此参数应与 **username** 一起使用。

- **channelOptions** （*channelOptions*） -

    gRPC 的附加通道选项。

**返回：** *MilvusClient*

此方法返回一个扩展了 GRPC Client 并负责与 Zilliz Cloud 集群通信的 Milvus Client 实例。

## 示例\{#example}

```java
new MilvusClient(config: ClientConfig)
```

<Admonition type="info" title="Notes">

- 将 **configOrAddress** 设置为您的集群 Endpoint。您可以在 Zilliz Cloud 控制台的 Cluster details 中找到相关信息。

</Admonition>

