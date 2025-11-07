---
title: "クラスターに接続 | Cloud"
slug: /connect-to-cluster
sidebar_label: "クラスターに接続"
beta: FALSE
added_since: FALSE
last_modified: FALSE
deprecate_since: FALSE
notebook: FALSE
description: "この記事では、クラスターに接続するための体系的なガイドを提供します。 | Cloud"
type: origin
token: IVFfws0lJi8gIVkRvrvc9aXvnNe
sidebar_position: 2
keywords: 
  - zilliz
  - ベクターデータベース
  - クラウド
  - クラスター
  - 接続
  - llm-as-a-judge
  - ハイブリッドベクター検索
  - ビデオ重複排除
  - ビデオ類似検索

---

import Admonition from '@theme/Admonition';
import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

# クラスターに接続

この記事では、クラスターに接続するための体系的なガイドを提供します。

## 事前準備\{#before-you-start}

次に進む前に、以下の前提条件が満たされていることを確認してください：

- Zilliz Cloudでアカウントを登録済みです。詳細については、[Zilliz Cloudに登録](./register-with-zilliz-cloud)を参照してください。

- クラスターを作成済みです。詳細については、[クラスターを作成](./create-cluster)を参照してください。

- ご使用のユースケースに適したMilvus SDKをインストール済みです。詳細については、[SDKをインストール](./install-sdks)を参照してください。

<Admonition type="info" icon="📘" title="注意">

<p>SDKよりもRESTful APIの使用を検討している場合、継続的な接続を確立できないことに注意することが重要です。これは、HTTPプロトコルの単方向通信モードに起因します。</p>

</Admonition>

## クラスターに接続\{#connect-to-a-cluster}

クラスターが稼働したら、パブリックエンドポイントと認証トークンを使用して接続します。

- **クラスターパブリックエンドポイント:** Zilliz Cloudウェブコンソールで取得できます。対象クラスターの**クラスター詳細**ページに移動します。**接続**カードで、クラスターパブリックエンドポイントをコピーできます。

    ![connection-info](/img/connection-info.png)

- **トークン:** このトークンは、[APIキー](./manage-api-keys)またはユーザー名とパスワードのペアで構成される[クラスターログイン情報](./cluster-credentials)のいずれかになります。

以下の例では、クラスターに接続する方法を示します。

<Tabs groupId="code" defaultValue='python' values={[{"label":"Python","value":"python"},{"label":"Java","value":"java"},{"label":"NodeJS","value":"javascript"}]}>
<TabItem value='python'>

```python
# MilvusClientオブジェクトを使用して接続
from pymilvus import MilvusClient
CLUSTER_ENDPOINT="YOUR_CLUSTER_ENDPOINT" # クラスターのエンドポイントを設定
TOKEN="YOUR_CLUSTER_TOKEN" # トークンを設定

# MilvusClientインスタンスを初期化
# uriとtokenを自分のものに置き換えてください
client = MilvusClient(
    uri=CLUSTER_ENDPOINT, # コンソールから取得したクラスターのエンドポイント
    token=TOKEN # APIキーまたはコロンで区切られたクラスターのユーザー名とパスワード
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
