---
title: "Clusterに接続 | Cloud"
slug: /connect-to-cluster
sidebar_label: "Clusterに接続"
beta: FALSE
notebook: FALSE
description: "この記事では、クラスターへの接続に関する体系的なガイドを提供しています。 | Cloud"
type: origin
token: IVFfws0lJi8gIVkRvrvc9aXvnNe
sidebar_position: 2
keywords: 
  - zilliz
  - vector database
  - cloud
  - cluster
  - connect
  - nearest neighbor search
  - Agentic RAG
  - rag llm architecture
  - private llms

---

import Admonition from '@theme/Admonition';
import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

# Clusterに接続

この記事では、クラスターへの接続に関する体系的なガイドを提供しています。

## 始める前に{#before-you-start}

次に進む前に、次の前提条件が満たされていることを確認してください:

- Zilliz Cloudにアカウントを登録しました。詳細については、[Zilliz Cloudに登録してください。](./register-with-zilliz-cloud)を参照してください。

</exclude>

- BYOCプロジェクトをデプロイしました。詳細については、[AWSでBYOCをデプロイする](./deploy-byoc-aws)を参照してください。

</include>

- クラスタが作成されました。詳細については、[クラスタ作成](./create-cluster)を参照してください。

- ユースケースに適したMilvus SDKがインストールされています。詳細については、[SDKのインストール](./install-sdks)を参照してください。

<Admonition type="caution" icon="🚧" title="undefined">

<p>SDKよりもRESTful APIを利用する傾向にある人にとって、継続的な接続は確立できないことを理解することが重要です。これは、HTTPプロトコルの単方向通信モードに起因しています。</p>

</Admonition>

## クラスタに接続する{#connect-to-a-cluster}

クラスターが稼働したら、パブリックエンドポイントと認証トークンを使用して接続します。 

- クラスター公開エンドポイント:これはZilliz Cloudウェブコンソールで取得できます。ターゲットクラスターの「クラスターの詳細」ページに移動してください。「接続」カードで、クラスター公開エンドポイントをコピーできます。

    ![connection-info](/img/connection-info.png)

- **トークン:**このトークンは[APIキー](./manage-api-keys)またはユーザー名とパスワードのペアで構成される[クラスター資格情報](./cluster-credentials)。

次の例は、クラスターに接続する方法を示しています。

<Tabs groupId="code" defaultValue='python' values={[{"label":"Python","value":"python"},{"label":"Java","value":"java"},{"label":"NodeJS","value":"javascript"}]}>
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

<TabItem value='javascript'>

```javascript
const { MilvusClient, DataType, sleep } = require("@zilliz/milvus2-sdk-node")

const address = "YOUR_CLUSTER_ENDPOINT"
const token = "YOUR_CLUSTER_TOKEN"

// 1. Connect to the cluster
const client = new MilvusClient({address, token})
```

</TabItem>
</Tabs>

