---
title: "ConnectParam | Cloud"
slug: /cpp/cpp/Client-ConnectParam
sidebar_label: "ConnectParam"
beta: false
added_since: v2.6.x
last_modified: false
deprecate_since: false
notebook: false
description: "このクラスは、`MilvusClient:Connect()` に渡される接続パラメータを保持します。コンストラクタのオーバーロードで簡易設定を行った後、`With()` メソッドをチェーンして TLS、keepalive、タイムアウトなどの詳細設定を行えます。 | Cloud"
type: docx
token: VMgPdyPGuor1t7xlZGWcWV1tnhh
sidebar_position: 3
keywords: 
  - knn algorithm
  - HNSW
  - What is unstructured data
  - ベクトル embeddings
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

このクラスは、`MilvusClient::Connect()` に渡される接続パラメータを保持します。コンストラクタのオーバーロードで簡易設定を行った後、`With*()` メソッドをチェーンして TLS、keepalive、タイムアウトなどの詳細設定を行えます。

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

**パラメータ:**

- **uri** (*const std::string&*)

    サーバーのエンドポイントを設定します。ローカルの Milvus には `http://host:port` を指定でき、Zilliz Cloud のエンドポイント URL も指定できます。

- **token** (*const std::string&*)

    Authorization ヘッダーの値を設定します。セルフホスト環境では `"username:password"` を、Zilliz Cloud では Zilliz Cloud API キーを使用します。

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
    .WithDbName(db_name);
```

**リクエスト メソッド:**

- `WithUri(const std::string& uri)`

    サーバーの URI を設定します。コンストラクタで指定した値を上書きします。デフォルト: `"YOUR_CLUSTER_ENDPOINT"`。

- `WithToken(const std::string& token)`

    認証トークンを設定します。このメソッドを呼び出すと、`WithAuthorizations()` で事前に設定されたユーザー名/passwordがリセットされます。

- `WithAuthorizations(std::string username, std::string password)`

    認証用のユーザー名とパスワードを設定します。このメソッドを呼び出すと、`WithToken()` で事前に設定されたトークンがリセットされます。

- `WithConnectTimeout(uint64_t connect_timeout_ms)`

    gRPC チャネルが `READY` 状態になるまでの待機タイムアウト（ミリ秒単位）。デフォルト: `10000`。

- `WithKeepaliveTimeMs(uint64_t keepalive_time_ms)`

    keepalive ping の送信間隔（ミリ秒単位）。デフォルト: `10000`。

- `WithKeepaliveTimeoutMs(uint64_t keepalive_timeout_ms)`

    keepalive ping の応答待ちタイムアウト（ミリ秒単位）。この時間内に応答がない場合、接続を閉じます。デフォルト: `5000`。

- `WithKeepaliveWithoutCalls(bool keepalive_without_calls)`

    `true` に設定すると、アクティブな RPC がなくても keepalive ping を送信します。デフォルト: `true`。

- `WithRpcDeadlineMs(uint64_t rpc_deadline_ms)`

    単一 RPC 呼び出しの最大許容時間（ミリ秒単位）。`0` を指定すると期限は設けられません。デフォルト: `0`。

- `WithTls()`

    証明書検証を行わずに TLS 暗号化を有効にします。

- `WithTls(const std::string& server_name, const std::string& ca_cert)`

    指定した CA 証明書ファイルパスを使用してサーバー証明書を検証し、TLS を有効にします。

- `WithTls(const std::string& server_name, const std::string& cert, const std::string& key, const std::string& ca_cert)`

    相互 TLS（mTLS）を有効にします。クライアント証明書ファイル、クライアントキーファイル、および CA 証明書ファイルのパスを指定してください。

- `WithDbName(const std::string& db_name)`

    接続後に使用するデフォルトのデータベースを設定します。デフォルト: `"default"`。

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
