---
title: "ConnectParam | Cloud"
slug: /cpp/cpp/Client-ConnectParam
sidebar_label: "ConnectParam"
beta: false
added_since: v2.6.x
last_modified: v3.0.x
deprecate_since: false
notebook: false
description: "このクラスは、`MilvusClient:Connect()` に渡される接続パラメータを保持します。すばやく設定するにはコンストラクターのオーバーロードを使用し、その後、`With()` メソッドをチェーンして TLS、keepalive、タイムアウトなどの詳細設定を構成します。 | Cloud"
type: docx
token: YY8Rd5aoOoeUYbxGqINcOHgjnsb
sidebar_position: 3
keywords: 
  - kNN アルゴリズム
  - HNSW
  - 非構造化データとは
  - ベクトル埋め込み
  - zilliz
  - zilliz cloud
  - クラウド
  - ConnectParam
  - cppv30
displayed_sidebar: cppSidebar

displayed_sidbar: cppSidebar
---

import Admonition from '@theme/Admonition';


# ConnectParam

このクラスは、`MilvusClient::Connect()` に渡される接続パラメータを保持します。すばやく設定するにはコンストラクターのオーバーロードを使用し、その後、`With*()` メソッドをチェーンして TLS、keepalive、タイムアウトなどの詳細設定を構成します。

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

**パラメーター:**

- **uri** (*const std::string&*)

    サーバーのエンドポイントを設定します。ローカルの Milvus には `http://host:port` を指定でき、Zilliz Cloud のエンドポイント URL も指定できます。

- **token** (*const std::string&*)

    Authorization ヘッダーの値を設定します。セルフホストインスタンスでは `"username:password"` を、Zilliz Cloud では Zilliz Cloud API キーを使用します。

- **host** (*std::string*) — *非推奨。代わりに* `uri` *を使用してください*

    Milvus プロキシの IP アドレスまたはホスト名を設定します。

- **port** (*uint16_t*) — *非推奨。代わりに* `uri` *を使用してください*

    Milvus プロキシのポート番号を設定します。

- **username** (*std::string*) — *非推奨。代わりに* `token` *を使用してください*

    認証に使用するユーザー名を設定します。

- **password** (*std::string*) — *非推奨。代わりに* `token` *を使用してください*

    認証に使用するパスワードを設定します。

## リクエスト構文\{#request-syntax}

```c++
ConnectParam param(uri, token)
    .WithConnectTimeout(connect_timeout_ms)
    .WithKeepaliveTimeMs(keepalive_time_ms)
    .WithKeepaliveTimeoutMs(keepalive_timeout_ms)
    .WithKeepaliveWithoutCalls(keepalive_without_calls)
    .WithRpcDeadlineMs(rpc_deadline_ms)
    .WithTls()
    .WithDbName(db_name)
    .WithTelemetryConfig(telemetry_config);
```

**リクエストメソッド:**

- `WithUri(const std::string& uri)`

    サーバーの URI を設定します。コンストラクターで指定した値を上書きします。デフォルト: `"YOUR_CLUSTER_ENDPOINT"`。

- `WithToken(const std::string& token)`

    認証トークンを設定します。このメソッドを呼び出すと、`WithAuthorizations()` で事前に設定したユーザー名/password がリセットされます。

- `WithAuthorizations(std::string username, std::string password)`

    認証に使用するユーザー名とパスワードを設定します。このメソッドを呼び出すと、`WithToken()` で事前に設定したトークンがリセットされます。

- `WithConnectTimeout(uint64_t connect_timeout_ms)`

    gRPC チャネルが `READY` 状態になるまでの待機タイムアウトをミリ秒単位で設定します。デフォルト: `10000`。

- `WithKeepaliveTimeMs(uint64_t keepalive_time_ms)`

    keepalive ping の間隔をミリ秒単位で設定します。デフォルト: `10000`。

- `WithKeepaliveTimeoutMs(uint64_t keepalive_timeout_ms)`

    接続を閉じる前に、keepalive ping の確認応答を待機するタイムアウトをミリ秒単位で設定します。デフォルト: `5000`。

- `WithKeepaliveWithoutCalls(bool keepalive_without_calls)`

    `true` の場合、アクティブな RPC がないときでも keepalive ping が送信されます。デフォルト: `true`。

- `WithRpcDeadlineMs(uint64_t rpc_deadline_ms)`

    1 回の RPC 呼び出しに許可される最大時間をミリ秒単位で設定します。`0` の場合、期限は適用されません。デフォルト: `0`。

- `WithTls()`

    証明書検証を行わずに TLS 暗号化を有効にします。

- `WithTls(const std::string& server_name, const std::string& ca_cert)`

    指定した CA 証明書ファイルのパスを使用してサーバー証明書を検証する TLS を有効にします。

- `WithTls(const std::string& server_name, const std::string& cert, const std::string& key, const std::string& ca_cert)`

    相互 TLS（mTLS）を有効にします。クライアント証明書ファイル、クライアントキーファイル、CA 証明書ファイルのパスを指定します。

- `WithDbName(const std::string& db_name)`

    接続後に使用するデフォルトのデータベースを設定します。デフォルト: `"default"`。

- `WithTelemetryConfig(const TelemetryConfig& config)`

    クライアントのテレメトリ設定を指定します。使用可能な設定については、[TelemetryConfig](./Client-TelemetryConfig) を参照してください。

## 例\{#example}

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
