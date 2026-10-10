---
title: "Free & Serverless クラスター | BYOC"
slug: /free-and-serverless-clusters
sidebar_label: "Free & Serverless クラスター"
beta: FALSE
added_since: FALSE
last_modified: FALSE
deprecate_since: FALSE
notebook: FALSE
description: "Free および Serverless クラスターはサービングクラスターです。作成、接続、管理という基本的なライフサイクルについては、このページを参照してください。 | BYOC"
type: origin
token: EO58wVRLpiTBXQkceRjccN28nrh
sidebar_position: 1
displayed_sidebar: default

---

import Admonition from '@theme/Admonition';
import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

# Free & Serverless クラスター

Free および Serverless クラスターはサービングクラスターです。作成、接続、管理という基本的なライフサイクルについては、このページを参照してください。

<Admonition type="info" title="Note">

Dedicated クラスターについては、[Dedicated クラスター](./manage-cluster) を参照してください。プロジェクトエンドポイントを介したオンデマンド検索については、[オンデマンド検索への接続](./connect-for-on-demand-search) を参照してください。

</Admonition>

## 作成\{#create}

Free または Serverless クラスターを作成する前に、Zilliz Cloud に登録済みであり、クラスターを作成する組織またはプロジェクトの所有権を持っていることを確認してください。

<Admonition type="info" title="Note">

各組織で作成できる Free クラスターは 1つだけです。追加のサービングクラスターが必要な場合は、Serverless または Dedicated を使用してください。

</Admonition>

Free または Serverless クラスターは、Zilliz Cloud コンソールから作成できます。クラスターのステータスが **Running** に変わると、クラスターは使用可能です。作成時に表示されるクラスター認証情報は保存してください。パスワードは一度しか表示されません。

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

| パラメーター | 説明 |
| --- | --- |
| `API_KEY` | コントロールプレーン API リクエストの認証に使用する API キーです。 |
| `clusterName` | 作成するクラスターの名前です。 |
| `projectId` | クラスターを作成するプロジェクトの ID です。 |
| `regionId` | クラスターを作成するクラウドリージョンの ID です。 |

## 接続\{#connect}

Free および Serverless クラスターでは、以下のサービングエンドポイントパターンを使用します。

```bash
https://{cluster-id}.serverless.{region}.vectordb.zillizcloud.com
```

クラスターの詳細ページの **Connect** カードから、クラスターのパブリックエンドポイントをコピーします。トークンには、そのクラスターにアクセスできる API キー、または `username:password` 形式のクラスター認証情報のいずれかを使用します。

<Tabs groupId="code" defaultValue='python' values={[{"label":"Python","value":"python"},{"label":"Java","value":"java"},{"label":"Go","value":"go"},{"label":"Rust","value":"rust"},{"label":"C++","value":"c++"},{"label":"NodeJS","value":"javascript"},{"label":"cURL","value":"bash"}]}>
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
import "github.com/milvus-io/milvus/client/v3/milvusclient"

client, err := milvusclient.New(ctx, &milvusclient.ClientConfig{
    Address: "YOUR_CLUSTER_ENDPOINT",
    APIKey:  "YOUR_CLUSTER_TOKEN",
})
```

</TabItem>

<TabItem value='rust'>

```rust
use milvus::v2::prelude::*;

let config = ConnectConfig::new()
    .uri("YOUR_CLUSTER_ENDPOINT")
    .token("YOUR_CLUSTER_TOKEN");
let client = ClientV2::new(&config).await?;
```

</TabItem>

<TabItem value='c++'>

```c++
#include <iostream>
#include "milvus/MilvusClientV2.h"

auto client = milvus::MilvusClientV2::Create();
auto status = client->Connect(milvus::ConnectParam("YOUR_CLUSTER_ENDPOINT").WithToken("YOUR_CLUSTER_TOKEN"));
if (!status.IsOk()) {
    std::cout << status.Message() << std::endl;
}
```

</TabItem>

<TabItem value='javascript'>

```javascript
import { MilvusClient } from "@zilliz/milvus2-sdk-node";

const address = "YOUR_CLUSTER_ENDPOINT";
const token = "YOUR_CLUSTER_TOKEN";

const client = new MilvusClient({ address, token });
```

</TabItem>

<TabItem value='bash'>

```bash
curl --request POST \
  --url "YOUR_CLUSTER_ENDPOINT/v2/vectordb/collections/list" \
  --header "Authorization: Bearer YOUR_CLUSTER_TOKEN" \
  --header "Content-Type: application/json" \
  --data '{"dbName": "default"}'
```

</TabItem>
</Tabs>

接続を確認するには、コレクションの一覧表示などの軽量な操作を実行します。

```python
collections = client.list_collections()
print(collections)
```

## 管理\{#manage}

Free および Serverless クラスターは、クラスターの詳細ページから管理できます。

| 操作 | Free クラスター | Serverless クラスター |
| --- | --- | --- |
| 名前の変更 | サポートされています。 | サポートされています。 |
| 再開 | Free クラスターは 7 日間連続で非アクティブになると自動的に一時停止され、いつでも再開できます。 | Serverless クラスターは、一時停止および再開操作をサポートしていません。 |
| デプロイオプションのアップグレード | Serverless または Dedicated にアップグレードできます。Free から Dedicated へのアップグレードでは、新しい Dedicated クラスターが作成され、Free クラスターからデータが移行されます。 | Dedicated にアップグレードできます。Serverless から Dedicated へのアップグレードでは、新しい Dedicated クラスターが作成され、Serverless クラスターからデータが移行されます。 |
| 削除 | サポートされています。Free クラスターは、削除後にごみ箱から復元できません。 | サポートされています。 |

アップグレードによって新しい Dedicated クラスターが作成される場合は、アプリケーションコード内のクラスターエンドポイントを忘れずに更新してください。

## 削除\{#drop}

プログラムからクラスターを削除するには、クラスター ID を指定してクラスター削除 API を呼び出します。

```bash
curl --request POST \
     --url "https://api.cloud.zilliz.com/v2/clusters/${CLUSTER_ID}/drop" \
     --header "Authorization: Bearer ${API_KEY}" \
     --header "Accept: application/json" \
     --header "Content-Type: application/json"
```
