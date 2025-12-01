---
title: "クラスターへの接続 | BYOC"
slug: /connect-to-cluster
sidebar_label: "クラスターへの接続"
beta: FALSE
added_since: FALSE
last_modified: FALSE
deprecate_since: FALSE
notebook: FALSE
description: "クラスターへの接続方法についての体系的なガイド。 | BYOC"
type: origin
token: IVFfws0lJi8gIVkRvrvc9aXvnNe
sidebar_position: 2
keywords:
  - zilliz
  - ベクトルデータベース
  - クラウド
  - クラスター
  - 接続
  - ハイブリッドベクトル検索
  - ビデオ重複排除
  - ビデオ類似検索
  - ベクトル検索

---

import Admonition from '@theme/Admonition';
import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

# クラスターへの接続

この記事では、クラスターへの接続方法について体系的なガイドを提供します。

## 事前準備\{#before-you-start}

進める前に、以下の前提条件が満たされていることを確認してください：

- BYOCプロジェクトをデプロイ済みです。詳細は[Deploy BYOC on AWS](./deploy-byoc-aws)を参照してください。

- クラスターを作成済みです。詳細は[Create Cluster](./create-cluster)を参照してください。

- あなたのユースケースに適したMilvus SDKをインストール済みです。詳細は[Install SDKs](./install-sdks)を参照してください。

<Admonition type="info" icon="📘" title="Note">

<p>SDKよりもRESTful APIを活用することを検討している場合、継続的な接続は確立できないことに注意することが重要です。これは、HTTPプロトコルの双方向通信モードに起因します。</p>

</Admonition>

## クラスターへの接続\{#connect-to-a-cluster}

クラスターが稼働している状態で、パブリックエンドポイントと認証トークンを使用して接続します。

- **クラスターパブリックエンドポイント:** Zilliz Cloudウェブコンソールで取得できます。対象クラスターの**クラスターデータils**ページに移動します。**Connect**カードで、クラスターパブリックエンドポイントをコピーできます。

    ![connection-info](/img/connection-info.png)

- **トークン:** [クラスタークレデンシャル](./cluster-credentials)（ユーザー名とパスワードのペア）を使用できます。

以下の例は、クラスターへの接続方法を示しています。

<Tabs groupId="code" defaultValue='python' values={[{"label":"Python","value":"python"},{"label":"Java","value":"java"},{"label":"NodeJS","value":"javascript"}]}>
<TabItem value='python'>

```python
# MilvusClientオブジェクトを使用して接続
from pymilvus import MilvusClient
CLUSTER_ENDPOINT="YOUR_CLUSTER_ENDPOINT" # クラスターエンドポイントを設定
TOKEN="YOUR_CLUSTER_TOKEN" # トークンを設定

# MilvusClientインスタンスを初期化
# uriとtokenを自分のものに置き換えてください
client = MilvusClient(
    uri=CLUSTER_ENDPOINT, # コンソールから取得したクラスターエンドポイント
    token=TOKEN # コロンで区切られたクラスターのユーザー名とパスワード
)
```

</TabItem>

<TabItem value='java'>

```java
import io.milvus.v2.client.MilvusClientV2;
import io.milvus.v2.client.ConnectConfig;

String CLUSTER_ENDPOINT = "YOUR_CLUSTER_ENDPOINT";
String TOKEN = "YOUR_CLUSTER_TOKEN";

// 1. Milvusサーバーに接続
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

// 1. クラスターに接続
const client = new MilvusClient({address, token})
```

</TabItem>
</Tabs>
