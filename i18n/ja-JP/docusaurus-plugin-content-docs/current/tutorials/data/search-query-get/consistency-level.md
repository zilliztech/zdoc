---
title: "整合性レベル | Cloud"
slug: /consistency-level
sidebar_label: "整合性レベル"
beta: FALSE
added_since: FALSE
last_modified: FALSE
deprecate_since: FALSE
notebook: FALSE
description: "分散型ベクトルデータベースとして、Zilliz Cloudは複数の整合性レベルを提供し、各ノードまたはレプリカが読み書き操作中に同じデータにアクセスできるようにします。現在サポートされている整合性レベルには、Strong、Bounded、Eventually、Sessionがあり、デフォルトではBoundedが使用されます。 | Cloud"
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
  - 類似度検索
  - マルチモーダルRAG
  - LLMの幻覚
  - ハイブリッド検索

---

import Admonition from '@theme/Admonition';
import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

# 整合性レベル

分散型ベクトルデータベースとして、Zilliz Cloudは複数の整合性レベルを提供し、各ノードまたはレプリカが読み書き操作中に同じデータにアクセスできるようにします。現在サポートされている整合性レベルには、**Strong**、**Bounded**、**Eventually**、**Session**があり、デフォルトでは**Bounded**が使用されます。

## 概要\{#overview}

Zilliz Cloudはストレージと計算を分離したシステムです。このシステムでは、**DataNodes**がデータの永続化を担当し、最終的にはMinIO/S3などの分散オブジェクトストレージに保存します。**QueryNodes**は検索などの計算タスクを処理します。これらのタスクには、**バッチデータ**と**ストリーミングデータ**の両方の処理が含まれます。簡単に言うと、バッチデータは既にオブジェクトストレージに保存されたデータであると理解できますが、ストリーミングデータはまだオブジェクトストレージに保存されていないデータを指します。ネットワークの遅延により、QueryNodesはしばしば最新のストリーミングデータを持っていません。追加の保護措置を講じない場合、ストリーミングデータに対して直接検索を実行すると、多くの未コミットデータポイントが失われる可能性があり、検索結果の正確性に影響を与えることがあります。

![UlOJwpWuKhj5LAbGSp9cwMFznEb](/img/UlOJwpWuKhj5LAbGSp9cwMFznEb.png)

上図のように、検索リクエストを受け取った後、QueryNodesはストリーミングデータとバッチデータの両方を受け取ることができます。ただし、ネットワークの遅延により、QueryNodesが取得するストリーミングデータは不完全である可能性があります。

この問題を解決するために、Zilliz Cloudはデータキュー内の各レコードにタイムスタンプを付与し、データキューに継続的に同期タイムスタンプを挿入します。同期タイムスタンプ（syncTs）を受信するたびに、QueryNodesはそれをServiceTimeとして設定します。つまり、QueryNodesはそのServiceTime以前のすべてのデータを見ることができるようになります。ServiceTimeに基づき、Zilliz Cloudは整合性と可用性の異なるユーザー要求を満たすために保証タイムスタンプ（GuaranteeTs）を提供できます。ユーザーは、検索範囲に指定した時刻以前のデータを含める必要があることを検索リクエストでGuaranteeTsを指定することでQueryNodesに通知できます。

![Owddb7D3Fo8zyFxJgWWcZCxanIf](/img/Owddb7D3Fo8zyFxJgWWcZCxanIf.png)

上図のように、GuaranteeTsがServiceTimeより小さい場合、指定された時刻以前のすべてのデータが完全にディスクに書き込まれたことを意味し、QueryNodesはすぐに検索操作を実行できます。GuaranteeTsがServiceTimeより大きい場合、QueryNodesはServiceTimeがGuaranteeTsを超えるまで待機してから検索操作を実行する必要があります。

ユーザーはクエリの正確性とクエリの遅延の間でトレードオフを考慮する必要があります。整合性の要件が高く、クエリの遅延に敏感でない場合は、GuaranteeTsをできるだけ大きな値に設定できます。クエリ結果を迅速に受け取りたいが、クエリの正確性に対して寛容である場合は、GuaranteeTsを小さな値に設定できます。

![Y9YabwvmjoWMXhxt9kRc8Atmnid](/img/Y9YabwvmjoWMXhxt9kRc8Atmnid.png)

Zilliz Cloudは、異なるGuaranteeTsを持つ4つの整合性レベルを提供します。

- **Strong**

    最新のタイムスタンプをGuaranteeTsとして使用し、QueryNodesはServiceTimeがGuaranteeTsを満たすまで待機してから検索リクエストを実行します。

- **Eventually**

    GuaranteeTsを1のように極めて小さな値に設定し、整合性チェックを回避して、QueryNodesがすべてのバッチデータに対して即座に検索リクエストを実行できるようにします。

- **Bounded Staleness**

    GuaranteeTsを最新のタイムスタンプより前の時刻に設定し、一定のデータ損失を許容してQueryNodesが検索を実行できるようにします。

- **Session**

    クライアントがデータを挿入した最新の時刻をGuaranteeTsとして使用し、QueryNodesがクライアントが挿入したすべてのデータを検索できるようにします。

Zilliz Cloudでは、デフォルトの整合性レベルとしてBounded Stalenessが使用されます。GuaranteeTsを指定しない場合、最新のServiceTimeがGuaranteeTsとして使用されます。

## 整合性レベルの設定\{#set-consistency-level}

コレクションの作成時や検索・クエリの実行時に、異なる整合性レベルを設定できます。検索またはクエリに整合性レベルが指定されていない場合、コレクション作成時に指定した整合性レベルが適用されます。

### コレクション作成時の整合性レベル設定\{#set-consistency-level-upon-creating-collection}

コレクションを作成する際、コレクション内の検索およびクエリの整合性レベルを設定できます。以下のコード例では、整合性レベルを**Bounded**に設定しています。

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

`consistency_level`パラメータの可能な値は、`Strong`、`Bounded`、`Eventually`、`Session`です。

### 検索時の整合性レベル設定\{#set-consistency-level-in-search}

特定の検索について常に整合性レベルを変更できます。以下のコード例では、整合性レベルを**Bounded**に戻しています。変更は現在の検索リクエストにのみ適用されます。

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

このパラメータはハイブリッド検索および検索イテレータでも使用できます。`consistency_level`パラメータの可能な値は、`Strong`、`Bounded`、`Eventually`、`Session`です。

### クエリ時の整合性レベル設定\{#set-consistency-level-in-query}

特定の検索について常に整合性レベルを変更できます。以下のコード例では、整合性レベルを**Eventually**に設定しています。設定は現在のクエリリクエストにのみ適用されます。

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

このパラメータはクエリイテレータでも使用できます。`consistency_level`パラメータの可能な値は、`Strong`、`Bounded`、`Eventually`、`Session`です。