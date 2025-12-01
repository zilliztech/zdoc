---
title: "整合性レベル | BYOC"
slug: /consistency-level
sidebar_label: "整合性レベル"
beta: FALSE
added_since: FALSE
last_modified: FALSE
deprecate_since: FALSE
notebook: FALSE
description: "分散型ベクトルデータベースとして、Zilliz Cloudは複数の整合性レベルを提供し、各ノードまたはレプリカが読み書き操作中に同じデータにアクセスできるようにします。現在サポートされている整合性レベルには、Strong、Bounded、Eventually、Sessionがあり、デフォルトではBoundedが使用されます。 | BYOC"
type: origin
token: Xx9EwWtekinLZfkWKqic37dDnFb
sidebar_position: 17
keywords:
  - zilliz
  - ベクトルデータベース
  - クラウド
  - コレクション
  - データ
  - 整合性レベル
  - マルチモーダルベクトルデータベース検索
  - 検索拡張生成
  - 大規模言語モデル
  - ベクトル化

---

import Admonition from '@theme/Admonition';
import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

# 整合性レベル

分散型ベクトルデータベースとして、Zilliz Cloudは複数の整合性レベルを提供し、各ノードまたはレプリカが読み書き操作中に同じデータにアクセスできるようにします。現在サポートされている整合性レベルには、**Strong**、**Bounded**、**Eventually**、および**Session**があり、デフォルトでは**Bounded**が使用されます。

## 概要\{#overview}

Zilliz Cloudはストレージと計算を分離したシステムです。このシステムでは、**DataNodes** がデータの永続化を担当し、最終的にMinIO/S3などの分散オブジェクトストレージにデータを格納します。**QueryNodes** はSearchなどの計算タスクを処理します。これらのタスクには**バッチデータ**と**ストリーミングデータ**の両方の処理が含まれます。簡単に言うと、バッチデータはすでにオブジェクトストレージに保存されたデータと理解できますが、ストリーミングデータはまだオブジェクトストレージに保存されていないデータを指します。ネットワーク遅延のため、QueryNodesは多くの場合、最新のストリーミングデータを持っていません。追加の保護対策がなければ、ストリーミングデータに対して直接Searchを実行すると、多くの未コミットのデータポイントが失われ、検索結果の精度に影響を与える可能性があります。

![UlOJwpWuKhj5LAbGSp9cwMFznEb](/img/UlOJwpWuKhj5LAbGSp9cwMFznEb.png)

上図に示すように、QueryNodesはSearchリクエストを受信した後、ストリーミングデータとバッチデータの両方を同時に受信できます。しかし、ネットワーク遅延のため、QueryNodesが取得するストリーミングデータは不完全である可能性があります。

この問題を解決するために、Zilliz Cloudはデータキュー内の各レコードにタイムスタンプを付与し、データキューに継続的に同期タイムスタンプを挿入します。同期タイムスタンプ(syncTs)を受信するたびに、QueryNodesはそれをServiceTimeとして設定します。つまり、QueryNodesはそのServiceTime以前のすべてのデータを見ることができるようになります。ServiceTimeに基づき、Zilliz Cloudは異なるユーザーの整合性と可用性の要件を満たすために保証タイムスタンプ(GuaranteeTs)を提供できます。ユーザーは、検索範囲に特定の時点以前のデータを含める必要があることをSearchリクエストでGuaranteeTsを指定することでQueryNodesに通知できます。

![Owddb7D3Fo8zyFxJgWWcZCxanIf](/img/Owddb7D3Fo8zyFxJgWWcZCxanIf.png)

上図に示すように、GuaranteeTsがServiceTimeより小さい場合、指定された時刻より前のすべてのデータがディスクに完全に書き込まれていることを意味し、QueryNodesはすぐに検索操作を実行できます。GuaranteeTsがServiceTimeより大きい場合、QueryNodesはServiceTimeがGuaranteeTsを超えるまで待機してから検索操作を実行できます。

ユーザーはクエリの正確性とクエリの遅延の間でトレードオフを考慮する必要があります。整合性の要件が高くクエリの遅延に敏感でない場合、GuaranteeTsをできるだけ大きな値に設定できます。検索結果を迅速に受け取りたいがクエリの正確性については寛容である場合は、GuaranteeTsをより小さな値に設定できます。

![Y9YabwvmjoWMXhxt9kRc8Atmnid](/img/Y9YabwvmjoWMXhxt9kRc8Atmnid.png)

Zilliz Cloudは4種類の異なるGuaranteeTsを持つ整合性レベルを提供します。

- **Strong**

    最新のタイムスタンプをGuaranteeTsとして使用し、QueryNodesはServiceTimeがGuaranteeTsを満たすまで待機してからSearchリクエストを実行する必要があります。

- **Eventually**

    GuaranteeTsを1のように極めて小さな値に設定して整合性チェックを回避し、QueryNodesがすべてのバッチデータをすぐに検索リクエストを実行できるようにします。

- **Bounded Staleness**

    GuaranteeTsは、QueryNodesが一定のデータ損失を許容して検索を実行できるように、最新のタイムスタンプより前の時点に設定されます。

- **Session**

    クライアントがデータを挿入した最新の時刻をGuaranteeTsとして使用し、QueryNodesがクライアントによって挿入されたすべてのデータを検索できるようにします。

Zilliz CloudはBounded Stalenessをデフォルトの整合性レベルとして使用します。GuaranteeTsが指定されていない場合、最新のServiceTimeがGuaranteeTsとして使用されます。

## 整合性レベルの設定\{#set-consistency-level}

コレクションの作成時や検索・クエリの実行時に、異なる整合性レベルを設定できます。検索またはクエリの整合性レベルが指定されていない場合は、コレクション作成時に指定された整合性レベルが適用されます。

### コレクション作成時の整合性レベルの設定\{#set-consistency-level-upon-creating-collection}

コレクションを作成する際、コレクション内の検索とクエリの整合性レベルを設定できます。次のコード例では、整合性レベルを**Bounded**に設定しています。

<Tabs groupId="code" defaultValue='python' values={[{"label":"Python","value":"python"},{"label":"Java","value":"java"},{"label":"Go","value":"go"},{"label":"cURL","value":"bash"}]}>
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
</Tabs>

`consistency_level`パラメータに指定可能な値は `Strong`、`Bounded`、`Eventually`、`Session`です。

### 検索時の整合性レベルの設定\{#set-consistency-level-in-search}

特定の検索に対して常に整合性レベルを変更できます。次のコード例では、整合性レベルを**Bounded**に戻しています。この変更は現在の検索リクエストのみに適用されます。

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

このパラメータはハイブリッド検索と検索イテレータでも使用できます。`consistency_level`パラメータに指定可能な値は `Strong`、`Bounded`、`Eventually`、`Session`です。

### クエリ時の整合性レベルの設定\{#set-consistency-level-in-query}

特定の検索に対して常に整合性レベルを変更できます。次のコード例では、整合性レベルを**Eventually**に設定しています。この設定は現在のクエリリクエストのみに適用されます。

<Tabs groupId="code" defaultValue='python' values={[{"label":"Python","value":"python"},{"label":"Java","value":"java"},{"label":"Go","value":"go"},{"label":"cURL","value":"bash"}]}>
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
</Tabs>

このパラメータはクエリイテレータでも使用できます。`consistency_level`パラメータに指定可能な値は `Strong`、`Bounded`、`Eventually`、`Session`です。