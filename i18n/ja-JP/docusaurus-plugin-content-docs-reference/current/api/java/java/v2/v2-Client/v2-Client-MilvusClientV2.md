---
title: "MilvusClientV2 | Java | v2"
slug: /java/java/v2-Client-MilvusClientV2
sidebar_label: "MilvusClientV2"
beta: false
added_since: v2.3.x
last_modified: v2.5.x
deprecate_since: false
notebook: false
description: "MilvusClientV2 インスタンスは、特定の Zilliz Cloud cluster に接続する Java クライアントを表します。 | Java | v2"
type: docx
token: IeOWd0yR2onm5Ex6XyqcrGjKnpS
sidebar_position: 1
keywords: 
  - ベクトルデータベース
  - IVF
  - knn
  - 画像検索
  - zilliz
  - zilliz cloud
  - クラウド
  - MilvusClientV2
  - javaV230
displayed_sidebar: javaSidebar

displayed_sidbar: javaSidebar
---

import Admonition from '@theme/Admonition';


# MilvusClientV2

**MilvusClientV2** インスタンスは、特定の Zilliz Cloud cluster に接続する Java クライアントを表します。

```java
io.milvus.v2.client.MilvusClientV2
```

## Constructor\{#constructor}

一般的なユースケース向けのクライアントを構築します。

<Admonition type="info" icon="📘" title="Notes">

このクライアントは、Zilliz Cloud 上で Create、Read、Update、Delete（CRUD）操作を処理する現在の API セットに対する、使いやすい代替手段として機能します。

</Admonition>

```java
MilvusClientV2(ConnectConfig connectConfig);
```

## [ConnectConfig](./v2-Client-ConnectConfig)\{#connectconfigv2-client-connectconfig}

**[ConnectConfig](./v2-Client-ConnectConfig)** を使用すると、接続プロパティを 1 か所で設定でき、**MilvusClientV2** はそれを参照して connection pool を作成および管理できます。

```java
// use either token or username/password
ConnectConfig.builder()
    .uri(String uri)
    .token(String token)
    .username(String userName)
    .password(String password)
    .dbName(String dbName)
    .connectTimeoutMs(long connectTimeoutMs)
    .keepAliveTimeMs(long keepAliveTimeMs)
    .keepAliveTimeoutMs(long keepAliveTimeoutMs)
    .keepAliveWithoutCalls(Boolean keeAliveWithoutCalls)
    .rpcDeadlineMs(long rpcDeadlineMs)
    .clientKeyPath(String clientKeyPath)
    .clientPemPath(String clientPemPath)
    .caPemPath(String caPemPath)
    .serverPemPath(String serverPemPath)
    .serverName(String serverName)
    .proxyAddress(String proxyAddress)
    .secure(Boolean secure)
    .idleTimeoutMs(long idleTimeoutMs)
    .sslContext(SSLContext sslContext)
    .clientRequestId(ThreadLocal<String> clientRequestId)
    .build();
```

**BUILDER METHODS:**

- `uri(String uri)`

    Zilliz Cloud cluster の URI。例:

    ```plaintext
    https://inxx-xxxxxxxxxxxxxxxxx.aws-us-west-2.vectordb-uat3.zillizcloud.com:19540
    ```

- `token(String token)`

    指定した Zilliz Cloud cluster にアクセスするための有効な access token。 

    これは、**user** と **password** を個別に設定する代わりの推奨手段として使用できます。

    このフィールドを設定する際は、次の点に注意してください。

    有効な token は次のいずれかである必要があります。

    - 十分な権限を持つ [API key](/docs/manage-api-keys)、または

    - 対象 cluster へのアクセスに使用する [username and password ](/docs/cluster-credentials) をコロン (:) で連結したもの。たとえば、`username:p@ssw0rd` に設定できます。

- `username(String userName)`

    指定した Zilliz Cloud cluster に接続するために使用する有効な username。

    これは **password** と一緒に使用する必要があります。

- `password(String password)`

    指定した Zilliz Cloud cluster に接続するために使用する有効な password。

    これは **user** と一緒に使用する必要があります。

- `connectTimeoutMs(long connectTimeout)`

    この操作のタイムアウト時間（ミリ秒）。 

    デフォルト値は **10000** です。

- `keepAliveTimeMs(long keepAliveTime)`

    クライアントがサーバーに keep-alive probe を送信する間隔の時間（ミリ秒）。

    デフォルト値は **55000** です。

- `keepAliveTimeoutMs(long keepAliveTimeout)`

    クライアントから送信された keep-alive probe にサーバーが応答するまでのタイムアウト時間（ミリ秒）。

    デフォルト値は **20000** です。

- `keepAliveWithoutCalls(boolean enable)`

    リクエストを行わずに keep-alive probe を送信するかどうか。

    デフォルト値は **false** です。

- `rpcDeadlineMs(long rpcDeadline)`

    RPC 呼び出しの deadline（無効）。

    デフォルト値は **0** で、deadline が無効であることを示します。

- `clientKeyPath(String clientKeyPath)`

    双方向認証用の client key ファイルへのパス。

- `clientPemPath(String clientPemPath)`

    双方向認証用の client PEM ファイルへのパス。

- `caPemPath(String caPemPath)`

    双方向認証用の CA PEM ファイルへのパス。

- `serverPemPath(String serverPemPath)`

    双方向認証用の server PEM ファイルへのパス。

- `serverName(String serverName)`

    想定される server 名。

- `proxyAddress(String proxyAddress)`

    接続の確立に使用する proxy server のアドレス。

- `secure(boolean enable)`

    接続に TLS を使用するかどうか。

    デフォルト値は **true** です。

- `idleTimeoutMs(long idleTimeout)`

    接続のアイドルタイムアウト。

- `.clientRequestId(ThreadLocal<String> clientRequestId)`

    client request の ID。このパラメータを使用して、各スレッドが特定の request ID に対応するようなスレッドのマップを維持できます。 

    request ID はサーバーに渡されるため、access log から、どのクライアントがこのインターフェースを呼び出したかを確認できます。

**PUBLIC METHODS:**

- `getHost()`

    現在接続されている Milvus インスタンスのホスト名を返します。

- `getPort()`

    現在接続されている Milvus インスタンスのポート番号を返します。

- `getAuthorization()`

    現在の接続の設定に使用された認証情報を返します。

- `getDbName()`

    現在使用中のデータベース名を返します。

- `isSecure()`

    現在の接続が TLS 経由かどうかを返します。

- `getProxyAddress()`

    **[ConnectConfig](./v2-Client-ConnectConfig)** で指定された proxy server のアドレスを返します。

## Examples\{#examples}

```java
import io.milvus.v2.client.ConnectConfig;
import io.milvus.v2.client.MilvusClientV2;

ConnectConfig connectConfig = ConnectConfig.builder()
        .uri("https://in01-******.aws-us-west-2.vectordb.zillizcloud.com:19531")
        .token("user:password") // replace this with your token
        .build();
        
MilvusClientV2 client = new MilvusClientV2(connectConfig);
```

<Admonition type="info" icon="📘" title="Notes">

**uri** には cluster endpoint を設定してください。**token** パラメータには、十分な権限を持つ Zilliz Cloud API key、または `username:p@ssw0rd` 形式の cluster user の認証情報を指定できます。

</Admonition>

