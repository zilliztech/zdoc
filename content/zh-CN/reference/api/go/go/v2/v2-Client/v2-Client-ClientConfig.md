---
title: "ClientConfig | Go | v2"
slug: /go/go/v2-Client-ClientConfig
sidebar_label: "ClientConfig"
beta: false
added_since: v2.6.x
last_modified: v3.0.x
deprecate_since: false
notebook: false
description: "配置 Milvus v3 客户端连接，包括身份验证、TLS、重试、遥测、数据库和 gRPC authority 设置。 | Go | v2"
type: docx
token: NNQmdw1DloRDi6xeO0acaMfdnib
sidebar_position: 1
keywords: 
  - nearest neighbor search
  - Agentic RAG
  - rag llm architecture
  - private llms
  - zilliz
  - zilliz cloud
  - cloud
  - ClientConfig
  - gov230
displayed_sidebar: goSidebar

displayed_sidbar: goSidebar
---

import Admonition from '@theme/Admonition';


# ClientConfig

配置 Milvus v3 客户端连接，包括身份验证、TLS、重试、遥测、数据库和 gRPC authority 设置。

```go
type ClientConfig struct {
    Address string
    Username string
    Password string
    DBName string
    EnableTLSAuth bool
    APIKey string
    DialOptions []grpc.DialOption
    RetryRateLimit *RetryRateLimitOption
    DisableConn bool
    TelemetryConfig *TelemetryConfig
    ServerVersion string
}
```

**方法：**

- `WithTLSConfig(tlsConfig *tls.Config) *ClientConfig`

    此方法用于设置自定义 TLS 配置并启用 TLS 身份验证。

- `WithGrpcAuthority(authority string) *ClientConfig`

    此方法用于为基于代理的路由设置 gRPC `:authority` 标头；默认的拨号选项由客户端单独应用。

**返回类型：**

*ClientConfig*

**返回：**

用于创建 Milvus 客户端的配置，包括地址、身份验证、TLS、数据库和 gRPC 选项。

- **Address** (*string*) -

    远程地址，即 `"YOUR_CLUSTER_ENDPOINT"`。

- **Username** (*string*) -

    用于身份验证的用户名。

- **Password** (*string*) -

    用于身份验证的密码。

- **DBName** (*string*) -

    此客户端使用的 DBName。

- **EnableTLSAuth** (*bool*) -

    启用 TLS 身份验证以确保传输安全。

- **APIKey** (*string*) -

    API 密钥。

- **DialOptions** (*[]grpc.DialOption*) -

    GRPC 的拨号选项。

- **RetryRateLimit** (**RetryRateLimitOption*) -

    用于在速率限制拦截器上进行重试的选项。

- **DisableConn** (*bool*) -

    设置为 true 时，将阻止客户端建立 gRPC 连接。

- **TelemetryConfig** (**TelemetryConfig*) -

    用于配置客户端遥测设置。

- **ServerVersion** (*string*) -

    ServerVersion。

## 示例\{#example}

演示 ClientConfig 的用法。

```go
import (
	"context"

	"github.com/milvus-io/milvus/client/v3/milvusclient"
)

ctx, cancel := context.WithCancel(context.Background())
defer cancel()

config := (&milvusclient.ClientConfig{
	Address: "YOUR_CLUSTER_ENDPOINT",
}).WithGrpcAuthority("milvus.example.com")

cli, err := milvusclient.New(ctx, config)
if err != nil {
	// handle error
}
defer cli.Close(ctx)
```

## 说明\{#notes}

- `TelemetryConfig` 用于控制 v3 客户端中的客户端遥测行为。

