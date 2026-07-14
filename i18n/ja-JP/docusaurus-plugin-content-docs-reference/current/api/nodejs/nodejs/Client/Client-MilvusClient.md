---
title: "MilvusClient | Node.js"
slug: /node/node/Client-MilvusClient
sidebar_label: "MilvusClient"
beta: false
added_since: v2.3.x
last_modified: v2.6.x
deprecate_since: false
notebook: false
description: "MilvusClient インスタンスは、特定の Zilliz Cloud クラスターに接続する Node.js クライアントを表します。 | Node.js"
type: docx
token: DsyLdmJr0o7FAfxwPcNct1Bqnth
sidebar_position: 5
keywords: 
  - lexical search
  - nearest neighbor search
  - Agentic RAG
  - rag llm architecture
  - zilliz
  - zilliz cloud
  - cloud
  - MilvusClient
  - nodejs30
displayed_sidebar: nodeSidebar

displayed_sidbar: nodeSidebar
---

import Admonition from '@theme/Admonition';


# MilvusClient

**MilvusClient** インスタンスは、特定の Zilliz Cloud クラスターに接続する Node.js クライアントを表します。

```javascript
new MilvusClient(options:ClientConfig)
```

## Request Syntax\{#request-syntax}

```javascript
new MilvusClient(config: ClientConfig)
```

**PARAMETERS:**

- **configOrAddress** (*string*) -

    **[REQUIRED]**

    Zilliz Cloud クラスターのアドレス。例:

    ```plaintext
    https://inxx-xxxxxxxxxxxxxxxxx.aws-us-west-2.vectordb-uat3.zillizcloud.com:19540
    ```

- **configOrAddress** (*ClientConfig*)

    - **address** (*string*) -

        **[REQUIRED]**

        クラスターエンドポイント。例:

        ```plaintext
        https://inxx-xxxxxxxxxxxxxxxxx.aws-us-west-2.vectordb-uat3.zillizcloud.com:19540
        ```

    - **_SKIPCONNECT__** (*boolean*) -

        接続をスキップするかどうかを示すブール値。 

    - **channelOptions** (*channelOptions*) -

        gRPC の追加チャネルオプション。

    - **database** (*string*) -

        接続先のクラスターデータベース名。

    - **id** (*string*) -

        接続先クラスターの ID。

    - **loaderOptions** (*Options*) -

        int64 を Long 形式に変換するオプション。指定可能な値は次のとおりです。

        - `{ longs: Function }`

            これは int64 を Long.js 形式に変換する関数である必要があります。

        - `{ longs: Number }`

            これは int64 を number に変換し、精度の損失が発生します。

        - `{ longs: String }`

            これは int64 を string に変換します。これがデフォルトの動作です。

    - **logLevel** (*string*) -

        ログレベル。使用可能なオプション: `debug`, `info`, `warn`, `error`, `panic`, `fatal`。 

        デフォルト値は `debug` です。

        テストおよび開発環境では `debug` レベル、本番環境では `info` レベルを使用することを推奨します。

    - **logPrefix** (*string*) -

        各ログエントリのプレフィックス。

    - **maxRetries** (*number*) -

        接続に成功しなかった場合に再試行する回数。

    - **option** (*Record&lt;string, string&gt;*) -

        `ConnectRequest` のクライアント情報で送信される予約済み接続オプション。初期ハンドシェイク時に任意のキーと値のペアをサーバーへ渡すために使用します。

    - **password** (*string*) -

        接続の認証に使用されるユーザーパスワード。

    - **pool** (*Options*) -

        汎用的な poll オプションで、[this repo](https://github.com/coopernurse/node-pool) で規定されたルールに従います。

    - **protoFilePath** (*protoFilePath*) -

        - **milvus** (*string*) -

        - **schema** (*string*) -

    - **retryDelay** (*number*) -

        再試行の間隔。

    - **ssl** (*boolean*) -

        SSL を使用するかどうかを示すブール値。Zilliz Cloud では常に `true` に設定してください。

    - **timeout** (*string* | *number*) -

        この操作のタイムアウト時間。 

        これを **None** に設定すると、いずれかのレスポンスが到着するか、何らかのエラーが発生した時点でこの操作はタイムアウトします。

    - **tls** (*tls*) -

        - **certChain** (*Buffer*) -

            バッファ内の証明書チェーン。

        - **certChainPath** (*string*) -

            証明書チェーンのファイルパス。

        - **privateKey** (*Buffer*) -

            バッファ内の秘密鍵。

        - **privateKeyPath** (*string*) -

            秘密鍵のファイルパス。

        - **rootCert** (*Buffer*) -

            バッファ内のルート証明書。

        - **rootCertPath** (*string*) -

            ルート証明書のファイルパス。

        - **serverName** (*string*) -

            サーバー名。

        - **skipCertCheck** (*boolean*) -

            提供された証明書に対するチェックをスキップするかどうか。`true` に設定するとスキップを示します。

        - **verifyOptions** (*string*) -

            検証オプション。

    - **token** (*string*) -

        接続に使用されるトークン。トークンには API key、またはコロンで連結したユーザー名とパスワードのペアを使用できます。

    - **trace** (*boolean*) -

        トレーシングを有効にするかどうか。 

    - **username** (*string*) -

        接続に使用されるユーザー名。

- **ssl** (*boolean*) -

    SSL を使用するかどうかを示すブール値。Zilliz Cloud では常に `true` に設定してください。

- **username** (*string*) -

    指定した Zilliz Cloud クラスターへの接続に使用する有効なユーザー名。

    これは **password** と一緒に使用する必要があります。

- **password** (*string*) -

    指定した Zilliz Cloud クラスターへの接続に使用する有効なパスワード。

    これは **username** と一緒に使用する必要があります。

- **channelOptions** (*channelOptions*) -

    gRPC の追加チャネルオプション。

**RETURNS** *MilvusClient*

このメソッドは、GRPC Client を拡張し、Zilliz Cloud クラスターとの通信を処理する Milvus Client インスタンスを返します。

## Example\{#example}

```java
new MilvusClient(config: ClientConfig)
```

<Admonition type="info" icon="📘" title="注意">

- **configOrAddress** をクラスターエンドポイントに設定してください。該当する情報は、Zilliz Cloud コンソールの Cluster details で確認できます。

</Admonition>

