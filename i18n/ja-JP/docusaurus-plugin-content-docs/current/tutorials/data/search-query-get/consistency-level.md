---
title: "一貫性レベル | Cloud"
slug: /consistency-level
sidebar_key: consistency-level
sidebar_label: "一貫性レベル"
beta: FALSE
notebook: FALSE
description: "分散型ベクトルデータベースである Zilliz Cloud は、読み取りおよび書き込み操作中に各ノードまたはレプリカが同じデータにアクセスできるように、複数の一貫性レベルを提供します。現在サポートされている一貫性レベルには、Strong、Bounded、Eventually、Session があり、デフォルトの一貫性レベルは Bounded です。 | Cloud"
type: origin
token: Xx9EwWtekinLZfkWKqic37dDnFb
sidebar_position: 21
keywords: 
  - zilliz
  - ベクトルデータベース
  - cloud
  - collection
  - data
  - 一貫性レベル

---

import Admonition from '@theme/Admonition';
import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

# 一貫性レベル

分散型ベクトルデータベースとして、Zilliz Cloud は複数の一貫性レベルを提供し、読み取りおよび書き込み操作中に各ノードまたはレプリカが同じデータにアクセスできるようにします。現在サポートされている一貫性レベルには、**Strong**（強い一貫性）、**Bounded**（限定的古さ許容）、**Eventually**（結果整合性）、**Session**（セッション一貫性）があり、デフォルトで使用される一貫性レベルは **Bounded** です。

## 概要\{#overview}

Zilliz Cloud はストレージとコンピューティングを分離したシステムです。このシステムにおいて、**データNode** はデータの永続化を担当し、最終的に MinIO/S3 などの分散オブジェクトストレージにデータを保存します。一方、**QueryNode** は Search などの計算タスクを処理します。これらのタスクでは、**バッチデータ**と**ストリーミングデータ**の両方を処理します。簡単に言うと、バッチデータとはすでにオブジェクトストレージに保存されたデータであり、ストリーミングデータとはまだオブジェクトストレージに保存されていないデータを指します。ネットワーク遅延のため、QueryNode は最新のストリーミングデータを保持していないことがよくあります。追加の保護措置がなければ、ストリーミングデータに対して直接 Search を実行すると、多くの未コミットデータが失われ、検索結果の精度に影響を与える可能性があります。

![UlOJwpWuKhj5LAbGSp9cwMFznEb](https://zdoc-images.s3.us-west-2.amazonaws.com/UlOJwpWuKhj5LAbGSp9cwMFznEb.png)

上図のように、QueryNode は Search リクエストを受け取った後、ストリーミングデータとバッチデータの両方を同時に受信できます。しかしネットワーク遅延のため、QueryNode が取得するストリーミングデータは不完全な場合があります。

この問題に対処するため、Zilliz Cloud はデータキュー内の各レコードにタイムスタンプを付与し、継続的に同期タイムスタンプ（syncTs）をデータキューに挿入します。QueryNode が同期タイムスタンプ（syncTs）を受信すると、それを ServiceTime として設定します。つまり、QueryNode はその ServiceTime より前のすべてのデータを参照可能になります。この ServiceTime を基に、Zilliz Cloud はユーザーの異なる一貫性および可用性要件を満たすために保証タイムスタンプ（GuaranteeTs）を提供できます。ユーザーは Search リクエスト内で GuaranteeTs を指定することで、QueryNode に指定時刻以前のデータを検索範囲に含めるよう指示できます。

![Owddb7D3Fo8zyFxJgWWcZCxanIf](https://zdoc-images.s3.us-west-2.amazonaws.com/owddb7d3fo8zyfxjgwwczcxanif.png "Owddb7D3Fo8zyFxJgWWcZCxanIf")

上図のように、GuaranteeTs が ServiceTime より小さい場合、指定時刻以前のすべてのデータがディスクに完全に書き込まれていることを意味し、QueryNode は直ちに Search 操作を実行できます。一方、GuaranteeTs が ServiceTime より大きい場合、QueryNode は ServiceTime が GuaranteeTs を超えるまで待機し、その後で Search 操作を実行できます。

ユーザーは、クエリ精度とクエリレイテンシの間でトレードオフを行う必要があります。一貫性要件が高く、クエリレイテンシに敏感でない場合は、GuaranteeTs を可能な限り大きな値に設定できます。一方、検索結果を迅速に受け取りたい場合やクエリ精度に対する許容度が高い場合は、GuaranteeTs をより小さな値に設定できます。

![Y9YabwvmjoWMXhxt9kRc8Atmnid](https://zdoc-images.s3.us-west-2.amazonaws.com/y9yabwvmjowmxhxt9krc8atmnid.png "Y9YabwvmjoWMXhxt9kRc8Atmnid")

Zilliz Cloud は、異なる GuaranteeTs を持つ以下の4種類の一貫性レベルを提供します。

- **Strong**

    最新のタイムスタンプを GuaranteeTs として使用し、QueryNode は ServiceTime が GuaranteeTs に到達するまで待機してから Search リクエストを実行します。

- **Eventual**

    GuaranteeTs を 1 のような極めて小さな値に設定し、一貫性チェックを回避することで、QueryNode はバッチデータに対して直ちに Search リクエストを実行できます。

- **Bounded Staleness**

    GuaranteeTs を最新タイムスタンプよりも前の時点に設定し、QueryNode が一定のデータ損失を許容しながら検索を実行できるようにします。

- **Session**

    クライアントがデータを挿入した最新の時点を GuaranteeTs として使用し、QueryNode がそのクライアントによって挿入されたすべてのデータに対して検索を実行できるようにします。

Zilliz Cloud はデフォルトで Bounded Staleness を一貫性レベルとして使用します。GuaranteeTs が明示されない場合、最新の ServiceTime が GuaranteeTs として使用されます。

## 一貫性レベルの設定\{#set-consistency-level}

コレクション作成時や Search・Query 実行時に、異なる一貫性レベルを設定できます。Search や Query で一貫性レベルが指定されない場合、コレクション作成時に指定された一貫性レベルが適用されます。

### コレクション作成時の一貫性レベル設定\{#set-consistency-level-upon-creating-collection}

コレクション作成時に、そのコレクション内で実行される Search や Query の一貫性レベルを設定できます。以下のコード例では、一貫性レベルを **Bounded** に設定しています。

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

<TabItem value='java'>

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

<TabItem value='java'>

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

`consistency_level` パラメータの可能な値は、`Strong`、`Bounded`、`Eventually`、および `Session` です。

### Search での一貫性レベルの設定\{#set-consistency-level-in-search}

特定の検索に対して常に一貫性レベルを変更できます。次のコード例では、一貫性レベルを **Bounded** に設定し直しています。この変更は現在の検索リクエストにのみ適用されます。

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

<TabItem value='java'>

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

<TabItem value='java'>

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

このパラメータはハイブリッド検索および検索イテレータでも利用可能です。`consistency_level` パラメータに指定可能な値は、`Strong`、`Bounded`、`Eventually`、および `Session` です。

### クエリでの一貫性レベルの設定\{#set-consistency-level-in-query}

特定の検索に対していつでも一貫性レベルを変更できます。以下のコード例では、一貫性レベルを **Eventually** に設定しています。この設定は現在のクエリリクエストにのみ適用されます。

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

<TabItem value='java'>

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

<TabItem value='java'>

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

このパラメータはクエリイテレータでも利用可能です。`consistency_level` パラメータの取り得る値は、`Strong`、`Bounded`、`Eventually`、および `Session` です。