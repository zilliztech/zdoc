---
title: "クラスターへの接続 | Cloud"
slug: /connect-to-clusters
sidebar_label: "クラスターへの接続"
beta: FALSE
added_since: FALSE
last_modified: FALSE
deprecate_since: FALSE
notebook: FALSE
description: "アプリケーションでスキーマ管理、insert、upsert、delete、search、query、hybrid search を含む完全なコレクション API が必要な場合は、Dedicated クラスターのエンドポイントを使用します。 | Cloud"
type: origin
token: ZWwJwKjeDi7SJGkzUQ0c7XfBnqh
sidebar_position: 2
displayed_sidebar: default

---

import Admonition from '@theme/Admonition';
import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

# クラスターへの接続

アプリケーションでスキーマ管理、insert、upsert、delete、search、query、hybrid search を含む完全なコレクション API が必要な場合は、Dedicated クラスターのエンドポイントを使用します。

<Admonition type="info" title="Note">

このページでは、Dedicated serving クラスターへの接続方法を説明します。Free または Serverless クラスターに接続するには、[Free & Serverless クラスター](./free-and-serverless-clusters) を参照してください。プロジェクトエンドポイントを介したオンデマンドコンピュートについては、[オンデマンド検索のための接続](./connect-for-on-demand-search) を参照してください。

</Admonition>

## エンドポイント形式\{#endpoint-formats}

| クラスタータイプ | エンドポイントのパターン | 備考 |
| --- | --- | --- |
| Dedicated | `https://{cluster-id}.{region}.vectordb.zillizcloud.com:19530` | Dedicated クラスターは、ポート `19530` のリアルタイム serving エンドポイントを使用します。 |

## 事前準備\{#before-you-begin}

Dedicated クラスターに接続する前に、以下を確認してください。

- Zilliz Cloud にアカウントを登録していること。詳細については、[Zilliz Cloud への登録](./register-with-zilliz-cloud) を参照してください。

- Dedicated クラスターを作成していること。

- ユースケースに合った Milvus SDK をインストールしていること。詳細については、[SDK のインストール](./install-sdks) を参照してください。

- クラスターのパブリックエンドポイントを取得していること。

- 認証トークンを取得していること。これは、対象クラスターへのアクセス権を持つ API キー、または `username:password` 形式のクラスター認証情報です。

クラスターのパブリックエンドポイントは、Zilliz Cloud コンソールから取得できます。対象クラスターの **クラスター Details** ページに移動します。**Connect** カードで、クラスターのパブリックエンドポイントをコピーします。

<Admonition type="info" title="Note">

SDK ではなく RESTful API を使用する場合、HTTP はリクエスト・レスポンス型の通信モデルに従うため、継続的な接続は確立されません。

</Admonition>

## SDK のインストール\{#install-sdks}

アプリケーションで使用する言語の SDK をインストールします。

```bash
pip install pymilvus
```

Java、Node.js、Go のプロジェクトでは、以下の例を使用する前に、対応する Milvus SDK をプロジェクトにインストールしてください。

## Dedicated クラスターへの接続\{#connect-to-a-dedicated-cluster}

クラスターのエンドポイントとトークンは、すべての SDK で一貫して使用します。`YOUR_CLUSTER_ENDPOINT` は、クラスターの **Connect** カードからコピーしたパブリックエンドポイントです。`YOUR_CLUSTER_TOKEN` は、対象クラスターへのアクセス権を持つ API キー、または `username:password` 形式のクラスター認証情報です。

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

SDK で接続した後、コレクションの一覧表示などの軽量な操作を実行します。

```python
collections = client.list_collections()
print(collections)
```

## 次のステップ\{#next-steps}

接続後は、同じクライアントインスタンスを使用して、コレクションの作成、データのロード、Dedicated クラスターに対するリアルタイムの search または query 操作を実行します。

Free または Serverless の serving クラスターについては、[Free & Serverless クラスター](./free-and-serverless-clusters) を参照してください。プロジェクトエンドポイントを介したオンデマンドコンピュートについては、[オンデマンド検索のための接続](./connect-for-on-demand-search) を参照してください。
