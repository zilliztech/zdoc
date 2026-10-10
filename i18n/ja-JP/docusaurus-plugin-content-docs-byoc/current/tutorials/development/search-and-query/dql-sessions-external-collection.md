---
title: "オンデマンド DQL 操作 | BYOC"
slug: /dql-sessions-external-collection
sidebar_label: "DQL セッション"
beta: PUBLIC
added_since: FALSE
last_modified: FALSE
deprecate_since: FALSE
notebook: FALSE
description: "オンデマンドコンピューティング向けのコレクションでの DQL 操作（search、query、get、hybrid search など）では、オンデマンドクラスターのコンピューティングリソースをアタッチする必要があります。Zilliz Cloud では、セッションを作成してオンデマンドコンピューティングのニーズに対応できます。 | BYOC"
type: origin
token: BcjLwmXTni1fiMkkyx9ct5iWngc
sidebar_position: 2
displayed_sidebar: default

---

import Admonition from '@theme/Admonition';
import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

# オンデマンド DQL 操作

オンデマンドコンピューティング向けのコレクションでの DQL 操作（search、query、get、hybrid search など）では、オンデマンドクラスターのコンピューティングリソースをアタッチする必要があります。Zilliz Cloud では、セッションを作成してオンデマンドコンピューティングのニーズに対応できます。

この記事では、プロジェクトエンドポイントを使用してデータベースにコレクションを作成済みであることを前提としています。詳細については、[外部コレクションの作成](./create-external-collection) を参照してください。

## プロジェクトエンドポイントに接続する\{#connect-to-a-project-endpoint}

プロジェクトエンドポイントは、オンデマンドコンピューティングリソースへのアクセスを提供するために設計されています。これを使用すると、オンデマンドクラスターとデータベースを管理したり、コレクションに保存されているデータを操作したりできます。

以下のコード例では、デフォルトデータベースに `my_collection` という名前の外部コレクションがあることを前提としています。また、接続を確立するには、十分な権限を持つ有効な API キーを常に使用してください。

<Tabs groupId="code" defaultValue='python' values={[{"label":"Python","value":"python"},{"label":"Java","value":"java"},{"label":"Go","value":"go"},{"label":"Rust","value":"rust"},{"label":"C++","value":"c++"},{"label":"NodeJS","value":"javascript"},{"label":"cURL","value":"bash"}]}>
<TabItem value='python'>

```python
client = MilvusClient(
    uri="https://{project-id}.{region}.vectordb.zillizcloud.com",
    token="YOUR_API_KEY"
)

client.has_collection(
    collection_name="my_collection"
)
```

</TabItem>

<TabItem value='java'>

```java
import io.milvus.v2.client.ConnectConfig;
import io.milvus.v2.client.MilvusClientV2;

MilvusClientV2 client = new MilvusClientV2(ConnectConfig.builder()
        .uri("https://{project-id}.{region}.vectordb.zillizcloud.com")
        .token("YOUR_API_KEY")
        .build());

client.hasCollection("my_collection");
```

</TabItem>

<TabItem value='go'>

```go
// Note: the cluster session is not yet supported in milvus-sdk-go.
```

</TabItem>

<TabItem value='rust'>

```rust
use milvus::v2::prelude::*;

#[tokio::main]
async fn main() -> Result<()> {
    let client = ClientV2::new(
        &ConnectConfig::new()
            .uri("https://{project-id}.{region}.vectordb.zillizcloud.com")
            .token("YOUR_API_KEY"),
    )
    .await?;

    let has = client.has_collection("my_collection").await?;
    Ok(())
}
```

</TabItem>

<TabItem value='c++'>

```c++
#include "milvus/MilvusClientV2.h"

auto client = milvus::MilvusClientV2::Create();
auto status = client->Connect(milvus::ConnectParam("https://{project-id}.{region}.vectordb.zillizcloud.com", "YOUR_API_KEY"));

bool has = client->HasCollection("my_collection");
```

</TabItem>

<TabItem value='javascript'>

```javascript
const client = new MilvusClient({
    address: "https://{project-id}.{region}.vectordb.zillizcloud.com",
    token: "YOUR_API_KEY"
});

client.has_collection({
    collection_name: "my_collection"
});
```

</TabItem>

<TabItem value='bash'>

```bash
export PROJECT_ENDPOINT='https://{project-id}.{region}.vectordb.zillizcloud.com'
export TOKEN="YOUR_API_KEY"

curl --request POST \
--url "${PROJECT_ENDPOINT}/v2/vectordb/collections/has" \
--header "Authorization: Bearer ${TOKEN}" \
--header "Content-Type: application/json" \
-d '{
    "collectionName": "my_collection"
}'
```

</TabItem>
</Tabs>

## セッションを作成する\{#create-a-session}

プロジェクトエンドポイントへの接続を確立したら、セッションを作成して、指定したオンデマンドクラスターのコンピューティングリソースをアタッチします。

以下の例では、ID が `inxx-xxxxxxxxxxxxxxxxx` のオンデマンドクラスターをすでに作成していることを前提としています。

<Admonition type="info" title="Notes">

RESTful リクエストの場合は、セッションを作成する代わりに、クラスター ID をクエリパラメーターとして DQL 呼び出しに渡す必要があります。

</Admonition>

<Tabs groupId="code" defaultValue='python' values={[{"label":"Python","value":"python"},{"label":"Java","value":"java"},{"label":"Go","value":"go"},{"label":"Rust","value":"rust"},{"label":"C++","value":"c++"},{"label":"NodeJS","value":"javascript"},{"label":"cURL","value":"bash"}]}>
<TabItem value='python'>

```python
session = client.session(
    cluster_id="inxx-xxxxxxxxxxxxxxxxx"
)
```

</TabItem>

<TabItem value='java'>

```java
import io.milvus.v2.client.MilvusClientV2Session;

MilvusClientV2Session session = client.session("inxx-xxxxxxxxxxxxxxxxx");
```

</TabItem>

<TabItem value='go'>

```go
// Note: the cluster session is not yet supported in milvus-sdk-go.
```

</TabItem>

<TabItem value='rust'>

```rust
let session = client.session("inxx-xxxxxxxxxxxxxxxxx")?;
```

</TabItem>

<TabItem value='c++'>

```c++
milvus::MilvusClientV2SessionPtr session;
status = client->Session("inxx-xxxxxxxxxxxxxxxxx", session);
```

</TabItem>

<TabItem value='javascript'>

```javascript
const session = client.session("inxx-xxxxxxxxxxxxxxxxx");
```

</TabItem>

<TabItem value='bash'>

```bash
export CLUSTER_ID="inxx-xxxxxxxxxxxxxxxxx"
```

</TabItem>
</Tabs>

## DQL 操作を実行する\{#conduct-dql-operations}

セッションの準備ができたら、検索を実行できます。以下の例では、基本的なベクトル検索を例として使用しています。これは query、get、hybrid search にも同様に当てはまります。

<Tabs groupId="code" defaultValue='python' values={[{"label":"Python","value":"python"},{"label":"Java","value":"java"},{"label":"Go","value":"go"},{"label":"Rust","value":"rust"},{"label":"C++","value":"c++"},{"label":"NodeJS","value":"javascript"},{"label":"cURL","value":"bash"}]}>
<TabItem value='python'>

```python
query_vector = [0.3580376395471989, -0.6023495712049978, 0.18414012509913835, -0.26286205330961354, 0.9029438446296592]
res = session.search(
    db_name="my_database",
    collection_name="my_collection",
    anns_field="vector",
    data=[query_vector],
    limit=3,
    output_fields=["product_id", "title", "main_category", "price", "average_rating", "rating_number"]
)
```

</TabItem>

<TabItem value='java'>

```java
import io.milvus.v2.service.vector.request.SearchReq;
import io.milvus.v2.service.vector.request.data.FloatVec;
import io.milvus.v2.service.vector.response.SearchResp;
import java.util.*;

FloatVec queryVector = new FloatVec(new float[]{0.3580376395471989f, -0.6023495712049978f, 0.18414012509913835f, -0.26286205330961354f, 0.9029438446296592f});

SearchReq searchReq = SearchReq.builder()
        .databaseName("my_database")
        .collectionName("my_collection")
        .data(Collections.singletonList(queryVector))
        .annsField("vector")
        .topK(3)
        .outputFields(Arrays.asList("product_id", "title", "main_category", "price", "average_rating", "rating_number"))
        .build();

SearchResp searchResp = session.search(searchReq);
```

</TabItem>

<TabItem value='go'>

```go
// Note: the cluster session is not yet supported in milvus-sdk-go.
```

</TabItem>

<TabItem value='rust'>

```rust
let query_vector = vec![0.3580376395471989, -0.6023495712049978, 0.18414012509913835, -0.26286205330961354, 0.9029438446296592];

let res = session
    .search(
        SearchRequest::builder()
            .database_name("my_database")
            .collection_name("my_collection")
            .vector_field("vector")
            .vectors(SearchVectors::Float(vec![query_vector]))
            .limit(3)
            .output_fields(["product_id", "title", "main_category", "price", "average_rating", "rating_number"])
            .build()?,
    )
    .await?;
```

</TabItem>

<TabItem value='c++'>

```c++
std::vector<float> queryVector = {
    0.35803764F, -0.60234958F, 0.18414013F, -0.26286206F, 0.90294385F
};

auto request = milvus::SearchRequest()
    .WithDatabaseName("my_database")
    .WithCollectionName("my_collection")
    .WithAnnsField("vector")
    .WithLimit(3)
    .AddOutputField("product_id")
    .AddOutputField("title")
    .AddFloatVector(queryVector);

milvus::SearchResponse response;
status = session->Search(request, response);
```

</TabItem>

<TabItem value='javascript'>

```javascript
const query_vector = [0.3580376395471989, -0.6023495712049978, 0.18414012509913835, -0.26286205330961354, 0.9029438446296592];
const res = session.search({
    db_name: "my_database",
    collection_name: "my_collection",
    anns_field: "vector",
    data: [query_vector],
    limit: 3,
    output_fields: ["product_id", "title", "main_category", "price", "average_rating", "rating_number"],
});
```

</TabItem>

<TabItem value='bash'>

```bash
curl --request POST \
--url "${PROJECT_ENDPOINT}/v2/vectordb/entities/search?cluster_id=inxx-xxxxxxxxxxxxxxxxx" \
--header "Authorization: Bearer ${TOKEN}" \
--header "Content-Type: application/json" \
-d '{
    "dbName": "my_database",
    "collectionName": "my_collection",
    "data": [
        [
            0.3580376395471989,
            -0.6023495712049978,
            0.18414012509913835,
            -0.26286205330961354,
            0.9029438446296592
        ]
    ],
    "annsField": "vector",
    "limit": 3,
    "outputFields": [
        "product_id",
        "title",
        "main_category",
        "price",
        "average_rating",
        "rating_number"
    ]
}'
```

</TabItem>
</Tabs>

## セッションを閉じる\{#close-a-session}

オンデマンドコンピューティングのタスクが完了したら、セッションを閉じることができます。閉じたセッションは、以降の DQL 操作には使用できません。

<Admonition type="info" title="Notes">

RESTful 呼び出しにはこれは必要ありません。

</Admonition>

<Tabs groupId="code" defaultValue='python' values={[{"label":"Python","value":"python"},{"label":"Java","value":"java"},{"label":"Go","value":"go"},{"label":"Rust","value":"rust"},{"label":"C++","value":"c++"},{"label":"NodeJS","value":"javascript"},{"label":"cURL","value":"bash"}]}>
<TabItem value='python'>

```python
session.close()
```

</TabItem>

<TabItem value='java'>

```java
session.close();
```

</TabItem>

<TabItem value='go'>

```go
// Note: the cluster session is not yet supported in milvus-sdk-go.
```

</TabItem>

<TabItem value='rust'>

```rust
session.close();
```

</TabItem>

<TabItem value='c++'>

```c++
session->Close();
```

</TabItem>

<TabItem value='javascript'>

```javascript
session.close();
```

</TabItem>

<TabItem value='bash'>

```bash
# Note: the RESTful API does not maintain a persistent session; no explicit close is required.
```

</TabItem>
</Tabs>

