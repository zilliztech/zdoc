---
title: "ClientConfig | Go | v2"
slug: /go/go/v2-Client-ClientConfig
sidebar_label: "ClientConfig"
beta: false
added_since: v2.6.x
last_modified: false
deprecate_since: false
notebook: false
description: "この操作は、Milvus または Zilliz Cloud サーバーへの接続を確立するための設定を提供します。`New()` を呼び出す際に、この struct へのポインタを渡してください。 | Go | v2"
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

この操作は、Milvus または Zilliz Cloud サーバーへの接続を確立するための設定を提供します。`New()` を呼び出す際に、この struct へのポインタを渡してください。

```go
type ClientConfig struct {
    Address        string
    Username       string
    Password       string
    DBName         string
    EnableTLSAuth  bool
    APIKey         string
    DialOptions    []grpc.DialOption
    RetryRateLimit *RetryRateLimitOption
    DisableConn    bool
    ServerVersion  string
}
```

**PARAMETERS:**

- **Address** (*string*) -
[必須] `host:port` 形式の Milvus サーバーのアドレスです（例: `YOUR_CLUSTER_ENDPOINT`）。Zilliz Cloud の場合は、完全な HTTPS エンドポイントを使用します。

- **Username** (*string*) -
パスワードベース認証用のユーザー名です。

- **Password** (*string*) -
パスワードベース認証用のパスワードです。

- **DBName** (*string*) -
接続先データベースの名前です。設定されていない場合は、デフォルトデータベースを使用します。

- **EnableTLSAuth** (*bool*) -
接続で TLS を有効にするかどうかを指定します。アドレスが `https` スキームを使用している場合は、自動的に `true` に設定されます。

- **APIKey** (*string*) -
Zilliz Cloud または認証が有効な Milvus インスタンス用の API key です。クラウドデプロイでは、ユーザー名/パスワードより優先されます。

- **DialOptions** ([]*grpc.DialOption*) -
接続をカスタマイズするための追加の gRPC ダイヤルオプションです。指定した場合、デフォルトオプションとマージされます。

- **RetryRateLimit** (*RetryRateLimitOption*) -
レート制限エラー発生時の自動再試行の設定です。

- **DisableConn** (*bool*) -
`true` の場合、クライアントは即座に接続を確立しません。テストや遅延接続のシナリオで役立ちます。

- **ServerVersion** (*string*) -
接続先サーバーのバージョン文字列です。接続後に自動的に設定されます。

**BUILDER METHODS:**

- `WithTLSConfig(tlsConfig *tls.Config)`
セキュアな接続のためのカスタム TLS 設定を行います。

- `WithGrpcAuthority(authority string)`
接続用の gRPC authority ヘッダーを設定します。プロキシやロードバランサー経由で接続する場合に便利です。

**RETURN TYPE:**

*ClientConfig*

**RETURNS:**

メソッドチェーンのために更新された `ClientConfig` へのポインタです。

## Example\{#example}

```go
import (
	"context"
	"log"

	"github.com/milvus-io/milvus/client/v2/milvusclient"
)

ctx, cancel := context.WithCancel(context.Background())
defer cancel()

// Connect with username/password
client, err := milvusclient.New(ctx, &milvusclient.ClientConfig{
    Address:  "YOUR_CLUSTER_ENDPOINT",
    Username: "root",
    Password: "Milvus",
    DBName:   "default",
})
if err != nil {
    log.Fatal("failed to create client:", err)
}
defer client.Close(ctx)

// Connect to Zilliz Cloud with API key
cloudClient, err := milvusclient.New(ctx, &milvusclient.ClientConfig{
    Address: "https://your-endpoint.api.gcp-us-west1.zillizcloud.com:443",
    APIKey:  "your-api-key",
})
if err != nil {
    log.Fatal("failed to create cloud client:", err)
}
```
