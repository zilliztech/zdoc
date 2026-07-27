---
title: "ClientConfig | Go | v2"
slug: /go/go/v2-Client-ClientConfig
sidebar_label: "ClientConfig"
beta: false
added_since: v2.6.x
last_modified: v3.0.x
deprecate_since: false
notebook: false
description: "認証、TLS、リトライ、テレメトリ、データベース、gRPC authority の設定を含む、Milvus v3 クライアント接続を構成します。 | Go | v2"
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

認証、TLS、リトライ、テレメトリ、データベース、gRPC authority の設定を含む、Milvus v3 クライアント接続を構成します。

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

**METHODS:**

- `WithTLSConfig(tlsConfig *tls.Config) *ClientConfig`

    これはカスタム TLS 設定を行い、TLS 認証を有効にします。

- `WithGrpcAuthority(authority string) *ClientConfig`

    これはプロキシベースのルーティングのために gRPC `:authority` ヘッダーを設定します。デフォルトの dial オプションはクライアントによって別途適用されます。

**RETURN TYPE:**

*ClientConfig*

**RETURNS:**

アドレス、認証、TLS、データベース、gRPC オプションを含む、Milvus クライアントを作成するための設定です。

- **Address** (*string*) -

    リモートアドレス。"YOUR_CLUSTER_ENDPOINT"。

- **Username** (*string*) -

    認証用のユーザー名。

- **Password** (*string*) -

    認証用のパスワード。

- **DBName** (*string*) -

    このクライアントの DBName。

- **EnableTLSAuth** (*bool*) -

    転送セキュリティのために TLS Auth を有効にします。

- **APIKey** (*string*) -

    API key。

- **DialOptions** (*[]grpc.DialOption*) -

    GRPC の dial オプション。

- **RetryRateLimit** (**RetryRateLimitOption*) -

    レート制限インターセプターでのリトライ用オプション。

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

- `TelemetryConfig` は v3 クライアントにおけるクライアントのテレメトリ動作を制御します。

