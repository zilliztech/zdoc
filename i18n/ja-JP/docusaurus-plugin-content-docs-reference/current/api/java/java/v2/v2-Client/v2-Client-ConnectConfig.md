---
title: "ConnectConfig | Java | v2"
slug: /java/java/v2-Client-ConnectConfig
sidebar_label: "ConnectConfig"
beta: false
added_since: v2.6.x
last_modified: v3.0.x
deprecate_since: false
notebook: false
description: "`MilvusClientV2` インスタンスの作成時に使用される接続設定は、ConnectConfig builder に保持されます。builder パターンを使用して、認証、TLS、タイムアウト、keepalive 設定を含むすべての接続パラメータを構成します。 | Java | v2"
type: docx
token: ErNidktYPodbDxxow0xcV5qHnof
sidebar_position: 4
keywords: 
  - Pinecone vector database
  - Audio search
  - semantic search とは
  - Embedding model
  - zilliz
  - zilliz cloud
  - cloud
  - ConnectConfig
  - javaV230
displayed_sidebar: javaSidebar

displayed_sidbar: javaSidebar
---

import Admonition from '@theme/Admonition';


# ConnectConfig

`MilvusClientV2` インスタンスの作成時に使用される接続設定は、ConnectConfig builder に保持されます。builder パターンを使用して、認証、TLS、タイムアウト、keepalive 設定を含むすべての接続パラメータを構成します。

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
    .build()
```

**BUILDER メソッド:**

- `uri(String uri)` -

    **[必須]**

    サーバーエンドポイント URI。ローカルの Milvus インスタンスには `http://host:port` を、Zilliz Cloud には HTTPS URL を受け付けます。

- `token(String token)` -

    認証用の API key または `"username:password"` 文字列。Zilliz Cloud の API key に使用するか、username/password 認証の短縮記法として使用します。デフォルト: `null`。

- `username(String username)` -

    認証用のユーザー名。`password()` と組み合わせて使用します。`token()` が設定されている場合は無視されます。デフォルト: `null`。

- `password(String password)` -

    認証用のパスワード。`username()` と組み合わせて使用します。デフォルト: `null`。

- `dbName(String dbName)` -

    接続後に使用するデフォルトのデータベース名。デフォルト: `null`（サーバーのデフォルトを使用）。

- `connectTimeoutMs(long connectTimeoutMs)` -

    接続中に gRPC チャネルが READY 状態に到達するまで待機するタイムアウト時間（ミリ秒）。デフォルト: `10000`。

- `keepAliveTimeMs(long keepAliveTimeMs)` -

    サーバーに送信される keepalive ping の間隔（ミリ秒）。デフォルト: `10000`。

- `keepAliveTimeoutMs(long keepAliveTimeoutMs)` -

    接続を閉じる前に keepalive ping の確認応答を待機するタイムアウト時間（ミリ秒）。デフォルト: `5000`。

- `keepAliveWithoutCalls(boolean keepAliveWithoutCalls)` -

    `true` の場合、アクティブな RPC がないときでも keepalive ping が送信されます。デフォルト: `true`。

- `rpcDeadlineMs(long rpcDeadlineMs)` -

    単一の RPC 呼び出しに許可される最大時間（ミリ秒）。`0` を指定すると deadline は無効になります。デフォルト: `0`。

- `secure(Boolean secure)` -

    TLS 暗号化を有効にします。URI が `https` で始まる場合、この設定に関係なく TLS は常に有効になります。デフォルト: `false`。

- `enablePrecheck(boolean enablePrecheck)` -

    `true` の場合、client を返す前に接続性チェックを実行します。デフォルト: `false`。

- `idleTimeoutMs(long idleTimeoutMs)` -

    アイドル状態の接続が閉じられるまでの時間（ミリ秒）。デフォルト: `86400000`（24 時間）。

- `clientKeyPath(String clientKeyPath)` -

    相互 TLS（mTLS）用のクライアント秘密鍵ファイルへのパス。デフォルト: `null`。

- `clientPemPath(String clientPemPath)` -

    相互 TLS（mTLS）用のクライアント証明書ファイルへのパス。デフォルト: `null`。

- `caPemPath(String caPemPath)` -

    TLS 検証用の CA 証明書ファイルへのパス。デフォルト: `null`。

- `serverPemPath(String serverPemPath)` -

    一方向 TLS 用のサーバー証明書ファイルへのパス。デフォルト: `null`。

- `serverName(String serverName)` -

    TLS 証明書検証用のサーバー名オーバーライド。デフォルト: `null`。

- `proxyAddress(String proxyAddress)` -

    gRPC 接続用の HTTP プロキシアドレス。デフォルト: `null`。

- `option(Map<String, String> option)` -

    接続時に `ClientInfo.reserved` フィールドでサーバーに転送される任意のキーと値のペア。クライアント側のメタデータや、サーバーが理解できる feature flag を渡すのに役立ちます。デフォルト値は空の map です。

## Example\{#example}

```java
import io.milvus.v2.client.ConnectConfig;
import io.milvus.v2.client.MilvusClientV2;

// ローカルの Milvus インスタンスに接続
ConnectConfig config = ConnectConfig.builder()
    .uri("YOUR_CLUSTER_ENDPOINT")
    .build();

// API key を使用して Zilliz Cloud に接続
// ConnectConfig config = ConnectConfig.builder()
//     .uri("https://your-instance.zilliz.com")
//     .token("your-api-key")
//     .build();

MilvusClientV2 client = new MilvusClientV2(config);
```
