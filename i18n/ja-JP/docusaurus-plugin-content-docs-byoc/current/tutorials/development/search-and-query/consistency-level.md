---
title: "整合性レベル | BYOC"
slug: /consistency-level
sidebar_label: "整合性レベル"
beta: FALSE
added_since: FALSE
last_modified: FALSE
deprecate_since: FALSE
notebook: FALSE
description: "分散ベクトルデータベースとして、Zilliz Cloud は読み取りおよび書き込み操作中に各ノードまたはレプリカが同じデータにアクセスできるようにするため、複数の整合性レベルを提供します。現在、サポートされている整合性レベルには Strong、Bounded、Eventually、Session があり、デフォルトで使用される整合性レベルは Bounded です。 | BYOC"
type: origin
token: Xx9EwWtekinLZfkWKqic37dDnFb
sidebar_position: 22
displayed_sidebar: default

---

import Admonition from '@theme/Admonition';
import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

# 整合性レベル

分散ベクトルデータベースとして、Zilliz Cloud は読み取りおよび書き込み操作中に各ノードまたはレプリカが同じデータにアクセスできるようにするため、複数の整合性レベルを提供します。現在、サポートされている整合性レベルには **Strong**、**Bounded**、**Eventually**、**Session** があり、デフォルトで使用される整合性レベルは **Bounded** です。

## 概要\{#overview}

Zilliz Cloud は、ストレージと計算を分離したシステムです。このシステムでは、**DataNodes** がデータの永続化を担い、最終的に MinIO/S3 などの分散オブジェクトストレージに保存します。**QueryNodes** は Search などの計算タスクを処理します。これらのタスクでは、**バッチデータ** と **ストリーミングデータ** の両方を処理します。簡単に言うと、バッチデータはすでにオブジェクトストレージに保存されたデータであり、ストリーミングデータはまだオブジェクトストレージに保存されていないデータを指します。ネットワーク遅延のため、QueryNodes は多くの場合、最新のストリーミングデータを保持していません。追加の保護がない場合、ストリーミングデータに対して直接 Search を実行すると、未コミットの多数のデータポイントが失われ、検索結果の精度に影響する可能性があります。

![UlOJwpWuKhj5LAbGSp9cwMFznEb](https://zdoc-images.s3.us-west-2.amazonaws.com/UlOJwpWuKhj5LAbGSp9cwMFznEb.png)

上図に示すように、Search リクエストを受信した後、QueryNodes はストリーミングデータとバッチデータの両方を同時に受け取ることができます。ただし、ネットワーク遅延のため、QueryNodes が取得するストリーミングデータは不完全な場合があります。

この問題に対処するため、Zilliz Cloud はデータキュー内の各レコードにタイムスタンプを付与し、継続的に同期タイムスタンプをデータキューへ挿入します。同期タイムスタンプ（syncTs）を受信すると、QueryNodes はそれを ServiceTime として設定します。つまり、QueryNodes はその ServiceTime より前のすべてのデータを参照できます。Zilliz Cloud は、この ServiceTime に基づいて、整合性と可用性に関するさまざまなユーザー要件を満たすための保証タイムスタンプ（GuaranteeTs）を提供できます。ユーザーは Search リクエストで GuaranteeTs を指定することで、指定時点より前のデータを検索範囲に含める必要があることを QueryNodes に伝えることができます。

![Owddb7D3Fo8zyFxJgWWcZCxanIf](https://zdoc-images.s3.us-west-2.amazonaws.com/owddb7d3fo8zyfxjgwwczcxanif.png "Owddb7D3Fo8zyFxJgWWcZCxanIf")

上図に示すように、GuaranteeTs が ServiceTime より小さい場合、指定時点より前のすべてのデータが完全にディスクへ書き込まれていることを意味し、QueryNodes はただちに Search 操作を実行できます。GuaranteeTs が ServiceTime より大きい場合、QueryNodes は ServiceTime が GuaranteeTs を超えるまで待機してから Search 操作を実行する必要があります。

ユーザーはクエリ精度とクエリ遅延の間でトレードオフを行う必要があります。高い整合性要件があり、クエリ遅延に敏感でない場合は、GuaranteeTs をできるだけ大きな値に設定できます。検索結果をすばやく受け取りたく、クエリ精度に対してより寛容である場合は、GuaranteeTs をより小さな値に設定できます。

![Y9YabwvmjoWMXhxt9kRc8Atmnid](https://zdoc-images.s3.us-west-2.amazonaws.com/y9yabwvmjowmxhxt9krc8atmnid.png "Y9YabwvmjoWMXhxt9kRc8Atmnid")

Zilliz Cloud は、GuaranteeTs が異なる 4 種類の整合性レベルを提供します。

- **Strong**

    最新のタイムスタンプが GuaranteeTs として使用され、QueryNodes は ServiceTime が GuaranteeTs を満たすまで待ってから Search リクエストを実行する必要があります。

- **Eventual**

    整合性チェックを回避するために、GuaranteeTs は 1 のような極めて小さい値に設定されるため、QueryNodes はすべてのバッチデータに対してただちに Search リクエストを実行できます。

- **Bounded Staleness**

    GuranteeTs は最新のタイムスタンプよりも前の時点に設定され、QueryNodes が一定のデータ損失を許容した検索を実行できるようにします。

- **Session**

    クライアントがデータを挿入した最新時点が GuaranteeTs として使用されるため、QueryNodes はそのクライアントによって挿入されたすべてのデータに対して検索を実行できます。

Zilliz Cloud は、デフォルトの整合性レベルとして Bounded Staleness を使用します。GuaranteeTs が指定されていない場合、最新の ServiceTime が GuaranteeTs として使用されます。

## 整合性レベルの設定\{#set-consistency-level}

コレクションを作成するとき、および検索やクエリを実行するときに、異なる整合性レベルを設定できます。検索またはクエリで整合性レベルが指定されていない場合は、コレクション作成時に指定した整合性レベルが適用されます。

### コレクション作成時に整合性レベルを設定する\{#set-consistency-level-upon-creating-collection}

コレクションを作成するときに、そのコレクション内での検索およびクエリの整合性レベルを設定できます。以下のコード例では、整合性レベルを **Bounded** に設定しています。

<Tabs groupId="code" defaultValue='python' values={[{"label":"Python","value":"python"},{"label":"Java","value":"java"},{"label":"Go","value":"go"},{"label":"cURL","value":"bash"},{"label":"C++","value":"c++"}]}>
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
CreateCollectionReq createCollectionReq = CreateCollectionReq.builder()
        .collectionName("my_collection")
        .collectionSchema(schema)
        // highlight-next-line
        .consistencyLevel(ConsistencyLevel.Bounded)
        .build();
client.createCollection(createCollectionReq);
```

</TabItem>

<TabItem value='go'>

```go
err = client.CreateCollection(ctx,
    milvusclient.NewCreateCollectionOption("my_collection", schema).
        WithConsistencyLevel(entity.ClBounded))
if err != nil {
    fmt.Println(err.Error())
    // handle error
}
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

<TabItem value='c++'>

```c++
auto status = client->CreateCollection(milvus::CreateSimpleCollectionRequest()
                                          .WithCollectionName("my_collection")
                                          .WithCollectionSchema(schema)
                                          .WithConsistencyLevel(milvus::ConsistencyLevel::BOUNDED));
if (!status.IsOk()) {
    std::cout << status.Message() << std::endl;
}
```

</TabItem>
</Tabs>

`consistency_level` パラメータに指定可能な値は、`Strong`、`Bounded`、`Eventually`、`Session` です。

### Search で整合性レベルを設定する\{#set-consistency-level-in-search}

特定の検索に対して整合性レベルはいつでも変更できます。以下のコード例では、整合性レベルを **Bounded** に戻しています。この変更は現在の Search リクエストにのみ適用されます。

<Tabs groupId="code" defaultValue='python' values={[{"label":"Python","value":"python"},{"label":"Java","value":"java"},{"label":"Go","value":"go"},{"label":"cURL","value":"bash"},{"label":"C++","value":"c++"}]}>
<TabItem value='python'>

```python
res = client.search(
    collection_name="my_collection",
    data=[query_vector],
    limit=3
    # highlight-start
    consistency_level="Bounded",
    # highlight-next
)
```

</TabItem>

<TabItem value='java'>

```java
SearchReq searchReq = SearchReq.builder()
        .collectionName("my_collection")
        .data(Collections.singletonList(queryVector))
        .topK(3)
        .searchParams(params)
        .consistencyLevel(ConsistencyLevel.BOUNDED)
        .build();

SearchResp searchResp = client.search(searchReq);
```

</TabItem>

<TabItem value='go'>

```go
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
</Tabs>

このパラメータは、ハイブリッド検索および search iterator でも使用できます。`consistency_level` パラメータに指定可能な値は、`Strong`、`Bounded`、`Eventually`、`Session` です。

### Query で整合性レベルを設定する\{#set-consistency-level-in-query}

特定の検索に対して整合性レベルはいつでも変更できます。以下のコード例では、整合性レベルを **Eventually** に設定しています。この設定は現在のクエリリクエストにのみ適用されます。

<Tabs groupId="code" defaultValue='python' values={[{"label":"Python","value":"python"},{"label":"Java","value":"java"},{"label":"Go","value":"go"},{"label":"cURL","value":"bash"},{"label":"C++","value":"c++"}]}>
<TabItem value='python'>

```python
res = client.query(
    collection_name="my_collection",
    filter="color like \"red%\"",
    output_fields=["vector", "color"],
    limit=3，
    # highlight-start
    consistency_level="Bounded",
    # highlight-next
)
```

</TabItem>

<TabItem value='java'>

```java
QueryReq queryReq = QueryReq.builder()
        .collectionName("my_collection")
        .filter("color like \"red%\"")
        .outputFields(Arrays.asList("vector", "color"))
        .limit(3)
        .consistencyLevel(ConsistencyLevel.Bounded)
        .build();
        
 QueryResp getResp = client.query(queryReq);
```

</TabItem>

<TabItem value='go'>

```go
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

<TabItem value='bash'>

```bash
curl --request POST \
--url "${CLUSTER_ENDPOINT}/v2/vectordb/entities/query" \
--header "Authorization: Bearer ${TOKEN}" \
--header "Content-Type: application/json" \
-d '{
    "collectionName": "my_collection",
    "filter": "color like \"red_%\"",
    "consistencyLevel": "Bounded",
    "limit": 3
}'
```

</TabItem>

<TabItem value='c++'>

```c++
auto request = milvus::QueryRequest()
                       .WithCollectionName("my_collection")
                       .WithFilter(R"(color like "red%")")
                       .WithLimit(3)
                       .WithConsistencyLevel(milvus::ConsistencyLevel::BOUNDED);

milvus::QueryResponse response;
auto status = client->Query(request, response);
if (!status.IsOk()) {
    std::cout << status.Message() << std::endl;
}
```

</TabItem>
</Tabs>

このパラメータは query iterator でも使用できます。`consistency_level` パラメータに指定可能な値は、`Strong`、`Bounded`、`Eventually`、`Session` です。
