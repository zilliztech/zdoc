---
title: "オンデマンド検索のための接続 | BYOC"
slug: /connect-for-on-demand-search
sidebar_label: "オンデマンド検索のための接続"
beta: PUBLIC
added_since: FALSE
last_modified: FALSE
deprecate_since: FALSE
notebook: FALSE
description: "オンデマンドクラスターのコンピューティングを使用してオンデマンド検索またはクエリのワークロードを実行する場合は、プロジェクトエンドポイントを使用します。 | BYOC"
type: origin
token: BTrNwoEfYii1e9kf0BScWDpcnA2
sidebar_position: 2
displayed_sidebar: default

---

import Admonition from '@theme/Admonition';
import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

# オンデマンド検索のための接続

オンデマンドクラスターのコンピューティングを使用してオンデマンド検索またはクエリのワークロードを実行する場合は、プロジェクトエンドポイントを使用します。

<Admonition type="info" title="Note">

このページは、オンデマンド検索用のプロジェクトエンドポイントに接続するためのものです。Free、Serverless、Dedicated のサービングクラスターに接続する場合は、[サービングクラスターへの接続](./connect-to-clusters) を参照してください。

</Admonition>

## エンドポイント形式\{#endpoint-format}

| エンドポイントタイプ | エンドポイントパターン | 用途 |
| --- | --- | --- |
| プロジェクトエンドポイント | `https://{project-id}.{region}.api.zillizcloud.com` | オンデマンドクラスターを介したデータインポート、バッチ検索、クエリ、get、検索、ハイブリッド検索 |

## 事前準備\{#before-you-begin}

- Zilliz Cloud コンソールからプロジェクトエンドポイントを取得すること。

- 検索ワークロードにコンピューティングリソースを提供するオンデマンドクラスター ID を取得すること。

- プロジェクトと対象データに対する十分な権限を持つ API キーを作成すること。

- ユースケースに合った Milvus SDK をインストールすること。詳細については、[SDK のインストール](./install-sdks) を参照してください。

## プロジェクトエンドポイントに接続する\{#connect-to-a-project-endpoint}

プロジェクトエンドポイントを指定して `MilvusClient` を作成し、リクエストを処理するオンデマンドクラスターを指定します。

<Tabs groupId="code" defaultValue='python' values={[{"label":"Python","value":"python"},{"label":"Java","value":"java"},{"label":"Go","value":"go"},{"label":"Rust","value":"rust"},{"label":"C++","value":"c++"},{"label":"NodeJS","value":"javascript"},{"label":"cURL","value":"bash"}]}>
<TabItem value='python'>

```python
from pymilvus import MilvusClient

client = MilvusClient(
    uri="https://{project-id}.{region}.api.zillizcloud.com",
    token="YOUR_API_KEY",
)
```

</TabItem>

<TabItem value='java'>

```java
import io.milvus.v2.client.ConnectConfig;
import io.milvus.v2.client.MilvusClientV2;

ConnectConfig connectConfig = ConnectConfig.builder()
    .uri("https://{project-id}.{region}.api.zillizcloud.com")
    .token("YOUR_API_KEY")
    .build();

MilvusClientV2 client = new MilvusClientV2(connectConfig);
```

</TabItem>

<TabItem value='go'>

```go
// Note: The Go SDK does not support project-endpoint connections with
// on-demand cluster routing as of client/v3.0.0. Use a serving-cluster
// endpoint with the Go SDK instead.
```

</TabItem>

<TabItem value='rust'>

```rust
use milvus::v2::prelude::*;

let config = ConnectConfig::new()
    .uri("https://{project-id}.{region}.api.zillizcloud.com")
    .token("YOUR_API_KEY");
let client = ClientV2::new(&config).await?;
```

</TabItem>

<TabItem value='c++'>

```c++
#include <iostream>
#include "milvus/MilvusClientV2.h"

auto client = milvus::MilvusClientV2::Create();
auto status = client->Connect(milvus::ConnectParam("https://{project-id}.{region}.api.zillizcloud.com").WithToken("YOUR_API_KEY"));
if (!status.IsOk()) {
    std::cout << status.Message() << std::endl;
}
```

</TabItem>

<TabItem value='javascript'>

```javascript
import { MilvusClient } from "@zilliz/milvus2-sdk-node";

const client = new MilvusClient({
  address: "https://{project-id}.{region}.api.zillizcloud.com",
  token: "YOUR_API_KEY",
});
```

</TabItem>

<TabItem value='bash'>

```bash
# Note: The RESTful API does not expose on-demand cluster routing.
# Connect to the project endpoint with the /v2/vectordb/* endpoints directly.
```

</TabItem>
</Tabs>

## 検索セッションを作成する\{#create-a-search-session}

Use a session object to attach your operations to the on-demand クラスター.

<Tabs groupId="code" defaultValue='python' values={[{"label":"Python","value":"python"},{"label":"Java","value":"java"},{"label":"Go","value":"go"},{"label":"Rust","value":"rust"},{"label":"C++","value":"c++"},{"label":"NodeJS","value":"javascript"},{"label":"cURL","value":"bash"}]}>
<TabItem value='python'>

```python
session = client.session(cluster_id="inxx-xxxxxxxxxxxxxxx")
```

</TabItem>

<TabItem value='java'>

```java
import io.milvus.v2.client.MilvusClientV2Session;

MilvusClientV2Session session = client.session("inxx-xxxxxxxxxxxxxxx");
```

</TabItem>

<TabItem value='go'>

```go
// Note: Not yet supported in the Go SDK as of client/v3.0.0.
```

</TabItem>

<TabItem value='rust'>

```rust
let session = client.session("inxx-xxxxxxxxxxxxxxx")?;
```

</TabItem>

<TabItem value='c++'>

```c++
milvus::MilvusClientV2SessionPtr session;
status = client->Session("inxx-xxxxxxxxxxxxxxx", session);
if (!status.IsOk()) {
    std::cout << status.Message() << std::endl;
}
```

</TabItem>

<TabItem value='javascript'>

```javascript
const session = client.session("inxx-xxxxxxxxxxxxxxx");
```

</TabItem>

<TabItem value='bash'>

```bash
# Note: REST does not expose session objects or on-demand cluster routing.
```

</TabItem>
</Tabs>

次に、セッションを使用して、`query`、`get`、`search`、`hybrid_search` などの DQL 操作を実行します。

<Tabs groupId="code" defaultValue='python' values={[{"label":"Python","value":"python"},{"label":"Java","value":"java"},{"label":"Go","value":"go"},{"label":"Rust","value":"rust"},{"label":"C++","value":"c++"},{"label":"NodeJS","value":"javascript"},{"label":"cURL","value":"bash"}]}>
<TabItem value='python'>

```python
results = session.search(
    collection_name="my_collection",
    data=[[0.1, 0.2, 0.3, 0.4]],
    anns_field="vector",
    limit=10,
)

print(results)
```

</TabItem>

<TabItem value='java'>

```java
import io.milvus.v2.service.vector.request.SearchReq;
import io.milvus.v2.service.vector.request.data.FloatVec;
import io.milvus.v2.service.vector.response.SearchResp;
import java.util.Arrays;
import java.util.Collections;

SearchReq searchReq = SearchReq.builder()
    .collectionName("my_collection")
    .data(Collections.singletonList(new FloatVec(Arrays.asList(0.1f, 0.2f, 0.3f, 0.4f))))
    .annsField("vector")
    .topK(10)
    .build();

SearchResp results = session.search(searchReq);
System.out.println(results.getSearchResults());
```

</TabItem>

<TabItem value='go'>

```go
// Note: Not yet supported in the Go SDK as of client/v3.0.0.
```

</TabItem>

<TabItem value='rust'>

```rust
let results = session
    .search(SearchRequest::builder()
        .collection_name("my_collection")
        .vector_field("vector")
        .vectors(SearchVectors::Float(vec![vec![0.1, 0.2, 0.3, 0.4]]))
        .limit(10)
        .build()?)
    .await?;

println!("{results:?}");
```

</TabItem>

<TabItem value='c++'>

```c++
#include <vector>

milvus::SearchRequest request;
request.WithCollectionName("my_collection").WithLimit(10).WithAnnsField("vector");
request.AddFloatVector(std::vector<float>{0.1f, 0.2f, 0.3f, 0.4f});

milvus::SearchResponse response;
status = session->Search(request, response);
if (!status.IsOk()) {
    std::cout << status.Message() << std::endl;
}
```

</TabItem>

<TabItem value='javascript'>

```javascript
const results = await session.search({
  collection_name: "my_collection",
  vector: [0.1, 0.2, 0.3, 0.4],
  anns_field: "vector",
  limit: 10,
});

console.log(results);
```

</TabItem>

<TabItem value='bash'>

```bash
# Note: REST does not expose session objects or on-demand cluster routing.
# Search an on-demand cluster via the /v2/vectordb/search endpoint on the project endpoint.
```

</TabItem>
</Tabs>

## 認証\{#authentication}

プロジェクトエンドポイントに接続する場合は、有効な API キーを認証トークンとして使用します。

`username:password` 形式のクラスター認証情報は、サービングクラスターエンドポイント用です。プロジェクトエンドポイントを介したオンデマンド検索では、必要なプロジェクト権限を持つ API キーを使用してください。

## この接続を使用する場合\{#when-to-use-this-connection}

バッチ処理、探索、検証、実験など、常時稼働のサービングよりもオンデマンドコンピューティングの方が適しているワークロードには、プロジェクトエンドポイントを使用します。

完全なコレクション API と常時稼働の低レイテンシサービングを必要とする本番アプリケーションでは、代わりに Free、Serverless、Dedicated のサービングクラスターに接続してください。サービングクラスターのエンドポイント形式と接続例については、[サービングクラスターへの接続](./connect-to-clusters) を参照してください。
