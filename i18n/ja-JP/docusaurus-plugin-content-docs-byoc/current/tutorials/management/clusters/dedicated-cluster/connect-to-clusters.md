---
title: "クラスターへの接続 | BYOC"
slug: /connect-to-clusters
sidebar_label: "クラスターへの接続"
beta: FALSE
added_since: FALSE
last_modified: FALSE
deprecate_since: FALSE
notebook: FALSE
description: "アプリケーションでスキーマ管理、insert、upsert、delete、search、query、hybrid search を含む完全な Collection API が必要な場合は、Dedicated cluster endpoint を使用します。 | BYOC"
type: origin
token: ZWwJwKjeDi7SJGkzUQ0c7XfBnqh
sidebar_position: 2
displayed_sidebar: default

---

import Admonition from '@theme/Admonition';
import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

# クラスターへの接続

アプリケーションでスキーマ管理、insert、upsert、delete、search、query、hybrid search を含む完全な Collection API が必要な場合は、Dedicated cluster endpoint を使用します。

<Admonition type="info" icon="📘" title="注">

このページでは、Dedicated serving cluster に接続する方法を説明します。Free または Serverless cluster に接続するには、[Free & Serverless Clusters](./free-and-serverless-clusters) を参照してください。project endpoint 経由の on-demand compute については、[Connect for On-Demand Search](./connect-for-on-demand-search) を参照してください。

</Admonition>

## エンドポイント形式\{#endpoint-formats}

| クラスタータイプ | エンドポイントパターン | 注記 |
| --- | --- | --- |
| Dedicated | `https://{cluster-id}.{region}.vectordb.zillizcloud.com:19530` | Dedicated cluster は、ポート `19530` のリアルタイム serving endpoint を使用します。 |

## 始める前に\{#before-you-begin}

Dedicated cluster に接続する前に、以下を確認してください。

- BYOC project をデプロイしていること。詳細は次を参照してください。 

    - [Deploy BYOC on AWS](./deploy-byoc-aws)

    - [Deploy BYOC-I on AWS](./deploy-byoc-i-aws)

    - [Deploy BYOC on GCP](./deploy-byoc-gcp)

    - [Deploy BYOC-I on Microsoft Azure](./deploy-byoc-i-azure)

- アプリケーションと BYOC project 内の cluster 間のネットワーク設定が完了していること。詳細は、[Prepare for Cluster Connection](./prepare-for-cluster-connection) を参照してください。

- cluster を作成していること。

- ユースケースに応じた Milvus SDK をインストールしていること。詳細は、[Install SDKs](./install-sdks) を参照してください。

- cluster public endpoint を取得していること。

- 認証トークンを取得していること。これは、対象 cluster にアクセスできる API key、または `username:password` 形式の cluster credential です。

cluster public endpoint は、Zilliz Cloud コンソールから取得できます。対象 cluster の **Cluster Details** ページに移動します。**Connect** カードで、cluster public endpoint をコピーします。

<Admonition type="info" icon="📘" title="注">

SDK ではなく RESTful API を使用する場合、HTTP はリクエスト・レスポンスの通信モデルに従うため、継続的な接続は確立されません。

</Admonition>

## SDK のインストール\{#install-sdks}

アプリケーション言語用の SDK をインストールします。

```plaintext
pip install pymilvus
```

Java、Node.js、Go の project では、以下の例を使用する前に、対応する Milvus SDK を project にインストールしてください。

## Dedicated cluster への接続\{#connect-to-a-dedicated-cluster}

SDK 間で cluster endpoint と token を一貫して使用します。`YOUR_CLUSTER_ENDPOINT` は cluster の **Connect** カードからコピーした public endpoint、`YOUR_CLUSTER_TOKEN` は対象 cluster にアクセスできる API key、または `username:password` 形式の cluster credential です。

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

SDK で接続した後、collections の一覧表示のような軽量な操作を実行します。

```python
collections = client.list_collections()
print(collections)
```

## 次のステップ\{#next-steps}

接続後は、同じ client インスタンスを使用して collection を作成し、データをロードし、Dedicated cluster に対してリアルタイムの search または query 操作を実行します。

Free または Serverless serving cluster については、[Free & Serverless Clusters](./free-and-serverless-clusters) を参照してください。project endpoint 経由の on-demand compute については、[Connect for On-Demand Search](./connect-for-on-demand-search) を参照してください。
