---
title: "クラスターへの接続 | BYOC"
slug: /connect-to-clusters
sidebar_label: "クラスターへの接続"
beta: FALSE
added_since: FALSE
last_modified: FALSE
deprecate_since: FALSE
notebook: FALSE
description: "アプリケーションで、スキーマ管理、insert、upsert、delete、search、query、hybrid search を含む完全な Collection API が必要な場合は、Dedicated クラスターエンドポイントを使用します。 | BYOC"
type: origin
token: ZWwJwKjeDi7SJGkzUQ0c7XfBnqh
sidebar_position: 2
displayed_sidebar: default

---

import Admonition from '@theme/Admonition';
import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

# クラスターへの接続

アプリケーションで、スキーマ管理、insert、upsert、delete、search、query、hybrid search を含む完全な Collection API が必要な場合は、Dedicated クラスターエンドポイントを使用します。

<Admonition type="info" icon="📘" title="注記">

このページでは、Dedicated サービングクラスターへの接続方法を示します。Free または Serverless クラスターに接続するには、[Free & Serverless クラスター](./free-and-serverless-clusters) を参照してください。プロジェクトエンドポイントを介したオンデマンド計算については、[オンデマンド検索への接続](./connect-for-on-demand-search) を参照してください。

</Admonition>

## エンドポイント形式\{#endpoint-formats}

| クラスタータイプ | エンドポイントパターン | 注記 |
| --- | --- | --- |
| Dedicated | `https://{cluster-id}.{region}.vectordb.zillizcloud.com:19530` | Dedicated クラスターは、ポート `19530` を使用するリアルタイムサービングエンドポイントを使用します。 |

## 始める前に\{#before-you-begin}

Dedicated クラスターに接続する前に、以下を確認してください。

- BYOC プロジェクトをデプロイ済みであること。詳細については、以下を参照してください。 

    - [AWS に BYOC をデプロイする](./deploy-byoc-aws)

    - [AWS に BYOC-I をデプロイする](./deploy-byoc-i-aws)

    - [GCP に BYOC をデプロイする](./deploy-byoc-gcp)

    - [Microsoft Azure に BYOC-I をデプロイする](./deploy-byoc-i-azure)

- アプリケーションと BYOC プロジェクト内のクラスター間のネットワーク構成が完了していること。詳細については、[クラスター接続の準備](./prepare-for-cluster-connection) を参照してください。

- クラスターを作成済みであること。

- ユースケースに対応する Milvus SDK をインストール済みであること。詳細については、[SDK のインストール](./install-sdks) を参照してください。

- クラスターのパブリックエンドポイントを取得していること。

- 認証トークンを取得していること。これは、対象クラスターにアクセスできる API キー、または `username:password` 形式のクラスター認証情報のいずれかです。

クラスターのパブリックエンドポイントは Zilliz Cloud コンソールから取得できます。対象クラスターの **Cluster Details** ページに移動します。**Connect** カードで、クラスターのパブリックエンドポイントをコピーしてください。

<Admonition type="info" icon="📘" title="注記">

SDK の代わりに RESTful API を使用する場合、HTTP はリクエスト/レスポンスの通信モデルに従うため、継続的な接続は確立されません。

</Admonition>

## SDK のインストール\{#install-sdks}

アプリケーション言語向けの SDK をインストールします。

```bash
pip install pymilvus
```

Java、Node.js、Go のプロジェクトでは、以下の例を使用する前に、対応する Milvus SDK をプロジェクトにインストールしてください。

## Dedicated クラスターへの接続\{#connect-to-a-dedicated-cluster}

SDK 間でクラスターエンドポイントとトークンを一貫して使用してください。`YOUR_CLUSTER_ENDPOINT` はクラスターの **Connect** カードからコピーしたパブリックエンドポイント、`YOUR_CLUSTER_TOKEN` は対象クラスターにアクセスできる API キー、または `username:password` 形式のクラスター認証情報です。

<Tabs groupId="code" defaultValue='python' values={[{"label":"Python","value":"python"},{"label":"Java","value":"java"},{"label":"Go","value":"go"},{"label":"NodeJS","value":"javascript"},{"label":"cURL","value":"bash"}]}>
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
import "github.com/milvus-io/milvus/client/v2/milvusclient"

client, err := milvusclient.New(ctx, &milvusclient.ClientConfig{
    Address: "YOUR_CLUSTER_ENDPOINT",
    APIKey:  "YOUR_CLUSTER_TOKEN",
})
```

</TabItem>

<TabItem value='javascript'>

```javascript
const { MilvusClient } = require("@zilliz/milvus2-sdk-node");

const address = "YOUR_CLUSTER_ENDPOINT";
const token = "YOUR_CLUSTER_TOKEN";

const client = new MilvusClient({ address, token });
```

</TabItem>

<TabItem value='bash'>

```bash
curl --request POST \
  --url "YOUR_CLUSTER_ENDPOINT" \
  --header "Authorization: Bearer YOUR_CLUSTER_TOKEN" \
  --header "Content-Type: application/json" \
  --data '{"dbName": "default"}'
```

</TabItem>
</Tabs>

## 接続の確認\{#verify-the-connection}

SDK で接続した後、コレクションの一覧取得などの軽量な操作を実行します。

```python
collections = client.list_collections()
print(collections)
```

## 次のステップ\{#next-steps}

接続後は、同じクライアントインスタンスを使用してコレクションを作成し、データをロードし、Dedicated クラスターに対してリアルタイムの search または query 操作を実行します。

Free または Serverless サービングクラスターについては、[Free & Serverless クラスター](./free-and-serverless-clusters) を参照してください。プロジェクトエンドポイントを介したオンデマンド計算については、[オンデマンド検索への接続](./connect-for-on-demand-search) を参照してください。
