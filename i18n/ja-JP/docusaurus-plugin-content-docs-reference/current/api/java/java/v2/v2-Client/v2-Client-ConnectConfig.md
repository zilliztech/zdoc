---
title: "ConnectConfig | Java | v2"
slug: /java/java/v2-Client-ConnectConfig
sidebar_label: "ConnectConfig"
beta: false
added_since: v2.6.x
last_modified: v3.0.x
deprecate_since: false
notebook: false
description: "ConnectConfig インスタンスは、`MilvusClientV2` を作成するときに使用する接続設定を保持します。ビルダーパターンを使用して、認証、TLS、タイムアウト、keepalive 設定を含むすべての接続パラメーターを構成します。 | Java | v2"
type: docx
token: ErNidktYPodbDxxow0xcV5qHnof
sidebar_position: 5
keywords: 
  - Pinecone ベクトルデータベース
  - 音声検索
  - セマンティック検索とは
  - 埋め込みモデル
  - zilliz
  - zilliz cloud
  - クラウド
  - ConnectConfig
  - javaV230
displayed_sidebar: javaSidebar

---

import Admonition from '@theme/Admonition';


# ConnectConfig

ConnectConfig インスタンスは、`MilvusClientV2` を作成するときに使用する接続設定を保持します。ビルダーパターンを使用して、認証、TLS、タイムアウト、keepalive 設定を含むすべての接続パラメーターを構成します。

```java
ConnectConfig.builder()
    .uri(String uri)
    .token(String token)
    .username(String username)
    .password(String password)
    .dbName(String dbName)
    .connectTimeoutMs(long connectTimeoutMs)
    .keepAliveTimeMs(long keepAliveTimeMs)
    .keepAliveTimeoutMs(long keepAliveTimeoutMs)
    .keepAliveWithoutCalls(boolean keepAliveWithoutCalls)
    .rpcDeadlineMs(long rpcDeadlineMs)
    .secure(Boolean secure)
    .enablePrecheck(boolean enablePrecheck)
    .idleTimeoutMs(long idleTimeoutMs)
    .clientKeyPath(String clientKeyPath)
    .clientPemPath(String clientPemPath)
    .caPemPath(String caPemPath)
    .serverPemPath(String serverPemPath)
    .serverName(String serverName)
    .proxyAddress(String proxyAddress)
    .option(Map<String, String> option)
    .telemetryConfig(TelemetryConfig telemetryConfig)
    .build()
```

**ビルダーメソッド:**

- `uri(String uri)` -

    **[必須]**

    サーバーエンドポイントの URI です。ローカルの Milvus インスタンスの場合は `http://host:port`、Zilliz Cloud の場合は HTTPS URL を受け付けます。

- `token(String token)` -

    認証用の API キーまたは `"username:password"` 形式の文字列です。Zilliz Cloud の API キーに使用するか、username/password 認証の省略形として使用します。デフォルト: `null`。

- `username(String username)` -

    認証用のユーザー名です。`password()` と組み合わせて使用します。`token()` が設定されている場合は無視されます。デフォルト: `null`。

- `password(String password)` -

    認証用のパスワードです。`username()` と組み合わせて使用します。デフォルト: `null`。

- `dbName(String dbName)` -

    接続後に使用するデフォルトのデータベース名です。デフォルト: `null`（サーバーのデフォルトを使用します）。

- `connectTimeoutMs(long connectTimeoutMs)` -

    接続時に gRPC チャネルが READY 状態になるまで待機するタイムアウト時間（ミリ秒）です。デフォルト: `10000`。

- `keepAliveTimeMs(long keepAliveTimeMs)` -

    サーバーに送信する keepalive ping の間隔（ミリ秒）です。デフォルト: `10000`。

- `keepAliveTimeoutMs(long keepAliveTimeoutMs)` -

    接続を閉じる前に keepalive ping の応答確認を待機するタイムアウト時間（ミリ秒）です。デフォルト: `5000`。

- `keepAliveWithoutCalls(boolean keepAliveWithoutCalls)` -

    `true` の場合、アクティブな RPC がないときでも keepalive ping を送信します。デフォルト: `true`。

- `rpcDeadlineMs(long rpcDeadlineMs)` -

    1 回の RPC 呼び出しに許可される最大時間（ミリ秒）です。値が `0` の場合は期限が無効になります。デフォルト: `0`。

- `secure(Boolean secure)` -

    TLS 暗号化を有効にします。URI が `https` で始まる場合、この設定に関係なく TLS は常に有効になります。デフォルト: `false`。

- `enablePrecheck(boolean enablePrecheck)` -

    `true` の場合、クライアントを返す前に接続チェックを実行します。デフォルト: `false`。

- `idleTimeoutMs(long idleTimeoutMs)` -

    アイドル接続が閉じられるまでの時間（ミリ秒）です。デフォルト: `86400000`（24 時間）。

- `clientKeyPath(String clientKeyPath)` -

    相互 TLS（mTLS）用のクライアント秘密鍵ファイルへのパスです。デフォルト: `null`。

- `clientPemPath(String clientPemPath)` -

    相互 TLS（mTLS）用のクライアント証明書ファイルへのパスです。デフォルト: `null`。

- `caPemPath(String caPemPath)` -

    TLS 検証用の CA 証明書ファイルへのパスです。デフォルト: `null`。

- `serverPemPath(String serverPemPath)` -

    一方向 TLS 用のサーバー証明書ファイルへのパスです。デフォルト: `null`。

- `serverName(String serverName)` -

    TLS 証明書の検証に使用するサーバー名のオーバーライドです。デフォルト: `null`。

- `proxyAddress(String proxyAddress)` -

    gRPC 接続用の HTTP プロキシアドレスです。デフォルト: `null`。

- `option(Map<String, String> option)` -

    接続時に `ClientInfo.reserved` フィールドでサーバーに転送される任意のキーと値のペアです。サーバーが認識するクライアント側のメタデータや機能フラグを渡すのに役立ちます。デフォルト値は空のマップです。

- `telemetryConfig(TelemetryConfig telemetryConfig)` -

    クライアントのテレメトリー設定です。利用可能な設定については、TelemetryConfig を参照してください。

## 例\{#example}

```java
import io.milvus.v2.client.ConnectConfig;
import io.milvus.v2.client.MilvusClientV2;

// Connect to a local Milvus instance
ConnectConfig config = ConnectConfig.builder()
    .uri("YOUR_CLUSTER_ENDPOINT")
    .build();

// Connect to Zilliz Cloud with an API key
// ConnectConfig config = ConnectConfig.builder()
//     .uri("https://your-instance.zilliz.com")
//     .token("your-api-key")
//     .build();

MilvusClientV2 client = new MilvusClientV2(config);
```
