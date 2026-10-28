---
title: "サービングクラスターに接続する | Cloud"
slug: /connect-to-serving-cluster
sidebar_label: "サービングクラスターに接続する"
beta: FALSE
added_since: FALSE
last_modified: FALSE
deprecate_since: FALSE
notebook: FALSE
description: "Zilliz Cloud は、多様なビジネスニーズに対応するさまざまなサービングクラスターのデプロイオプションを提供します。 | Cloud"
type: origin
token: SFPlwOh8cigh8wkm9xLcXHlfnVh
sidebar_position: 1
displayed_sidebar: default

---

import Admonition from '@theme/Admonition';
import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

# サービングクラスターに接続する

Zilliz Cloud は、多様なビジネスニーズに対応するさまざまなサービングクラスターのデプロイオプションを提供します。

- **Free**: 学習や個人プロジェクトの出発点となるオプションで、ストレージ、vCU 消費量、コレクション数に制限があります。

- **Serverless**: ワークロードに合わせて自動的にスケールする共有環境を提供し、リソースをプロビジョニングする必要はありません。予測不能なトラフィックや急増するトラフィックに対して、優れたコスト効率と伸縮性を実現します。

- **Dedicated**: 一貫した予測可能なパフォーマンスが求められる本番ワークロード向けに、分離された予約済み環境を提供します。このオプションは、持続的な高スループットと低レイテンシが重要なアプリケーションに最適です。

## エンドポイント形式\{#endpoint-formats}

| クラスタータイプ | エンドポイントパターン | 備考 |
| --- | --- | --- |
| Free/Serverless | `https://{cluster-id}.serverless.{region}.vectordb.zillizcloud.com` | Free/Serverless クラスターは、専用ポートなしでリアルタイムサービングエンドポイントを使用します。 |
| Dedicated | `https://{cluster-id}.{region}.vectordb.zillizcloud.com:19530` | Dedicated クラスターは、ポート `19530` を使用するリアルタイムサービングエンドポイントを使用します。 |

## Free/Serverless クラスターに接続する\{#connect-to-freeserverless-clusters}

クラスターの詳細ページにある **Connect** カードから、クラスターのパブリックエンドポイントをコピーします。トークンには、クラスターへのアクセス権を持つ API キー、または `username:password` 形式のクラスター認証情報を使用します。

<Tabs groupId="code" defaultValue='python' values={[{"label":"Python","value":"python"},{"label":"Java","value":"java"},{"label":"Go","value":"go"},{"label":"Rust","value":"rust"},{"label":"C++","value":"c++"},{"label":"NodeJS","value":"javascript"},{"label":"CSharp","value":"csharp"},{"label":"cURL","value":"bash"}]}>
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
import (
    "context"

    "github.com/milvus-io/milvus/client/v3/milvusclient"
)

ctx := context.Background()

client, err := milvusclient.New(ctx, &milvusclient.ClientConfig{
    Address: "YOUR_CLUSTER_ENDPOINT",
    APIKey:  "YOUR_CLUSTER_TOKEN",
})
if err != nil {
    panic(err)
}
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

<TabItem value='csharp'>

```csharp
using Milvus.Client.V2;
using Milvus.Client.V2.Types;

const string CLUSTER_ENDPOINT = "YOUR_CLUSTER_ENDPOINT";
const string TOKEN = "YOUR_CLUSTER_TOKEN";

using var client = new MilvusClientV2(new ConnectConfig
{
    Uri = CLUSTER_ENDPOINT,
    ApiKey = TOKEN
});
await client.ConnectAsync();
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

接続を確認するには、コレクションの一覧表示など、軽量な操作を実行します。

```python
collections = client.list_collections()
print(collections)
```

## Dedicated クラスターに接続する\{#connect-to-dedicated-clusters}

SDK 間でクラスターのエンドポイントとトークンを一貫して使用します。`YOUR_CLUSTER_ENDPOINT` は、クラスターの **Connect** カードからコピーしたパブリックエンドポイントです。`YOUR_CLUSTER_TOKEN` には、ターゲットクラスターへのアクセス権を持つ API キー、または `username:password` 形式のクラスター認証情報を使用します。

<Tabs groupId="code" defaultValue='python' values={[{"label":"Python","value":"python"},{"label":"Java","value":"java"},{"label":"Go","value":"go"},{"label":"Rust","value":"rust"},{"label":"C++","value":"c++"},{"label":"NodeJS","value":"javascript"},{"label":"CSharp","value":"csharp"},{"label":"cURL","value":"bash"}]}>
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
import (
    "context"

    "github.com/milvus-io/milvus/client/v3/milvusclient"
)

ctx := context.Background()

client, err := milvusclient.New(ctx, &milvusclient.ClientConfig{
    Address: "YOUR_CLUSTER_ENDPOINT",
    APIKey:  "YOUR_CLUSTER_TOKEN",
})
if err != nil {
    // handle error
}
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

<TabItem value='csharp'>

```csharp
using Milvus.Client.V2;
using Milvus.Client.V2.Types;

const string CLUSTER_ENDPOINT = "YOUR_CLUSTER_ENDPOINT";
const string TOKEN = "YOUR_CLUSTER_TOKEN";

MilvusClientV2 client = new(new ConnectConfig
{
    Uri = CLUSTER_ENDPOINT,
    ApiKey = TOKEN
});
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

接続を確認するには、コレクションの一覧表示など、軽量な操作を実行します。

```python
collections = client.list_collections()
print(collections)
```
