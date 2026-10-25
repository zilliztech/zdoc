---
title: "MilvusClientV2 | Java | v2"
slug: /java/java/v2-Client-MilvusClientV2
sidebar_label: "MilvusClientV2"
beta: false
added_since: v2.3.x
last_modified: v2.5.x
deprecate_since: false
notebook: false
description: "MilvusClientV2 インスタンスは、特定の Zilliz Cloud クラスターに接続する Java クライアントを表します。 | Java | v2"
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

---

import Admonition from '@theme/Admonition';


# MilvusClientV2

**MilvusClientV2** インスタンスは、特定の Zilliz Cloud クラスターに接続する Java クライアントを表します。

```java
io.milvus.v2.client.MilvusClientV2
```

## コンストラクター\{#constructor}

一般的なユースケース向けのクライアントを構築します。

このクライアントは、Zilliz Cloud 上で Create、Read、Update、Delete（CRUD）操作を処理する現在の API セットに対する、使いやすい代替手段として機能します。

```java
MilvusClientV2(ConnectConfig connectConfig);
```

## ConnectConfig\{#connectconfig}

**ConnectConfig** を使用すると、接続プロパティを 1 か所で設定でき、**MilvusClientV2** がそれを参照してコネクションプールを作成および管理できるようになります。

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

**ビルダーメソッド：**

- `uri(String uri)`

    Zilliz Cloud クラスターの URI です。例：

```plaintext
https://inxx-xxxxxxxxxxxxxxxxx.aws-us-west-2.vectordb-uat3.zillizcloud.com:19540
```

- `token(String token)`

    指定した Zilliz Cloud クラスターにアクセスするための有効なアクセストークンです。

これは、**user** と **password** を個別に設定する代わりに推奨される方法として使用できます。

このフィールドを設定する際は、次の点に注意してください。

有効なトークンは、次のいずれかである必要があります。

- 十分な権限を持つ API キー、または

- コロン（:）で連結した、対象クラスターへのアクセスに使用するユーザー名とパスワードのペア。たとえば、`username:p@ssw0rd` に設定できます。

- `username(String userName)`

    指定した Zilliz Cloud クラスターへの接続に使用する有効なユーザー名です。

これは **password** と組み合わせて使用する必要があります。

- `password(String password)`

    指定した Zilliz Cloud クラスターへの接続に使用する有効なパスワードです。

これは **user** と組み合わせて使用する必要があります。

- `connectTimeoutMs(long connectTimeout)`

    この操作のタイムアウト時間（ミリ秒）です。

デフォルト値は **10000** です。

- `keepAliveTimeMs(long keepAliveTime)`

    クライアントがサーバーにキープアライブプローブを送信する間隔（ミリ秒）です。

デフォルト値は **55000** です。

- `keepAliveTimeoutMs(long keepAliveTimeout)`

    クライアントから送信されたキープアライブプローブにサーバーが応答するまでのタイムアウト時間（ミリ秒）です。

デフォルト値は **20000** です。

- `keepAliveWithoutCalls(boolean enable)`

    リクエストを行わずにキープアライブプローブを送信するかどうかです。

デフォルト値は **false** です。

- `rpcDeadlineMs(long rpcDeadline)`

    RPC 呼び出しのデッドライン（無効）です。

デフォルト値は **0** で、デッドラインが無効であることを示します。

- `clientKeyPath(String clientKeyPath)`<br/>
  双方向認証用のクライアントキーファイルへのパスです。

- `clientPemPath(String clientPemPath)`<br/>
  双方向認証用のクライアント PEM ファイルへのパスです。

- `caPemPath(String caPemPath)`<br/>
  双方向認証用の CA PEM ファイルへのパスです。

- `serverPemPath(String serverPemPath)`<br/>
  双方向認証用のサーバー PEM ファイルへのパスです。

- `serverName(String serverName)`<br/>
  想定されるサーバー名です。

- `proxyAddress(String proxyAddress)`<br/>
  接続を確立するためのプロキシサーバーのアドレスです。

- `secure(boolean enable)`<br/>
  接続に TLS を使用するかどうかです。

デフォルト値は **true** です。

- `idleTimeoutMs(long idleTimeout)`<br/>
  接続のアイドルタイムアウトです。

- `.clientRequestId(ThreadLocal<String> clientRequestId)`<br/>
  クライアントリクエストの ID です。このパラメーターを使用すると、各スレッドが特定のリクエスト ID に対応するスレッドのマップを維持できます。

リクエスト ID はサーバーに渡されるため、アクセスログから、どのクライアントがこのインターフェースを呼び出したかを確認できます。

**パブリックメソッド：**

- `getHost()`<br/>
  現在接続している Milvus インスタンスのホスト名を返します。

- `getPort()`<br/>
  現在接続している Milvus インスタンスのポート番号を返します。

- `getAuthorization()`<br/>
  現在の接続の設定に使用された認証情報を返します。

- `getDbName()`<br/>
  現在使用中のデータベース名を返します。

- `isSecure()`<br/>
  現在の接続が TLS 経由かどうかを返します。

- `getProxyAddress()`<br/>
  **ConnectConfig** で指定されたプロキシサーバーのアドレスを返します。

## 例\{#examples}

```java
import io.milvus.v2.client.ConnectConfig;
import io.milvus.v2.client.MilvusClientV2;

ConnectConfig connectConfig = ConnectConfig.builder()
        .uri("https://in01-******.aws-us-west-2.vectordb.zillizcloud.com:19531")
        .token("user:password") // replace this with your token
        .build();
        
MilvusClientV2 client = new MilvusClientV2(connectConfig);
```

**uri** にはクラスターのエンドポイントを設定してください。**token** パラメーターには、十分な権限を持つ Zilliz Cloud API キー、または `username:p@ssw0rd` 形式のクラスターユーザーの認証情報を指定できます。

