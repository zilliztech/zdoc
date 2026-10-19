---
title: "クラスターへの接続 | BYOC"
slug: /connect-to-clusters
sidebar_label: "クラスターへの接続"
beta: FALSE
added_since: FALSE
last_modified: FALSE
deprecate_since: FALSE
notebook: FALSE
description: "アプリケーションで、スキーマ管理、挿入、upsert、削除、検索、クエリ、ハイブリッド検索を含むコレクション API 全体が必要な場合は、Dedicated クラスターのエンドポイントを使用します。 | BYOC"
type: origin
token: ZWwJwKjeDi7SJGkzUQ0c7XfBnqh
sidebar_position: 2
displayed_sidebar: default

---

import Admonition from '@theme/Admonition';
import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

# クラスターへの接続

アプリケーションで、スキーマ管理、挿入、upsert、削除、検索、クエリ、ハイブリッド検索を含むコレクション API 全体が必要な場合は、Dedicated クラスターのエンドポイントを使用します。

<Admonition type="info" title="Note">

このページでは、Dedicated サービス用クラスターへの接続方法を説明します。Free または Serverless クラスターに接続する場合は、[Free & Serverless クラスター](./free-and-serverless-clusters) を参照してください。プロジェクトエンドポイントを介したオンデマンドコンピューティングについては、[オンデマンド検索用の接続](./connect-for-on-demand-search) を参照してください。

</Admonition>

## エンドポイント形式\{#endpoint-formats}

| クラスタータイプ | エンドポイントのパターン | 注記 |
| --- | --- | --- |
| Dedicated | `https://{cluster-id}.{region}.vectordb.zillizcloud.com:19530` | Dedicated クラスターは、ポート `19530` を使用するリアルタイムのサービス提供エンドポイントを使用します。 |

## 事前準備\{#before-you-begin}

Dedicated クラスターに接続する前に、以下を満たしていることを確認してください。

- BYOC プロジェクトをデプロイしていること。詳細については、以下を参照してください。

    - [AWS で BYOC をデプロイする](./deploy-byoc-aws)

    - [AWS で BYOC-I をデプロイする](./deploy-byoc-i-aws)

    - [GCP で BYOC をデプロイする](./deploy-byoc-gcp)

    - [Microsoft Azure で BYOC-I をデプロイする](./deploy-byoc-i-azure)

- アプリケーションと BYOC プロジェクト内のクラスター間のネットワーク構成を完了していること。詳細については、[クラスター接続の準備](./prepare-for-cluster-connection) を参照してください。

- クラスターを作成していること。

- ユースケースに合った Milvus SDK をインストールしていること。詳細については、[SDK のインストール](./install-sdks) を参照してください。

- クラスターのパブリックエンドポイントを取得していること。

- 認証トークンを取得していること。これは、ターゲットクラスターにアクセスできる API キー、または `username:password` 形式のクラスター認証情報です。

クラスターのパブリックエンドポイントは、Zilliz Cloud コンソールから取得できます。対象のクラスターの **クラスター Details** ページに移動します。**Connect** カードで、クラスターのパブリックエンドポイントをコピーします。

<Admonition type="info" title="Note">

SDK ではなく RESTful API を使用する場合、HTTP はリクエスト・レスポンス型の通信モデルに従うため、継続的な接続は確立されません。

</Admonition>

## SDK のインストール\{#install-sdks}

アプリケーションの言語に対応する SDK をインストールします。

```bash
pip install pymilvus
```

Java、Node.js、Go プロジェクトでは、以下の例を使用する前に、プロジェクトに対応する Milvus SDK をインストールしてください。

## Dedicated クラスターへの接続\{#connect-to-a-dedicated-cluster}

SDK 間でクラスターのエンドポイントとトークンを一貫して使用します。`YOUR_CLUSTER_ENDPOINT` はクラスターの **Connect** カードからコピーしたパブリックエンドポイントで、`YOUR_CLUSTER_TOKEN` はターゲットクラスターにアクセスできる API キー、または `username:password` 形式のクラスター認証情報です。

<Tabs groupId="code" defaultValue='python' values={[{"label":"Python","value":"python"},{"label":"Java","value":"java"},{"label":"Go","value":"go"},{"label":"Rust","value":"rust"},{"label":"C++","value":"c++"},{"label":"NodeJS","value":"javascript"},{"label":"cURL","value":"bash"}]}>
<TabItem value='python'>

```python
from pymilvus import MilvusClient

CLUSTER_ENDPOINT = "YOUR_CLUSTER_ENDPOINT"
TOKEN = "YOUR_CLUSTER_TOKEN"

client = MilvusClient(
    uri=CLUSTER_ENDPOINT,
    token=TOKEN,
)
```

</TabItem>

<TabItem value='java'>

```java
import io.milvus.v2.client.MilvusClientV2;
import io.milvus.v2.client.ConnectConfig;

String CLUSTER_ENDPOINT = "YOUR_CLUSTER_ENDPOINT";
String TOKEN = "YOUR_CLUSTER_TOKEN";

ConnectConfig connectConfig = ConnectConfig.builder()
    .uri(CLUSTER_ENDPOINT)
    .token(TOKEN)
    .build();

MilvusClientV2 client = new MilvusClientV2(connectConfig);
```

</TabItem>

<TabItem value='go'>

```go
import (
    "context"

    "github.com/milvus-io/milvus/client/v3/milvusclient"
)

ctx := context.Background()

client, err := milvusclient.New(ctx, &milvusclient.ClientConfig{
    Address: "YOUR_CLUSTER_ENDPOINT",
    APIKey:  "YOUR_CLUSTER_TOKEN",
})
if err != nil {
    // handle error
}
```

</TabItem>

<TabItem value='rust'>

```rust
use milvus::v2::prelude::*;

let config = ConnectConfig::new()
    .uri("YOUR_CLUSTER_ENDPOINT")
    .token("YOUR_CLUSTER_TOKEN");
let client = ClientV2::new(&config).await?;
```

</TabItem>

<TabItem value='c++'>

```c++
#include <iostream>
#include "milvus/MilvusClientV2.h"

auto client = milvus::MilvusClientV2::Create();
auto status = client->Connect(milvus::ConnectParam("YOUR_CLUSTER_ENDPOINT").WithToken("YOUR_CLUSTER_TOKEN"));
if (!status.IsOk()) {
    std::cout << status.Message() << std::endl;
}
```

</TabItem>

<TabItem value='javascript'>

```javascript
import { MilvusClient } from "@zilliz/milvus2-sdk-node";

const address = "YOUR_CLUSTER_ENDPOINT";
const token = "YOUR_CLUSTER_TOKEN";

const client = new MilvusClient({ address, token });
```

</TabItem>

<TabItem value='bash'>

```bash
curl --request POST \
  --url "YOUR_CLUSTER_ENDPOINT/v2/vectordb/collections/list" \
  --header "Authorization: Bearer YOUR_CLUSTER_TOKEN" \
  --header "Content-Type: application/json" \
  --data '{"dbName": "default"}'
```

</TabItem>
</Tabs>

## 接続の確認\{#verify-the-connection}

SDK で接続した後、コレクションの一覧表示などの軽量な操作を実行します。

```python
collections = client.list_collections()
print(collections)
```

## 次のステップ\{#next-steps}

接続したら、同じクライアントインスタンスを使用して、Dedicated クラスターに対してコレクションの作成、データのロード、リアルタイムの検索またはクエリ操作を実行します。

Free または Serverless のサービス用クラスターについては、[Free & Serverless クラスター](./free-and-serverless-clusters) を参照してください。プロジェクトエンドポイントを介したオンデマンドコンピューティングについては、[オンデマンド検索用の接続](./connect-for-on-demand-search) を参照してください。
