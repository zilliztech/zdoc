---
title: "ConnectParam | Cloud"
slug: /cpp/cpp/Client-ConnectParam
sidebar_label: "ConnectParam"
beta: false
added_since: v2.6.x
last_modified: false
deprecate_since: false
notebook: false
description: "此类用于保存传递给 `MilvusClient:Connect()` 的连接参数。您可以通过构造函数重载快速完成配置，并通过链式调用 `With()` 方法设置 TLS、keepalive 和超时等高级选项。 | Cloud"
type: docx
token: VMgPdyPGuor1t7xlZGWcWV1tnhh
sidebar_position: 3
keywords: 
  - knn algorithm
  - HNSW
  - What is unstructured data
  - Vector embeddings
  - zilliz
  - zilliz cloud
  - cloud
  - ConnectParam
  - cppv30
displayed_sidebar: cppSidebar

displayed_sidbar: cppSidebar
---

import Admonition from '@theme/Admonition';


# ConnectParam

此类用于保存传递给 `MilvusClient::Connect()` 的连接参数。您可以通过构造函数重载快速完成配置，并通过链式调用 `With*()` 方法设置 TLS、keepalive 和超时等高级选项。

```c++
// Recommended: URI only (no authentication)
explicit ConnectParam(const std::string& uri);

// Recommended: URI + token
ConnectParam(const std::string& uri, const std::string& token);

// Deprecated: host/port constructors (replaced by URI-based constructors above)
ConnectParam(std::string host, uint16_t port);
ConnectParam(std::string host, uint16_t port, const std::string& token);
ConnectParam(std::string host, uint16_t port, std::string username, std::string password);
```

**参数：**

- **uri** (*const std::string&*)

    设置服务器 Endpoint，支持用于本地 Milvus 的 `http://host:port` 或 Zilliz Cloud Endpoint URL。

- **token** (*const std::string&*)

    设置授权请求头的值。自托管实例请使用 `"username:password"`，或使用 Zilliz Cloud API 密钥。

- **host** (*std::string*) — *已弃用，请改用* `uri`

    设置 Milvus 代理的 IP 地址或主机名。

- **port** (*uint16_t*) — *已弃用，请改用* `uri`

    设置 Milvus 代理的端口。

- **username** (*std::string*) — *已弃用，请改用* `token`

    设置身份验证用户名。

- **password** (*std::string*) — *已弃用，请改用* `token`

    设置身份验证密码。

## 请求语法\{#request-syntax}

```c++
ConnectParam param(uri, token)
    .WithConnectTimeout(connect_timeout_ms)
    .WithKeepaliveTimeMs(keepalive_time_ms)
    .WithKeepaliveTimeoutMs(keepalive_timeout_ms)
    .WithKeepaliveWithoutCalls(keepalive_without_calls)
    .WithRpcDeadlineMs(rpc_deadline_ms)
    .WithTls()
    .WithDbName(db_name);
```

**请求方法：**

- `WithUri(const std::string& uri)`

    设置服务器 URI，将覆盖构造函数中传入的值。默认值：`"YOUR_CLUSTER_ENDPOINT"`。

- `WithToken(const std::string& token)`

    设置授权令牌。调用此方法将重置此前通过 `WithAuthorizations()` 设置的用户名/password。

- `WithAuthorizations(std::string username, std::string password)`

    设置身份验证用户名和密码。调用此方法将重置此前通过 `WithToken()` 设置的令牌。

- `WithConnectTimeout(uint64_t connect_timeout_ms)`

    等待 gRPC 通道进入 `READY` 状态的超时时间（毫秒）。默认值：`10000`。

- `WithKeepaliveTimeMs(uint64_t keepalive_time_ms)`

    keepalive ping 的发送间隔（毫秒）。默认值：`10000`。

- `WithKeepaliveTimeoutMs(uint64_t keepalive_timeout_ms)`

    关闭连接前等待 keepalive ping 确认的超时时间（毫秒）。默认值：`5000`。

- `WithKeepaliveWithoutCalls(bool keepalive_without_calls)`

    当设置为 `true` 时，即使没有活跃的 RPC 也会发送 keepalive ping。默认值：`true`。

- `WithRpcDeadlineMs(uint64_t rpc_deadline_ms)`

    单次 RPC 调用的最大允许时长（毫秒）。值为 `0` 表示不设置截止时间。默认值：`0`。

- `WithTls()`

    启用 TLS 加密，但不验证证书。

- `WithTls(const std::string& server_name, const std::string& ca_cert)`

    使用指定的 CA 证书文件路径启用 TLS 并验证服务器证书。

- `WithTls(const std::string& server_name, const std::string& cert, const std::string& key, const std::string& ca_cert)`

    启用双向 TLS (mTLS)。需提供客户端证书文件、客户端密钥文件和 CA 证书文件的路径。

- `WithDbName(const std::string& db_name)`

    设置连接后使用的默认 Database。默认值：`"default"`。

## 示例\{#example}

```c++
#include "milvus/MilvusClientV2.h"
#include <milvus/MilvusClientV2.h>
using namespace milvus;

// Connect to a local Milvus instance
ConnectParam param("YOUR_CLUSTER_ENDPOINT");
param.WithAuthorizations("root", "Milvus");

// Connect to Zilliz Cloud
// ConnectParam param("https://your-instance.zilliz.com", "your-api-key");

auto client = MilvusClientV2::Create();
auto status = client->Connect(param);
if (!status.IsOk()) {
    std::cerr << "Connect failed: " << status.Message() << std::endl;
    return 1;
}
```
