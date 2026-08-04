---
title: "ClientConfig | Go | v2"
slug: /go/go/v2-Client-ClientConfig
sidebar_label: "ClientConfig"
beta: false
added_since: v2.6.x
last_modified: v3.0.x
deprecate_since: false
notebook: false
description: "認証、TLS、再試行、テレメトリ、データベース、および gRPC authority 設定を含む、Milvus v3 クライアント接続を構成します。 | Go | v2"
type: docx
token: NNQmdw1DloRDi6xeO0acaMfdnib
sidebar_position: 1
keywords: 
  - 最近傍探索
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

認証、TLS、再試行、テレメトリ、データベース、および gRPC authority 設定を含む、Milvus v3 クライアント接続を構成します。

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

**メソッド:**

- `WithTLSConfig(tlsConfig *tls.Config) *ClientConfig`

    これにより、カスタム TLS 構成を設定し、TLS 認証を有効にします。

- `WithGrpcAuthority(authority string) *ClientConfig`

    これにより、プロキシベースのルーティング用に gRPC `:authority` ヘッダーを設定します。デフォルトのダイヤルオプションは、クライアントによって別途適用されます。

**戻り値の型:**

*ClientConfig*

**戻り値:**

アドレス、認証、TLS、データベース、および gRPC オプションを含む、Milvus クライアントを作成するための構成です。

- **Address** (*string*) -

    リモートアドレス、"YOUR_CLUSTER_ENDPOINT"。

- **Username** (*string*) -

    認証用のユーザー名。

- **Password** (*string*) -

    認証用のパスワード。

- **DBName** (*string*) -

    このクライアントの DBName。

- **EnableTLSAuth** (*bool*) -

    転送セキュリティのために TLS 認証を有効にします。

- **APIKey** (*string*) -

    API key。

- **DialOptions** (*[]grpc.DialOption*) -

    GRPC 用のダイヤルオプション。

- **RetryRateLimit** (**RetryRateLimitOption*) -

    レート制限インターセプター時の再試行用オプション。

- **DisableConn** (*bool*) -

    true に設定すると、クライアントが gRPC 接続を確立しないようにします。

- **TelemetryConfig** (**TelemetryConfig*) -

    クライアントのテレメトリ設定を構成します。

- **ServerVersion** (*string*) -

    ServerVersion。

## Example\{#example}

ClientConfig の使用方法を示します。

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

## Notes\{#notes}

- `TelemetryConfig` は、v3 クライアントにおけるクライアントテレメトリの動作を制御します。

