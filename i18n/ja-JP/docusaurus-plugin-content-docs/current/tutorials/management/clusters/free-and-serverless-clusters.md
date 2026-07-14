---
title: "Free & Serverless クラスター | Cloud"
slug: /free-and-serverless-clusters
sidebar_label: "Free & Serverless クラスター"
beta: FALSE
added_since: FALSE
last_modified: FALSE
deprecate_since: FALSE
notebook: FALSE
description: "Free および Serverless クラスターは serving クラスターです。作成、接続、管理という基本的なライフサイクルについては、このページを参照してください。 | Cloud"
type: origin
token: EO58wVRLpiTBXQkceRjccN28nrh
sidebar_position: 1
displayed_sidebar: default

---

import Admonition from '@theme/Admonition';
import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

# Free & Serverless クラスター

Free および Serverless クラスターは serving クラスターです。作成、接続、管理という基本的なライフサイクルについては、このページを参照してください。

<Admonition type="info" icon="📘" title="注">

Dedicated クラスターについては、[Dedicated Cluster](./manage-cluster) を参照してください。プロジェクトエンドポイントを介したオンデマンド検索については、[Connect for On-Demand Search](./connect-for-on-demand-search) を参照してください。

</Admonition>

## Create\{#create}

Free または Serverless クラスターを作成する前に、Zilliz Cloud に登録済みであり、クラスターを作成する organization または project の所有権を持っていることを確認してください。

<Admonition type="info" icon="📘" title="注">

各 organization では、作成できる Free クラスターは 1 つのみです。追加の serving クラスターが必要な場合は、Serverless または Dedicated を使用してください。

</Admonition>

Zilliz Cloud コンソールから Free または Serverless クラスターを作成できます。クラスターのステータスが **Running** に変わると、クラスターの準備は完了です。作成時に表示されるクラスター認証情報は保存してください。パスワードは一度しか表示されません。

RESTful API を使用してクラスターを作成することもできます。

### Free クラスターを作成する\{#create-a-free-cluster}

```bash
curl --request POST \
     --url "https://api.cloud.zilliz.com/v2/clusters/createFree" \
     --header "Authorization: Bearer ${API_KEY}" \
     --header "Accept: application/json" \
     --header "Content-Type: application/json" \
     --data-raw '{
        "clusterName": "cluster-free",
        "projectId": "proj-xxxxxxxxxxxxxxxxxxxxxx",
        "regionId": "gcp-us-west1"
    }'
```

### Serverless クラスターを作成する\{#create-a-serverless-cluster}

```bash
curl --request POST \
     --url "https://api.cloud.zilliz.com/v2/clusters/createServerless" \
     --header "Authorization: Bearer ${API_KEY}" \
     --header "Accept: application/json" \
     --header "Content-Type: application/json" \
     --data-raw '{
        "clusterName": "cluster-serverless",
        "projectId": "proj-xxxxxxxxxxxxxxxxxxxxxxx",
        "regionId": "gcp-us-west1"
    }'
```

| Parameter | 説明 |
| --- | --- |
| `API_KEY` | コントロールプレーン API リクエストの認証に使用する API key。 |
| `clusterName` | 作成するクラスターの名前。 |
| `projectId` | クラスターを作成する project の ID。 |
| `regionId` | クラスターを作成するクラウドリージョンの ID。 |

## Connect\{#connect}

Free および Serverless クラスターでは、以下の serving エンドポイントパターンを使用します。

```bash
https://{cluster-id}.serverless.{region}.vectordb.zillizcloud.com
```

クラスター詳細ページの **Connect** カードから、クラスターのパブリックエンドポイントをコピーします。トークンとしては、クラスターへのアクセス権を持つ API key、または `username:password` 形式のクラスター認証情報のいずれかを使用します。

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

接続を確認するには、collections の一覧表示のような軽量な操作を実行します。

```python
collections = client.list_collections()
print(collections)
```

## Manage\{#manage}

Free および Serverless クラスターは、クラスター詳細ページから管理できます。

| Operation | Free cluster | Serverless cluster |
| --- | --- | --- |
| Rename | サポートされています。 | サポートされています。 |
| Resume | Free クラスターは、7 日間連続で非アクティブな場合に自動的に一時停止され、いつでも再開できます。 | Serverless クラスターは一時停止および再開操作をサポートしていません。 |
| Upgrade deployment option | Serverless または Dedicated にアップグレードできます。Free から Dedicated へのアップグレードでは、新しい Dedicated クラスターが作成され、Free クラスターからデータが移行されます。 | Dedicated にアップグレードできます。Serverless から Dedicated へのアップグレードでは、新しい Dedicated クラスターが作成され、Serverless クラスターからデータが移行されます。 |
| Drop | サポートされています。Free クラスターは削除後、recycle bin から復元できません。 | サポートされています。 |

アップグレードによって新しい Dedicated クラスターが作成される場合は、アプリケーションコード内のクラスターエンドポイントを忘れずに更新してください。

## Drop\{#drop}

プログラムでクラスターを削除するには、クラスター ID を指定して drop cluster API を呼び出します。

```bash
curl --request POST \
     --url "https://api.cloud.zilliz.com/v2/clusters/${CLUSTER_ID}/drop" \
     --header "Authorization: Bearer ${API_KEY}" \
     --header "Accept: application/json" \
     --header "Content-Type: application/json"
```
