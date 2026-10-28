---
title: "一貫性レベル | Cloud"
slug: /consistency-level
sidebar_label: "一貫性レベル"
beta: FALSE
added_since: FALSE
last_modified: FALSE
deprecate_since: FALSE
notebook: FALSE
description: "分散ベクトルデータベースである Zilliz Cloud は、読み取りおよび書き込み操作中に各ノードまたはレプリカが同じデータにアクセスできるよう、複数の一貫性レベルを提供します。現在サポートされている一貫性レベルには Strong、Bounded、Eventually、Session があり、デフォルトでは Bounded が使用されます。 | Cloud"
type: origin
token: Xx9EwWtekinLZfkWKqic37dDnFb
sidebar_position: 21
displayed_sidebar: default

---

import Admonition from '@theme/Admonition';
import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

# 一貫性レベル

分散ベクトルデータベースである Zilliz Cloud は、読み取りおよび書き込み操作中に各ノードまたはレプリカが同じデータにアクセスできるよう、複数の一貫性レベルを提供します。現在サポートされている一貫性レベルには **Strong**、**Bounded**、**Eventually**、**Session** があり、デフォルトでは **Bounded** が使用されます。

## 概要\{#overview}

Zilliz Cloud は、ストレージとコンピューティングを分離するシステムです。このシステムでは、**DataNodes** がデータの永続化を担当し、最終的に MinIO/S3. などの分散オブジェクトストレージにデータを保存します。**QueryNodes** は検索などの計算タスクを処理します。これらのタスクでは、**バッチデータ**と**ストリーミングデータ**の両方を処理します。簡単に言うと、バッチデータはすでにオブジェクトストレージに保存されているデータであり、ストリーミングデータはまだオブジェクトストレージに保存されていないデータです。ネットワークレイテンシーのため、QueryNodes は最新のストリーミングデータを保持していないことがよくあります。追加の保護措置を講じずにストリーミングデータを直接検索すると、多数の未コミットデータポイントが失われ、検索結果の精度に影響する可能性があります。

![UlOJwpWuKhj5LAbGSp9cwMFznEb](https://zdoc-images.s3.us-west-2.amazonaws.com/UlOJwpWuKhj5LAbGSp9cwMFznEb.png)

上の図に示すように、QueryNodes は検索リクエストを受信した後、ストリーミングデータとバッチデータの両方を同時に受信できます。ただし、ネットワークレイテンシーのため、QueryNodes が取得するストリーミングデータは不完全な場合があります。

この問題に対処するため、Zilliz Cloud はデータキュー内の各レコードにタイムスタンプを付与し、同期タイムスタンプをデータキューに継続的に挿入します。同期タイムスタンプ（syncTs）を受信するたびに、QueryNodes はそれを ServiceTime として設定します。これは、QueryNodes がその ServiceTime より前のすべてのデータを参照できることを意味します。ServiceTime に基づいて、Zilliz Cloud は一貫性と可用性に関するさまざまなユーザー要件を満たす保証タイムスタンプ（GuaranteeTs）を提供できます。ユーザーは、検索リクエストで GuaranteeTs を指定することで、指定した時点より前のデータを検索範囲に含める必要があることを QueryNodes に通知できます。

![Owddb7D3Fo8zyFxJgWWcZCxanIf](https://zdoc-images.s3.us-west-2.amazonaws.com/owddb7d3fo8zyfxjgwwczcxanif.png "Owddb7D3Fo8zyFxJgWWcZCxanIf")

上の図に示すように、GuaranteeTs が ServiceTime より小さい場合、指定した時点より前のすべてのデータがディスクに完全に書き込まれていることを意味し、QueryNodes はすぐに検索操作を実行できます。GuaranteeTs が ServiceTime より大きい場合、QueryNodes は ServiceTime が GuaranteeTs を超えるまで待ってから検索操作を実行する必要があります。

ユーザーは、クエリの精度とクエリのレイテンシーの間でトレードオフを行う必要があります。高い一貫性要件があり、クエリのレイテンシーを気にしない場合は、GuaranteeTs を可能な限り大きな値に設定できます。検索結果をすばやく受け取り、クエリの精度に対する許容度が高い場合は、GuaranteeTs をより小さな値に設定できます。

![Y9YabwvmjoWMXhxt9kRc8Atmnid](https://zdoc-images.s3.us-west-2.amazonaws.com/y9yabwvmjowmxhxt9krc8atmnid.png "Y9YabwvmjoWMXhxt9kRc8Atmnid")

Zilliz Cloud は、GuaranteeTs が異なる 4 種類の一貫性レベルを提供します。

- **Strong**

    最新のタイムスタンプが GuaranteeTs として使用され、QueryNodes は ServiceTime が GuaranteeTs を満たすまで待ってから検索リクエストを実行する必要があります。

- **Eventual**

    GuaranteeTs は 1 などの非常に小さな値に設定され、一貫性チェックを回避することで、QueryNodes がすべてのバッチデータに対して検索リクエストをすぐに実行できるようにします。

- **Bounded Staleness**

    GuaranteeTs は最新のタイムスタンプより前の時点に設定され、QueryNodes が一定のデータ損失を許容して検索を実行できるようにします。

- **Session**

    クライアントがデータを挿入した最新の時点が GuaranteeTs として使用され、QueryNodes がクライアントによって挿入されたすべてのデータに対して検索を実行できるようにします。

Zilliz Cloud は、デフォルトの一貫性レベルとして Bounded Staleness を使用します。GuaranteeTs を指定しない場合、最新の ServiceTime が GuaranteeTs として使用されます。

## 一貫性レベルを設定する\{#set-consistency-level}

コレクションを作成するときだけでなく、検索やクエリを実行するときにも、異なる一貫性レベルを設定できます。検索またはクエリで一貫性レベルを指定しない場合は、コレクション作成時に指定した一貫性レベルが適用されます。

### コレクション作成時の一貫性レベルの設定\{#set-consistency-level-upon-creating-collection}

コレクションを作成するときに、そのコレクション内の検索とクエリに使用する一貫性レベルを設定できます。次のコード例では、一貫性レベルを **Bounded** に設定します。

<Tabs groupId="code" defaultValue='python' values={[{"label":"Python","value":"python"},{"label":"Java","value":"java"},{"label":"Go","value":"go"},{"label":"Rust","value":"rust"},{"label":"C++","value":"c++"},{"label":"NodeJS","value":"javascript"},{"label":"cURL","value":"bash"}]}>
<TabItem value='python'>

```python
client.create_collection(
    collection_name="my_collection",
    schema=schema,
    # highlight-next-line
    consistency_level="Bounded",
)
```

</TabItem>

<TabItem value='java'>

```java
import io.milvus.v2.common.ConsistencyLevel;
import io.milvus.v2.service.collection.request.CreateCollectionReq;

CreateCollectionReq createCollectionReq = CreateCollectionReq.builder()
        .collectionName("my_collection")
        .collectionSchema(schema)
        // highlight-next-line
        .consistencyLevel(ConsistencyLevel.BOUNDED)
        .build();
client.createCollection(createCollectionReq);
```

</TabItem>

<TabItem value='go'>

```go
import (
    "fmt"

    "github.com/milvus-io/milvus/client/v3/entity"
    "github.com/milvus-io/milvus/client/v3/milvusclient"
)

err = client.CreateCollection(ctx,
    milvusclient.NewCreateCollectionOption("my_collection", schema).
        WithConsistencyLevel(entity.ClBounded))
if err != nil {
    fmt.Println(err.Error())
    // handle error
}
```

</TabItem>

<TabItem value='rust'>

```rust
use milvus::v2::prelude::*;

client.create_collection(
    CreateCollectionRequest::builder()
        .collection_name("my_collection")
        .schema(schema)
        .consistency_level(ConsistencyLevel::Bounded)
        .build()?,
)
.await?;
```

</TabItem>

<TabItem value='c++'>

```c++
auto status = client->CreateCollection(milvus::CreateCollectionRequest()
                                          .WithCollectionName("my_collection")
                                          .WithCollectionSchema(schema)
                                          .WithConsistencyLevel(milvus::ConsistencyLevel::BOUNDED));
if (!status.IsOk()) {
    std::cout << status.Message() << std::endl;
}
```

</TabItem>

<TabItem value='javascript'>

```javascript
await client.createCollection({
    collection_name: "my_collection",
    schema,
    consistency_level: "Bounded",
});
```

</TabItem>

<TabItem value='bash'>

```bash
export schema='{
        "autoId": true,
        "enabledDynamicField": false,
        "fields": [
            {
                "fieldName": "id",
                "dataType": "Int64",
                "isPrimary": true
            },
            {
                "fieldName": "vector",
                "dataType": "FloatVector",
                "elementTypeParams": {
                    "dim": "5"
                }
            },
            {
                "fieldName": "my_varchar",
                "dataType": "VarChar",
                "isClusteringKey": true,
                "elementTypeParams": {
                    "max_length": 512
                }
            }
        ]
    }'

export params='{
    "consistencyLevel": "Bounded"
}'

curl --request POST \
--url "${CLUSTER_ENDPOINT}/v2/vectordb/collections/create" \
--header "Authorization: Bearer ${TOKEN}" \
--header "Content-Type: application/json" \
-d "{
    \"collectionName\": \"my_collection\",
    \"schema\": $schema,
    \"params\": $params
}"
```

</TabItem>
</Tabs>

`consistency_level` パラメーターに指定できる値は `Strong`、`Bounded`、`Eventually`、`Session` です。

### 検索時の一貫性レベルの設定\{#set-consistency-level-in-search}

特定の検索では、いつでも一貫性レベルを変更できます。次のコード例では、一貫性レベルを **Bounded** に戻します。この変更は、現在の検索リクエストにのみ適用されます。

<Tabs groupId="code" defaultValue='python' values={[{"label":"Python","value":"python"},{"label":"Java","value":"java"},{"label":"Go","value":"go"},{"label":"Rust","value":"rust"},{"label":"C++","value":"c++"},{"label":"NodeJS","value":"javascript"},{"label":"cURL","value":"bash"}]}>
<TabItem value='python'>

```python
res = client.search(
    collection_name="my_collection",
    data=[query_vector],
    limit=3,
    # highlight-start
    consistency_level="Bounded",
    # highlight-next
)
```

</TabItem>

<TabItem value='java'>

```java
import io.milvus.v2.common.ConsistencyLevel;
import io.milvus.v2.service.vector.request.SearchReq;
import io.milvus.v2.service.vector.request.data.FloatVec;
import io.milvus.v2.service.vector.response.SearchResp;
import java.util.Collections;

SearchReq searchReq = SearchReq.builder()
        .collectionName("my_collection")
        .data(Collections.singletonList(new FloatVec(queryVector)))
        .topK(3)
        .consistencyLevel(ConsistencyLevel.BOUNDED)
        .build();

SearchResp searchResp = client.search(searchReq);
```

</TabItem>

<TabItem value='go'>

```go
import (
    "fmt"

    "github.com/milvus-io/milvus/client/v3/entity"
    "github.com/milvus-io/milvus/client/v3/milvusclient"
)

resultSets, err := client.Search(ctx, milvusclient.NewSearchOption(
    "my_collection", // collectionName
    3,               // limit
    []entity.Vector{entity.FloatVector(queryVector)},
).WithConsistencyLevel(entity.ClBounded).
    WithANNSField("vector"))
if err != nil {
    fmt.Println(err.Error())
    // handle error
}
```

</TabItem>

<TabItem value='rust'>

```rust
use milvus::v2::prelude::*;

client.search(
    SearchRequest::builder()
        .collection_name("my_collection")
        .vector_field("vector")
        .vectors(SearchVectors::Float(vec![query_vector]))
        .limit(3)
        .consistency_level(ConsistencyLevel::Bounded)
        .build()?,
)
.await?;
```

</TabItem>

<TabItem value='c++'>

```c++
std::vector<float> query_vector = {0.3580376395471989, -0.6023495712049978, 0.18414012509913835, -0.26286205330961354, 0.9029438446296592};
auto request = milvus::SearchRequest()
                           .WithCollectionName("my_collection")
                           .WithLimit(3)
                           .AddFloatVector(std::move(query_vector))
                           .WithConsistencyLevel(milvus::ConsistencyLevel::BOUNDED);

milvus::SearchResponse response;
auto status = client->Search(request, response);
if (!status.IsOk()) {
    std::cout << status.Message() << std::endl;
}
```

</TabItem>

<TabItem value='javascript'>

```javascript
const res = await client.search({
    collection_name: "my_collection",
    data: [query_vector],
    limit: 3,
    consistency_level: "Bounded",
});
```

</TabItem>

<TabItem value='bash'>

```bash
curl --request POST \
--url "${CLUSTER_ENDPOINT}/v2/vectordb/entities/search" \
--header "Authorization: Bearer ${TOKEN}" \
--header "Content-Type: application/json" \
-d '{
    "collectionName": "my_collection",
    "data": [
        [0.3580376395471989, -0.6023495712049978, 0.18414012509913835, -0.26286205330961354, 0.9029438446296592]
    ],
    "limit": 3,
    "consistencyLevel": "Bounded"
}'
```

</TabItem>
</Tabs>

このパラメーターは、ハイブリッド検索および検索イテレーターでも使用できます。`consistency_level` パラメーターに指定できる値は `Strong`、`Bounded`、`Eventually`、`Session` です。

### クエリ時の一貫性レベルの設定\{#set-consistency-level-in-query}

特定の検索では、いつでも一貫性レベルを変更できます。次のコード例では、一貫性レベルを **Eventually** に設定します。この設定は、現在のクエリリクエストにのみ適用されます。

<Tabs groupId="code" defaultValue='python' values={[{"label":"Python","value":"python"},{"label":"Java","value":"java"},{"label":"Go","value":"go"},{"label":"Rust","value":"rust"},{"label":"C++","value":"c++"},{"label":"NodeJS","value":"javascript"},{"label":"cURL","value":"bash"}]}>
<TabItem value='python'>

```python
res = client.query(
    collection_name="my_collection",
    filter="color like \"red%\"",
    output_fields=["vector", "color"],
    limit=3,
    # highlight-start
    consistency_level="Bounded",
    # highlight-next
)
```

</TabItem>

<TabItem value='java'>

```java
import io.milvus.v2.common.ConsistencyLevel;
import io.milvus.v2.service.vector.request.QueryReq;
import io.milvus.v2.service.vector.response.QueryResp;
import java.util.Arrays;

QueryReq queryReq = QueryReq.builder()
        .collectionName("my_collection")
        .filter("color like \"red%\"")
        .outputFields(Arrays.asList("vector", "color"))
        .limit(3)
        .consistencyLevel(ConsistencyLevel.BOUNDED)
        .build();

QueryResp getResp = client.query(queryReq);
```

</TabItem>

<TabItem value='go'>

```go
import (
    "fmt"

    "github.com/milvus-io/milvus/client/v3/entity"
    "github.com/milvus-io/milvus/client/v3/milvusclient"
)

resultSet, err := client.Query(ctx, milvusclient.NewQueryOption("my_collection").
    WithFilter("color like \"red%\"").
    WithOutputFields("vector", "color").
    WithLimit(3).
    WithConsistencyLevel(entity.ClBounded))
if err != nil {
    fmt.Println(err.Error())
    // handle error
}
```

</TabItem>

<TabItem value='rust'>

```rust
use milvus::v2::prelude::*;

client.query(
    QueryRequest::builder()
        .collection_name("my_collection")
        .filter(r#"color like "red%""#)
        .output_fields(["vector", "color"])
        .limit(3)
        .consistency_level(ConsistencyLevel::Bounded)
        .build()?,
)
.await?;
```

</TabItem>

<TabItem value='c++'>

```c++
auto request = milvus::QueryRequest()
                       .WithCollectionName("my_collection")
                       .WithFilter(R"(color like "red%")")
                       .WithOutputFields({"vector", "color"})
                       .WithLimit(3)
                       .WithConsistencyLevel(milvus::ConsistencyLevel::BOUNDED);

milvus::QueryResponse response;
auto status = client->Query(request, response);
if (!status.IsOk()) {
    std::cout << status.Message() << std::endl;
}
```

</TabItem>

<TabItem value='javascript'>

```javascript
const res = await client.query({
    collection_name: "my_collection",
    filter: 'color like "red%"',
    output_fields: ["vector", "color"],
    limit: 3,
    consistency_level: "Bounded",
});
```

</TabItem>

<TabItem value='bash'>

```bash
curl --request POST \
--url "${CLUSTER_ENDPOINT}/v2/vectordb/entities/query" \
--header "Authorization: Bearer ${TOKEN}" \
--header "Content-Type: application/json" \
-d '{
    "collectionName": "my_collection",
    "filter": "color like \"red%\"",
    "outputFields": ["vector", "color"],
    "consistencyLevel": "Bounded",
    "limit": 3
}'
```

</TabItem>
</Tabs>

このパラメーターは、クエリイテレーターでも使用できます。`consistency_level` パラメーターに指定できる値は `Strong`、`Bounded`、`Eventually`、`Session` です。
