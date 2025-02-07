---
title: "一貫性レベル | Cloud"
slug: /consistency-level
sidebar_label: "一貫性レベル"
beta: FALSE
notebook: FALSE
description: "分散ベクトルデータベースとして、Zilliz Cloudは、各ノードまたはレプリカが読み取りおよび書き込み操作中に同じデータにアクセスできるように、複数の一貫性レベルを提供しています。現在、サポートされている一貫性レベルには、Strong、Bounded、Eventally、Sessionがあり、Boundedがデフォルトの一貫性レベルとして使用されています。 | Cloud"
type: origin
token: L0kBwLwG5iNXSBkUpYKcSixknqe
sidebar_position: 15
keywords: 
  - zilliz
  - vector database
  - cloud
  - collection
  - data
  - consistency level
  - what is vector db
  - what are vector databases
  - vector databases comparison
  - Faiss

---

import Admonition from '@theme/Admonition';
import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

# 一貫性レベル

分散ベクトルデータベースとして、Zilliz Cloudは、各ノードまたはレプリカが読み取りおよび書き込み操作中に同じデータにアクセスできるように、複数の一貫性レベルを提供しています。現在、サポートされている一貫性レベルには、**Strong**、**Bounded**、**Eventally**、**Session**があり、**Bounded**がデフォルトの一貫性レベルとして使用されています。

## 概要について{#}

Zilliz Cloudは、ストレージと計算を分離するシステムです。このシステムでは、**DataNodes**がデータの永続性に責任を持ち、最終的にMinIO/S 3などの分散オブジェクトストレージに保存します。**Query Nodes**は、Searchのような計算タスクを処理します。これらのタスクには、**バッチデータ**と**ストリーミングデータ**の両方を処理する必要があります。単純に言えば、バッチデータはすでにオブジェクトストレージに保存されているデータとして理解でき、ストリーミングデータはまだオブジェクトストレージに保存されていないデータを指します。ネットワークレイテンシのため、Query Nodesは最新のストリーミングデータを保持しないことがよくあります。追加の保護措置がない場合、ストリーミングデータに直接Searchを実行すると、多くの未確定データポイントが失わ

Zilliz CloudCommercial Editionは、ストレージと計算を分離するシステムです。このシステムでは、DataNodesがデータの永続性に責任を持ち、最終的にMinIO/S 3などの分散オブジェクトストレージに保存します。QueryNodesは、Searchのような計算タスクを処理します。これらのタスクには、バッチデータとストリーミングデータの両方の処理が含まれます。単純に言えば、バッチデータはすでにオブジェクトストレージに保存されているデータとして理解でき、ストリーミングデータはまだオブジェクトストレージに保存されていないデータを指します。ネットワークレイテンシのため、QueryNodesは最新のストリーミングデータを保持しないことがよくあります。追加の保護措置がない場合、ストリーミングデータに直接Searchを実行すると、多くの未確定データポイントが失われ、検索結果の精度に影響を与える

![Owpww720QhpW3UbnDaLcXNcJnQd](/img/ja-JP/Owpww720QhpW3UbnDaLcXNcJnQd.png)

上の図に示すように、Query NodesはSearchリクエストを受信した後、ストリーミングデータとバッチデータの両方を同時に受信することができます。ただし、ネットワークの遅延により、Query Nodesが取得するストリーミングデータが不完全になる可能性があります。

この問題に対処するために、Zilliz Cloudは、データキュー内の各レコードにタイムスタンプを付け、データキューに同期タイムスタンプを継続的に挿入します。同期タイムスタンプ(syncTs)が受信されるたびに、Query NodesはそれをService Timeとして設定します。つまり、Query NodesはそのService Timeより前のすべてのデータを見ることができます。Service Timeに基づいて、Zilliz Cloudは、一貫性と可用性の異なるユーザー要件を満たすための保証タイムスタンプ(GuaranteeTs)を提供できます。ユーザーは、SearchリクエストでGuaranteeTsを指定することで、指定された時点よりも前にデータを含める必要があることを

![PW6pbkoQtoKVQTxE4mlcIfOen5g](/img/ja-JP/PW6pbkoQtoKVQTxE4mlcIfOen5g.png)

上の図に示されているように、GuaranteeTsが小なりServiceTimeである場合、指定された時点より前のすべてのデータがディスクに完全に書き込まれたことを意味し、Query NodesがすぐにSearch操作を実行できるようになります。GuaranteeTsが大なりServiceTimeである場合、Query NodesはServiceTimeがGuaranteeTsを超えるまで待たなければなりません。

ユーザーは、クエリの正確性とクエリの遅延のトレードオフを行う必要があります。ユーザーが高い一貫性要件を持ち、クエリの遅延に敏感でない場合、GuaranteeTsをできるだけ大きな値に設定できます。ユーザーが検索結果を迅速に受け取り、クエリの正確性により寛容である場合、GuaranteeTsをより小さな値に設定できます。

![OhjXbpye0oktzExy7MaccTCunrg](/img/ja-JP/OhjXbpye0oktzExy7MaccTCunrg.png)

Zilliz Cloudは、異なる保証Tを持つ4種類の一貫性レベルを提供します。

- **強い**

    最新のタイムスタンプがGuaranteeTとして使用され、Query NodeはServiceTimeがGuaranteeTに達するまで待ってからSearchリクエストを実行する必要があります。

- **Eventual**

    GuaranteeTsは、整合性チェックを回避するために1などの非常に小さな値に設定されています。これにより、Query Nodesはすべてのバッチデータに対してすぐにSearch要求を実行できます。

- **不美しさの限界**

    GuranteeTsは、最新のタイムスタンプよりも前の時点に設定され、Query Nodesが特定のデータ損失の許容範囲で検索を実行するようになっています。

- **セッション**

    クライアントがデータを挿入した最新の時点が保証Tとして使用されるため、Query Nodesはクライアントによって挿入されたすべてのデータに対して検索を実行できます。

Zilliz Cloudは、デフォルトの一貫性レベルとしてBounded Stalenessを使用します。GuaranteeTが指定されていない場合、最新のService TimeがGuaranteeTとして使用されます。

## 一貫性レベルを設定{#}

コレクションを作成したり、検索やクエリを実行したりするときに、さまざまな一貫性レベルを設定できます。

### コレクション作成時に一貫性レベルを設定する{#}

コレクションを作成するときに、コレクション内の検索とクエリの一貫性レベルを設定できます。次のコード例では、一貫性レベルを**Strong**に設定します。

<Tabs groupId="code" defaultValue='python' values={[{"label":"Python","value":"python"},{"label":"Java","value":"java"},{"label":"cURL","value":"bash"}]}>
<TabItem value='python'>

```python
client.create_collection(
    collection_name="my_collection",
    schema=schema,
    # highlight-next
    consistency_level="Strong",
)
```

</TabItem>

<TabItem value='java'>

```java
CreateCollectionReq createCollectionReq = CreateCollectionReq.builder()
        .collectionName("my_collection")
        .collectionSchema(schema)
        // highlight-next
        .consistencyLevel(ConsistencyLevel.STRONG)
        .build();
client.createCollection(createCollectionReq);
```

</TabItem>

<TabItem value='bash'>

```bash
export schema='{
        "autoId": true,
        "enabledDynamicField": false,
        "fields": [
            {
                "fieldName": "my_id",
                "dataType": "Int64",
                "isPrimary": true
            },
            {
                "fieldName": "my_vector",
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

使用可能な値、`整合性_レベル`パラメーターは`強い`、`境界`、`最終的`に、および`セッション`。

### 検索の一貫性レベルを設定する{#}

特定の検索の一貫性レベルはいつでも変更できます。次のコード例では、一貫性レベルを**Bounded**に戻します。この変更は、現在の検索要求にのみ適用されます。

<Tabs groupId="code" defaultValue='python' values={[{"label":"Python","value":"python"},{"label":"Java","value":"java"},{"label":"cURL","value":"bash"}]}>
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

このパラメータは、ハイブリッド検索や検索イテレータでも使用できます。`Consistence_level`パラメータの可能な値は、`Strong`、`Bounded`、`Eventally`、`Session`です。

### クエリで一貫性レベルを設定する{#}

特定の検索の一貫性レベルはいつでも変更できます。次のコード例では、一貫性レベルを**Eventally**に設定します。この設定は、現在のクエリ要求にのみ適用されます。

<Tabs groupId="code" defaultValue='python' values={[{"label":"Python","value":"python"},{"label":"Java","value":"java"}]}>
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
</Tabs>

クエリイテレータでもこのパラメータを使用できます。`Consistence_level`パラメータの可能な値は、`Strong`、`Bounded`、`Eventally`、`Session`です。