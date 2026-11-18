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

---

# MilvusClient

**MilvusClient** インスタンスは、特定の Milvus インスタンスに接続する Node.js クライアントを表します。

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

    Milvus インスタンスのアドレス。例:

    ```javascript
    https://inxx-xxxxxxxxxxxxxxxxx.aws-us-west-2.vectordb-uat3.zillizcloud.com:19540
    ```

- **configOrAddress** (*ClientConfig*)

    - **address** (*string*) -

        **[REQUIRED]**

        クラスターエンドポイント。例:

        ```javascript
        https://inxx-xxxxxxxxxxxxxxxxx.aws-us-west-2.vectordb-uat3.zillizcloud.com:19540
        ```

    - **__SKIP_CONNECT__** (*boolean*) -

        接続をスキップするかどうかを示すブール値。 

    - **channelOptions** (*channelOptions*) -

        gRPC の追加チャネルオプション。

    - **データベース** (*string*) -

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

    - **retryDelay** (*number*) -

        再試行の間隔。

    - **ssl** (*boolean*) -

        SSL を使用するかどうかを示すブール値です。Milvus を TLS エンドポイントで動作するように構成している場合は、これを `true` に設定してください。詳細は、[Encryption in Transit](https://milvus.io/docs/tls.md) を参照してください。

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

        - **verifyOptions** (*Record&lt;string, any&gt;*) -

            検証オプション。

    - **token** (*string*) -

        接続に使用されるトークン。トークンには API key、またはコロンで連結したユーザー名とパスワードのペアを使用できます。

    - **trace** (*boolean*) -

        トレーシングを有効にするかどうか。 

    - **telemetry** (*TelemetryConfig*) -

        クライアントのメトリクス、ハートビート、およびサーバーからプッシュされるコマンドの設定です。

    - **isGlobal** (*boolean*) -

        グローバルクラスターモードを有効にするかどうか。**true** の場合、SDK はエンドポイントからクラスタートポロジーを取得し、プライマリクラスターへルーティングします。省略した場合、モードはアドレス URI から自動検出されます。

    - **username** (*string*) -

        接続に使用されるユーザー名。

- **ssl** (*boolean*) -

    SSL を使用するかどうかを示すブール値です。Milvus を TLS エンドポイントで動作するように構成している場合は、これを `true` に設定してください。詳細は、[Encryption in Transit](https://milvus.io/docs/tls.md) を参照してください。

- **username** (*string*) -

    指定した Milvus インスタンスへの接続に使用する有効なユーザー名。

    対象の Milvus インスタンスで認証が有効になっている場合に使用します。認証を有効にするには、[Authenticate User Access](https://milvus.io/docs/authenticate.md) を参照してください。

    これは **password** と一緒に使用する必要があります。

- **password** (*string*) -

    指定した Milvus インスタンスへの接続に使用する有効なパスワード。

    対象の Milvus インスタンスで認証が有効になっている場合に使用します。認証を有効にするには、[Authenticate User Access](https://milvus.io/docs/authenticate.md) を参照してください。

    これは **username** と一緒に使用する必要があります。

- **channelOptions** (*channelOptions*) -

    gRPC の追加チャネルオプション。

**メソッド:**

- `static get sdkInfo`

    ビルド時に生成された SDK バージョンと推奨される Milvus バージョンを表す `{ version, recommendMilvus }` を返します。

- `session(clusterId: string): MilvusClientSession`

    対象のクラスター ID に固定された軽量な DQL セッションを作成します。このセッションはこのクライアントの接続を再利用し、`search`、`hybridSearch`、`searchIterator`、`query`、`queryIterator`、`get` リクエストに `cluster_id` を注入します。詳細は、[session()](./Client-session) を参照してください。

- `createCollection(data): Promise<ResStatus>`

    `collection_name` と `dimension` からデフォルトのスキーマを構築し、任意でインデックスを作成してコレクションをロードする、高レベルのコレクション作成メソッドです。

- その他すべての操作（`insert`、`search`、`query`、`createIndex`、`loadCollection` など）は、基盤となる GRPC クライアントから継承されます。

**戻り値:**

*MilvusClient*

このメソッドは、GRPC Client を拡張し、Milvus サーバーとの通信を処理する Milvus Client インスタンスを返します。

## Example\{#example}

```javascript
new MilvusClient(config: ClientConfig)
```

