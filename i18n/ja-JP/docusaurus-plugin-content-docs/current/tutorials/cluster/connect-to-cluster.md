---
title: "クラスターへの接続 | Cloud"
slug: /connect-to-cluster
sidebar_key: connect-to-cluster
sidebar_label: "クラスターへの接続"
beta: FALSE
notebook: FALSE
description: "この記事では、クラスターに接続するための体系的なガイドを提供します。| Cloud"
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

続行する前に、以下の前提条件が満たされていることを確認してください：

- Zilliz Cloud にアカウントを登録済みであること。詳細は [Zilliz Cloud に登録](./register-with-zilliz-cloud) をご覧ください。

- クラスターを作成済みであること。詳細は [クラスターの作成](./create-cluster) をご覧ください。

- ユースケースに適した Milvus SDK をインストール済みであること。詳細は [SDK のインストール](./install-sdks) をご覧ください。

<Admonition type="info" icon="📘" title="Note">

<p>SDK よりも RESTful API の利用を検討している場合、継続的な接続を確立できない点を理解することが重要です。これは、HTTP プロトコルが単方向通信モードを採用していることに起因します。</p>
<p></p>

</Admonition>

## クラスターへの接続\{#connect-to-a-cluster}

クラスターが稼働したら、そのパブリックエンドポイントと認証トークンを使用して接続します。

- **クラスターの公開エンドポイント:** これは Zilliz Cloud Web コンソールで取得できます。対象のクラスの**クラスターの詳細**ページに移動し、**接続**カードからクラスターの公開エンドポイントをコピーできます。

    ![connection-info](https://zdoc-images.s3.us-west-2.amazonaws.com/connection-info.png "connection-info")

- **トークン:** このトークンは、[API キー](./manage-api-keys) またはユーザー名とパスワードのペアで構成される [クラスター資格情報](./cluster-credentials) のいずれかです。

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
    token=TOKEN # API key or a colon-separated cluster username and password
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

