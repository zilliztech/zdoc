---
title: "クラスターへの接続 | BYOC"
slug: /connect-to-cluster
sidebar_key: connect-to-cluster
sidebar_label: "クラスターへの接続"
beta: FALSE
notebook: FALSE
description: "この記事では、クラスターに接続するための体系的なガイドを提供します。| BYOC"
type: origin
token: IVFfws0lJi8gIVkRvrvc9aXvnNe
sidebar_position: 2
keywords: 
  - zilliz
  - ベクトルデータベース
  - クラウド
  - クラスター
  - 接続

---

import Admonition from '@theme/Admonition';
import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

# クラスターへの接続

この記事では、クラスターに接続するための体系的なガイドを提供します。

## 開始前に\{#before-you-start}

続行する前に、以下の前提条件が満たされていることを確認してください。

- BYOC プロジェクトをデプロイ済みであること。詳細については、以下を参照してください。

    - [AWS 上に BYOC をデプロイする](./deploy-byoc-aws)

    - [AWS 上に BYOC-I をデプロイする](./deploy-byoc-i-aws)

    - [GCP 上に BYOC をデプロイする](./deploy-byoc-gcp)

    - [Microsoft Azure 上に BYOC-I をデプロイする](./deploy-byoc-i-azure)

- アプリケーションと BYOC プロジェクト内のクラスター間のネットワーク設定が完了していること。詳細については、[BYOC クラスターへの接続準備](./prepare-for-cluster-connection) を参照してください。

- クラスターを作成済みであること。詳細については、[クラスターの作成](./create-cluster) を参照してください。

- ユースケースに適した Milvus SDK をインストール済みであること。詳細については、[SDK のインストール](./install-sdks) を参照してください。

<Admonition type="info" icon="📘" title="Note">

<p>SDK よりも RESTful API の利用を検討している場合、継続的な接続を確立できないことを理解することが重要です。これは、HTTP プロトコルが単方向通信モードであることに起因します。</p>
<p></p>
<p>BYOC デプロイメントでは、クラスター認証情報 (<code>username:password</code>) を使用してクラスターに接続します。API キーはプラットフォーム API 操作用のみであり、データプレーン (Milvus SDK/クライアント) 接続には使用できません。</p>
<p></p>

</Admonition>

## クラスターへの接続\{#connect-to-a-cluster}

クラスターが稼働したら、そのパブリックエンドポイントと認証トークンを使用して接続します。

- **クラスターのパブリックエンドポイント:** これは Zilliz Cloud Web コンソールで取得できます。対象のクラスターの**クラスターの詳細**ページに移動します。**接続**カードで、クラスターのパブリックエンドポイントをコピーできます。

    ![connection-info](https://zdoc-images.s3.us-west-2.amazonaws.com/connection-info.png "connection-info")

- **トークン:** このトークンは、ユーザー名とパスワードのペアで構成される [クラスター認証情報](./cluster-credentials) です。

以下の例は、クラスターに接続する方法を示しています。

<Tabs groupId="code" defaultValue='python' values={[{"label":"Python","value":"python"},{"label":"Java","value":"java"},{"label":"NodeJS","value":"javascript"},{"label":"Go","value":"go"},{"label":"cURL","value":"bash"}]}>
<TabItem value='python'>

```python
# Connect using a MilvusClient object
from pymilvus import MilvusClient
CLUSTER_ENDPOINT="YOUR_CLUSTER_ENDPOINT" # Set your cluster endpoint
TOKEN="YOUR_CLUSTER_TOKEN" # Set your token

# Initialize a MilvusClient instance
# Replace uri and token with your own
client = MilvusClient(
    uri=CLUSTER_ENDPOINT, # Cluster endpoint obtained from the console
    token=TOKEN # a colon-separated cluster username and password
)
```

</TabItem>

<TabItem value='java'>

```java
import io.milvus.v2.client.MilvusClientV2;
import io.milvus.v2.client.ConnectConfig;

String CLUSTER_ENDPOINT = "YOUR_CLUSTER_ENDPOINT";
String TOKEN = "YOUR_CLUSTER_TOKEN";

// 1. Connect to Milvus server
ConnectConfig connectConfig = ConnectConfig.builder()
    .uri(CLUSTER_ENDPOINT)
    .token(TOKEN)
    .build();

MilvusClientV2 client = new MilvusClientV2(connectConfig);

```

</TabItem>

<TabItem value='java'>

```javascript
const { MilvusClient, DataType, sleep } = require("@zilliz/milvus2-sdk-node")

const address = "YOUR_CLUSTER_ENDPOINT"
const token = "YOUR_CLUSTER_TOKEN"

// 1. Connect to the cluster
const client = new MilvusClient({address, token})
```

</TabItem>

<TabItem value='java'>

```go
import "github.com/milvus-io/milvus/client/v2/milvusclient"

client, err := milvusclient.New(ctx, &milvusclient.ClientConfig{
    Address: "YOUR_CLUSTER_ENDPOINT",
    APIKey:  "YOUR_CLUSTER_TOKEN",
})
```

</TabItem>

<TabItem value='java'>

```bash
curl --request POST \
  --url "YOUR_CLUSTER_ENDPOINT" \
  --header "Authorization: Bearer YOUR_CLUSTER_TOKEN" \
  --header "Content-Type: application/json" \
  --data '{"dbName": "default"}'
```

</TabItem>
</Tabs>

