---
title: "Serving Clusters への接続 | BYOC"
slug: /connect-to-serving-cluster
sidebar_label: "Serving Clusters への接続"
beta: FALSE
added_since: FALSE
last_modified: FALSE
deprecate_since: FALSE
notebook: FALSE
description: "Zilliz Cloud は、さまざまなビジネスニーズに対応するために、多様な serving cluster デプロイオプションを提供します。 | BYOC"
type: origin
token: SFPlwOh8cigh8wkm9xLcXHlfnVh
sidebar_position: 1
displayed_sidebar: default

---

import Admonition from '@theme/Admonition';
import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

# Serving Clusters への接続

Zilliz Cloud は、さまざまなビジネスニーズに対応するために、多様な serving cluster デプロイオプションを提供します。 

- **Free**: ストレージ、vCU 消費量、および collection 数に制限はあるものの、学習や個人プロジェクトの出発点を提供します。

- **Serverless**: ワークロードに応じて自動的にスケールする共有環境を提供します。リソースをプロビジョニングする必要はありません。このオプションは、予測しにくいトラフィックやスパイク的なトラフィックに対して、優れたコスト効率と伸縮性を実現します。

- **Dedicated**: 一貫した予測可能なパフォーマンスが求められる本番ワークロード向けに、分離された予約済み環境を提供します。このオプションは、継続的な高スループットやレイテンシに敏感なアプリケーションに最適です。

## Endpoint formats\{#endpoint-formats}

| Cluster type | Endpoint pattern | Notes |
| --- | --- | --- |
| Free/Serverless | `https://{cluster-id}.serverless.{region}.vectordb.zillizcloud.com` | Free/Serverless cluster は、専用ポートなしのリアルタイム serving endpoint を使用します。 |
| Dedicated | `https://{cluster-id}.{region}.vectordb.zillizcloud.com:19530` | Dedicated cluster は、ポート `19530` を使用するリアルタイム serving endpoint を使用します。 |

## Free/Serverless cluster への接続\{#connect-to-freeserverless-clusters}

cluster 詳細ページの **Connect** カードから cluster public endpoint をコピーします。cluster へのアクセス権を持つ API key、または `username:password` 形式の cluster credential のいずれかを token として使用します。

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

接続を確認するには、collection の一覧表示などの軽量な操作を実行します。

```python
collections = client.list_collections()
print(collections)
```

## Dedicated cluster への接続\{#connect-to-dedicated-clusters}

すべての SDK で cluster endpoint と token を一貫して使用します。`YOUR_CLUSTER_ENDPOINT` は cluster の **Connect** カードからコピーした public endpoint であり、`YOUR_CLUSTER_TOKEN` は対象 cluster へのアクセス権を持つ API key、または `username:password` 形式の cluster credential のいずれかです。

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

SDK で接続した後、collection の一覧表示などの軽量な操作を実行します。

```python
collections = client.list_collections()
print(collections)
```
