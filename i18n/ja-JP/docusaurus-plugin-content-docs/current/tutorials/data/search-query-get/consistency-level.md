---
title: "一貫性レベル | Cloud"
slug: /consistency-level
sidebar_label: "一貫性レベル"
beta: FALSE
notebook: FALSE
description: "分散ベクトルデータベースとして、Zillizクラウド各ノードまたはレプリカが読み取りおよび書き込み操作中に同じデータにアクセス可能であることを確認するために、複数の一貫性レベルを提供します。現在、サポートされている一貫性レベルには、Strong、Bounded、Eventally、およびSessionが含まれ、Boundedがデフォルトの一貫性レベルとして使用されています。 | Cloud"
type: origin
token: Xx9EwWtekinLZfkWKqic37dDnFb
sidebar_position: 17
keywords: 
  - zilliz
  - vector database
  - cloud
  - collection
  - data
  - consistency level
  - Zilliz Cloud
  - what is milvus
  - milvus database
  - milvus lite

---

import Admonition from '@theme/Admonition';
import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

# 一貫性レベル

分散ベクトルデータベースとして、Zillizクラウド各ノードまたはレプリカが読み取りおよび書き込み操作中に同じデータにアクセス可能であることを確認するために、複数の一貫性レベルを提供します。現在、サポートされている一貫性レベルには、Strong、Bounded、Eventally、およびSessionが含まれ、Boundedがデフォルトの一貫性レベルとして使用されています。

## 概要について{#overview}

Zillizクラウドストレージと計算を分離するシステムです。このシステムでは、DataNodesはデータの永続性に責任を持ち、最終的にMinIO/S 3などの分散オブジェクトストレージに保存します。Query NodesはSearchのような計算タスクを処理します。これらのタスクには、バッチデータとストリーミングデータの両方を処理する必要があります。単純に言えば、バッチデータはすでにオブジェクトストレージに保存されているデータとして理解でき、ストリーミングデータはまだオブジェクトストレージに保存されていないデータを指します。ネットワークレイテンシのため、Query Nodesはしばしば最新のストリーミングデータを保持しません。追加の保護措置がない場合、ストリーミングデータに直接Searchを実行すると、未確定のデータポイントが多数失われ、検索結果の精度に影響を与える可能性があります。

![UlOJwpWuKhj5LAbGSp9cwMFznEb](/img/UlOJwpWuKhj5LAbGSp9cwMFznEb.png)

上の図に示すように、Query NodesはSearchリクエストを受信した後、ストリーミングデータとバッチデータの両方を同時に受信することができます。ただし、ネットワークの遅延により、Query Nodesが取得するストリーミングデータが不完全になる可能性があります。

この問題に対処するために、Zillizクラウドデータキュー内の各レコードにタイムスタンプを付け、データキューに同期タイムスタンプを継続的に挿入します。同期タイムスタンプ（syncTs）が受信されるたびに、Query NodesはそれをService Timeとして設定します。つまり、Query NodesはそのService Timeより前のすべてのデータを見ることができます。Service Timeに基づいて、Zillizクラウド保証タイムスタンプ(GuaranteeTs)を提供して、一貫性と可用性に関するさまざまなユーザー要件を満たすことができます。ユーザーは、検索リクエストでGuaranteeTsを指定することで、検索範囲内の指定された時点より前のデータを含める必要があることをQuery Nodesに通知できます。

![Owddb7D3Fo8zyFxJgWWcZCxanIf](/img/Owddb7D3Fo8zyFxJgWWcZCxanIf.png)

上の図に示されているように、GuaranteeTsが小なりServiceTimeである場合、指定された時点より前のすべてのデータがディスクに完全に書き込まれたことを意味し、Query NodesがすぐにSearch操作を実行できるようになります。GuaranteeTsが大なりServiceTimeである場合、Query NodesはServiceTimeがGuaranteeTsを超えるまで待たなければなりません。

ユーザーは、クエリの正確性とクエリの遅延のトレードオフを行う必要があります。ユーザーが高い一貫性要件を持ち、クエリの遅延に敏感でない場合、GuaranteeTsをできるだけ大きな値に設定できます。ユーザーが検索結果を迅速に受け取り、クエリの正確性により寛容である場合、GuaranteeTsをより小さな値に設定できます。

![Y9YabwvmjoWMXhxt9kRc8Atmnid](/img/Y9YabwvmjoWMXhxt9kRc8Atmnid.png)

Zillizクラウド異なる保証Tを持つ4種類の一貫性レベルを提供します。

- **強い**

    最新のタイムスタンプがGuaranteeTとして使用され、Query NodeはServiceTimeがGuaranteeTに達するまで待ってからSearchリクエストを実行する必要があります。

- **最終的な**

    GuaranteeTsは、整合性チェックを回避するために1などの非常に小さな値に設定されています。これにより、Query Nodesはすべてのバッチデータに対してすぐにSearch要求を実行できます。

- **囲まれた不毛**

    GuranteeTsは、Query Nodesが特定のデータ損失の許容範囲で検索を実行するように、最新のタイムスタンプよりも前の時点に設定されます。

- **セッション**

    クライアントがデータを挿入した最新の時点が保証Tとして使用されるため、Query Nodesはクライアントによって挿入されたすべてのデータに対して検索を実行できます。

Zillizクラウドデフォルトの一貫性レベルとしてBounded Stalenessを使用します。GuaranteeTが指定されていない場合、最新のService TimeがGuaranteeTとして使用されます。

## 一貫性レベルを設定する{#set-consistency-level}

コレクションを作成したり、検索やクエリを実行する際に、異なる一貫性レベルを設定することができます。検索やクエリの一貫性レベルが指定されていない場合、コレクション作成時に指定された一貫性レベルが適用されます。

### コレクション作成時に一貫性レベルを設定する{#set-consistency-level-upon-creating-collection}

コレクションを作成する際に、コレクション内の検索とクエリの一貫性レベルを設定できます。次のコード例では、一貫性レベルを**Strong**に設定しています。

<Tabs groupId="code" defaultValue='python' values={[{"label":"Python","value":"python"},{"label":"Java","value":"java"},{"label":"Go","value":"go"},{"label":"cURL","value":"bash"}]}>
<TabItem value='python'>

```python
client.create_collection(
    collection_name="my_collection",
    schema=schema,
    # highlight-next-line
    consistency_level="Strong",
)
```

</TabItem>

<TabItem value='java'>

```java
CreateCollectionReq createCollectionReq = CreateCollectionReq.builder()
        .collectionName("my_collection")
        .collectionSchema(schema)
        // highlight-next-line
        .consistencyLevel(ConsistencyLevel.STRONG)
        .build();
client.createCollection(createCollectionReq);
```

</TabItem>

<TabItem value='go'>

```go
err = client.CreateCollection(ctx,
    milvusclient.NewCreateCollectionOption("my_collection", schema).
        WithConsistencyLevel(entity.ClStrong))
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
    "consistencyLevel": "Strong"
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

`consistency_level`パラメーターに指定できる値は、`Strong`、`Bounded`、`Eventually`、および`Session`です。

### 検索の一貫性レベルを設定する{#set-consistency-level-in-search}

特定の検索の一貫性レベルはいつでも変更できます。次のコード例では、一貫性レベルを**Bounded**に戻します。この変更は現在の検索要求にのみ適用されます。

<Tabs groupId="code" defaultValue='python' values={[{"label":"Python","value":"python"},{"label":"Java","value":"java"},{"label":"Go","value":"go"},{"label":"cURL","value":"bash"}]}>
<TabItem value='python'>

```python
res = client.search(
    collection_name="my_collection",
    data=[query_vector],
    limit=3,
    search_params={"metric_type": "IP"}，
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
</Tabs>

`consistency_level`パラメータの可能な値は、`Strong`、`Bounded`、`Eventually`、および`Session`です。このパラメータは、ハイブリッド検索や検索イテレータでも使用できます。

### クエリで一貫性レベルを設定する{#set-consistency-level-in-query}

特定の検索の一貫性レベルはいつでも変更できます。次のコード例では、一貫性レベルを**最終的に**に設定しています。この設定は、現在のクエリリクエストにのみ適用されます。

<Tabs groupId="code" defaultValue='python' values={[{"label":"Python","value":"python"},{"label":"Java","value":"java"},{"label":"Go","value":"go"},{"label":"cURL","value":"bash"}]}>
<TabItem value='python'>

```python
res = client.query(
    collection_name="my_collection",
    filter="color like \"red%\"",
    output_fields=["vector", "color"],
    limit=3，
    # highlight-start
    consistency_level="Eventually",
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
        .consistencyLevel(ConsistencyLevel.EVENTUALLY)
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
    WithConsistencyLevel(entity.ClEventually))
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
</Tabs>

このパラメータはクエリイテレータでも使用できます。`consistency_level`パラメータの可能な値は、`Strong`、`Bounded`、`Eventually`、および`Session`です。